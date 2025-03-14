import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from "dotenv";

// https://vite.dev/config/
export default defineConfig({
  base:'/',
  plugins: [react()],
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
  define:{
    'process.env.VITE_BASE_API':JSON.stringify(process.env.VITE_BASE_API),
  },
})
