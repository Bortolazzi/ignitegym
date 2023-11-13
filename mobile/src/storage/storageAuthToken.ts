import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTHTOKEN_STORAGE } from '@storage/storageConfig';

type StorageAuthTokenProps = {
    token: string;
    refresh_token: string;
}

export async function getTokenAsync() {
    try {
        const tokenStorage = await AsyncStorage.getItem(AUTHTOKEN_STORAGE);

        const { token }: StorageAuthTokenProps = tokenStorage ? JSON.parse(tokenStorage) : {};

        return token;
    } catch (exception) {
        throw exception;
    }
}

export async function getRefreshTokenAsync() {
    try {
        const tokenStorage = await AsyncStorage.getItem(AUTHTOKEN_STORAGE);

        const { refresh_token }: StorageAuthTokenProps = tokenStorage ? JSON.parse(tokenStorage) : {};

        return refresh_token;
    } catch (exception) {
        throw exception;
    }
}

export async function saveTokenAsync({ token, refresh_token }: StorageAuthTokenProps) {
    try {
        await AsyncStorage.setItem(AUTHTOKEN_STORAGE, JSON.stringify({ token, refresh_token }));
    } catch (exception) {
        throw exception;
    }
}

export async function removeTokenAsync() {
    try {
        await AsyncStorage.removeItem(AUTHTOKEN_STORAGE);
    } catch (exception) {
        throw exception;
    }
}