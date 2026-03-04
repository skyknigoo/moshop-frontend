<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import api from '@/api/axios';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(false);
const products = ref([]);
const categories = ref([]);
const stats = ref({ totalCount: 0, availableCount: 0, lowStockCount: 0, frozenCount: 0 });
const filters = ref({
  startDate: null,
  endDate: null,
  groupId: null,
  search: '',
  page: 1
})

// 讀取商品資料
const loadData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/manage/MProductApi', { params: filters.value });
    products.value = res.items;
    stats.value = res.stats;
    categories.value = res.categories;
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '失敗', detail: '無法載入商品資料', life: 3000 });
  } finally {
    loading.value = false;
  }
}

// 清空搜尋欄位
const resetFilters = () => {
  filters.value = { startDate: null, endDate: null, groupId: null, search: '', page: 1 };
  loadData();
};
// 操作邏輯

// 商品狀態顯示
const getStatusLabel = (stats) => {
  const map = { 0: '已下架', 1: '上架中', 2: '凍結中', 3: '庫存告急' };
  return map[stats] || '未知';
};
const getStatusSeverity = (status) => {
  const map = { 0: 'secondary', 1: 'success', 2: 'info', 3: 'warn' };
  return map[status] || 'info';
};

const formatDate = (date) => new Date(date).toLocaleString();

const onPageChange = (event) => {
  filters.value.page = event.page + 1;
  loadData();
};

// --- 確認對話框 (復刻 confirmFrozen 與 confirmDelete) ---
// --- 凍結邏輯 ---
const confirmFrozen = (product) => {
  const isFrozen = product.status === 2;
  const actionText = isFrozen ? '解凍' : '凍結';
  confirm.require({
    header: `確定要${actionText}該商品嗎？`,
    message: `${actionText}後，該商品將${isFrozen ? '重新出現在前台' : '從前台隱藏'}。`,
    icon: 'pi pi-info-circle',
    acceptLabel: '確定',
    rejectLabel: '取消',
    acceptClass: isFrozen ? 'p-button-warn' : 'p-button-info',
    accept: async () => {
      try {
        const res = await api.post(`/manage/MProductApi/Frozen/${product.productID}`);
        if (res.success) {
          toast.add({ severity: 'success', summary: '成功', detail: `商品已${actionText}`, life: 2000 });
          loadData();
        }
      } catch (e) {
        toast.add({ severity: 'error', summary: '失敗', detail: e.response?.message || '操作失敗', life: 3000 });
      }
    }
  });
}

// ---刪除邏輯---
const confirmDelete = (product) => {
  confirm.require({
    header: '確定要刪除嗎?',
    message: '此動作無法復原,請確認商品資料',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確認刪除',
    rejectLabel: '取消',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const res = await api.post(`/manage/MProductApi/Delete/${product.productID}`);
        if (res.success) {
          toast.add({ severity: 'success', summary: '已刪除', detail: '商品已成功移除', life: 2000 });
          loadData();
        }
      } catch (e) {
        toast.add({ severity: 'error', summary: '刪除失敗', detail: e.response?.message || '無法刪除' });
      }
    }
  })
}




onMounted(loadData);
</script>


