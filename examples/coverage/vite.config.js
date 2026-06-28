import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'windrunner': resolve(__dirname, '../../dist/index.esm.js'),
    },
  },
})
