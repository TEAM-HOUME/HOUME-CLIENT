import axios, { AxiosError } from 'axios';
import type { BaseResponse } from '../types/apis';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error: AxiosError<BaseResponse<null>>) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
