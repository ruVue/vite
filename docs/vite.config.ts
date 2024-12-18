import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true, // Enable polling for file changes
    },
  },
  ssr: {
    format: 'cjs',
  },
  legacy: {
    buildSsrCjsExternalHeuristics: true,
  },
  optimizeDeps: {
    // vitepress is aliased with replacement `join(DIST_CLIENT_PATH, '/index')`
    // This needs to be excluded from optimization
    exclude: ['vitepress'],
  },
})
