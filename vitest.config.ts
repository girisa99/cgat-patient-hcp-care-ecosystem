/// <reference types="vitest" />
import { defineConfig, UserConfigExport } from 'vitest/config';
import * as path from 'path';

export default defineConfig(<UserConfigExport>{
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});