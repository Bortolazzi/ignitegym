import { ReactNode, createContext, useState } from 'react';

import { UserDto } from '@dtos/UserDto';

import { api } from '@services/api';

export type AuthContextDataProps = {
    user: UserDto;
    signIn: (email: string, password: string) => void;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDto>({} as UserDto);

    async function signIn(email: string, password: string){
        try {
            const response = await api.post('/sessions', { email, password });
            
            if(response.data && response.data.user){
                setUser(response.data.user);
            }
          } catch (exception) {
            throw exception;
          }
    }

    return (
        <AuthContext.Provider value={{ user, signIn }}>
            {children}
        </AuthContext.Provider>
    );
}