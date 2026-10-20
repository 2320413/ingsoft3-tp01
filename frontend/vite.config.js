import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],

      include: ['src/lib/**/*.js'],

      exclude: ['src/lib/**/*.test.js'],

      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
})