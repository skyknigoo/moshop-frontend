<template>
  <div class="card p-4 mx-auto" style="max-width: 1200px">
    <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
      <img src="/uploads/Logo/LogoMoShop2.jpg" width="180" alt="MoShop Logo" />
      <div class="flex w-full md:w-30rem gap-2">
        <InputGroup class="shadow-1">
          <InputText v-model="searchQuery" placeholder="想找什麼商品？" @keyup.enter="fetchData" />
          <Button icon="pi pi-search" severity="success" label="搜尋" @click="fetchData" />
        </InputGroup>
      </div>
    </div>

    <div class="grid mt-2">
      <div class="col-12 md:col-3">
        <Panel header="商品分類" class="shadow-1 sticky top-0">
          <Menu :model="categoryMenuItems" class="w-full border-none" />
        </Panel>
      </div>

      <div class="col-12 md:col-9">
        <DataView :value="products" :layout="layout" :loading="loading" :paginator="totalPages > 1" :rows="10">
          <template #grid="slotProps" >
            <div class="grid grid-nogutter" >
              <div v-for="(item, index) in slotProps.items" :key="index" class="col-12 sm:col-6 md:col-4 p-2">
                <div @click="$router.push({ name: 'ProductDetails', params: { id: item.productID }})" class="p-4 border-1 surface-border surface-card border-round flex flex-column product-card h-full shadow-1">
                  <div class="relative">
                    <img :src="item.imagePath || '/uploads/Comm/等待餵圖.png'" 
                         class="w-full border-round" style="height: 200px; object-fit: cover" />
                    <Tag :value="item.groupName" severity="secondary" class="absolute top-0 left-0 m-2"></Tag>
                  </div>
                  <div class="flex flex-column justify-content-between flex-1 mt-3" >
                    <div>
                      <div class="text-xl font-bold text-900 mb-2 truncate">{{ item.productName }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-between mt-3">
                      <span class="text-2xl font-semibold text-danger">{{ formatPrice(item.productPrice) }}</span>
               
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-search-minus text-6xl text-400 mb-4" />
              <p class="text-xl text-500">找不到符合條件的商品 😥</p>
            </div>
          </template>
        </DataView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// PrimeVue 組件 (建議在 main.js 全域註冊，或在此手動匯入)
import DataView from 'primevue/dataview';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import Tag from 'primevue/tag';
import Panel from 'primevue/panel';
import Menu from 'primevue/menu';

const products = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedGroupId = ref(null);
const loading = ref(false);
const totalPages = ref(1);
const layout = ref('grid'); // 設定預設為格狀佈局

// 格式化價格
const formatPrice = (val) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';

// 將 API 分類轉換為 PrimeVue Menu 格式
const categoryMenuItems = computed(() => {
  const items = [
    { label: '全部商品', icon: 'pi pi-list', command: () => selectCategory(null) }
  ];
  categories.value.forEach(c => {
    items.push({ 
      label: c.groupName, 
      command: () => selectCategory(c.groupID) 
    });
  });
  return items;
});

const fetchData = async () => {
  loading.value = true;
  try {
    // 確保後端專案有在執行，且網址正確
    const res = await axios.get('http://localhost:5158/api/ProductApi', {
      params: { 
        search: searchQuery.value, 
        groupId: selectedGroupId.value 
      }
    });
    
    // 這裡要對應你 ProductApiController.cs 回傳的 Ok(new { ... })
    products.value = res.data.items || []; 
    categories.value = res.data.categories || [];
    totalPages.value = res.data.totalPages || 1;
    
    console.log("資料抓取成功:", res.data); // 除錯用
  } catch (e) { 
    console.error("API 請求發生錯誤:", e.message); 
    if (e.response) {
       console.error("伺服器回傳狀態碼:", e.response.status);
    }
  } finally { 
    loading.value = false; 
  }
};

const selectCategory = (id) => {
  selectedGroupId.value = id;
  fetchData();
};

onMounted(fetchData);
</script>