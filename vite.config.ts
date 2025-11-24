
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the warning limit to 1600kB to suppress warnings 
    // caused by large dependencies like Recharts or GenAI SDK.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
        output: {
            // Removing manualChunks because dependencies in importmap cannot be bundled by Vite
            manualChunks: undefined,
        },
    },
  },
  define: {
    // Polyfill process.env for libraries that expect it
    'process.env': {},
  },
});
