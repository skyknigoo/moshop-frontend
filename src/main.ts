import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 1. 全域開啟跨域憑證 (Axios 配置)
axios.defaults.withCredentials = true

// 2. PrimeVue 核心與主題樣式
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import './style.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'

// 3. PrimeVue 服務與功能
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Form from '@primevue/forms/form'

// 4. 匯入 PrimeVue 組件
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import Menubar from 'primevue/menubar'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Skeleton from 'primevue/skeleton'
import Image from 'primevue/image'
import Textarea from 'primevue/textarea'
import Paginator from 'primevue/paginator'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Menu from 'primevue/menu'
import Panel from 'primevue/panel'
import Dialog from 'primevue/dialog'
import SelectButton from 'primevue/selectbutton'

// 5. 初始化 App 與 Pinia
const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // 必須在 router 之前註冊 Pinia，以便路由守衛使用 Store
app.use(router)

// 6. 註冊服務與 PrimeVue 設定
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'false', // 修正：確保為字串格式
      cssLayer: false
    },
  },
})

// 7. 全域組件註冊 (對應你原本的自定義名稱)
app.component('PButton', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Card', Card)
app.component('Toast', Toast)
app.component('Tag', Tag)
app.component('Divider', Divider)
app.component('Menubar', Menubar)
app.component('InputGroup', InputGroup)
app.component('InputGroupAddon', InputGroupAddon)
app.component('Checkbox', Checkbox)
app.component('InputNumber', InputNumber)
app.component('Skeleton', Skeleton)
app.component('PImage', Image)
app.component('Paginator', Paginator)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('ConfirmDialog', ConfirmDialog)
app.component('PTextarea', Textarea)
app.component('PSelect', Select)
app.component('PForm', Form)
app.component('Splitter', Splitter)
app.component('SplitterPanel', SplitterPanel)
app.component('PMenu', Menu)
app.component('Panel', Panel)
app.component('PDialog', Dialog)
app.component('SelectButton', SelectButton)

// 8. 掛載應用程式
app.mount('#app')
