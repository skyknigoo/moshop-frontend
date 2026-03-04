<template>
  <div class="container mt-5 px-4" style="max-width: 1200px; margin: 0 auto;">
    <Toast />

    <nav class="flex align-items-center gap-2 mb-4 text-sm">
      <router-link to="/" class="text-primary no-underline hover:underline">商品首頁</router-link>
      <i class="pi pi-chevron-right text-xs text-400"></i>
      <span class="text-600" v-if="product">{{ product.group.groupName }}</span>
    </nav>

    <div v-if="loading" class="grid">
      <div class="col-12 md:col-6">
        <Skeleton height="500px" />
      </div>
      <div class="col-12 md:col-6">
        <Skeleton height="500px" />
      </div>
    </div>

    <div v-else-if="product" class="grid">

      <div class="col-12 md:col-6 pr-md-4">
        <div class="surface-card p-2 border-round shadow-1 mb-4">
          <PImage :src="product.imagePath || '/uploads/Comm/等待餵圖.png'" preview
            imageStyle="max-height: 500px; width: 100%; object-fit: contain;" class="w-full" />
        </div>
        <div class="mt-4">
          <h3 class="font-bold text-xl mb-2 border-bottom-1 surface-border pb-2">商品描述</h3>
          <p class="text-700 line-height-3" style="white-space: pre-line;">
            {{ product.productDescription || '此商品暫無詳細描述。' }}
          </p>
        </div>
      </div>

      <div class="col-12 md:col-6 pl-md-4">
        <h6 class="text-primary font-bold uppercase mb-1">{{ product.group.groupName }}</h6>
        <h1 class="text-4xl font-bold mb-3 text-900">{{ product.productName }}</h1>

        <div class="mb-4">
          <span class="text-3xl text-danger font-bold">{{ formatPrice(product.productPrice) }}</span>
        </div>

        <Divider />

        <div class="surface-100 p-3 border-round mb-4">
          <div class="grid text-center flex">
            <div class="col-6">
              <small class="text-600 block mb-2">購買數量</small>
              <InputNumber v-model="quantity" showButtons buttonLayout="horizontal" :min="1" :max="product.stockQty"
                decrementButtonIcon="pi pi-minus" incrementButtonIcon="pi pi-plus" inputClass="text-center w-full"
                class="w-full" />
            </div>
            <div class="col-6">
              <small class="text-600 block mb-3">剩餘數量</small>
              <span class="text-xl font-bold text-900 ">{{ product.stockQty }}</span>
            </div>
          </div>
        </div>

        <div class="border-1 surface-border border-round p-3 shadow-1 mb-4">
          <div class="font-bold mb-3 flex align-items-center">
            <i class="pi pi-truck mr-2 text-primary"></i>
            收件資訊 <span class="text-sm font-normal text-500 ml-2">(目前僅提供貨到付款)</span>
          </div>

          <div class="grid mb-3">
            <div class="col-6">
              <label class="block text-sm font-bold mb-2">*姓名</label>
              <InputText v-model="orderForm.receiverName" class="w-full" placeholder="收件人姓名" />
            </div>
            <div class="col-6">
              <label class="block text-sm font-bold mb-2">*電話</label>
              <InputText v-model="orderForm.receiverPhone" class="w-full" placeholder="收件人電話" />
            </div>
          </div>

          <div class="mb-3">
            <label class="block text-sm font-bold mb-2">*收件地址</label>
            <div class="grid">
              <div class="col-6">
                <select v-model="orderForm.city" class="p-inputtext w-full" @change="orderForm.district = ''">
                  <option value="">選擇縣市</option>
                  <option v-for="(districts, city) in twData" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
              <div class="col-6">
                <select v-model="orderForm.district" class="p-inputtext w-full" :disabled="!orderForm.city">
                  <option value="">選擇區域</option>
                  <option v-for="d in currentDistricts" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <InputText v-model="orderForm.detailAddress" class="w-full" placeholder="*詳細地址 (路街巷弄號樓)" />
          </div>

          <div class="flex align-items-center gap-2">
            <Checkbox v-model="saveDefault" :binary="true" inputId="saveDef" />
            <label for="saveDef" class="text-600 text-sm cursor-pointer">儲存為預設收件資訊</label>
          </div>
        </div>

        <div class="flex flex-column gap-2">
          <PButton label="立即購買" icon="pi pi-shopping-bag" severity="success" class="w-full p-3 font-bold text-lg"
            @click="handlePurchase" />
          <PButton label="回商品列表" icon="pi pi-arrow-left" text class="w-full" @click="$router.push('/')" />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showModal" header="📋 訂單最終確認" :style="{ width: '450px' }" modal>
      <div class="flex flex-column gap-3 py-2">
        <div class="flex justify-content-between">
          <span class="text-600">商品：</span>
          <span class="font-bold">{{ product?.productName }}</span>
        </div>
        <div class="flex justify-con        nt-between">
          <span class="text-600">數量：</span>
          <span class="text-danger font-bold text-xl">{{ quantity }}</span>
        </div>
        <div class="flex justify-content-between">
          <span class="text-600">總價：</span>
          <span class="text-danger font-bold text-xl">{{ formatPrice(quantity * (product?.productPrice || 0)) }}</span>
        </div>
        <Divider />
        <div class="flex flex-column gap-1">
          <span class="text-600 text-sm">收件資訊：</span>
          <div class="font-bold text-900">{{ orderForm.receiverName }} | {{ orderForm.receiverPhone }}</div>
          <div class="text-700">{{ fullAddress }}</div>
        </div>
      </div>
      <template #footer>
        <PButton label="取消" icon="pi pi-times" text @click="showModal = false" />
        <PButton label="確定下單" icon="pi pi-check" severity="primary" @click="submitOrder" :loading="submitting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router'; // 1. 確保有匯入 router
