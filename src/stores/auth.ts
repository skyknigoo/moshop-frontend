import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// --- 1. 定義型別 (Type Definittion ) ---
// 定義使用者物件的形狀，面試時可以說：這能確保資料結構的前後端一致性
interface User {
  id: number;
  name: string;
  role: 'Guest' | 'Normal' | 'Store' | 'Admin' | 'System'
}

export const useAuthStore = defineStore('auth', () => {
  // --- 2. 權限等級映射表 ---
  // 使用readonly 去保這張表部會在執行時被意外執行
  const RoleLevel: Record<string, number> = {
    Guest: 0,
    Normal: 1,
    Store: 2,
    Admin: 3,
    System: 4
  }

  // --- 3. 響應式狀態 (State) ---
  // ref<User | null> 告訴 TS:這個變數 不是 User 物件 就是空值
  const user = ref<User | null>(JSON.parse(localStorage.getItem('moshop_user') || 'null'));
  const token = ref<string | null>(localStorage.getItem('moshop_token'));

  // --- 4. 計算屬性 (Getters) ---
  const currentUserLevel = computed((): number => {
    const roleName = user.value?.role;
    //使用 type assertion 確保 roleName 是 RoleLevel 的 key
    return roleName ? RoleLevel[roleName] : 0;
  })

  const isLoggedIn = computed((): boolean => !!user.value && !!token.value);

  // 精準權限判斷
  const isNormal = computed(() => currentUserLevel.value === RoleLevel.Normal);
  const isStore = computed(() => currentUserLevel.value === RoleLevel.Store);
  const isAdmin = computed(() => currentUserLevel.value === RoleLevel.Admin);
  const isSystem = computed(() => currentUserLevel.value === RoleLevel.System);

  // 階層式權限
  const canManageProduct = computed(() => currentUserLevel.value >= RoleLevel.Store);
  const canAccessAdmin = computed(() => currentUserLevel.value >= RoleLevel.Admin);

  // --- 5. 動作 (Actions) ---
  const login = (userData: User, newToken: string): void => {
    user.value = userData;
    token.value = newToken;
    localStorage.setItem('moshop_user', JSON.stringify(userData));
    localStorage.setItem('moshop_token', newToken);
  };

  const logout = (): void => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('moshop_user');
    localStorage.removeItem('moshop_token');

  }

  return {
    user, token, currentUserLevel, isLoggedIn,
    isNormal, isStore, isAdmin, isSystem,
    canManageProduct, canAccessAdmin, login, logout
  }






})
