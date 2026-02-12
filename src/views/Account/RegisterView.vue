<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground p-4">
    <Card class="w-full md:w-30rem shadow-4">
      <template #title>
        <div class="text-center mb-4">
          <h2 class="text-3xl font-bold text-900 m-0">註冊會員</h2>
          <p class="text-600 mt-2">加入 MoShop 享受購物樂趣</p>
        </div>
      </template>

      <template #content>
        <div class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label class="font-bold">帳號</label>
            <InputText v-model="registerForm.Account" placeholder="請輸入帳號" />
          </div>

          <div class="flex flex-column gap-2">
            <label class="font-bold">姓名</label>
            <InputText v-model="registerForm.MemberName" placeholder="請輸入姓名" />
          </div>

          <div class="flex flex-column gap-2">
            <label class="font-bold">Email</label>
            <InputText v-model="registerForm.Email" placeholder="example@mail.com" />
          </div>

          <div class="flex flex-column gap-2">
            <label class="font-bold">設定密碼</label>
            <Password v-model="registerForm.Password" toggleMask placeholder="請輸入密碼" />
            <small class="text-500">需包含大、小寫字母、數字及符號，至少 8 位</small>
          </div>

          <div class="flex flex-column gap-2">
            <label class="font-bold">確認密碼</label>
            <Password v-model="confirmPassword" :feedback="false" toggleMask placeholder="請再次輸入密碼" />
          </div>

          <PButton label="同意條款並註冊" icon="pi pi-user-plus" severity="success" class="w-full mt-4 p-3" @click="handleRegister" />
          <PButton label="已有帳號？返回登入" link class="w-full mt-2" @click="$router.push('/login')" />
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const registerForm = ref({
  MemberName: '',
  Account: '',
  Password: '',
  Email: ''
});
const confirmPassword = ref('');

// 密碼驗證邏輯
const handleRegister = async () => {
  const { Account, MemberName, Email, Password } = registerForm.value;

  // 1. 必填檢查
  if (!Account || !MemberName || !Email || !Password || !confirmPassword.value) {
    toast.add({ severity: 'error', summary: '錯誤', detail: '所有欄位均為必填', life: 3000 });
    return;
  }

  // 2. 密碼強度檢查 (正規表達式)
  // 包含：大寫、小寫、數字、特殊符號，長度至少 8 位
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(Password)) {
    toast.add({
      severity: 'error',
      summary: '密碼格式不正確',
      detail: '密碼需至少 8 位，且包含大、小寫字母、數字及特殊符號',
      life: 5000
    });
    return;
  }

  // 3. 密碼一致性檢查
  if (Password !== confirmPassword.value) {
    toast.add({ severity: 'warn', summary: '注意', detail: '兩次密碼輸入不一致', life: 3000 });
    return;
  }

  // 4. 通過驗證，送出 API
  try {
    await axios.post('http://localhost:5158/api/AccountApi/Register', registerForm.value);
    toast.add({ severity: 'success', summary: '成功', detail: '註冊成功！即將前往登入頁', life: 2000 });
    setTimeout(() => router.push('/login'), 2000);
  } catch (error) {
    console.error("API 報錯內容：", error); 
    toast.add({ severity: 'error', summary: '註冊失敗', detail: '該帳號可能已被使用', life: 3000 });
  }
};
</script>