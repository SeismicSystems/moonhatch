import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  envDir: resolve(__dirname, '../../'),
})