import api from '@/api/axios'

const props = defineProps(['id']);
const product = ref(null);
const loading = ref(true);
const submitting = ref(false);
const quantity = ref(1);
const showModal = ref(false);
const saveDefault = ref(false);
const toast = useToast();
const router = useRouter(); // 2. 初始化 router

const twData = {
  "台北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
  "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區"],
  "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區"]
};

const orderForm = ref({
  receiverName: '',
  receiverPhone: '',
  city: '',
  district: '',
  detailAddress: ''
});

const currentDistricts = computed(() => twData[orderForm.value.city] || []);
const fullAddress = computed(() => `${orderForm.value.city}${orderForm.value.district}${orderForm.value.detailAddress}`);
const formatPrice = (val) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/ProductApi/${props.id}`);
    console.log("資料=>", res)
    product.value = res;
    const saved = JSON.parse(localStorage.getItem("moshop_default_info"));
    if (saved) { orderForm.value = { ...saved }; saveDefault.value = true; }
  } catch (e) { console.error(e); } finally { loading.value = false; }
};

const handlePurchase = () => {
  const f = orderForm.value;
  if (!f.receiverName || !f.receiverPhone || !f.city || !f.district || !f.detailAddress) {
    toast.add({ severity: 'warn', summary: '提醒', detail: '請完整填寫收件資訊！', life: 3000 });
    return;
  }
  if (saveDefault.value) { localStorage.setItem("moshop_default_info", JSON.stringify(orderForm.value)); }
  else { localStorage.removeItem("moshop_default_info"); }
  showModal.value = true;
};

const submitOrder = async () => {
  submitting.value = true;
  try {
    const orderData = {
      ProductId: product.value.productID,
      OrderQty: quantity.value,
      ReceiverName: orderForm.value.receiverName,
      ReceiverPhone: orderForm.value.receiverPhone,
      ReceiverAddress: fullAddress.value
    };
    const res = await api.post('/OrderApi/SubmitOrder', orderData);
    if (res.success) {
      // 3. 顯示成功訊息
      toast.add({
        severity: 'success',
        summary: '下單成功',
        detail: '感謝您的購買！即將前往訂單列表...',
        life: 2000
      });

      // 4. 關鍵修改：延遲 1.5 秒後跳轉，讓使用者看清楚 Toast 提示
      setTimeout(() => {
        router.push('/order'); // 假設你的訂單列表路由路徑是 /order
      }, 1500);
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: '失敗', detail: e.response?.data?.message || '系統錯誤', life: 3000 });
  } finally { submitting.value = false; }
};

onMounted(fetchData);
</script>

<style scoped></style>
