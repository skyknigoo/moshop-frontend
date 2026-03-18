<script setup lang="ts">// 1. 加上 lang="ts"
import { ref, onMounted } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import { z } from "zod";

// --- 2. 定義型別，確保與你的 API 回傳資料一致 ---
interface UserProfile {
  memberName: string;
  email: string;
}

const toast = useToast();

// 3. 為 ref 加上型別標註
const user = ref<UserProfile>({ memberName: '', email: '' })
const showPasswordSection = ref(false);
const isSubmitting = ref(false);

// 讀取會員資料
const fetchProfile = async () => {
  try {
    // 使用 generic 定義回傳值型別，確保 res.memberName 能被正確辨識
    const res = await api.get<UserProfile>('/AccountApi/Profile');
    user.value = res as any; // 這裡視你 axios 攔截器的回傳處理而定，通常 res 已經是 data
  } catch (e) {
    console.log("🚀 ~ fetchProjile ~ e=>", e)
    toast.add({ severity: 'error', summary: '連線錯誤', detail: '無法讀取您的會員資料', life: 3000 });
  }
}

// 隱藏顯示修改密碼區域
const togglePasswordFields = () => {
  showPasswordSection.value = !showPasswordSection.value;
  if (!showPasswordSection.value) {
    initialValues.value = { OldPassword: '', NewPassword: '', ConfirmPassword: '' }
  }
}

const initialValues = ref({
  OldPassword: '',
  NewPassword: '',
  ConfirmPassword: '',
});

// --- 4. 將 Zod Schema 抽出，方便 TS 推導型別 ---
const passwordSchema = z.object({
  OldPassword: z.string().min(1, { message: "請填寫原始密碼" }),
  NewPassword: z.string()
    .min(8, { message: "最少需要 8 位" })
    .max(16, { message: "最多只能 16 位" })
    .refine((val) => /[a-z]/.test(val), { message: '需含有小寫英文' })
    .refine((val) => /[A-Z]/.test(val), { message: "需含有大寫英文" })
    .refine((val) => /\d/.test(val), { message: '需含有數字' })
    .refine((val) => /[@$!%*?&]/.test(val), "需含有特殊符號 (@$!%*?&)"),
  ConfirmPassword: z.string().min(1, '請再次輸入密碼')
}).refine((data) => data.NewPassword === data.ConfirmPassword, {
  message: '兩次輸入的密碼不一致',
  path: ["ConfirmPassword"],
});

const resolver = ref(zodResolver(passwordSchema));

// --- 5. 為提交函式的參數加上型別 ---
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    isSubmitting.value = true;
    console.log('傳遞資料:', values)

    try {
      await api.post('/AccountApi/ChangePassword', values);
      toast.add({ severity: 'success', summary: '密碼修改成功', detail: "您的登入密碼已完成更新", life: 5000 })
      togglePasswordFields();
    } catch (error: any) {
      console.log("🚀 ~ submitPassword ~ err=>", error)
      const errorMsg = error.response?.data?.message || '當前密碼輸入有錯誤,請重新輸入';
      toast.add({ severity: 'error', summary: '密碼修改失敗', detail: errorMsg, life: 5000 });
      initialValues.value = { OldPassword: '', NewPassword: '', ConfirmPassword: '' }
    } finally {
      isSubmitting.value = false;
    }
  }
}

// 讀取一次
onMounted(fetchProfile);
</script>

<template>
  <div style=" display: flex; justify-content: center;">
    <Card style=" width: 30rem; overflow: hidden;padding: 10px;">
      <template #header>
        <div class="headTitle">
          <i class="pi pi-user-edit text-primary text-3xl p-2"></i>
          <div>個人資料</div>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-2">
          <label for="username">會員姓名</label>
          <div class="text-xl font-bold text-900 bg-blue-50 p-3 border-round">
            {{ user.memberName }}
          </div>
          <label for="username">電子信箱</label>
          <div class="text-xl font-bold text-900 bg-blue-50 p-3 border-round">
            {{ user.email }}
          </div>
        </div>

        <Divider align="left" class="my-4">
          <span class="p-tag p-tag-info">安全性設定</span>
        </Divider>

        <div class="text-center py-2">
          <PButton icon="pi pi-shield" label="修改登入密碼" severity="success" outlined @click="togglePasswordFields" />
        </div>

        <div v-if="showPasswordSection" class="p-4 surface-50 border-round-lg border-1 surface-border">
          <PForm v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full ">
            <div class="flex flex-col gap-2">
              <label for="OldPassword">目前密碼</label>
              <Password name="OldPassword" id="OldPassword" v-model="initialValues.OldPassword" fluid />
              <Message class="text-red-400 -m-1" v-if="$form?.OldPassword?.invalid" severity="error" size="small"
                variant="simple">
                {{ $form.OldPassword.error?.message }}
              </Message>
            </div>
            <div class="flex flex-col gap-2">
              <label for="NewPassword">新密碼</label>
              <Password name="NewPassword" id="NewPassword" v-model="initialValues.NewPassword" fluid />
              <Message class="text-red-400 -m-1" v-if="$form?.NewPassword?.invalid" severity="error" size="small"
                variant="simple">
                {{ $form.NewPassword.error?.message }}
              </Message>
            </div>
            <div class="flex flex-col gap-2">
              <label for="ConfirmPassword">確認密碼</label>
              <Password name="ConfirmPassword" id="ConfirmPassword" v-model="initialValues.ConfirmPassword" fluid />
              <Message class="text-red-400 -m-1" v-if="$form?.ConfirmPassword?.invalid" severity="error" size="small"
                variant="simple">
                {{ $form.ConfirmPassword.error?.message }}
              </Message>
            </div>
            <div v-if="showPasswordSection" class="flex gap-3 mt-2">
              <PButton label="確認修改" icon="pi pi-save" class="flex-1 py-3 font-bold" type="submit"
                :loading="isSubmitting" />
              <PButton label="取消修改" severity="secondary" outlined class="flex-1 py-3" @click="togglePasswordFields" />
            </div>
          </PForm>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
/* 樣式保持原樣 */
.headTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  font-weight: bold;
  padding: 10px;
  border-bottom: 1px solid rgb(161, 161, 161);
}
</style>
