<template>
  <div class="p-4 surface-ground min-h-screen">
    <Toast />
    <ConfirmDialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-3xl font-bold m-0 text-900">👤 帳號管理系統 (Vue API 版)</h2>
      <PButton 
        label="新增帳號" 
        icon="pi pi-user-plus" 
        severity="success" 
        class="shadow-2"
        @click="router.push('/manage/account/create')" 
      />
    </div>

    <Card class="mb-4 shadow-1 border-none">
      <template #content>
        <div class="grid p-fluid align-items-end">
          <div class="col-12 md:col-4">
            <label class="block mb-2 font-bold text-sm text-700">帳號</label>
            <InputText v-model="filters.account" placeholder="輸入搜尋帳號..." @keyup.enter="loadData" />
          </div>
          <div class="col-12 md:col-4">
            <label class="block mb-2 font-bold text-sm text-700">Email</label>
            <InputText v-model="filters.email" type="email" placeholder="輸入搜尋 Email..." @keyup.enter="loadData" />
          </div>
          <div class="col-12 md:col-4">
            <div class="flex gap-2">
              <PButton label="查詢" icon="pi pi-search" severity="dark" class="flex-1" @click="loadData" />
              <PButton label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div class="surface-card border-round shadow-1 overflow-hidden">
      <DataTable 
        :value="members" 
        :loading="loading" 
        stripedRows 
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <Column field="account" header="帳號" class="font-bold text-900" />
        <Column field="memberName" header="名稱" />
        
        <Column header="最後修改時間">
          <template #body="{ data }">
            <span v-if="data.updatedAt">
              <i class="pi pi-clock text-xs mr-1 text-500"></i>
              {{ formatDate(data.updatedAt) }}
            </span>
            <span v-else class="text-400">-</span>
          </template>
        </Column>

        <Column header="最後修改人員">
          <template #body="{ data }">
            <Tag :value="data.updatedBy || 'N/A'" severity="secondary" rounded />
          </template>
        </Column>

        <Column header="操作" class="text-right pr-4" style="width: 180px">
          <template #body="{ data }">
            <div class="flex gap-2 justify-content-end">
              <PButton 
                label="修改" 
                icon="pi pi-pencil" 
                outlined 
                size="small" 
                @click="router.push(`/manage/account/edit/${data.account}`)" 
              />
              <PButton 
                label="刪除" 
                icon="pi pi-trash" 
                severity="danger" 
                outlined 
                size="small" 
                @click="confirmDelete(data)" 
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="text-center p-4 text-500">查無資料</div>
        </template>
      </DataTable>

      <Paginator 
        :rows="10" 
        :totalRecords="totalRecords" 
        @page="onPageChange" 
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="顯示第 {first} 至 {last} 筆，共 {totalRecords} 筆" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// --- 響應式狀態 ---
const members = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const filters = ref({
  account: '',
  email: '',
  page: 1
});

// --- 核心功能：讀取資料 [GET] ---
const loadData = async () => {
  loading.value = true;
  try {
    // 對接 MAccountApiController.cs
    const res = await axios.get('http://localhost:5158/api/manage/MAccountApi', { 
      params: filters.value ,
      withCredentials: true
    });
    
    // API 回傳結構：{ items: [], pagination: { totalCount: X } }
    members.value = res.data.items;
    totalRecords.value = res.data.pagination.totalCount;
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '載入失敗', detail: '伺服器連線異常' });
  } finally {
    loading.value = false;
  }
};

// --- 核心功能：刪除帳號 [POST/DELETE] ---
const confirmDelete = (user) => {
  confirm.require({
    header: '確定要刪除帳號嗎？',
    message: `帳號「${user.account}」刪除後將無法還原！`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定刪除',
    rejectLabel: '取消',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        // 對接 API: Post Delete
        const res = await axios.post(`http://localhost:5158/api/manage/MAccountApi/Delete/${user.account}`);
        
        if (res.data.success) {
          toast.add({ severity: 'success', summary: '成功', detail: res.data.message, life: 3000 });
          loadData(); // 重新整理表格，不需重新整理網頁
        }
      } catch (err) {
        toast.add({ severity: 'error', summary: '刪除失敗', detail: err.response?.data?.message || '刪除失敗' });
      }
    }
  });
};

// --- 其他輔助邏輯 ---
const resetFilters = () => {
  filters.value = { account: '', email: '', page: 1 };
  loadData();
};

const onPageChange = (event) => {
  filters.value.page = event.page + 1;
  loadData();
};

const formatDate = (date) => date ? new Date(date).toLocaleString() : '-';

onMounted(loadData);
</script>