import { ReactNode, createContext, useEffect, useState } from 'react';

import { UserDto } from '@dtos/UserDto';

import * as userStorage from '@storage/storageUser';
import * as tokenStorage from '@storage/storageAuthToken';
import { api } from '@services/api';

export type AuthContextDataProps = {
    user: UserDto;
    isLoadingUserStorageData: boolean;
    signInAsync: (email: string, password: string) => Promise<void>;
    signOutAsync: () => Promise<void>;
    updateProfileAsync: (userUpdate: UserDto) => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDto>({} as UserDto);
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState<boolean>(true);

    function userAndTokenUpdate(userData: UserDto, token: string) {
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    async function keepUserDataAndTokenAsync(userData: UserDto, token: string, refresh_token: string) {
        try {
            await userStorage.saveUserAsync(userData);
            await tokenStorage.saveTokenAsync({ token, refresh_token });
            userAndTokenUpdate(userData, token);
        } catch (error) {
            throw error;
        }
    }

    async function signInAsync(email: string, password: string) {
        try {
            setIsLoadingUserStorageData(true);
            const response = await api.post('/sessions', { email, password });

            if (response.data && response.data.user && response.data.token && response.data.refresh_token) {
                await keepUserDataAndTokenAsync(response.data.user, response.data.token, response.data.refresh_token);
            }
        } catch (exception) {
            throw exception;
        } finally { setIsLoadingUserStorageData(false); }
    }

    async function signOutAsync() {
        try {
            setIsLoadingUserStorageData(true);
            setUser({} as UserDto);
            await userStorage.removeUserAsync();
            await tokenStorage.removeTokenAsync();
        } catch (exception) {
            throw exception;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function loadUserAsync() {
        try {
            setIsLoadingUserStorageData(true);
            const userLogged = await userStorage.getUserAsync();
            const token = await tokenStorage.getTokenAsync();

            if (userLogged && token) {
                userAndTokenUpdate(userLogged, token);
            }
        } catch (exception) {
            throw exception;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function updateProfileAsync(userUpdate: UserDto) {
        try {
            setUser(userUpdate);
            await userStorage.saveUserAsync(userUpdate);
        } catch (exception) {
            throw exception;
        }
    }

    useEffect(() => {
        loadUserAsync();
    }, []);

    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOutAsync);

        return () => {
            subscribe();
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isLoadingUserStorageData,
            signInAsync,
            signOutAsync,
            updateProfileAsync
        }}>
            {children}
        </AuthContext.Provider>
    );
}