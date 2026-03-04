<template>
  <div class="container py-5" style="max-width: 800px; margin: 0 auto;">
    <Toast />

    <Card class="shadow-3 border-none overflow-hidden">
      <template #header>
        <div class="bg-blue-600 text-white p-4 flex align-items-center">
          <i class="pi pi-user-edit mr-3 text-2xl"></i>
          <h3 class="m-0 text-xl font-bold">修改使用者資料：{{ form.account }}</h3>
        </div>
      </template>

      <template #content>
        <div v-if="!loading" class="p-fluid grid mt-2">
          <div class="col-12 md:col-6 field">
            <label for="name" class="font-bold block mb-2">名稱</label>
            <InputText id="name" v-model="form.memberName" :class="{ 'p-invalid': v$.memberName.$error }" />
            <small class="p-error" v-if="v$.memberName.$error">請輸入名稱</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label for="email" class="font-bold block mb-2">Email</label>
            <InputText id="email" v-model="form.email" :class="{ 'p-invalid': v$.email.$error }" />
            <small class="p-error" v-if="v$.email.$error">請輸入有效的 Email 地址</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label for="password" class="font-bold block mb-2">重設密碼 (留空則不修改)</label>
            <Password id="password" v-model="form.password" toggleMask placeholder="******" :feedback="true" />
          </div>

          <div class="col-12 md:col-6 field">
            <label for="confirm" class="font-bold block mb-2">確認新密碼</label>
            <Password id="confirm" v-model="form.confirmPassword" toggleMask placeholder="******" :feedback="false" />
            <small class="p-error" v-if="v$.confirmPassword.$error">兩次新密碼輸入不一致</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label class="font-bold block mb-2">權限設定</label>
            <PSelect v-model="form.permissions" :options="filteredRoles" optionLabel="label" optionValue="value"
              placeholder="請選擇權限" />
            <div v-if="authStore.currentUserLevel < 4" class="mt-2 text-500 text-xs">
              <i class="pi pi-info-circle mr-1"></i> 只有系統開發者可以指派系統管理員權限。
            </div>
          </div>
        </div>

        <div v-else class="text-center py-5">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
          <p class="mt-3 text-500">正在獲取使用者資料...</p>
        </div>

        <div class="mt-4 p-3 surface-100 border-round text-500 text-xs">
          <div class="flex justify-content-between">
            <span>最後修改人員：{{ authStore.user?.account }} (當前登入)</span>
            <span>最後修改時間：{{ currentTime }}</span>
          </div>
        </div>
      </template>

      <template #footer>
        <Divider />
        <div class="flex justify-content-end gap-3 px-3 pb-3">
          <PButton label="取消返回" severity="secondary" text @click="router.push('/manage/account')" />
          <PButton label="儲存修改" severity="primary" icon="pi pi-save" :loading="isSaving" @click="handleUpdate"
            class="px-4 shadow-2" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth'; // 引用你的 auth.js
import { useVuelidate } from '@vuelidate/core';
import { required, email, sameAs } from '@vuelidate/validators';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const isSaving = ref(false);
const currentTime = ref(new Date().toLocaleString());

// 1. 表單資料結構 (對應 MemberEditViewModel)
const form = ref({
  account: '',
  memberName: '',
  email: '',
  password: '',
  confirmPassword: '',
  permissions: null
});

// 2. 驗證規則 (密碼不改則不驗證，但若輸入則需一致)
const rules = {
  memberName: { required },
  email: { required, email },
  confirmPassword: {
    sameAsPassword: sameAs(computed(() => form.value.password))
  }
};
const v$ = useVuelidate(rules, form);

// 3. 權限選項與過濾邏輯
const allRoles = [
  { label: '一般會員', value: 1 },
  { label: '特約店家', value: 2 },
  { label: '管理員', value: 3 },
  { label: '系統開發者', value: 4 }
];

const filteredRoles = computed(() => {
  // 讀取當前管理員的數字等級
  const currentLevel = authStore.currentUserLevel;
  return allRoles.filter(role => role.value > 0 && role.value <= currentLevel);
});

// 4. 初始化讀取資料
const initData = async () => {
  try {
    const accountId = route.params.account;
    const res = await api.get(`/manage/MAccountApi/${accountId}`, {
      withCredentials: true
    });

    // 將後端回傳資料填入表單
    form.value.account = res.account;
    form.value.memberName = res.memberName;
    form.value.email = res.email;
    form.value.permissions = res.permissions;
    form.value.password = ''; // 密碼欄位預設清空
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: '錯誤', detail: '無法獲取該帳號資料' });
    router.push('/manage/account');
  } finally {
    loading.value = false;
  }
};

// 5. 執行更新動作
const handleUpdate = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    toast.add({ severity: 'warn', summary: '驗證失敗', detail: '請確認輸入內容是否正確' });
    return;
  }

  isSaving.value = true;
  try {
    // 發送 PUT 請求至 api/manage/MAccountApi/{account}
    const res = await api.put(`/manage/MAccountApi/${form.value.account}`, form.value, {
      withCredentials: true
    });

    if (res.success) {
      toast.add({ severity: 'success', summary: '成功', detail: res.message, life: 2000 });
      setTimeout(() => router.push('/manage/account'), 1500);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || '資料更新失敗';
    toast.add({ severity: 'error', summary: '更新失敗', detail: errorMsg });
  } finally {
    isSaving.value = false;
  }
};

onMounted(initData);
</script>

<style scoped>
.field {
  margin-bottom: 1.2rem;
}
</style>
