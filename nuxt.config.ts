// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    transpile: ['primevue'],
  },

  modules: ['nuxt-auth-sanctum'],


  sanctum: {
    mode: 'token',
    endpoints: {
      user: '/me',
    }

  }
})