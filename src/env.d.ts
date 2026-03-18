/// <reference types="vite/client" />

// 告訴 TypeScript：所有以 .vue 結尾的檔案都是一個 Vue 組件
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

  // 解決 ts(2349) 與 ts(2305) 的關鍵：手動宣告 zodResolver 的型別
declare module '@primevue/forms/resolvers/zod' {
    // 將回傳型別改為 any，繞過套件內部的型別定義問題
    export const zodResolver: (schema: any) => any;
    export default zodResolver;
}

