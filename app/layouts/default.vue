<template>
  <div class="min-h-screen bg-surface-0 dark:bg-surface-950 font-sans transition-colors duration-300">
    <TopBar @login-click="loginModalVisible = true" />
    <main>
      <slot />
    </main>
    <LoginModal v-model:visible="loginModalVisible" />
  </div>
</template>

<script setup lang="ts">
import LoginModal from '~/components/LoginModal.vue';
import { ref } from 'vue';

const loginModalVisible = ref(false);
</script>
