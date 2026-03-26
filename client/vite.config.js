import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    host: true,  // 允许外部访问
    proxy: {
      '/api': {
        target: 'http://backend:3000',  // 改为backend服务名
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:3000',
        changeOrigin: true
      }
    }
  }
})
