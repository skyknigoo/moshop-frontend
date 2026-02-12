<template>
  <div class="container mt-5 px-4" style="max-width: 650px; margin: 0 auto;">
    <Toast />

    <Card class="shadow-4 border-none border-round-xl overflow-hidden">
      <template #title>
        <div class="flex align-items-center gap-3 py-2 border-bottom-1 surface-border">
          <i class="pi pi-user-edit text-primary text-3xl"></i>
          <h4 class="m-0 font-bold text-900">個人資料管理</h4>
        </div>
      </template>

      <template #content>
        <div class="p-fluid">
          <div class="grid mb-4">
            <div class="col-12 md:col-6">
              <label class="text-500 font-medium text-sm block mb-2">會員姓名</label>
              <div class="text-xl font-bold text-900 bg-blue-50 p-3 border-round">
                {{ user.memberName }}
              </div>
            </div>
            <div class="col-12 md:col-6">
              <label class="text-500 font-medium text-sm block mb-2">電子信箱</label>
              <div class="text-xl font-bold text-900 bg-blue-50 p-3 border-round">
                {{ user.email }}
              </div>
            </div>
          </div>

          <Divider align="left" class="my-4">
            <span class="p-tag p-tag-info">安全性設定</span>
          </Divider>

          <div v-if="!showPasswordSection" class="text-center py-2">
            <PButton 
              label="修改登入密碼" 
              icon="pi pi-shield" 
              severity="primary"
              outlined 
              class="w-full md:w-auto px-6 py-3 font-bold"
              @click="togglePasswordFields" 
            />
          </div>

          <div v-if="showPasswordSection" class="p-4 surface-50 border-round-lg border-1 surface-border">
            <div class="flex align-items-center justify-content-between mb-4">
              <h6 class="m-0 font-bold text-lg text-900">設定新密碼</h6>
              <PButton icon="pi pi-times" severity="secondary" rounded text @click="togglePasswordFields" />
            </div>
            
            <div class="flex flex-column gap-4">
              <div class="flex flex-column gap-2">
                <label for="oldPass" class="text-sm font-bold text-700">目前密碼</label>
                <Password 
                  id="oldPass" 
                  v-model="passForm.OldPassword" 
                  :feedback="false" 
                  toggleMask 
                  placeholder="請輸入目前的密碼" 
                  inputClass="w-full p-3"
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="newPass" class="text-sm font-bold text-700">新密碼</label>
                <Password 
                  id="newPass" 
                  v-model="passForm.NewPassword" 
                  toggleMask 
                  placeholder="請輸入新密碼"
                  promptLabel="請輸入符合規範的強密碼"
                  weakLabel="強度：弱"
                  mediumLabel="強度：中"
                  strongLabel="強度：高"
                  inputClass="w-full p-3"
                >
                  <template #footer>
                    <Divider />
                    <p class="mt-2 text-xs font-bold text-primary">密碼安全規範：</p>
                    <ul class="pl-3 m-0 text-xs line-height-3 text-600">
                      <li>長度必須至少 8 位</li>
                      <li>需包含大、小寫英文變體</li>
                      <li>需包含至少一個數字</li>
                      <li>需包含特殊符號 (@$!%*?&)</li>
                    </ul>
                  </template>
                </Password>
              </div>

              <div class="flex flex-column gap-2">
                <label for="confirmPass" class="text-sm font-bold text-700">確認新密碼</label>
                <Password 
                  id="confirmPass" 
                  v-model="passForm.confirmPassword" 
                  :feedback="false" 
                  toggleMask 
                  placeholder="請再次輸入新密碼" 
                  inputClass="w-full p-3"
                />
              </div>

              <div class="flex gap-3 mt-2">
                <PButton 
                  label="確認儲存" 
                  icon="pi pi-save" 
                  class="flex-1 py-3 font-bold" 
                  @click="submitPassword" 
                  :loading="isSubmitting" 
                />
                <PButton 
                  label="取消修改" 
                  severity="secondary" 
                  outlined 
                  class="flex-1 py-3" 
                  @click="togglePasswordFields" 
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div class="text-center mt-4 text-500 text-sm">
      最後更新時間：{{ new Date().toLocaleDateString() }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// 狀態管理
const user = ref({ memberName: '', email: '' });
const showPasswordSection = ref(false);
const isSubmitting = ref(false);

const passForm = ref({
  OldPassword: '',
  NewPassword: '',
  confirmPassword: ''
});

// 1. 初始化讀取會員資料
const fetchProfile = async () => {
  try {
    // 呼叫後端 AccountApi 的 Profile 方法
    const res = await axios.get('http://localhost:5158/api/AccountApi/Profile');
    user.value = res.data;
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '連線錯誤', detail: '無法讀取您的會員資料', life: 3000 });
  }
};

// 2. 切換密碼修改區域
const togglePasswordFields = () => {
  showPasswordSection.value = !showPasswordSection.value;
  if (!showPasswordSection.value) {
    // 關閉時清空輸入內容
    passForm.value = { OldPassword: '', NewPassword: '', confirmPassword: '' };
  }
};

// 3. 提交修改密碼邏輯
const submitPassword = async () => {
  const { OldPassword, NewPassword, confirmPassword } = passForm.value;

  // A. 欄位完整性檢查
  if (!OldPassword || !NewPassword || !confirmPassword) {
    toast.add({ severity: 'warn', summary: '輸入未完成', detail: '請填寫所有必要的密碼欄位', life: 3000 });
    return;
  }

  // B. 強強度驗證 (正規表達式)
  // 包含：大寫、小寫、數字、特殊符號，長度至少 8 位
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(NewPassword)) {
    toast.add({
      severity: 'error',
      summary: '密碼強度不足',
      detail: '新密碼必須包含大、小寫字母、數字及特殊符號，且長度至少 8 位',
      life: 5000
    });
    return;
  }

  // C. 密碼一致性檢查
  if (NewPassword !== confirmPassword) {
    toast.add({ severity: 'warn', summary: '密碼不相符', detail: '新密碼與確認密碼不一致', life: 3000 });
    return;
  }

  isSubmitting.value = true;
  try {
    // 呼叫後端修改密碼 API
    const res = await axios.post('http://localhost:5158/api/AccountApi/ChangePassword', {
    oldPassword: OldPassword,
    newPassword: NewPassword,
    ConfirmPassword:confirmPassword,
    });

    if (res.data.success) {
      toast.add({ severity: 'success', summary: '修改成功', detail: '您的登入密碼已完成更新', life: 3000 });
      togglePasswordFields(); // 隱藏表單
    }
  } catch (err) {
    console.log("錯誤資訊=>",err)
    const errorMsg = err.response?.data?.message || '原密碼輸入有誤，請再試一次';
    toast.add({ severity: 'error', summary: '修改失敗', detail: errorMsg, life: 3000 });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchProfile);
</script>

<style scoped>
/* 可以在這裡加入細微的轉場效果 */
.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>