import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // 1. 定義權限等級映射表 (對應 C# Enum)
    const RoleLevel = {
        Guest: 0,
        Normal: 1,
        Store: 2,
        Admin: 3,
        System: 4
    };

    // 初始化：從 localStorage 嘗試抓取舊資料，避免重新整理就登出
    const user = ref(JSON.parse(localStorage.getItem('moshop_user')) || null); 
    const token = ref(localStorage.getItem('moshop_token') || null);

    // 取得目前使用者的數字等級
    const currentUserLevel = computed(() => {
        const roleName = user.value?.role; 
        return RoleLevel[roleName] || 0;
    });

    const isLoggedIn = computed(() => user.value !== null && token.value !== null);

    // 2. 精確權限判斷
    const isNormal = computed(() => currentUserLevel.value === RoleLevel.Normal);
    const isStore  = computed(() => currentUserLevel.value === RoleLevel.Store);
    const isAdmin  = computed(() => currentUserLevel.value === RoleLevel.Admin);
    const isSystem = computed(() => currentUserLevel.value === RoleLevel.System);

    // 3. 複合權限判斷 (階層式)
    const canManageProduct = computed(() => currentUserLevel.value >= RoleLevel.Store);
    const canAccessAdmin = computed(() => currentUserLevel.value >= RoleLevel.Admin);

    // 動作：登入 (更新：接收兩個參數)
    const login = (userData, newToken) => { 
        user.value = userData; 
        token.value = newToken;
        
        // 同步存入瀏覽器「錢包」
        localStorage.setItem('moshop_user', JSON.stringify(userData));
        localStorage.setItem('moshop_token', newToken);
    };
    
    // 動作：登出
    const logout = () => { 
        user.value = null; 
        token.value = null;
        localStorage.removeItem('moshop_user');
        localStorage.removeItem('moshop_token');
    };

    return { 
        user,
        token, // 記得導出 token
        currentUserLevel,
        isLoggedIn, 
        isNormal, 
        isStore, 
        isAdmin, 
        isSystem,
        canManageProduct,
        canAccessAdmin,
        login, 
        logout 
    };
});