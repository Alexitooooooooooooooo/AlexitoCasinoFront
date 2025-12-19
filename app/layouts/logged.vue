<template>
  <div class="min-h-screen bg-surface-0 dark:bg-surface-950 font-sans transition-colors duration-300">
    <TopBarLogged />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopBarLogged from '~/components/TopBarLogged.vue';


</script>
