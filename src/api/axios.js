import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 1. 建立 axios 實例
const service = axios.create({
    // 設定你的 .NET 8 API 基礎網址
    baseURL: 'http://localhost:5158/api', 
    timeout: 10000, // 超時設定
    withCredentials: true // 跨域憑證
});

// 2. 請求攔截器 (Request Interceptor)
service.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        // 如果錢包裡有 Token，就自動貼在信封上
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 回應攔截器 (Response Interceptor)
service.interceptors.response.use(
    (response) => {
        // 直接回傳 data，這樣在組件中就不用寫 res.data.data 了
        return response.data;
    },
    (error) => {
        // 統一處理 401 數位簽證過期
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout(); // 清除過期資料
            
            // 跳轉至登入頁，並紀錄目前位置以便登入後跳回
            router.push({ 
                name: 'Login', 
                query: { redirect: router.currentRoute.value.fullPath } 
            });
        }
        return Promise.reject(error);
    }
);

export default service;