<template>
  <div class="p-4 surface-ground min-h-screen">
    <Toast />
    <ConfirmDialog />
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-3xl font-bold m-0 text-900">
          <i class="pi pi-shopping-bag mr-2 text-primary text-3xl"></i>
          商品管理
        </h2>
        <nav class="flex align-items-center gap-2 text-500 text-sm mt-2">
          <router-link to="/manage" class="no-underline text-500">控制台</router-link>
          <i class="pi pi-chevron-right text-xs"></i>
          <span>商品列表</span>
        </nav>
      </div>
      <PButton label="新增商品" icon="pi pi-plus" class="p-button-lg shadow-2"
        @click="router.push('/manage/product/createMe')" />
    </div>

    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <div class=" p-4 border-round shadow-1 bg-blue-500 text-white">
          <div class="text-blue-100 font-medium mb-2">總商品數</div>
          <div class="text-3xl font-bold">{{ stats.totalCount }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class=" p-4 border-round shadow-1 bg-green-500 text-white">
          <div class="text-green-100 font-medium mb-2">上架中</div>
          <div class="text-3xl font-bold">{{ stats.availableCount }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class=" p-4 border-round shadow-1 bg-orange-500 text-white">
          <div class="text-orange-100 font-medium mb-2">庫存告急</div>
          <div class="text-3xl font-bold">{{ stats.lowStockCount }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class=" p-4 border-round shadow-1 bg-gray-500 text-white">
          <div class="text-gray-100 font-medium mb-2">凍結</div>
          <div class="text-3xl font-bold">{{ stats.frozenCount }}</div>
        </div>
      </div>
    </div>

    <Card class="mb-4 shadow-1 border-none">
      <template #content>
        <div class="grid p-fluid">
          <div class="col-12 lg:col-4">
            <label class="block mb-2 font-bold text-sm text-600">日期範圍</label>
            <div class="flex align-items-center gap-2">
              <DatePicker v-model="filters.startDate" dateFormat="yy-mm-dd" placeholder="開始日期" class="flex-1" />
              <span class="text-400">-</span>
              <DatePicker v-model="filters.endDate" dateFormat="yy-mm-dd" placeholder="結束日期" class="flex-1" />
            </div>
          </div>
          <div class="col-12 lg:col-2">
            <label class="block mb-2 font-bold text-sm text-600">商品分類</label>
            <Select v-model="filters.groupId" :options="categories" optionLabel="groupName" optionValue="groupID"
              placeholder="全部類別" />
          </div>
          <div class="col-12 lg:col-6">
            <label class="block mb-2 font-bold text-sm text-600">搜尋關鍵字 (名稱/描述/代碼)</label>
            <InputGroup>
              <InputText v-model="filters.search" placeholder="輸入關鍵字..." @keyup.enter="loadData" />
              <PButton icon="pi pi-search" label="搜尋" @click="loadData" />
              <PButton icon="pi pi-refresh" severity="secondary" outlined label="清除" @click="resetFilters" />
            </InputGroup>
          </div>
        </div>
      </template>
    </Card>

    <div class="surface-card border-round shadow-1">
      <DataTable :value="products" :loading="loading" responsiveLayout="scroll" :rows="10" class="p-datatable-sm"
        hoverSelection>
        <Column header="商品縮圖" class="pl-4">
          <template #body="{ data }">
            <PImage :src="data.imagePath || '/uploads/Comm/等待餵圖.png'" width="60" class="shadow-1 border-round"
              preview />
          </template>
        </Column>
        <Column header="商品名稱">
          <template #body="{ data }">
            <div class="font-bold text-900">{{ data.productName }}</div>
            <small class="text-500">ID: {{ data.productID }}</small>
          </template>
        </Column>
        <Column field="group.groupName" header="分類" />
        <Column header="價格" class="font-bold text-primary">
          <template #body="{ data }">NT$ {{ data.productPrice.toLocaleString() }}</template>
        </Column>
        <Column header="庫存">
          <template #body="{ data }">
            <span :class="{ 'text-danger font-bold': data.stockQty <= 3 }">{{ data.stockQty }}</span>
            <small class="text-500 ml-1">/ 件</small>
          </template>
        </Column>
        <Column header="狀態">
          <template #body="{ data }">
            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" rounded />
          </template>
        </Column>
        <Column header="最後修改時間">
          <template #body="{ data }">{{ formatDate(data.updatedAt) }}</template>
        </Column>
        <Column header="操作" class="text-right pr-4" style="min-width: 250px">
          <template #body="{ data }">
            <div class="flex gap-2 justify-content-end">
              <PButton label="編輯" icon="pi pi-pencil" severity="primary" outlined size="small"
                @click="router.push(`/manage/product/editMe/${data.productID}`)" />

              <PButton :label="data.status === 2 ? '解凍' : '凍結'"
                :icon="data.status === 2 ? 'pi pi-unlock' : 'pi pi-lock'"
                :severity="data.status === 2 ? 'warn' : 'info'" outlined size="small" @click="confirmFrozen(data)" />

              <PButton label="刪除" icon="pi pi-trash" severity="danger" outlined size="small"
                @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>









      <Paginator :rows="10" :totalRecords="stats.totalCount" @page="onPageChange" />
    </div>


  </div>
</template>
