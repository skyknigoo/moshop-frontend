<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from "zod";
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

const props = defineProps(['id']);
const product = ref(null);
const quantity = ref(1);
const showModal = ref(false);
const saveDefault = ref(false);
const submitting = ref(false);
const formatPrice = (val) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';

const twData = {
  "台北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
  "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區"],
  "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區"]
};
const currentDistricts = computed(() => twData[orderForm.value.city] || []);
const fullAddress = computed(() => `${orderForm.value.city}${orderForm.value.district}${orderForm.value.detailAddress}`);

const orderForm = ref({
  receiverName: '',
  receiverPhone: '',
  city: '',
  district: '',
  detailAddress: ''
})

// 讀取商品資料
const fetcData = async () => {
  try {
    const res = await api.get(`/ProductAPi/${props.id}`);
    product.value = res;
    // 讀取儲存在本地的收件資訊

    const saved = JSON.parse(localStorage.getItem("moshop_default_info"));
    if (saved) { orderForm.value = { ...saved }; saveDefault.value = true; }
  } catch (e) { console.error(e); }
}

// 儲存預設收件資訊
const onFormSubmit = async ({ valid }) => {
  if (valid) {
    // 驗證通過，執行儲存預設資訊的邏輯
    if (saveDefault.value) {
      localStorage.setItem("moshop_default_info", JSON.stringify(orderForm.value));
    } else {
      localStorage.removeItem("moshop_default_info");
    }

    // 開啟確認視窗
    showModal.value = true;
  }
};

// 前端阻擋
const resolver = ref(zodResolver(
  z.object({
    receiverName: z.string().min(1, { message: '請填寫姓名' }),
    receiverPhone: z.string()
      .min(10, { message: '電話至少需 10 碼' })
      .regex(/^09\d{8}$/, { message: '手機格式不正確 (例如: 0912345678)' }),
    // 下拉選單驗證
    city: z.string().min(1, { message: '請選擇縣市' }),
    district: z.string().min(1, { message: '請選擇區域' }),
    detailAddress: z.string().min(1, { message: '請輸入詳細地址' })

  })
))

// 確認訂單
const submitOrder = async () => {
  submitting.value = true;
  console.log('傳遞資料:', orderForm.value)
  const orderData = {
    ProductId: product.value.productID,
    OrderQty: quantity.value,
    ReceiverName: orderForm.value.receiverName,
    ReceiverPhone: orderForm.value.receiverPhone,
    ReceiverAddress: fullAddress.value
  };
  try {

    const res = await api.post('/OrderApi/SubmitOrder', orderData);
    if (res.success) {

      toast.add({ severity: 'success', summary: '下單成功', detail: '感謝您的購買！即將前往訂單列表...', life: 2000 });
      setTimeout(() => {
        router.push('/order'); // 假設你的訂單列表路由路徑是 /order
      }, 1500);
    }
  } catch (error) {
    console.error("Api 錯誤詳細資訊:", error.response?.data || error.message);
    toast.add({ severity: 'error', summary: '失敗', detail: error.response?.data?.message || '系統錯誤', life: 3000 });

  }
}

onMounted(fetcData);
</script>

