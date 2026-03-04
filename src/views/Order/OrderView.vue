<template>
  <div class="container mt-5 px-4" style="max-width: 1200px; margin: 0 auto;">
    <Toast />
    <ConfirmDialog />

    <h2 class="font-bold mb-4 flex align-items-center text-900">
      <i class="pi pi-box mr-2 text-primary text-3xl"></i> 📦 我的購買清單
    </h2>

    <div class="surface-card shadow-1 border-round p-3 mb-4">
      <div class="grid align-items-center">
        <div class="col-12 lg:col-8">
          <SelectButton v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
            @change="handleFilterChange" />
        </div>
        <div class="col-12 lg:col-4">
          <div class="p-inputgroup">
            <InputText v-model="searchQuery" placeholder="搜尋商品名稱..." @keyup.enter="fetchOrders(1)" />
            <PButton icon="pi pi-search" label="搜尋" @click="fetchOrders(1)" />
          </div>
        </div>
      </div>
    </div>

    <div class="surface-card shadow-1 border-round overflow-hidden">
      <DataTable :value="orders" :loading="loading" responsiveLayout="stack" breakpoint="960px" class="p-datatable-sm">

        <template #empty>
          <div class="text-center py-5 text-500">目前沒有相關的訂單紀錄。</div>
        </template>

        <Column header="商品資訊">
          <template #body="{ data }">
            <div class="flex align-items-center gap-3">
              <PImage :src="data.product?.imagePath || '/uploads/Comm/等待餵圖.png'" width="70"
                imageClass="border-round shadow-1" />
              <div>
                <div class="font-bold text-900">{{ data.product?.productName }}</div>
                <small class="text-500 block mt-1">訂單編號: #{{ data.orderID }}</small>
              </div>
            </div>
          </template>
        </Column>

        <Column header="單價" class="text-center">
          <template #body="{ data }"> {{ formatPrice(data.product?.productPrice) }} </template>
        </Column>
        <Column header="數量" class="text-center">
          <template #body="{ data }"> x {{ data.orderQty }} </template>
        </Column>
        <Column header="總計">
          <template #body="{ data }">
            <span class="font-bold text-danger text-lg">{{ formatPrice(data.totalPrice) }}</span>
          </template>
        </Column>

        <Column header="狀態/時間" style="min-width: 220px">
          <template #body="{ data }">
            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" class="mb-2 px-3" />

            <div class="text-xs text-600 line-height-3">
              <div v-if="data.status === 0"><i class="pi pi-clock mr-1"></i>下單: {{ formatDate(data.orderDate) }}</div>
              <div v-else-if="data.status === 1"><i class="pi pi-send mr-1"></i>出貨: {{ formatDate(data.shipmentDate) }}
              </div>
              <div v-else-if="data.status === 2"><i class="pi pi-check-circle mr-1"></i>完成: {{
                formatDate(data.finishDate) }}</div>
              <div v-else-if="data.status === 4"><i class="pi pi-exclamation-circle mr-1"></i>退貨: {{
                formatDate(data.returnStoreDate) }}</div>
            </div>

            <div v-if="data.status === 1" class="flex gap-2 mt-2">
              <PButton label="完成訂單" icon="pi pi-check" severity="success" size="small"
                @click="confirmUpdate(data.orderID, 'CompleteOrder')" />
              <PButton label="申請退貨" icon="pi pi-undo" severity="danger" size="small" outlined
                @click="confirmUpdate(data.orderID, 'ReturnOrder')" />
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="p-3 border-top-1 surface-border bg-white">
        <Paginator :rows="10" :totalRecords="totalRecords" :first="(currentPage - 1) * 10" @page="onPageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import SelectButton from 'primevue/selectbutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import api from '@/api/axios';

const toast = useToast();
const confirm = useConfirm();

// --- 資料狀態管理 ---
const orders = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref(null);
const totalRecords = ref(0);
const currentPage = ref(1);

// 狀態選項 (對應後端 Enum)
const statusOptions = [
  { label: '全部', value: null },
  { label: '處理中', value: 0 },
  { label: '寄送中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已退貨', value: 4 }
];

// --- 格式化工具 ---
const formatPrice = (val) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';
const formatDate = (dateStr) => {
  if (!dateStr || dateStr.startsWith('0001')) return '-';
  return new Date(dateStr).toLocaleString('zh-TW', { hour12: false });
};

// 狀態樣式邏輯
const getStatusLabel = (status) => statusOptions.find(o => o.value === status)?.label || '未知';
const getStatusSeverity = (status) => {
  const map = { 0: 'warn', 1: 'info', 2: 'success', 3: 'danger' };
  return map[status] || 'secondary';
};

// --- API 請求邏輯 ---
const fetchOrders = async (page = 1) => {
  loading.value = true; // 修正先前 .ref 的錯誤
  currentPage.value = page;
  try {
    const params = {
      page: page,
      search: searchQuery.value,
      status: selectedStatus.value
    };
    // 呼叫後端 OrderApiController
    const res = await api.get('/OrderApi', { params });
    orders.value = res.items;
    totalRecords.value = res.pagination.totalCount;
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '連線錯誤', detail: '無法讀取訂單清單', life: 3000 });
  } finally {
    loading.value = false;
  }
};

// --- 事件處理 ---
const onPageChange = (event) => fetchOrders(event.page + 1);
const handleFilterChange = () => fetchOrders(1);

// 訂單狀態操作確認 (完成/退貨)
const confirmUpdate = (orderId, action) => {
  const isComplete = action === 'CompleteOrder';
  confirm.require({
    header: '訂單操作確認',
    message: isComplete ? '您是否已收到商品並確認完成訂單？' : '確定要對此訂單提出退貨申請嗎？',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定',
    rejectLabel: '我再想想',
    // 顏色區分：完成用 Success，退貨用 Danger，取消用 Secondary Outlined
    acceptClass: isComplete ? 'p-button-success' : 'p-button-danger',
    rejectClass: 'p-button-secondary p-button-outlined',
    accept: async () => {
      try {
        const res = await axios.post(`http://localhost:5158/api/OrderApi/${action}/${orderId}`);
        if (res.success) {
          toast.add({ severity: 'success', summary: '操作成功', detail: res.data.message, life: 3000 });
          fetchOrders(currentPage.value);
        }
      } catch (e) {
        toast.add({ severity: 'error', summary: '操作失敗', detail: e.response?.data?.message || '系統異常' });
      }
    }
  });
};

onMounted(() => fetchOrders(1));
</script>

<style scoped>
/* 針對手機版 DataTable Stack 模式的標題加粗 */
:deep(.p-datatable-stacked .p-column-title) {
  font-weight: 700;
  color: var(--text-color-secondary);
  min-width: 100px;
  display: inline-block;
}

/* 自定義分頁器顏色 */
:deep(.p-paginator) {
  background: transparent;
  border: none;
}
</style>
