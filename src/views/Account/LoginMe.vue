<script setup lang="ts"> // 1. 加上 lang="ts"
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from "primevue/usetoast";
import { z } from "zod";
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth';

// 2. 定義表單資料型別
interface LoginValues {
    account?: string;
    password?: string;
}

const router = useRouter();
const route = useRoute();
const toast = useToast();
const auth = useAuthStore();

const initialValues = ref<LoginValues>({
    account: '',
    password: '',
});

const resolver = ref(zodResolver(
    z.object({
        account: z.string().min(1, { message: '請輸入帳號' }),
        password: z.string().min(1, { message: "請輸入密碼" })
    })
))

// 3. 加上參數型別標註
const onFormSubmit = async ({ valid }: { valid: boolean }) => {
    if (!valid) return;

    try {
        // 1. 發送請求 (維持原本 API 路徑)
        const res: any = await api.post('/AccountApi/Login', initialValues.value)
        console.log("🚀 ~ onFormSubmit ~ res=>", res)

        // 2. 解構出 token 和 user (TS 現在知道 res 是 any 所以不會報錯)
        const { token, user } = res;

        // 3. 將資料存入 Auth Store
        auth.login(user, token);

        toast.add({
            severity: 'success',
            summary: '登入成功',
            detail: `歡迎回來，${user.name}！`,
            life: 2000
        });

        // 4. 處理跳轉路徑 (加上字串轉型以符合 TS 要求)
        const redirectPath = (route.query.redirect as string) || '/';
        setTimeout(() => router.push(redirectPath), 1);

    } catch (error: any) {
        console.log("登入失敗:", error);
        // 修正後的錯誤訊息讀取
        const errorMsg = error.response?.data?.message || '帳號或密碼錯誤';
        toast.add({ severity: 'error', summary: '登入失敗', detail: errorMsg, life: 3000 });
    }
}
</script>

<template>
    <div style="display: flex;justify-content: center;">
        <Card style="width: 30rem; overflow: hidden ; ">
            <template #header>
                <img class="w-full" alt="user header" src="/uploads/Logo/LogoMoShop2.jpg" />
            </template>
            <template #title>
                <div style="background-color: cornflowerblue; color: white; padding: 1rem; border-radius: 4px;">
                    請登入您的 MoShop 帳號
                </div>
            </template>

            <template #content>
                <PForm v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
                    class="flex flex-col gap-4 w-full ">
                    <div class="flex flex-col gap-3">
                        <div class="flex flex-col gap-y-1">
                            <label for="account" class="font-semibold text-slate-700">帳號</label>
                            <InputText name="account" id="account" v-model="initialValues.account" fluid />
                            <Message class="text-red-400  -m-1" v-if="$form?.account?.invalid" severity="error"
                                size="small" variant="simple">
                                {{ $form.account.error?.message }}
                            </Message>
                        </div>

                        <div class="flex flex-col gap-y-1">
                            <label for="password" class="font-semibold text-slate-700">密碼</label>
                            <Password name="password" id="password" v-model="initialValues.password" :feedback="false"
                                toggleMask fluid />
                            <template v-if="$form?.password?.invalid">
                                <Message v-for="(error, index) of $form.password.errors" :key="index" severity="error"
                                    size="small" variant="simple" class="text-red-400  -m-1">
                                    {{ error.message }}
                                </Message>
                            </template>
                        </div>

                        <div class="flex flex-col gap-y-2 mt-4">
                            <PButton label="立即登入" class="w-full" type="submit" />
                            <PButton label="註冊帳號" severity="link" variant="outlined" class="w-full text-blue-500"
                                @click="$router.push('registerMe')" />
                        </div>
                    </div>
                </PForm>
            </template>
            <template #footer>
            </template>
        </Card>
    </div>
</template>
