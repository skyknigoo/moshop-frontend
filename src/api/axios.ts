import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router/index';

// 1.建立 axios 實例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5158/api',
  timeout: 10000,
  withCredentials: true
});

// 2. 請求攔截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    // 如果錢包裡有Token ，就自動貼在信封上
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. 回應攔截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    //直接回傳data，減少組件層的負擔
    return response.data;
  },
  (error: AxiosError) => {
    //統一處理 401 數位簽證過期
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push({
        name: 'loginMe',
        query: { redirect: router.currentRoute.value.fullPath }
      });
    }
    return Promise.reject(error);
  }
);


export default service;




