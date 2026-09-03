import path from 'node:path'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
  base: process.env.GH_PAGES === '1' ? '/risk-control-dashboard/' : '/',
  plugins: [createVuePlugin()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      vue: path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js'),
    },
  },
  optimizeDeps: {
    include: ['vue', '@lui/lui-ui'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
  server: {
    port: 5175,
    open: false,
  },
})
