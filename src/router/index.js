import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

// 匯入組件 ... (維持原樣)
import ProductList from '../views/Product/ProductList.vue'
import ProductDetails from '../views/Product/ProductDetails.vue' 
import LoginView from '../views/Account/LoginView.vue'
import ProfileView from '../views/Account/ProfileView.vue'
import RegisterView from '../views/Account/RegisterView.vue'
import OrderView from '../views/Order/OrderView.vue'
import MProductList from '../views/Manage/Product/MProductList.vue'
import MProductForm from '../views/Manage/Product/MProductForm.vue'
import MOrderList from '../views/Manage/Order/MOrderList.vue'
import MAccountList from '../views/Manage/Account/MAccountList.vue'
import MAccountCreate from '../views/Manage/Account/MAccountCreate.vue'
import MAccountEdit from '../views/Manage/Account/MAccountEdit.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: ProductList },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    
    // 需要登入的 一般頁面
    {
      path: '/details/:id', 
      name: 'ProductDetails', 
      component: ProductDetails,
      props: true, 
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/order', 
      name: 'Order',
      component: OrderView,
      meta: { requiresAuth: true }
    },

    // --- 後台管理路由：對應 canManageProduct (Store 以上) ---
    {
      path: '/manage/product',
      name: 'MProductList',
      component: MProductList,
      meta: { requiresAuth: true, requiresManager: true } 
    },
    {
      path: '/manage/product/create',
      name: 'MProductCreate',
      component: MProductForm,
      meta: { requiresAuth: true, requiresManager: true }
    },
    {
      path: '/manage/product/edit/:id',
      name: 'MProductEdit',
      component: MProductForm,
      props: true,
      meta: { requiresAuth: true, requiresManager: true }
    },
    {
      path: '/manage/order',
      name: 'MOrderList',
      component: MOrderList,
      meta: { requiresAuth: true, requiresManager: true }
    },

    // --- 系統安全路由：對應 canAccessAdmin (Admin 以上) ---
    {
      path: '/manage/account',
      name: 'MAccountList',
      component: MAccountList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/manage/account/create',
      name: 'MAccountCreate',
      component: MAccountCreate,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/manage/account/edit/:account',
      name: 'MAccountEdit',
      component: MAccountEdit,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// --- 路由守衛：權限控管核心 ---
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // 1. 檢查是否需要登入
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // 2. 檢查是否需要「管理功能」權限 (Store/Admin/System)
  if (to.meta.requiresManager && !auth.canManageProduct) {
    next({ name: 'home' }); 
    return;
  }

  // 3. 檢查是否需要「系統安全」權限 (Admin/System)
  if (to.meta.requiresAdmin && !auth.canAccessAdmin) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router