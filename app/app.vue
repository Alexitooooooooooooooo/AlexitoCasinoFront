<template>
  <NuxtLayout :name="layout">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toast :pt="{
        root: { class: '!w-[90%] md:!w-96 !max-w-[90vw] !mx-auto !right-0 !left-0 md:!right-4 md:!left-auto' }
    }" />
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


