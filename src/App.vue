<script setup>
import { RouterView } from 'vue-router'
import TheNavbar from '@/components/layout/TheNavbar.vue';
import Toast from 'primevue/toast';
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
/* 這裡可以先清空，或放一些全域樣式 */
body {
  margin: 0;
  font-family: sans-serif;

}
</style>