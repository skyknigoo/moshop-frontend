<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useToast } from "primevue/usetoast";
import { z } from "zod";
import { useRouter } from 'vue-router';
import api from '@/api/axios'


const router = useRouter();
const toast = useToast();


const initialValues = ref({
    Account: '',
    MemberName: '',
    Email: '',
    Password: '',
    conpassword: ''
});

const resolver = ref(zodResolver(
    z.object({
        Account: z.string().min(8, { message: '帳號最少需要 8 位' }),
        MemberName: z.string().min(1, { message: '請填寫姓名' }),
        Email: z.string().email("信箱格式不正確"),
        Password: z
            .string()
            .min(8, { message: "最少需要 8 位" })
            .max(16, { message: "最多只能 16 位" })
            .refine((val) => /[a-z]/.test(val), { message: '需含有小寫英文' })
            .refine((val) => /[A-Z]/.test(val), { message: "需含有大寫英文" })
            .refine((val) => /\d/.test(val), { message: '需含有數字' })
            .refine((val) => /[@$!%*?&]/.test(val), "需含有特殊符號 (@$!%*?&)"),
        conpassword: z.string().min(1, '請再次輸入密碼')

    })
        .refine((data) => data.Password === data.conpassword, {
            message: '兩次輸入的密碼不一致',
            path: ["conpassword"],
        })
))

const onFormSubmit = async ({ valid, values }) => {
    if (valid) {
        // toast.add({ severity: 'success', summary: '註冊成功', detail: '歡迎來到MoShop', life: 3000 });
        delete values.conpassword;
        console.log('註冊資料:', values)

        try {
            await api.post('/AccountApi/Register', values);

            toast.add({ severity: 'success', summary: '成功', detail: '註冊成功!即將前往登入頁', life: 2000 });
            setTimeout(() => router.push('/login'), 2000);
        } catch (error) {
            console.error("Api 錯誤詳細資訊:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || '註冊失敗，請稍後再試';
            toast.add({ severity: 'error', summary: '註冊失敗', detail: errorMsg, life: 3000 });
        }
    }
}







</script>
<template>
    <div style="display: flex;justify-content: center;">

        <Card style="width: 50rem; overflow: hidden ; ">
            <template #header>
                <img class="w-full" alt="user header" src="/uploads/Logo/LogoMoShop2.jpg" />
            </template>
            <template #title>
                <div style="background-color: cornflowerblue; color: white; padding: 1rem; border-radius: 4px;">
                    加入 MoShop 享受購物樂趣
                </div>
            </template>

            <template #content>
                <PForm v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
                    class="flex flex-col gap-4 w-full ">
                    <div class="flex flex-col gap-3">
                        <div class="flex flex-col gap-y-1">
                            <label for="Account" class="font-semibold text-slate-700">帳號</label>
                            <InputText name="Account" id="Account" v-model="initialValues.Account" placeholder="請輸入帳號"
                                fluid />
                            <Message class="text-red-400  -m-1" v-if="$form?.Account?.invalid" severity="error"
                                size="small" variant="simple">
                                {{ $form.Account.error?.message }}
                            </Message>

                        </div>
                        <div class="flex flex-col gap-y-1">
                            <label for="MemberName" class="font-semibold text-slate-700">姓名</label>
                            <InputText name="MemberName" id="MemberNamee" v-model="initialValues.MemberName"
                                placeholder="請輸入姓名" fluid />
                            <Message class="text-red-400  -m-1" v-if="$form?.MemberName?.invalid" severity="error"
                                size="small" variant="simple">
                                {{ $form.MemberName.error?.message }}
                            </Message>
                        </div>
                        <div class="flex flex-col gap-y-1">
                            <label for="Email" class="font-semibold text-slate-700">電子信箱</label>
                            <InputText name="Email" id="Email" v-model="initialValues.Email" placeholder="請輸入信箱"
                                fluid />
                            <Message class="text-red-400  -m-1" v-if="$form?.Email?.invalid" severity="error"
                                size="small" variant="simple">
                                {{ $form.Email.error?.message }}
                            </Message>
                        </div>
                        <div class="flex flex-col gap-y-1">
                            <label for="Password" class="font-semibold text-slate-700">密碼</label>
                            <Password name="Password" id="Password" v-model="initialValues.Password" :feedback="false"
                                toggleMask fluid placeholder="********" />
                            <small>需包含大小寫字母及數字，至少 8 位</small>
                            <template v-if="$form?.Password?.invalid">
                                <Message v-for="(error, index) of $form.Password.errors" :key="index" severity="error"
                                    size="small" variant="simple" class="text-red-400  -m-1">
                                    {{ error.message }}
                                </Message>
                            </template>
                        </div>

                        <div class="flex flex-col gap-y-1">
                            <label for="conpassword" class="font-semibold text-slate-700">確認密碼</label>
                            <Password name="conpassword" id="conpassword" v-model="initialValues.conpassword"
                                :feedback="false" toggleMask fluid placeholder="********" />
                            <Message class="text-red-400  -m-1" v-if="$form?.conpassword?.invalid" severity="error"
                                size="small" variant="simple">
                                {{ $form.conpassword.error?.message }}
                            </Message>
                        </div>

                        <div class="flex flex-col gap-y-2 mt-4">
                            <PButton label="立即註冊" class="w-full" type="submit" />
                            <PButton label="已有帳號？ 前往登入" severity="link" variant="outlined" class="w-full text-blue-500"
                                @click="$router.push('loginMe')" />
                        </div>
                    </div>
                </PForm>



            </template>
            <template #footer>

            </template>

        </Card>





    </div>

</template>
