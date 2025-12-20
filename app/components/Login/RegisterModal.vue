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
        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">

                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-envelope" />
                        <InputText name="email" type="email" placeholder="Email" variant="filled" class="w-full" />
                    </IconField>
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </div>
                
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

                <div class="flex flex-col gap-1">
                    <IconField>
                        <InputIcon class="pi pi-lock" />
                        <InputText name="password_confirmation" type="password" placeholder="Confirm Password" class="w-full" />
                    </IconField>
                    <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">{{ $form.password_confirmation.error?.message }}</Message>
                </div>


                <Button type="submit" label="Registrarse" icon="pi pi-user" severity="success" class="mt-4" />
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

const client = useSanctumClient();

const initialValues = ref({
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
});

const resolver = ref(zodResolver(
    z.object({
        username: z.string().min(1, { message: 'El nombre de usuario es requerido.' }).regex(/^\S*$/, { message: 'El nombre de usuario no debe contener espacios.' }),
        email: z.string().min(1, { message: 'El email es requerido.' }).email({ message: 'El email es invalido.' }),
        password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
        password_confirmation: z.string().min(1, { message: 'Debe confirmar la contraseña.' })
    }).refine((data) => data.password === data.password_confirmation, {
        message: "Las contraseñas no coinciden",
        path: ["password_confirmation"],
    })
));

const onFormSubmit = async ({ valid, values }) => {
    if (valid) {
        try {
            await client(`/register`, { method: 'POST', body: values });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Registro exitoso',
                life: 3000
            });
            visible.value = false;
        } catch (error) {
            handleApiError(toast, error);
        }
    }
};
</script>