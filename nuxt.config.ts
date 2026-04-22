// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://127.0.0.1:8000'
  }
})
