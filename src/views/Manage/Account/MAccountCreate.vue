<template>
  <div class="container py-5" style="max-width: 900px; margin: 0 auto;">
    <Toast />
    
    <Card class="shadow-3 border-none overflow-hidden">
      <template #header>
        <div class="bg-green-600 text-white p-4 flex align-items-center">
          <i class="pi pi-user-plus mr-3 text-2xl"></i>
          <h3 class="m-0 text-xl font-bold">建立新帳號</h3>
        </div>
      </template>

      <template #content>
        <div class="p-fluid grid mt-2">
          <div class="col-12 md:col-6 field">
            <label for="account" class="font-bold block mb-2">登入帳號</label>
            <InputText id="account" v-model="form.account" placeholder="建議使用英文或數字" 
                       :class="{ 'p-invalid': v$.account.$error }" />
            <small class="p-error" v-if="v$.account.$error">請輸入有效帳號 (最少 4 字)</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label for="name" class="font-bold block mb-2">顯示名稱</label>
            <InputText id="name" v-model="form.memberName" placeholder="填寫使用者姓名" />
          </div>

          <div class="col-12 field">
            <label for="email" class="font-bold block mb-2">電子信箱</label>
            <InputText id="email" v-model="form.email" type="email" placeholder="example@moshop.com" />
          </div>

          <div class="col-12 md:col-6 field">
            <label for="password" class="font-bold block mb-2">初始密碼</label>
            <Password id="password" v-model="form.password" :feedback="true" toggleMask 
                      placeholder="請輸入安全密碼" />
          </div>

          <div class="col-12 md:col-6 field">
            <label for="confirm" class="font-bold block mb-2">確認密碼</label>
            <Password id="confirm" v-model="form.confirmPassword" :feedback="false" toggleMask 
                      placeholder="再次輸入密碼" />
          </div>

         <div class="col-12 md:col-6 field">
  <label class="font-bold block mb-2 text-900">指派權限等級</label>
  <PSelect 
    v-model="form.permissions" 
    :options="filteredRoles" 
    optionLabel="label" 
    optionValue="value" 
    placeholder="-- 請選擇權限 --" 
    class="w-full"
    :class="{ 'p-invalid': v$.permissions.$error }"
  />
  <small class="p-error" v-if="v$.permissions.$error">必須指派一個權限等級</small>
</div>
        </div>
      </template>

      <template #footer>
        <Divider />
        <div class="flex justify-content-end gap-3 px-3 pb-3">
          <PButton label="取消返回" severity="secondary" text @click="router.push('/manage/account')" />
          <PButton label="確認建立" severity="success" icon="pi pi-check" 
                   :loading="isSaving" @click="handleCreate" class="px-5 shadow-2" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth'; // 假設你用 Pinia 存 User 資訊
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email, sameAs } from '@vuelidate/validators';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const isSaving = ref(false);

// 1. 表單資料結構 (對應 MemberCreateViewModel)
const form = ref({
  account: '',
  memberName: '',
  email: '',
  password: '',
  confirmPassword: '',
  permissions: null
});

// 2. 驗證規則
const rules = {
  account: { required, minLength: minLength(4) },
  memberName: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAsPassword: sameAs(computed(() => form.value.password)) },
  permissions: { required }
};
const v$ = useVuelidate(rules, form);

// 3. 權限過濾邏輯 (復刻 ViewBag.LoginUserRole 的邏輯)
const allRoles = [
  { label: '一般會員 (Member)', value: 1 },
  { label: '特約商店 (Store)', value: 2 },
  { label: '管理員 (Admin)', value: 3 },
  { label: '系統開發者 (System)', value: 4 }
];

// 權限過濾邏輯：登入者不能指派比自己更高的權限
const filteredRoles = computed(() => {
  const currentLevel = authStore.currentUserLevel; 
  return allRoles.filter(role => role.value > 0 && role.value <= currentLevel);
});

// 4. 送出表單
const handleCreate = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    toast.add({ severity: 'error', summary: '格式錯誤', detail: '請檢查表單填寫是否完整', life: 3000 });
    return;
  }

  isSaving.value = true;
  try {
    // 這裡要注意：API 路徑要與你的 Controller 對齊
    const res = await axios.post('http://localhost:5158/api/manage/MAccountApi', form.value, {
      withCredentials: true // 確保發送 Cookie 以通過 [Authorize] 檢查
    });

    if (res.data.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '帳號已成功建立', life: 2000 });
      setTimeout(() => router.push('/manage/account'), 1500);
    }
  } catch (err) {
    const msg = err.response?.data?.message || '新增失敗，帳號可能已重複';
    toast.add({ severity: 'error', summary: '失敗', detail: msg });
  } finally {
    isSaving.value = false;
  }
};


</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>