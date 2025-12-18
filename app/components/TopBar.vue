<template>
  <Toolbar class="border-0 border-b border-gray-200 bg-white !rounded-none !p-2">
    <template #start>
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <img src="/logocorona.png" alt="ALEXITOCASINO" class="h-10 transition-transform group-hover:scale-110" />
        <span class="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm">
          ALEXITO<span class="text-fuchsia-400">CASINO</span>
        </span>
      </NuxtLink>
    </template>

    <template #end>
      <div class="flex items-center gap-2">
        <Button label="Iniciar Sesión" icon="pi pi-user" severity="help" rounded />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
</script>
