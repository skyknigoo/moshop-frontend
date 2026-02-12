<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground p-4">
    <Card class="w-full md:w-25rem shadow-4">
      <template #title>
        <div class="text-center mb-4">
          <img src="/uploads/Logo/LogoMoShop2.jpg" width="150" alt="Logo" class="mb-3" />
          <h2 class="text-2xl font-bold text-900 m-0">歡迎回來</h2>
          <p class="text-600 mt-2">請登入您的 MoShop 帳號</p>
        </div>
      </template>

      <template #content>
        <div class="flex flex-column gap-4">
          <div class="flex flex-column gap-2">
            <label for="username" class="font-bold">帳號</label>
            <InputGroup>
              <InputGroupAddon><i class="pi pi-user"></i></InputGroupAddon>
              <InputText id="username" v-model="loginForm.account" placeholder="請輸入帳號" @keyup.enter="handleLogin" />
            </InputGroup>
          </div>

          <div class="flex flex-column gap-2">
            <label for="password" class="font-bold">密碼</label>
            <InputGroup>
              <InputGroupAddon><i class="pi pi-lock"></i></InputGroupAddon>
              <Password id="password" v-model="loginForm.password" :feedback="false" toggleMask placeholder="請輸入密碼" 
                        class="w-full" inputClass="w-full" @keyup.enter="handleLogin" />
            </InputGroup>
          </div>

          <div class="flex align-items-center justify-content-between mb-2">
            <div class="flex align-items-center gap-2">
            </div>
            <a href="#" class="text-primary no-underline hover:underline font-medium">忘記密碼？</a>
          </div>

          <PButton label="立即登入" icon="pi pi-sign-in" class="w-full p-3 text-xl" :loading="loading" @click="handleLogin" />
          <PButton label="快速登入" icon="pi pi-sign-in" class="w-full p-3 text-xl" :loading="loading" @click="FastLogin" />

          <Divider align="center">
            <span class="text-500 font-normal">或者</span>
          </Divider>

          <PButton label="註冊新帳號" severity="secondary" outlined class="w-full" @click="$router.push('/register')" />
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'; // 1. 取消註解
import { useRouter } from 'vue-router'; // 2. 取消註解
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth'; // 3. 匯入 Auth Store

const router = useRouter();
const toast = useToast();
const auth = useAuthStore(); // 4. 初始化 Store
const loading = ref(false);

const loginForm = ref({
  account: '',
  password: '',
  rememberMe: false // 5. 加入 rememberMe 到表單物件
});

const handleLogin = async () => {
  // 基本驗證
  if (!loginForm.value.account || !loginForm.value.password) {
    toast.add({ severity: 'error', summary: '錯誤', detail: '請填寫完整資訊', life: 3000 });
    return;
  }

  loading.value = true;
  try {
    // 6. 呼叫後端 API (路徑與後端控制器名稱對齊)
    const res = await axios.post('http://localhost:5158/api/AccountApi/Login', loginForm.value);
    
    // 7. 登入成功處理
    // 將後端回傳的 user 資訊存入 Pinia，這會觸發 Navbar 更新
    auth.login(res.data.user);
    
    toast.add({ severity: 'success', summary: '登入成功', detail: `歡迎回來，${res.data.user.name}！`, life: 2000 });

    // 8. 導向首頁
    setTimeout(() => router.push('/'), 1000);
    
  } catch (error) {
    console.error("登入錯誤：", error);
    // 取得後端傳回的錯誤訊息
    const errorMsg = error.response?.data?.message || '帳號或密碼錯誤';
    toast.add({ severity: 'error', summary: '登入失敗', detail: errorMsg, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const FastLogin =async()=>{
  // 基本驗證

  loginForm.value.account = 'test000'
  loginForm.value.password = '123456'

  loading.value = true;
  try {
    // 6. 呼叫後端 API (路徑與後端控制器名稱對齊)
    const res = await axios.post('http://localhost:5158/api/AccountApi/Login', loginForm.value);
    
    // 7. 登入成功處理
    // 將後端回傳的 user 資訊存入 Pinia，這會觸發 Navbar 更新
    auth.login(res.data.user);
    
    toast.add({ severity: 'success', summary: '登入成功', detail: `歡迎回來，${res.data.user.name}！`, life: 2000 });

    // 8. 導向首頁
    setTimeout(() => router.push('/'), 1000);
    
  } catch (error) {
    console.error("登入錯誤：", error);
    // 取得後端傳回的錯誤訊息
    const errorMsg = error.response?.data?.message || '帳號或密碼錯誤';
    toast.add({ severity: 'error', summary: '登入失敗', detail: errorMsg, life: 3000 });
  } finally {
    loading.value = false;
  }
}

</script>