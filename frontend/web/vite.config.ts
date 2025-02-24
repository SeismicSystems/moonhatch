import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  envDir: resolve(__dirname, '../../'),
  build: {
    target: 'esnext', // Use modern JavaScript features without transpiling down to older versions.
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: mode != 'production',
  },
}))
