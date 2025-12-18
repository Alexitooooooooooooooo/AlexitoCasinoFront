<template>
    <div class="flex flex-col">
        <!-- Welcome Banner (Edge to Edge) -->
        <div class="w-full shadow-md relative">
            <img src="/banner.png" alt="Welcome to Alexito Casino" class="w-full h-56 md:h-[500px] object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <!-- Main Content -->
        <div class="container mx-auto p-4 md:p-6 flex flex-col gap-8">
            <!-- Games List Header -->
            <Divider align="center" type="solid" class="!my-0">
                <span class="text-2xl font-bold text-primary uppercase tracking-widest drop-shadow-sm">Lista de juegos</span>
            </Divider>
            
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <!-- Placeholders for games -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Divider from 'primevue/divider';
</script>

