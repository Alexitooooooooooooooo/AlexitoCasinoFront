import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.dark-mode' // o usar 'media' para auto-detectar
            }
        }
    })
})