<template>
  <nav class="flex align-items-center gap-2 mb-4 text-sm">
    <router-link to="/" class="text-primary no-underline hover:underline">商品首頁</router-link>
    <i class="pi pi-chevron-right text-xs text-400"></i>
    <span class="text-600" v-if="product">{{ product.group.groupName }}</span>
  </nav>

  <div v-if="product" class="flex">
    <div class="col-1 md:col-6 pl-md-4">
      <PImage :src="product.imagePath || '/uploads/Comm/等待餵圖.png'"
        imageStyle="max-height: 500px; width: 100%; object-fit: contain;" preview class="w-full" />
      <div class="border-1 surface-border border-round p-3 shadow-1 mt-4" style="height: 295px;">
        <h3 class="font-bold text-xl mb-2 border-bottom-1 surface-border pb-2">商品描述</h3>
        <p class="text-700 line-height-3" style="white-space: pre-line;">
          {{ product.productDescription || '此商品暫無詳細描述。' }}
        </p>
      </div>
    </div>
    <div class="col-12 md:col-6 pl-md-4">
      <div>
        <h6 class="text-primary font-bold uppercase mb-1">{{ product.group.groupName }}</h6>
        <h1 class="text-4xl font-bold mb-3 text-900">{{ product.productName }}</h1>
        <div class="mb-4">
          <span class="text-3xl text-danger font-bold">{{ formatPrice(product.productPrice) }}</span>
        </div>
      </div>
      <Divider />
      <PForm v-slot="$form" :resolver="resolver" :initialValues="orderForm" @submit="onFormSubmit">

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
          <div class="border-1 surface-border border-round p-3 shadow-1 mb-4">
            <div class="font-bold mb-3 flex align-items-center">
              <i class="pi pi-truck mr-2 text-primary"></i>
              收件資訊 <span class="text-sm font-normal text-500 ml-2">(目前僅提供貨到付款)</span>
            </div>
            <div class="grid mb-3">
              <div class="col-6">
                <label for="receiverName" class="block text-sm font-bold mb-2">*姓名</label>
                <InputText name="receiverName" id="receiverName" v-model="orderForm.receiverName" class="w-full"
                  placeholder="收件人姓名" fluid />
                <Message class="text-red-400" v-if="$form?.receiverName?.invalid" severity="error" size="small"
                  variant="simple">
                  {{ $form.receiverName.error?.message }}
                </Message>
              </div>
              <div class="col-6">
                <label for="receiverPhone" class="block text-sm font-bold mb-2">*電話</label>
                <InputText name="receiverPhone" id="receiverPhone" v-model="orderForm.receiverPhone" class="w-full"
                  placeholder="0912345678" fluid />
                <Message class="text-red-400" v-if="$form?.receiverPhone?.invalid" severity="error" size="small"
                  variant="simple">
                  {{ $form.receiverPhone.error?.message }}
                </Message>
              </div>
            </div>
            <Divider />

            <div class="mb-3">
              <label class="block text-sm font-bold mb-2">*收件地址</label>
              <div class="grid">
                <div class="col-6">

                  <PSelect name="city" :options="Object.keys(twData)" v-model="orderForm.city"
                    class="p-inputtext w-full" @change="orderForm.district = ''" placeholder="請選擇市區">
                  </PSelect>
                  <Message class="text-red-400" v-if="$form?.city?.invalid" severity="error" size="small"
                    variant="simple">
                    {{ $form.city.error?.message }}
                  </Message>
                </div>
                <div class="col-6">
                  <PSelect name="district" :options="currentDistricts" v-model="orderForm.district"
                    class="p-inputtext w-full" :disabled="!orderForm.city" placeholder="請選擇區域">

                  </PSelect>
                  <Message class="text-red-400" v-if="$form?.district?.invalid" severity="error" size="small"
                    variant="simple">
                    {{ $form.district.error?.message }}
                  </Message>
                </div>
                <div class="col-12">
                  <label for="detailAddress" class="block text-sm font-bold mb-2">*詳細地址 (路街巷弄號樓)</label>
                  <InputText name="detailAddress" id="detailAddress" v-model="orderForm.detailAddress" class="w-full"
                    placeholder="詳細地址 (路街巷弄號樓)" fluid />
                  <Message class="text-red-400" v-if="$form?.detailAddress?.invalid" severity="error" size="small"
                    variant="simple">
                    {{ $form.detailAddress.error?.message }}
                  </Message>
                </div>

              </div>
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="saveDefault" :binary="true" inputId="saveDef" />
                <label for="saveDef" class="text-600 text-sm cursor-pointer"> 儲存為預設收件資訊</label>
              </div>
            </div>

          </div>
          <div class="flex flex-col">
            <PButton label="確認訂單" icon="pi pi-shopping-bag " severity="success"
              class="w-full p-3 font-bold text-lg mb-3" type="submit" />
            <PButton label="回商品列表" icon="pi pi-arrow-left " class="w-full" text @click="$router.push('/')" />
          </div>
        </div>
      </PForm>

    </div>
    <PDialog v-model:visible="showModal" header="📋 訂單最終確認" :style="{ width: '600px' }" modal>
      <div class="flex flex-column gap-3 py-2">
        <div class="flex justify-content-between">
          <span class="text-600">商品：</span>
          <span class="font-bold">{{ product?.productName }}</span>
        </div>
        <div class="flex justify-content-between">
          <span class="text-600">單價：</span>
          <span class="text-danger font-bold text-xl">{{ product.productPrice }}</span>
        </div>
        <div class="flex justify-content-between">
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
    </PDialog>


  </div>





</template>

<style scoped></style>
