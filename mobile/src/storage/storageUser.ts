import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserDto } from '@dtos/UserDto';
import { USER_STORAGE } from '@storage/storageConfig';

export async function saveUserAsync(user: UserDto) {
    try {
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
    } catch (exception) {
        throw exception;
    }
}

export async function getUserAsync(): Promise<UserDto> {
    try {
        const storage = await AsyncStorage.getItem(USER_STORAGE);
        return storage ? JSON.parse(storage) : {};
    } catch (exception) {
        throw exception;
    }
}

export async function removeUserAsync() {
    try {
        await AsyncStorage.removeItem(USER_STORAGE);
    } catch (exception) {
        throw exception;
    }
}