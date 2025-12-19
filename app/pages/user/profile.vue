<template>
    <div class="w-full max-w-[95%] mx-auto p-4 md:p-6">
        <Toast />
        <div class="flex flex-col gap-8">
            <Card class="overflow-hidden border-none shadow-xl bg-surface-900">
                <template #title>
                    <div class="p-4 border-b border-surface-200 dark:border-surface-700 text-center">
                        <span class="text-2xl font-bold text-white">Mi Perfil</span>
                    </div>
                </template>
                <template #content>
                    <Tabs value="0">
                        <TabList>
                            <Tab value="0" class="flex items-center gap-2">
                                <i class="pi pi-user" />
                                <span>Detalles</span>
                            </Tab>
                            <Tab value="1" class="flex items-center gap-2">
                                <i class="pi pi-shield" />
                                <span>Seguridad</span>
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel value="0">
                                <div class="flex flex-col gap-6 max-w-lg mx-auto py-6">
                                    <div class="flex flex-col gap-2">
                                        <label class="font-bold">Usuario</label>
                                        <IconField>
                                            <InputIcon class="pi pi-user" />
                                            <InputText v-model="username" readonly class="w-full" disabled />
                                        </IconField>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="font-bold">Email</label>
                                        <IconField>
                                            <InputIcon class="pi pi-envelope" />
                                            <InputText v-model="email" readonly class="w-full" disabled />
                                        </IconField>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <label class="font-bold">Saldo</label>
                                        <IconField>
                                            <InputIcon class="pi pi-wallet" />
                                            <InputText v-model="balance" readonly class="w-full font-bold text-green-400" disabled />
                                        </IconField>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel value="1">
                                <div class="flex flex-col gap-6 max-w-lg mx-auto py-6 text-center text-gray-500">
                                    <i class="pi pi-lock text-4xl mb-4"></i>
                                    <p>Próximamente: Cambiar contraseña</p>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Toast from 'primevue/toast';

const client = useSanctumClient();

const username = ref('');
const email = ref('');
const balance = ref('');

onMounted(() => {
    getUser();
});

async function getUser() {
    try {
        const res: any = await client('/me', { method: 'GET' });
        username.value = res.user.username;
        email.value = res.user.email;
        const userId = res.user.id;
        
        // Fetch balance
        const walletRes: any = await client(`/wallet/${userId}`, { method: 'GET' });
        balance.value = formatNumber(walletRes.data.Balance);
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

function formatNumber(num: number) {
    return Number(num).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
</script>