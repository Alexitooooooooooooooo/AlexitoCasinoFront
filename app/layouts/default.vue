<template>
  <div class="min-h-screen bg-surface-0 dark:bg-surface-950 font-sans transition-colors duration-300">
    <TopBar @login-click="loginModalVisible = true" @register-click="registerModalVisible = true" />
      <main>
      <slot />
    </main>
    <LoginModal v-model:visible="loginModalVisible" />
    <RegisterModal v-model:visible="registerModalVisible" />
  </div>
</template>

<script setup lang="ts">
import LoginModal from '~/components/Login/LoginModal.vue';
import RegisterModal from '~/components/Login/RegisterModal.vue';
import TopBar from '~/components/layout/TopBar.vue';
import { ref } from 'vue';

const loginModalVisible = ref(false);
const registerModalVisible = ref(false);
</script>
