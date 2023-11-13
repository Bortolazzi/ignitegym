import axios, { AxiosError, AxiosInstance } from 'axios';

import { AppError } from '@utils/AppError';
import * as storageToken from '@storage/storageAuthToken';

type SignOut = () => void;

type PromiseType = {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void;
}

type ApiInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (signOut: SignOut) => () => void;
}

//Como se fosse o HTtpClient no C#, define os dados básicos da request
const api = axios.create({
    baseURL: 'http://127.0.0.1:3333'
}) as ApiInstanceProps;

let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use((response) => {
        return response;
    }, async (requestError) => {

        if (requestError?.response?.status === 401) {
            if (requestError.response.data?.message === "token.expired" || requestError.response.data?.message === "token.invalid") {
                const refresh_token = await storageToken.getRefreshTokenAsync();

                if (!refresh_token) {
                    signOut();
                    return Promise.reject(requestError);
                }

                const originalRequestConfig = requestError.config;
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` }
                                resolve(api(originalRequestConfig));
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error);
                            }
                        });
                    })
                }

                isRefreshing = true;

                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post('/sessions/refres-token', { refresh_token });
                        await storageToken.saveTokenAsync({ token: data.token, refresh_token: data.refresh_token });

                        if (originalRequestConfig.data) {
                            originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
                        }

                        originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` }
                        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

                        failedQueue.forEach(request=> {
                            request.onSuccess(data.token);
                        });

                        resolve(api(originalRequestConfig));
                    }
                    catch (error: any) {
                        failedQueue.forEach(request => {
                            request.onFailure(error);
                        });
                    }
                    finally {
                        isRefreshing = false;
                        failedQueue = [];
                    }
                });
            }

            signOut();
        }

        if (requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message));
        } else {
            console.log(requestError);
            return Promise.reject(requestError);
        }
    });

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    };
}

//intercepta todas as requisições para criar um comportamento padrão
//primeiro parametro é a função de sucesso
//segundo parametro é a função de error
api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    //daria para fazer alguma tratativa generica
    return Promise.reject(error);
});



export { api };