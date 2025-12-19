<template>
    <div class="w-full max-w-[95%] mx-auto p-4 md:p-6">
        <Card class="overflow-hidden">
            <template #header>
                <div class="w-full relative">
                    <img src="/banner.png" alt="Welcome to Alexito Casino" class="w-full h-56 md:h-[500px] object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            </template>
            <template #content>
                <div class="flex flex-col gap-8">
                    <!-- Games List Header -->
                    <Divider align="center" type="solid" class="!my-0">
                        <span class="text-2xl font-bold text-primary-600 uppercase tracking-widest drop-shadow-sm">Lista de juegos</span>
                    </Divider>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <!-- Placeholders for games -->
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">

const client = useSanctumClient()

let saldo = ref(0)

async function getData() {

    try{
        const res: any = await client('/wallet/1', { method: 'GET' })
        saldo.value = res.data.Balance
        console.log(saldo.value)
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    getData()
})


import Divider from 'primevue/divider';
import Card from 'primevue/card';
</script>

