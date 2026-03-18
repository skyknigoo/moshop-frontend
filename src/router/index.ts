import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized
} from 'vue-router'
import { useAuthStore } from '../stores/auth'

// --- 路由配置 (使用 RouteRecordRaw 強制檢查結構) ---
const routes: RouteRecordRaw[] = [
  // 公開頁面
  { path: '/product', name: 'home', component: () => import('../views/Product/ProductList.vue') },
  { path: '/', name: 'homeMe', component: () => import('../views/Product/ProductListMe.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Account/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Account/RegisterView.vue') },
  { path: '/registerMe', name: 'RegisterMe', component: () => import('../views/Account/RegisterMe.vue') },
  { path: '/loginMe', name: 'loginMe', component: () => import('../views/Account/LoginMe.vue') },

  // 需要登入的一般頁面
  {
    path: '/details/:id',
    name: 'ProductDetails',
    component: () => import('../views/Product/ProductDetails.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/detailsMe/:id',
    name: 'ProductDetailsMe',
    component: () => import('../views/Product/ProductDetailsMe.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Account/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profileme',
    name: 'ProfileMe',
    component: () => import('../views/Account/ProfileMe.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orderMe',
    name: 'OrderMe',
    component: () => import('../views/Order/OrderViewMe.vue'),
    meta: { requiresAuth: true },
  },

  // 後台管理路由：對應 canManageProduct (Store 等級以上)
  {
    path: '/manage/productMe',
    name: 'MProductListMe',
    component: () => import('../views/Manage/Product/MProductListMe.vue'),
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/manage/product/createMe',
    name: 'MProductCreateMe',
    component: () => import('../views/Manage/Product/MProductFormMe.vue'),
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/manage/product/editMe/:id',
    name: 'MProductEditMe',
    component: () => import('../views/Manage/Product/MProductFormMe.vue'),
    props: true,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/manage/orderMe',
    name: 'MOrderListMe',
    component: () => import('../views/Manage/Order/MOrderListMe.vue'),
    meta: { requiresAuth: true, requiresManager: true },
  },

  // 系統安全路由：對應 canAccessAdmin (Admin 等級以上)
  {
    path: '/manage/accountMe',
    name: 'MAccountListMe',
    component: () => import('../views/Manage/Account/MAccountListMe.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/manage/account/createMe',
    name: 'MAccountCreateMe',
    component: () => import('../views/Manage/Account/MAccountCreateMe.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/manage/account/editMe/:account',
    name: 'MAccountEditMe',
    component: () => import('../views/Manage/Account/MAccountEditme.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- 路由守衛：權限控管核心 ---
router.beforeEach((
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuthStore()

  // 1. 檢查是否需要登入
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'loginMe', query: { redirect: to.fullPath } })
    return
  }

  // 2. 檢查管理員功能權限 (Store/Admin/System)
  if (to.meta.requiresManager && !auth.canManageProduct) {
    next({ name: 'homeMe' })
    return
  }

  // 3. 檢查系統安全權限 (Admin/System)
  if (to.meta.requiresAdmin && !auth.canAccessAdmin) {
    next({ name: 'homeMe' })
    return
  }

  next()
})

export default router
