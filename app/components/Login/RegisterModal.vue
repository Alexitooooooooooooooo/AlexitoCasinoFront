<template>
    <Dialog
        v-model:visible="visible"
        :style="{ width: '25rem' }"
        :modal="true"
        :closable="false"
        :dismissableMask="true"
    >
        <template #header>
            <div class="w-full text-center">
                <span class="font-bold text-xl">Registrarse</span>
                <Divider type="solid" />

            </div>
            
        </template>
        <form @submit.prevent="login">
            <div class="flex flex-col gap-4">

                <IconField>
                    <InputIcon class="pi pi-envelope" />
                    <InputText v-model="email" type="email" placeholder="Email" variant="filled" class="w-full"  />
                </IconField>
                
                <IconField>
                    <InputIcon class="pi pi-user" />
                    <InputText v-model="username" type="text" placeholder="Username" variant="filled" class="w-full"  />
                </IconField>
                
                <IconField>
                    <InputIcon class="pi pi-lock" />
                    <InputText v-model="password" type="password" placeholder="Password" class="w-full"  />
                </IconField>

                <IconField>
                    <InputIcon class="pi pi-lock" />
                    <InputText v-model="password_confirmation" type="password" placeholder="Confirm Password" class="w-full"  />
                </IconField>


                <Button type="submit" label="Registrarse" icon="pi pi-user" severity="success" class="mt-4" @click="OnRegister"/>
            </div>
        </form>
    </Dialog>
</template>
    
<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import IconField from 'primevue/iconfield';

import InputIcon from 'primevue/inputicon';


const toast = useToast();


const visible = defineModel('visible');
const email = ref('');
const password = ref('');
const username = ref('');
const password_confirmation = ref('');

const client = useSanctumClient()

const OnRegister = async () =>   {

    const data = {
        username: username.value,
        email: email.value,
        password: password.value,
        password_confirmation: password_confirmation.value
    }
    try{
        await client(`/register`, { method: 'POST', body: data })
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registro exitoso',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al registrar',
            life: 3000
        })
    }

    visible.value = false;
};
</script>