<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheNavbar from '@/components/layout/TheNavbar.vue';
import Toast from 'primevue/toast';

// 匯入並實例化新的 TS 版本 Store
// import { useAuthStore } from '../src/stores/auth';
// const authStore = useAuthStore();

</script>

<template>
  <div class="min-h-screen surface-ground">
    <TheNavbar />

    <main class="container mx-auto">
      <RouterView />
    </main>

    <Toast />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}
</style>
