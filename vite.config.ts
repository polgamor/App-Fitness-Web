import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', 
  },
  server: {
    host: 'localhost',
    port: 5173
  }
})


