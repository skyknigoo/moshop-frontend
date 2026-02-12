<template>
  <div class="card shadow-2 mb-4 border-none border-round-none">
    <Menubar :model="items">
      <template #start>
        <router-link to="/" class="flex align-items-center no-underline mr-4">
          <img src="/uploads/Logo/LogoMoShop2.jpg" height="40" class="mr-2 border-round" />
          <span class="text-xl font-bold text-900">MoShop</span>
        </router-link>
      </template>

      <template #item="{ item, props, hasSubmenu }">
        <a v-ripple class="flex align-items-center" v-bind="props.action" @click="item.command">
          <span v-if="item.icon" :class="item.icon" :style="item.style" class="p-menuitem-icon mr-2" />
          
          <span :style="item.style" class="p-menuitem-text font-bold">{{ item.label }}</span>
          
          <i v-if="hasSubmenu" class="pi pi-angle-down ml-2" :style="item.style"></i>
        </a>
      </template>

      <template #end>
        <div v-if="auth.isLoggedIn" class="flex align-items-center gap-3">
          <span class="text-700 hidden md:block">
            你好，<b class="text-primary">{{ auth.user.name }}</b>
          </span>
          <PButton label="登出" icon="pi pi-sign-out" severity="danger" text @click="handleLogout" />
        </div>
        <div v-else class="flex gap-2">
          <PButton label="登入" icon="pi pi-user" text @click="$router.push('/login')" />
          <PButton label="註冊" icon="pi pi-user-plus" severity="success" @click="$router.push('/register')" />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const items = computed(() => {
  const baseItems = [
    { label: '商品首頁', icon: 'pi pi-home', command: () => router.push('/') }
  ];

  if (auth.isLoggedIn) {
    baseItems.push(
      { label: '購買清單', icon: 'pi pi-shopping-bag', command: () => router.push('/order') },
      { label: '個人資料', icon: 'pi pi-id-card', command: () => router.push('/profile') }
    );

    // 商品管理：橘色
    if (auth.canManageProduct) {
      baseItems.push({
        label: '管理功能',
        icon: 'pi pi-sliders-h',
        style: { color: '#f97316' }, // 直接對應模板中的 :style
        items: [
          { label: '商品管理', icon: 'pi pi-box', command: () => router.push('/manage/product') },
          { label: '訂單管理', icon: 'pi pi-file-edit', command: () => router.push('/manage/order') }
        ]
      });
    }

    // 帳號管理：紅色
    if (auth.canAccessAdmin) {
      baseItems.push({
        label: '系統安全',
        icon: 'pi pi-shield',
        style: { color: '#ef4444' }, // 直接對應模板中的 :style
        items: [
          { label: '帳號管理', icon: 'pi pi-users', command: () => router.push('/manage/account') }
        ]
      });
    }
  }

  return baseItems;
});

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>