import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 这个用于启动
    port: 3000, // 指定启动端口
    open: true //启动后是否自动打开浏览器
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
