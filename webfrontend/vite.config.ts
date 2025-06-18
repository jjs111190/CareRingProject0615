import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5177,         // 원하는 포트 번호
    host: '0.0.0.0',    // 외부 접속 허용 (선택사항)
  },
});