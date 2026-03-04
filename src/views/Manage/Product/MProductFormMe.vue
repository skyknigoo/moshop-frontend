<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from "zod";

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
  productGroup: 0,
  productPrice: 0,
  stockQty: 0,
  status: 1, // 預設 Available (1)
  imagePath: '',
  createdAt: null,
  updatedAt: null,
  updatedBy: ''
});

// 讀取資料
const initData = async () => {
  try {
    const catRes = await api.get('/manage/MProductApi/Categories')
    categories.value = catRes;
    if (isEdit.value) {
      const res = await api.get(`/manage/MProductApi/${route.params.id}`);
      product.value = res.product;
    }
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: '初始化失敗', detail: '無法連線至伺服器讀取資料', life: 3000 });
  }
}

// --- 圖片處理 ---
const onFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
}

// 表單驗證
const resolver = ref(zodResolver(
  z.object({
    productName: z.string().min(1, '請填寫商品名稱'),
    productDescription: z.string().min(1, '請填寫商品詳細描述'),
    productGroup: z.number().min(1, '請選擇商品類別'),
    productPrice: z.number().min(1, '請填寫價錢'),
    stockQty: z.number().min(1, '請填寫商品數量'),
  })

))


const onFormSubmit = async ({ valid, values }) => {
  if (valid) {
    console.log("傳遞的資料=>", values)
    isSaving.value = true;
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      formData.append(key, values[key]);
    });
    // 處理時間與路徑 (編輯模式重要)
    if (isEdit.value) { formData.append('ProductID', product.value.productID); }
    if (product.value.imagePath) formData.append('ImagePath', product.value.imagePath);
    if (product.value.createdAt) formData.append('CreatedAt', product.value.createdAt);

    // 夾帶實體檔案(圖片)
    if (selectedFile.value) { formData.append('ImageFile', selectedFile.value); }

    try {
      const actionUrl = isEdit.value ? 'Edit' : 'Create';
      const res = await api.post(`/manage/MProductApi/${actionUrl}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        toast.add({ severity: 'success', summary: '儲存成功', detail: res.message, life: 2000 });
        setTimeout(() => router.push('/manage/productMe'), 1200);
      }
    } catch (err) {
      const errorMsg = err.response?.message || '儲存過程中發生錯誤';
      toast.add({ severity: 'error', summary: '儲存失敗', detail: errorMsg, life: 3000 });
    } finally {
      isSaving.value = false;
    }
  }
}


const formatDate = (date) => date ? new Date(date).toLocaleString() : '無資料';

onMounted(initData);

</script>

<template>
  <div class="container py-4 px-4" style="max-width: 1100px; margin: 0 auto;">
    <Toast />
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-3xl font-bold m-0 text-900">
          <i class="pi pi-cart-arrow-down mr-2 text-primary text-3xl"></i>
          {{ isEdit ? ' 編輯商品資訊' : ' 新增商品' }}
        </h2>
        <nav class="flex align-items-center gap-2 text-500 text-sm mt-2">
          <router-link to="/manage/productMe" class="no-underline text-500 hover:text-primary">商品列表</router-link>
          <i class="pi pi-chevron-right text-xs"></i>
          <span class="text-900 font-medium">商品表單</span>
        </nav>
      </div>
      <PButton label="返回列表" icon="pi pi-arrow-left" severity="secondary" outlined
        @click="router.push('/manage/productMe')" />
    </div>
    <div v-if="!isEdit || (isEdit && product.productID !== 0)">
      <PForm v-slot="$form" :resolver="resolver" :initialValues="product" @submit="onFormSubmit"
        class="flex flex-col gap-4 w-full ">
        <div class="grid">
          <div class="col-12 lg:col-8">
            <Card class="mb-4 shadow-1 border-none">
              <template #title>基本資訊</template>
              <template #content>
                <div class="flex flex-column gap-4">
                  <div class="flex flex-column gap-2">
                    <label for="name" class="font-bold text-700">* 商品名稱</label>
                    <InputText name="productName" id="name" v-model="product.productName" maxlength="60"
                      placeholder="例如：高效能攀岩粉袋" />
                    <small class="text-500">剩餘字數：{{ 60 - (product.productName?.length || 0) }}</small>
                    <Message class="text-red-400  -m-1" v-if="$form?.productName?.invalid" severity="error" size="small"
                      variant="simple">
                      {{ $form.productName.error?.message }}
                    </Message>
                  </div>

                  <div class="flex flex-column gap-2">
                    <label for="desc" class="font-bold text-700">* 商品詳細描述</label>
                    <PTextarea name="productDescription" id="desc" v-model="product.productDescription" rows="10"
                      placeholder="請輸入商品規格、材質與使用說明..." />
                    <Message class="text-red-400  -m-1" v-if="$form?.productDescription?.invalid" severity="error"
                      size="small" variant="simple">
                      {{ $form.productDescription.error?.message }}
                    </Message>
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
                    <PSelect name="productGroup" v-model="product.productGroup" :options="categories"
                      optionLabel="groupName" optionValue="groupID" placeholder="請選擇分類" />
                    <Message class="text-red-400  -m-1" v-if="$form?.productGroup?.invalid" severity="error"
                      size="small" variant="simple">
                      {{ $form.productGroup.error?.message }}
                    </Message>
                  </div>

                  <div class="flex flex-column gap-2">
                    <label class="font-bold text-700">* 銷售價格 (TWD)</label>
                    <InputNumber name="productPrice" v-model="product.productPrice" currency="TWD" locale="zh-TW"
                      :min="0" placeholder="0" />
                    <Message class="text-red-400  -m-1" v-if="$form?.productPrice?.invalid" severity="error"
                      size="small" variant="simple">
                      {{ $form.productPrice.error?.message }}
                    </Message>
                  </div>

                  <div class="flex flex-column gap-2">
                    <label class="font-bold text-700">* 現有庫存</label>
                    <InputNumber name="stockQty" id="stockQty" v-model="product.stockQty" showButtons :min="0" />
                    <Message class="text-red-400  -m-1" v-if="$form?.stockQty?.invalid" severity="error" size="small"
                      variant="simple">
                      {{ $form.stockQty.error?.message }}
                    </Message>
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
                    type="submit" class="p-3 font-bold" />
                  <PButton label="取消並返回" severity="secondary" text @click="router.push('/manage/productMe')" />
                </div>
              </template>
            </Card>
          </div>
        </div>
      </PForm>
    </div>
    <div v-else class="text-center py-8">
      <ProgressSpinner />
    </div>
  </div>
</template>
