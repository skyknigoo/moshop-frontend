<script setup lang="ts"> // 1. 加上 lang="ts"
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import api from '@/api/axios';

// --- 2. 定義型別介面 (對應你的後端欄位) ---
interface MemberItem {
    account: string;
    memberName: string;
    updatedAt: string | null;
    updatedBy: string | null;
}

interface AccountFilters {
    account: string;
    email: string;
    page: number;
}

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const formatDate = (date: string | null | undefined) => date ? new Date(date).toLocaleString() : '-';

// --- 3. 響應式狀態型別標註 ---
const members = ref<MemberItem[]>([]);
const loading = ref(false);
const totalRecords = ref(0);
const filters = ref<AccountFilters>({
    account: '',
    email: '',
    page: 1
});

// 讀取資料 (維持原本 API 邏輯)
const loadData = async () => {
    loading.value = true;
    try {
        const res: any = await api.get('/manage/MAccountApi', {
            params: filters.value,
            withCredentials: true
        });
        console.log("帳號資料=>", res)

        // API 回傳結構對接
        members.value = res.items || [];
        totalRecords.value = res.pagination?.totalCount || 0;
    } catch (e) {
        console.error(e);
        // 修正錯字 summaty -> summary
        toast.add({ severity: 'error', summary: '資料讀取失敗', detail: '伺服器連線異常' })
    } finally {
        loading.value = false;
    }
}

// 清除
const resetFilters = () => {
    filters.value = { account: '', email: '', page: 1 };
    loadData();
}

// 切頁 (標註事件型別)
const onPageChange = (event: any) => {
    filters.value.page = event.page + 1;
    loadData();
}

// 刪除帳號 (標註參數型別)
const confirmDelete = (user: MemberItem) => {
    confirm.require({
        header: '確定要刪除帳號嗎？',
        message: `帳號「${user.account}」刪除後將無法還原！`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '確定刪除',
        rejectLabel: '取消',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                const res: any = await api.post(`/manage/MAccountApi/Delete/${user.account}`);
                if (res.success) {
                    toast.add({ severity: 'success', summary: '成功', detail: res.message, life: 3000 });
                    loadData();
                }
            } catch (err: any) {
                toast.add({ severity: 'error', summary: '刪除失敗', detail: err.response?.data?.message || '刪除失敗' });
            }
        }
    });
}

onMounted(loadData);
</script>

<template>
  <div class="p-4 surface-ground min-h-screen">
    <Toast />
    <ConfirmDialog />
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-3xl font-bold m-0 text-900"> 👶 帳號管理系統</h2>
      <PButton label="新增帳號" icon="pi pi-user-plus" severity="success" class="shadow-2"
        @click="router.push('/manage/account/createMe')" />
    </div>
    <Card>
      <template #content>
        <div class="grid p-fluid align-items-end">
          <div class="col-12 md:col-4 ">
            <label class="block mb-2 font-bold text-sm text-700">帳號</label>
            <InputText class="w-full" v-model="filters.account" placeholder="輸入搜尋帳號" @keyup.enter="loadData" />
          </div>
          <div class="col-12 md:col-4">
            <label class="block mb-2 font-bold text-sm text-700">Email</label>
            <InputText class="w-full" v-model="filters.email" type="email" placeholder="輸入搜尋 Email"
              @keyup.enter="loadData" />
          </div>
          <div class="col-12 md:col-4">
            <div class="flex gap-2">
              <PButton label="查詢" icon="pi pi-search" severity="dark" class="flex-1" @click="loadData" />
              <PButton label="清除" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>
    </Card>
    <Divider />

    <div class="surface-card border-round shadow-1 overflow-hidden">
      <DataTable :value="members" :loading="loading" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
        <template #empty>
          <div class="text-center p-4 text-500">查無資料</div>
        </template>
        <Column field="account" header="帳號" class="font-bold text-900" />
        <Column field="memberName" header="名稱" />
        <Column header="最後修改時間">
          <template #body="{ data }: { data: MemberItem }">
            <span v-if="data.updatedAt">
              <i class="pi pi-clock text-xs mr-1 text-500"></i>
              {{ formatDate(data.updatedAt) }}
            </span>
            <span v-else class="text-400">-</span>
          </template>
        </Column>
        <Column header="最後修改人員">
          <template #body="{ data }: { data: MemberItem }">
            <Tag :value="data.updatedBy || 'N/A'" severity="secondary" rounded />
          </template>
        </Column>
        <Column header="操作" class="text-right pr-2" style="width: 180px">
          <template #body="{ data }: { data: MemberItem }">
            <div class="flex gap-2 justify-content-end">
              <PButton label="修改" icon="pi pi-pencil" outlined size="small"
                @click="router.push(`/manage/account/editMe/${data.account}`)" />
              <PButton label="刪除" icon="pi pi-trash" severity="danger" outlined size="small"
                @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>

      <Paginator :rows="10" :totalRecords="totalRecords" @page="onPageChange" />
    </div>
  </div>
</template>
