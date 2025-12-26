<template>
    <div class="w-full max-w-[95%] mx-auto p-4 md:p-6">
        <Toast />
        <div class="flex flex-col gap-8">
            <Card class="overflow-hidden border-none shadow-xl bg-surface-900">
                <template #title>
                    <div class="p-4 border-b border-surface-200 dark:border-surface-700 text-center">
                        <span class="text-2xl font-bold text-on-surface">Mi Perfil</span>
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
                            <Tab value="2" class="flex items-center gap-2">
                                <i class="pi pi-wallet" />
                                <span>Recargar</span>
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
                                <Card>
                                    <template #title>
                                        <div class="p-4 text-center">
                                            <span class="text-2xl font-bold text-on-surface">Cambiar Contraseña</span>
                                        </div>
                                        <Divider />
                                    </template>
                                    <template #content>
                                        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col gap-4 max-w-lg mx-auto py-6 text-center text-gray-500">
                                            <div class="flex flex-col gap-1">
                                                <IconField>
                                                    <InputIcon class="pi pi-lock" />
                                                    <InputText name="current_password" type="password" placeholder="Contraseña Actual" class="w-full" />
                                                </IconField>
                                                <Message v-if="$form.current_password?.invalid" severity="error" size="small" variant="simple">{{ $form.current_password.error.message }}</Message>
                                            </div>

                                            <div class="flex flex-col gap-1">
                                                <IconField>
                                                    <InputIcon class="pi pi-lock" />
                                                    <InputText name="password" type="password" placeholder="Contraseña Nueva" class="w-full" />
                                                </IconField>
                                                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error.message }}</Message>
                                            </div>

                                            <div class="flex flex-col gap-1">
                                                <IconField>
                                                    <InputIcon class="pi pi-lock" />
                                                    <InputText name="password_confirmation" type="password" placeholder="Confirmar Contraseña Nueva" class="w-full" />
                                                </IconField>
                                                <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">{{ $form.password_confirmation.error.message }}</Message>
                                            </div>
                                            
                                            <Button type="submit" label="Cambiar Contraseña" />
                                        </Form>
                                    </template>
                                </Card>
                            </TabPanel>
                            <TabPanel value="2">
                                <Card>
                                    <template #title>
                                        <div class="p-4 text-center">
                                            <span class="text-2xl font-bold text-on-surface">Recargar Saldo</span>
                                        </div>
                                        <Divider />
                                    </template>
                                    <template #content>
                                        <div class="flex justify-center">
                                            <Button label="Recargar" @click="chargeBalance" />
                                        </div>
                                    </template>
                                </Card>
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
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import { handleApiError } from '~/utils/apiErrors';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

const initialValues = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
});

const resolver = ref(zodResolver(
    z.object({
        current_password: z.string().min(1, { message: 'La contraseña actual es requerida.' }),
        password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
        password_confirmation: z.string().min(1, { message: 'Debe confirmar la contraseña.' })
    }).refine((data) => data.password === data.password_confirmation, {
        message: "Las contraseñas no coinciden",
        path: ["password_confirmation"],
    })
));

const client = useSanctumClient();

const username = ref('');
const email = ref('');
const balance = ref('');
const balanceAmount = ref('');
const userId = ref('');

const onFormSubmit = async ({ valid, values, reset }: any) => {
    if (valid) {
        try {
            await client(`/users/${userId.value}/password`, {
                method: 'PUT',
                body: {
                    password: values.password,
                    current_password: values.current_password,
                    password_confirmation: values.password_confirmation
                }
            });

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Contraseña cambiada exitosamente',
                life: 3000
            });

            reset();
            
        } catch (error) {
            handleApiError(toast, error);
        }
    }
};

const toast = useToast();


onMounted(() => {
    getUser();
});

async function getUser() {
    try {
        const res: any = await client('/me', { method: 'GET' });
        username.value = res.user.username;
        email.value = res.user.email;
        userId.value = res.user.id;
        balanceAmount.value = res.user.balance;
        
        // Fetch balance
        const walletRes: any = await client(`/wallet/${userId.value}`, { method: 'GET' });
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

async function chargeBalance() {

    const amountCharge = 10000
    console.log(amountCharge);

    if(balanceAmount.value < 500) {
        
        try{
            await client(`/wallet/${userId.value}/charge`, { method: 'POST', body: { amount: amountCharge } });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Recarga exitosa',
                life: 3000
            });
            
            const triggerBalanceRefresh = useState('triggerBalanceRefresh');
            triggerBalanceRefresh.value = (triggerBalanceRefresh.value || 0) + 1;
            
            getUser();
        }catch(error){
            console.log(error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al recargar ',
                life: 3000
            });
        }



    }else{
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Debes tener un saldo menor a 500 para recargar',
            life: 3000
        });
    }

    
}

</script>