import axios from 'axios';

import { AppError } from '@utils/AppError';

//Como se fosse o HTtpClient no C#, define os dados básicos da request
const api = axios.create({
    baseURL: 'http://127.0.0.1:3333'
});

//intercepta todas as requisições para criar um comportamento padrão
//primeiro parametro é a função de sucesso
//segundo parametro é a função de error
api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    //daria para fazer alguma tratativa generica
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.data) {
        return Promise.reject(new AppError(error.response.data.message));
    } else {
        console.log(error);
        return Promise.reject(error);
    }
});

export { api };