<template>
  <NuxtLayout :name="layout">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast';

const { isAuthenticated } = useSanctumAuth();
const layout = computed(() => isAuthenticated.value ? 'logged' : 'default');

useHead({
  htmlAttrs: {
    class: 'dark-mode'
  }
})
</script>


