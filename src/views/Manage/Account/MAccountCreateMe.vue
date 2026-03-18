<script setup lang="ts"> // 1. 加上 lang="ts"
import { computed, ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from "primevue/usetoast";
import { z } from "zod";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/axios'

// --- 2. 定義型別介面 ---
interface RoleOption {
    label: string;
    value: number;
}

interface AccountCreateForm {
    Account: string;
    MemberName: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
    permissions: number | null;
}

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const isSaving = ref(false);

// 3. 標註初始值型別
const initialValues = ref<AccountCreateForm>({
    Account: '',
    MemberName: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    permissions: null
});

// 角色選項
const allRoles: RoleOption[] = [
    { label: '一般會員 (Member)', value: 1 },
    { label: '特約商店 (Store)', value: 2 },
    { label: '管理員 (Admin)', value: 3 },
    { label: '系統開發者 (System)', value: 4 }
]

// 權限過濾邏輯 (加上 any 轉型以相容 authStore)
const filteredRoles = computed(() => {
    const currentLevel = (authStore as any).currentUserLevel || 0;
    return allRoles.filter(role => role.value > 0 && role.value <= currentLevel);
})

// Zod 驗證邏輯保持原樣
const resolver = ref(zodResolver(
    z.object({
        Account: z.string().min(8, { message: '帳號最少需要 8 位' }),
        MemberName: z.string().min(1, { message: '請填寫姓名' }),
        Email: z.string().email("信箱格式不正確"),
        Password: z.string()
            .min(8, { message: "最少需要 8 位" })
            .max(16, { message: "最多只能 16 位" })
            .refine((val) => /[a-z]/.test(val), { message: '需含有小寫英文' })
            .refine((val) => /[A-Z]/.test(val), { message: "需含有大寫英文" })
            .refine((val) => /\d/.test(val), { message: '需含有數字' })
            .refine((val) => /[@$!%*?&]/.test(val), "需含有特殊符號 (@$!%*?&)"),
        ConfirmPassword: z.string().min(1, '請再次輸入密碼'),
        permissions: z.coerce
            .number({ message: '請選擇權限' })
            .min(1, { message: '請選擇權限' })
    }).refine((data) => data.Password === data.ConfirmPassword, {
        message: '兩次輸入的密碼不一致',
        path: ["ConfirmPassword"],
    })
))

// 4. 加上參數型別標註
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
    if (valid) {
        console.log("傳遞的資料=>", values)
        isSaving.value = true;
        try {
            // 維持原本 API 路徑
            const res: any = await api.post('/manage/MAccountApi', values);

            if (res.success) {
                toast.add({ severity: 'success', summary: '成功', detail: '帳號已成功建立', life: 2000 });
                setTimeout(() => router.push('/manage/accountMe'), 1500);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || '新增失敗，帳號可能已重複';
            toast.add({ severity: 'error', summary: '失敗', detail: msg });
        } finally {
            isSaving.value = false;
        }
    }
}
</script>

<template>
  <div class="container py-5" style="max-width: 900px; margin: 0 auto;">
    <PForm v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit">
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
              <label for="Account" class="font-semibold text-slate-700">帳號</label>
              <InputText class="w-full" name="Account" id="Account" v-model="initialValues.Account" placeholder="請輸入帳號" fluid />
              <Message class="text-red-400  -m-1" v-if="$form?.Account?.invalid" severity="error" size="small" variant="simple">
                {{ $form.Account.error?.message }}
              </Message>
            </div>

            <div class="col-12 md:col-6 field">
              <label for="MemberName" class="font-bold block mb-2">姓名</label>
              <InputText class="w-full" id="MemberName" name="MemberName" v-model="initialValues.MemberName" placeholder="填寫使用者姓名" />
              <Message class="text-red-400  -m-1" v-if="$form?.MemberName?.invalid" severity="error" size="small" variant="simple">
                {{ $form.MemberName.error?.message }}
              </Message>
            </div>

            <div class="col-12 field">
              <label for="Email" class="font-bold block mb-2">電子信箱</label>
              <InputText class="w-full" id="Email" name="Email" v-model="initialValues.Email" type="Email" placeholder="example@moshop.com" />
              <Message class="text-red-400  -m-1" v-if="$form?.Email?.invalid" severity="error" size="small" variant="simple">
                {{ $form.Email.error?.message }}
              </Message>
            </div>

            <div class="col-12 md:col-6 field">
              <label for="Password" class="font-bold block mb-2">初始密碼</label>
              <Password id="Password" name="Password" v-model="initialValues.Password" :feedback="true" toggleMask placeholder="請輸入安全密碼" />
              <br>
              <Message class="text-red-400  -m-1" v-if="$form?.Password?.invalid" severity="error" size="small" variant="simple">
                {{ $form.Password.error?.message }}
              </Message>
            </div>

            <div class="col-12 md:col-6 field">
              <label for="ConfirmPassword" class="font-bold block mb-2">確認密碼</label>
              <Password id="ConfirmPassword" name="ConfirmPassword" v-model="initialValues.ConfirmPassword" :feedback="false" toggleMask placeholder="再次輸入密碼" />
              <br>
              <Message class="text-red-400  -m-1" v-if="$form?.ConfirmPassword?.invalid" severity="error" size="small" variant="simple">
                {{ $form.ConfirmPassword.error?.message }}
              </Message>
            </div>

            <div class="col-12 md:col-6 field">
              <label class="font-bold block mb-2 text-900">指派權限等級</label>
              <PSelect id="permissions" name="permissions" v-model="initialValues.permissions" :options="filteredRoles" optionLabel="label" optionValue="value" placeholder="-- 請選擇權限 --" class="w-full" />
              <Message class="text-red-400  -m-1" v-if="$form?.permissions?.invalid" severity="error" size="small" variant="simple">
                {{ $form.permissions.error?.message }}
              </Message>
            </div>
          </div>
        </template>

        <template #footer>
          <Divider />
          <div class="flex justify-content-end gap-3 px-3 pb-3">
            <PButton label="取消返回" severity="secondary" text @click="router.push('/manage/accountMe')" />
            <PButton label="確認建立" severity="success" icon="pi pi-check" :loading="isSaving" type="submit" class="px-5 shadow-2" />
          </div>
        </template>
      </Card>
    </PForm>
  </div>
</template>
