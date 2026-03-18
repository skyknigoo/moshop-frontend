<script setup lang="ts"> // 1. 加上 lang="ts"
import { ref, computed, onMounted } from "vue";
import api from '@/api/axios'
// 2. 引入 PrimeVue 菜單型別
import type { MenuItem } from 'primevue/menuitem';

// 3. 定義資料結構介面
interface Product {
    productID: number;
    productName: string;
    productPrice: number;
    imagePath: string | null;
}

interface Category {
    groupID: number;
    groupName: string;
}

const products = ref<Product[]>([]);
const groups = ref<Category[]>([]);
const searchQuery = ref('');
const selectedGroupId = ref<number | null>(null);
const loading = ref(false);
const selectPage = ref(1);
const currentPage = ref(1);
const totalPages = ref(1);

// 格式化價格 (加上參數型別)
const formatPrice = (val: number | null) => val ? `NT$ ${val.toLocaleString()}` : 'NT$ 0';

// 取得商品分類 (指定回傳型別為 MenuItem[])
const groupMenuItems = computed((): MenuItem[] => {
    const items: MenuItem[] = [{ label: '全部商品', icon: '', command: () => selectGroup(null) }];
    groups.value.forEach(c => {
        items.push({
            label: c.groupName,
            command: () => selectGroup(c.groupID),
            class: selectedGroupId.value === c.groupID ? 'selectMenuItem' : ''
        });
    });

    return items;
});

// 2. 各分類項目的判斷 (加上參數型別)
const selectGroup = (id: number | null) => {
    selectedGroupId.value = id;
    fetchData();
}

const selectPageF = (num: number) => {
    selectPage.value = num;
    fetchData();
}

const searchString = () => {
    selectPage.value = 1
    fetchData();
}

const fetchData = async () => {
    loading.value = true;
    try {
        // 使用 res: any 確保能讀取你後端回傳的 items, categories 等欄位
        const res: any = await api.get('/ProductApi', {
            params: {
                search: searchQuery.value,
                groupId: selectedGroupId.value,
                page: selectPage.value
            }
        });
        console.log("資料抓取成功=>", res)

        products.value = res.items || [];
        groups.value = res.categories || [];
        totalPages.value = res.totalPages || 1;
        currentPage.value = res.currentPage || 1;
    } catch (e: any) {
        console.error("API請求發生錯誤", e.message);
        if (e.response) {
            console.error("伺服器回傳狀態碼:", e.response.status);
        }
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>

<template>
    <div class="card">
        <div class="m-">
            <div class="card flex justify-end m-5">
                <InputGroup style="width: 500px;">
                    <InputText type="text" v-model="searchQuery" placeholder="想找什麼商品？" />
                    <PButton icon="pi pi-search" severity="success" label="搜尋" @click="searchString()" />
                </InputGroup>
            </div>
        </div>

        <div class="flex">
            <div class="mr-5">
                <Panel header="商品分類" class="shadow-1 sticky top-0">
                    <PMenu :model="groupMenuItems" class="w-full border-none" />
                </Panel>
            </div>
            <div>
                <div class="grid gap-4">
                    <div v-if="products.length == 0">
                        <div style="width: 300px;border: 2px solid #e7e7e7; border-radius: 10px;" class=" p-2">
                            <img class="w-full border-round" style="height: 175px ;object-fit: cover" alt=" productImg"
                                src="/uploads/Comm/等待餵圖.png" />
                            <h3 class="mt-3 font-bold text-xl truncate">目前沒有相關產品</h3>
                            <div class="mt-4 font-bold text-xl " style="color:#f58800">$ 9999999
                            </div>
                        </div>
                    </div>
                    <div v-for="(item, index) in products" :key="index">

                        <div @click="$router.push({ name: 'ProductDetailsMe', params: { id: item.productID } })"
                            style="width: 300px;border: 2px solid #e7e7e7; border-radius: 10px;" class=" p-2">
                            <img class="w-full border-round" style="height: 250px ;object-fit: cover" alt=" productImg"
                                :src="item.imagePath || '/uploads/Comm/等待餵圖.png'" />
                            <h3 class="mt-3 font-bold text-xl truncate">{{ item.productName }}</h3>
                            <div class="mt-4 font-bold text-xl " style="color:#f58800">{{ formatPrice(item.productPrice)
                            }}
                            </div>
                        </div>
                    </div>

                </div>
                <div v-if="products.length > 0" class="flex mt-10 justify-center">
                    <div v-for="(item, index) in totalPages" :key="index">
                        <PButton class="m-1" size="large" @click="selectPageF(index + 1)"
                            :severity="item == currentPage ? '' : 'secondary'">
                            {{ item }}
                        </PButton>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <div>
    </div>
</template>

<style scoped>
/* 樣式 100% 沒動 */
:deep(.selectMenuItem .p-menu-item-content) {
    background-color: rgb(202, 221, 255) !important;
}
</style>
