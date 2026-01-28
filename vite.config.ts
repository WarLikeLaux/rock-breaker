import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/strike-v/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/style.css',
        'src/main.ts',
      ]
    }
  },
  // Явная конфигурация esbuild: Vite использует esbuild для транспиляции TS,
  // но не читает tsconfig.json напрямую — нужно дублировать критичные опции
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2020',
        jsx: 'preserve',
      },
    },
  },
});