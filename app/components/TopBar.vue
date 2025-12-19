<template>
  <Toolbar class="border-0 border-b border-gray-200 bg-white !rounded-none !p-2">
    <template #start>
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <img src="/logocorona.png" alt="ALEXITOCASINO" class="h-10 transition-transform group-hover:scale-110" />
        <span class="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
          ALEXITO<span class="text-teal-400">CASINO</span>
        </span>
      </NuxtLink>
    </template>

    <template #end>
      <div class="flex items-center gap-2">
        <Button 
            :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'" 
            severity="secondary" 
            rounded 
            aria-label="Toggle Dark Mode"
            @click="toggleDarkMode" 
        />
        <Button label="Iniciar Sesión" icon="pi pi-user" severity="success" variant="outlined" @click="$emit('login-click')" />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';

const isDark = ref(false);

const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark-mode');
    isDark.value = document.documentElement.classList.contains('dark-mode');
};

onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark-mode');
});
</script>
