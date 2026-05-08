import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Dùng './' để deploy được cả trên GitHub Pages dạng /ten-repo/
 base: '/mysister/',
});
