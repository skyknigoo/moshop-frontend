import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios'; // 1. 匯入 axios

// 關鍵新增：全域開啟跨域憑證
axios.defaults.withCredentials = true;

// 1. PrimeVue 核心與主題
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

// 2. 樣式庫
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

// 3. PrimeVue 服務
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

// 4. --- 關鍵新增：匯入所有常用組件 ---
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Menubar from 'primevue/menubar';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import Skeleton from 'primevue/skeleton';
import Image from 'primevue/image';
import Textarea from 'primevue/textarea';

import Paginator from 'primevue/paginator'; 
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog'; 
import Select from 'primevue/select';

const app = createApp(App);

// 5. 註冊 Pinia 與 路由 (順序很重要！)
const pinia = createPinia();
app.use(pinia);
app.use(router);

// 6. 註冊服務
app.use(ToastService);
app.use(ConfirmationService);

// 7. 註冊 PrimeVue 配置
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'false',
            cssLayer: false
        }
    }
});

// 8. --- 關鍵新增：全域組件註冊 ---
// 註冊後，你在所有頁面都不用再 import 這些組件了
app.component('PButton', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Card', Card);
app.component('Toast', Toast);
app.component('Tag', Tag);
app.component('Divider', Divider);
app.component('Menubar', Menubar);
app.component('InputGroup', InputGroup);
app.component('InputGroupAddon', InputGroupAddon);
app.component('Checkbox', Checkbox);
app.component('InputNumber', InputNumber);
app.component('Skeleton', Skeleton);
app.component('PImage', Image);
app.component('Paginator', Paginator); 
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ConfirmDialog', ConfirmDialog); 
app.component('PTextarea',Textarea);
app.component('PSelect',Select);

app.mount('#app');