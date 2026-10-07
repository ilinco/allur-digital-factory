import axios from 'axios';
import { tokenStorage } from './tokenStorage';
import { toast } from '@/context/notificationStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const token = tokenStorage.get();

      if (
        token &&
        error.config?.headers.get('Authorization') === `Bearer ${token}`
      ) {
        tokenStorage.clear();
        toast.warning(
          'Сессия авторизации завершена. Пожалуйста, выполните повторный вход.',
          { title: 'Авторизация' },
        );
      }
    }

    return Promise.reject(error);
  },
);
