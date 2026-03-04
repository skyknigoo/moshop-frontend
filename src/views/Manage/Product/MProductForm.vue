<template>
  <div class="container py-4 px-4" style="max-width: 1100px; margin: 0 auto;">
    <Toast />

    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-3xl font-bold m-0 text-900">
          {{ isEdit ? '📝 編輯商品資訊' : '✨ 新增商城商品' }}
        </h2>
        <nav class="flex align-items-center gap-2 text-500 text-sm mt-2">
          <router-link to="/manage/product" class="no-underline text-500 hover:text-primary">商品列表</router-link>
          <i class="pi pi-chevron-right text-xs"></i>
          <span class="text-900 font-medium">商品表單</span>
        </nav>
      </div>
      <PButton label="返回列表" icon="pi pi-arrow-left" severity="secondary" outlined
        @click="router.push('/manage/product')" />
    </div>

    <div class="grid">
      <div class="col-12 lg:col-8">
        <Card class="mb-4 shadow-1 border-none">
          <template #title>基本資訊</template>
          <template #content>
            <div class="flex flex-column gap-4">
              <div class="flex flex-column gap-2">
                <label for="name" class="font-bold text-700">* 商品名稱</label>
                <InputText id="name" v-model="product.productName" maxlength="60" placeholder="例如：高效能攀岩粉袋" />
                <small class="text-500">剩餘字數：{{ 60 - (product.productName?.length || 0) }}</small>
              </div>

              <div class="flex flex-column gap-2">
                <label for="desc" class="font-bold text-700">* 商品詳細描述</label>
                <PTextarea id="desc" v-model="product.productDescription" rows="10" placeholder="請輸入商品規格、材質與使用說明..." />
              </div>
            </div>
          </template>
        </Card>

        <Card class="shadow-1 border-none">
          <template #title>商品主圖</template>
          <template #content>
            <div class="text-center mb-4 p-3 surface-100 border-round-xl">
              <img :src="imagePreview || product.imagePath || '/uploads/Comm/等待餵圖.png'"
                class="border-round shadow-2 bg-white" style="max-height: 450px; width: 80%; object-fit: cover;" />
            </div>
            <div class="flex flex-column gap-2">
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileSelect" />
              <PButton label="更換商品圖片" icon="pi pi-upload" severity="info" class="w-full"
                @click="$refs.fileInput.click()" />
              <p class="text-center text-500 text-xs mt-2">支援 JPG, PNG 格式，建議正方形比例以獲得最佳顯示效果</p>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-4">
        <Card class="shadow-1 border-none">
          <template #title>銷售設定</template>
          <template #content>
            <div class="flex flex-column gap-4 p-fluid">
              <div class="flex flex-column gap-2">
                <label class="font-bold text-700">* 商品類別</label>
                <PSelect v-model="product.productGroup" :options="categories" optionLabel="groupName"
                  optionValue="groupID" placeholder="請選擇分類" />
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-bold text-700">* 銷售價格 (TWD)</label>
                <InputNumber v-model="product.productPrice" currency="TWD" locale="zh-TW" :min="0" />
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-bold text-700">* 現有庫存</label>
                <InputNumber v-model="product.stockQty" showButtons :min="0" />
              </div>

              <template v-if="isEdit">
                <Divider />
                <div class="surface-50 p-3 border-round">
                  <h6 class="m-0 mb-3 text-700 font-bold"><i class="pi pi-info-circle mr-2"></i>系統資訊</h6>
                  <ul class="list-none p-0 m-0 flex flex-column gap-2 text-sm text-600">
                    <li><span class="font-medium text-800">商品 ID：</span>{{ product.productID }}</li>
                    <li><span class="font-medium text-800">建立時間：</span>{{ formatDate(product.createdAt) }}</li>
                    <li><span class="font-medium text-800">最後修改：</span>{{ product.updatedBy || '系統' }}</li>
                    <li><span class="font-medium text-800">更新時間：</span>{{ formatDate(product.updatedAt) }}</li>
                  </ul>
                </div>
              </template>

              <Divider />
              <PButton label="確認儲存商品" icon="pi pi-check-circle" severity="success" size="large" :loading="isSaving"
                @click="handleSubmit" class="p-3 font-bold" />
              <PButton label="取消並返回" severity="secondary" text @click="router.push('/manage/product')" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

// --- 路由與狀態 ---
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isEdit = computed(() => !!route.params.id);
const isSaving = ref(false);
const categories = ref([]);
const imagePreview = ref(null);
const selectedFile = ref(null);

// 依照 MSProduct 模型初始化
const product = ref({
  productID: 0,
  productName: '',
  productDescription: '',
  productGroup: null,
  productPrice: 0,
  stockQty: 0,
  status: 1, // 預設 Available (1)
  imagePath: '',
  createdAt: null,
  updatedAt: null,
  updatedBy: ''
});

// --- 1. 資料初始化 ---
const initData = async () => {
  try {
    // 優先讀取分類 API
    const catRes = await axios.get('http://localhost:5158/api/manage/MProductApi/Categories');
    categories.value = catRes;

    if (isEdit.value) {
      // 編輯模式：讀取單一商品資料
      const res = await axios.get(`http://localhost:5158/api/manage/MProductApi/${route.params.id}`);
      product.value = res.product;
    }
  } catch (e) {
    console.error(e)
    toast.add({ severity: 'error', summary: '初始化失敗', detail: '無法連線至伺服器讀取資料', life: 3000 });
  }
};

// --- 2. 圖片預覽處理 ---
const onFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    // 使用瀏覽器 API 生成即時預覽
    imagePreview.value = URL.createObjectURL(file);
  }
};

// --- 3. 提交表單 (FormData) ---
const handleSubmit = async () => {
  // 基本客戶端驗證
  if (!product.value.productName || !product.value.productGroup || product.value.productPrice === null) {
    toast.add({ severity: 'warn', summary: '驗證失敗', detail: '請填寫所有必填欄位 (*)', life: 3000 });
    return;
  }

  isSaving.value = true;
  const formData = new FormData();

  // 封裝欄位 (注意：Key 需完全對應 C# Model 屬性名稱)
  formData.append('ProductID', product.value.productID);
  formData.append('ProductName', product.value.productName);
  formData.append('ProductDescription', product.value.productDescription);
  formData.append('ProductGroup', product.value.productGroup);
  formData.append('ProductPrice', product.value.productPrice);
  formData.append('StockQty', product.value.stockQty);
  formData.append('Status', product.value.status);

  // 處理時間與路徑 (編輯模式重要)
  if (product.value.imagePath) formData.append('ImagePath', product.value.imagePath);
  if (product.value.createdAt) formData.append('CreatedAt', product.value.createdAt);

  // 夾帶實體檔案
  if (selectedFile.value) {
    formData.append('ImageFile', selectedFile.value);
  }

  try {
    const actionUrl = isEdit.value ? 'Edit' : 'Create';
    const res = await axios.post(`http://localhost:5158/api/manage/MProductApi/${actionUrl}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.data.success) {
      toast.add({ severity: 'success', summary: '儲存成功', detail: res.data.message, life: 2000 });
      // 延遲跳轉讓使用者看到成功訊息
      setTimeout(() => router.push('/manage/product'), 1200);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || '儲存過程中發生錯誤';
    toast.add({ severity: 'error', summary: '儲存失敗', detail: errorMsg, life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (date) => date ? new Date(date).toLocaleString() : '無資料';

onMounted(initData);
</script>

<style scoped>
/* 可以在這裡加入淡入效果 */
.container {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
