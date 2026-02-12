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

    const user = ref(null); 

    // 取得目前使用者的數字等級 (核心修正)
    const currentUserLevel = computed(() => {
        const roleName = user.value?.role; // 假設 API 回傳 'Admin'
        return RoleLevel[roleName] || 0;
    });

    const isLoggedIn = computed(() => user.value !== null);

    // 2. 精確權限判斷 (改用數字比較，更安全)
    const isNormal = computed(() => currentUserLevel.value === RoleLevel.Normal);
    const isStore  = computed(() => currentUserLevel.value === RoleLevel.Store);
    const isAdmin  = computed(() => currentUserLevel.value === RoleLevel.Admin);
    const isSystem = computed(() => currentUserLevel.value === RoleLevel.System);

    // 3. 複合權限判斷 (階層式)
    // 只要等級 >= 2 (店家、管理員、系統) 就能管理商品
    const canManageProduct = computed(() => currentUserLevel.value >= RoleLevel.Store);

    // 只要等級 >= 3 (管理員、系統) 就能進入控制台
    const canAccessAdmin = computed(() => currentUserLevel.value >= RoleLevel.Admin);

    // 動作：登入
    const login = (userData) => { 
        user.value = userData; 
        localStorage.setItem('moshop_user', JSON.stringify(userData));
    };
    
    // 動作：登出
    const logout = () => { 
        user.value = null; 
        localStorage.removeItem('moshop_user');
    };

    return { 
        user,
        currentUserLevel, // 導出這個屬性供組件過濾使用
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