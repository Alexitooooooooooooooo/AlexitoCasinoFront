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
                <span class="font-bold text-xl">Iniciar Sesión</span>
                <Divider type="solid" />

            </div>
            
        </template>
        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">

                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-user" />
                        <InputText name="username" type="text" placeholder="Username" variant="filled" class="w-full" />
                    </IconField>
                    <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">{{ $form.username.error?.message }}</Message>
                </div>
                
                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock" />
                        <InputText name="password" type="password" placeholder="Password" class="w-full" />
                    </IconField>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                </div>

                <Button type="submit" label="Ingresar" icon="pi pi-user" severity="success" class="mt-4" />
            </div>
        </Form>
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
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import Message from 'primevue/message';
import { handleApiError } from '~/utils/apiErrors';


const toast = useToast();
const visible = defineModel('visible');

const { login } = useSanctumAuth();

const initialValues = ref({
    username: '',
    password: ''
});

const resolver = ref(zodResolver(
    z.object({
        username: z.string().min(1, { message: 'Username es requerido.' }),
        password: z.string().min(1, { message: 'Password es requerido.' })
    })
));

const onFormSubmit = async ({ valid, values }) => {
    if (valid) {
        try {
            await login(values);
            toast.add({
                severity: 'success',
                summary: 'Bienvenido!',
                detail: 'Inicio de sesión exitoso',
                life: 3000
            });
            visible.value = false;
        } catch (error) {
            handleApiError(toast, error);
        }
    }
};
</script>