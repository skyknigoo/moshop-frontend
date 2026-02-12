<template>
  <div class="p-4 surface-ground min-h-screen">
    <Toast />
    <ConfirmDialog />

    <div class="flex align-items-center gap-3 mb-4">
      <i class="pi pi-receipt text-primary text-4xl"></i>
      <h2 class="text-3xl font-bold m-0 text-900">後台訂單管理</h2>
    </div>

    <Card class="mb-4 shadow-1 border-none">
      <template #content>
        <div class="grid align-items-center">
          <div class="col-12 lg:col-8">
            <div class="flex flex-wrap gap-2">
              <PButton 
                label="全部" 
                :outlined="filters.status !== null" 
                severity="secondary" 
                rounded
                @click="handleStatusChange(null)" 
              />
              <PButton 
                v-for="s in statusOptions" 
                :key="s.value"
                :label="s.label" 
                :outlined="filters.status !== s.value" 
                :severity="s.severity"
                rounded
                @click="handleStatusChange(s.value)" 
              />
            </div>
          </div>
          <div class="col-12 lg:col-4">
            <InputGroup>
              <InputText v-model="filters.search" placeholder="單號 / 會員 / 收件人" @keyup.enter="loadData" />
              <PButton icon="pi pi-search" severity="dark" @click="loadData" />
              <PButton icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
            </InputGroup>
          </div>
        </div>
      </template>
    </Card>

    <div class="surface-card border-round shadow-1 overflow-hidden">
      <DataTable 
        :value="orders" 
        :loading="loading" 
        responsiveLayout="scroll" 
        class="p-datatable-sm"
        stripedRows
      >
        <Column field="orderID" header="單號" class="font-bold">
          <template #body="{ data }">#{{ data.orderID }}</template>
        </Column>

        <Column header="會員 / 收件人 / 訂單時間">
          <template #body="{ data }">
            <div class="font-bold text-900">{{ data.account }}</div>
            <div class="text-sm text-600">{{ data.receiverName }} ({{ data.receiverPhone }})</div>
            <div class="text-xs text-500 mt-1">
              <i class="pi pi-clock text-xs mr-1"></i>{{ formatDate(data.upDate) }}
            </div>
          </template>
        </Column>

        <Column header="商品項目">
          <template #body="{ data }">
            <div class="flex align-items-center gap-3">
              <PImage :src="data.product?.imagePath || '/uploads/Comm/等待餵圖.png'" width="50" class="border-round shadow-1" />
              <div>
                <div class="text-900 font-medium">{{ data.product?.productName }}</div>
                <small class="text-500">數量：{{ data.orderQty }} 件</small>
              </div>
            </div>
          </template>
        </Column>

        <Column header="總金額">
          <template #body="{ data }">
            <span class="text-primary font-bold text-lg">NT$ {{ data.totalPrice.toLocaleString() }}</span>
          </template>
        </Column>

        <Column header="狀態與動作">
          <template #body="{ data }">
            <div class="flex flex-column gap-2">
              <Tag 
                :value="getStatusLabel(data.status)" 
                :severity="getStatusSeverity(data.status)" 
                style="width: fit-content;"
              />
              
              <PButton 
                v-if="data.status === 0" 
                label="標記為寄送中" 
                icon="pi pi-truck" 
                severity="primary" 
                outlined 
                size="small" 
                class="mt-1"
                @click="confirmShipping(data)" 
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <Paginator 
        :rows="10" 
        :totalRecords="totalCount" 
        @page="onPageChange" 
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="第 {first} 至 {last} 筆，共 {totalRecords} 筆" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();

// --- 狀態定義 ---
const orders = ref([]);
const loading = ref(false);
const totalCount = ref(0);
const filters = ref({
  page: 1,
  search: '',
  status: null
});

// 狀態選項 (對應 OrderStatus Enum)
const statusOptions = [
  { label: '處理中', value: 0, severity: 'warn' },  
  { label: '寄送中', value: 1, severity: 'info' },
  { label: '已完成', value: 2, severity: 'success' },
  { label: '取消訂單', value: 3, severity: 'Secondary' },
  { label: '已退貨', value: 4, severity: 'danger' }
];

// --- 資料讀取 ---
const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:5158/api/manage/MOrderApi', { params: filters.value });
    orders.value = res.data.items;
    totalCount.value = res.data.pagination.totalCount;
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '錯誤', detail: '無法讀取訂單資料' });
  } finally {
    loading.value = false;
  }
};

// --- 操作邏輯 ---
const handleStatusChange = (status) => {
  filters.value.status = status;
  filters.value.page = 1;
  loadData();
};

const resetFilters = () => {
  filters.value = { page: 1, search: '', status: null };
  loadData();
};

const onPageChange = (event) => {
  filters.value.page = event.page + 1;
  loadData();
};

const confirmShipping = (order) => {
  confirm.require({
    header: '確認出貨？',
    message: `您確定要將訂單 #${order.orderID} 標記為『寄送中』嗎？這將記錄出貨時間。`,
    icon: 'pi pi-info-circle',
    acceptLabel: '確定出貨',
    rejectLabel: '取消',
    accept: async () => {
      try {
        // 對接 API: POST api/manage/MOrderApi/Shipping/{id}
        const res = await axios.post(`http://localhost:5158/api/manage/MOrderApi/Shipping/${order.orderID}`);
        if (res.data.success) {
          toast.add({ severity: 'success', summary: '成功', detail: res.data.message, life: 3000 });
          loadData();
        }
      } catch (err) {
        toast.add({ severity: 'error', summary: '操作失敗', detail: err.response?.data?.message || '系統錯誤' });
      }
    }
  });
};

// --- 小工具 ---
const getStatusLabel = (status) => {
  const opt = statusOptions.find(o => o.value === status);
  return opt ? opt.label : '未知';
};

const getStatusSeverity = (status) => {
  const opt = statusOptions.find(o => o.value === status);
  return opt ? opt.severity : 'secondary';
};

const formatDate = (val) => val ? new Date(val).toLocaleString() : '-';

onMounted(loadData);
</script>

<style scoped>
/* 模擬 MVC 的 nav-pills active 效果 */
.p-button.p-button-outlined.p-button-secondary {
  border-color: transparent;
  color: var(--text-color-secondary);
}
</style>