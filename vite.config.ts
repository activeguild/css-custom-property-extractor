import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles" as common;`,
        importer(...args: string[]) {
          if (args[0] !== '@/styles') {
            return
          }

          return {
            file: `${path.resolve(__dirname, './src/assets/styles')}`,
          }
        },
      },
    },
  },
})
