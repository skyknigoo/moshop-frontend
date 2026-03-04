<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from "primevue/usetoast";
import { z } from "zod";
import { useRoute } from 'vue-router'; // 1. 匯入 useRoute
import { useRouter } from 'vue-router'; // 1. 匯入 useRoute
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth';

const router = useRouter(); // 動作派
const route = useRoute();   // 資訊派
const toast = useToast();
const auth = useAuthStore();


const initialValues = ref({
    account: '',
    password: '',
});

const resolver = ref(zodResolver(
    z.object({
        account: z.string().min(1, { message: '請輸入帳號' }),
        password: z.string().min(1, { message: "請輸入密碼" })
    })
))


// Cookie方法
// const onFormSubmit = async () => {
//     try {
//         const res = await axios.post('http://localhost:5158/api/AccountApi/Login', initialValues.value)
//         console.log("🚀 ~ onFormSubmit ~ res=>", res)
//         auth.login(res.data.user);

//         toast.add({ severity: 'success', summary: '登入成功', detail: `歡迎回來，${res.data.user.name}！`, life: 2000 })

//         setTimeout(() => router.push('/', 1000));

//     } catch (error) {
//         console.log("登入失敗:", error);
//         const errorMsg = error.response?.daat?.message || '帳號或密碼錯誤';
//         toast.add({ severity: 'error', summary: '登入失敗', detail: errorMsg, life: 3000 });
//     }

// }

const onFormSubmit = async () => {
    try {
        // 1. 發送請求
        const res = await api.post('/AccountApi/Login', initialValues.value)
        console.log("🚀 ~ onFormSubmit ~ res=>", res)

        // 2. 解構出 token 和 user (這是後端回傳的新結構)
        const { token, user } = res;

        // 3. 將資料存入 Auth Store
        // 記得修改你的 authStore.login，讓它能同時接收 user 和 token
        auth.login(user, token);

        toast.add({
            severity: 'success',
            summary: '登入成功',
            detail: `歡迎回來，${user.name}！`,
            life: 2000
        });

        const redirectPath = route.query.redirect || '/';
        setTimeout(() => router.push(redirectPath), 1);
    } catch (error) {
        console.log("登入失敗:", error);
        // 修正：將 .daat 改回 .data
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
                                    {{ $form.password.error?.message }}
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
