/** @type {import('tailwindcss').Config} */
export default {
  // 告訴 Tailwind 去掃描你的 Vue 檔案裡面的 class
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}