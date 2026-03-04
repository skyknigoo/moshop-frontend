<script setup>
import { onMounted, ref } from 'vue';
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();

const loading = ref(false);
const orders = ref([]);
const searchQuery = ref('');
const selectedStatus = ref(null);
const currentPage = ref(1);
const totalRecords = ref(0);
const toast = useToast();

const formatPrice = (val) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';
const formatDate = (dateStr) => {
  if (!dateStr || dateStr.startsWith('0001')) return '-';
  return new Date(dateStr).toLocaleString('zh-TW', { hour12: false });
};

//Tab設定
const statusOptions = [
  { label: '全部', value: null },
  { label: '處理中', value: 0 },
  { label: '寄送中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已退貨', value: 4 },
];

// 狀態樣式變化
const getStatusLabel = (status) => statusOptions.find(o => o.value === status)?.label || '未知';
const getStatusSeverity = (status) => {
  const map = { 0: 'warn', 1: 'info', 2: 'success', 3: 'danger' };
  return map[status] || 'secondary';
};


//取得訂單資料
const fetchOrders = async (page = 1) => {
  loading.value = true;
  currentPage.value = page;
  try {
    const params = {
      page: page,
      search: searchQuery.value,
      status: selectedStatus.value
    };

    const res = await api.get('/OrderApi', { params });
    console.log("取得資料=>", res)
    orders.value = res.items;
    totalRecords.value = res.pagination.totalCount;
  } catch (e) {
    console.log(e)
    toast.add({ severity: 'error', summary: '連線錯誤', detail: '無法讀取訂單清單', life: 3000 })
  } finally {
    loading.value = false;
  }
}

// 搜尋 頁數 操作
const onPageChange = (event) => fetchOrders(event.page + 1);
const handleFilterChange = () => fetchOrders(1);

// 訂單狀態操作 (完成/退貨)
const confirmUpdate = (orderId, action) => {
  const isComplate = action === 'CompleteOrder';
  confirm.require({
    header: '訂單操作確認',
    message: isComplate ? '您是否已收到商品並確認完成訂單？' : '確定要對此訂單提出退貨申請嗎？',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定',
    rejectLabel: '我再想想',
    acceptClass: 'p-button-success',
    rejectClass: 'p-button-danger',
    accept: async () => {
      try {
        const res = await api.post(`/OrderApi/${action}/${orderId}`);
        console.log("看=>", res)
        if (res.success) {
          toast.add({ severity: 'success', summary: '操作成功', detail: res.message, life: 3000 });
          fetchOrders(currentPage.value);
        }
      } catch (e) {
        console.log("錯誤資訊=>", e)
        toast.add({ severity: 'error', summary: '操作失敗', detail: e.response?.message || '系統異常' });
      }
    }
  })
}

onMounted(() => fetchOrders(1));
</script>


<template>
  <Toast />
  <ConfirmDialog />
  <div class="container mt-5 px-4" style="max-width: 1200px; margin: 0 auto;">
    <h1 class="font-bold mb-4 flex align-items-center text-1200">
      <i class="pi pi-box mr-2 text-primary text-3xl"></i> 我的購買清單
    </h1>
    <div class="surface-card shadow-1 border-round p-3 mb-4">
      <div class="grid align-items-center">
        <div class="col-12 lg:col-8">
          <SelectButton @change="handleFilterChange" v-model="selectedStatus" :options="statusOptions"
            optionLabel="label" optionValue="value" />

        </div>
        <div class="col-12 lg:col-4">
          <div class="p-inputgroup">
            <InputGroup style="width: 500px;">
              <InputText type="text" v-model="searchQuery" placeholder="搜尋訂單名稱" />
              <PButton icon="pi pi-search" severity="success" label="搜尋" @click="fetchOrders(1)" />
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
    <div class="surface-card border-round shadow-1 overflow-hidden">
      <DataTable :value="orders" :loading="loading" responsiveLayout="stack" breakpoint="960px"
        class="p-datatable-sm p-3">
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
        <Column header="單價">
          <template #body="{ data }"> {{ formatPrice(data.product?.productPrice) }} </template>
        </Column>
        <Column header="數量">
          <template #body="{ data }"> x {{ data.orderQty }} </template>
        </Column>
        <Column header="總計">
          <template #body="{ data }">
            <span class="font-bold text-danger text-lg">{{ formatPrice(data.totalPrice) }}</span>
          </template>
        </Column>
        <Column header="狀態/時間">
          <template #body="{ data }">
            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" class="mb-2 px-3" />
            <div class="text-xs text-600 line-height-3">
              <div v-if="data.status === 0"><i class="pi pi-clock mr-1"></i>下單 {{ formatDate(data.orderDate) }}</div>
              <div v-if="data.status === 1"><i class="pi pi-send mr-1"></i>出貨 {{ formatDate(data.shipmentDate) }}</div>
              <div v-if="data.status === 2"><i class="pi pi-check-circle mr-1"></i>完成 {{ formatDate(data.finishDate) }}
              </div>
              <div v-if="data.status === 4"><i class="pi pi-exclamation-circle mr-1"></i>退貨
                {{ formatDate(data.returnStoreDate) }}</div>

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

<style scoped></style>
