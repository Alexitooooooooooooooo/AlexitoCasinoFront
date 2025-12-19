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
      <div class="flex items-center gap-4">
        <Button 
            :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'" 
            severity="secondary" 
            text 
            rounded 
            aria-label="Toggle Dark Mode"
            @click="toggleDarkMode" 
        />

        <Button 
            :label="balance" 
            icon="pi pi-wallet" 
            variant="text" 
            severity="secondary" 
            class="!text-lg font-bold !text-surface-900 dark:!text-surface-0 pointer-events-none" 
        />

        <Button 
            :label="username" 
            icon="pi pi-user" 
            variant="text" 
            severity="success" 
            class="font-bold" 
            iconPos="left" 
            @click="toggle" 
            aria-haspopup="true" 
            aria-controls="overlay_menu"
        />
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
    </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { useToast } from 'primevue/usetoast';

const isDark = ref(false);
const balance = ref('');
const username = ref('');
const id = ref('');
const menu = ref();
const { logout } = useSanctumAuth();
const toast = useToast();

const items = ref([
    {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => {
        }
    },
    {
        label: 'Historial',
        icon: 'pi pi-history',
        command: () => {
        }
    },
    {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: async () => {
             await OnLogout();
        }
    }
]);

const toggle = (event: any) => {
    menu.value.toggle(event);
};

async function OnLogout() {
    try {
        await logout();
        toast.add({ severity: 'info', summary: 'Adiós', detail: 'Sesión cerrada', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error al cerrar sesión', life: 3000 });
    }
}

const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark-mode');
    isDark.value = document.documentElement.classList.contains('dark-mode');
};

onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark-mode');
    getUser();
});

function formatNumber(num: number) {
    return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}



const client = useSanctumClient()

async function getBalance() {

    try{
        const res: any = await client(`/wallet/${id.value}`, { method: 'GET' })
        balance.value = formatNumber(res.data.Balance)
        
    } catch (error) {
        console.error(error)
    }
}


async function getUser() {
  try{
    const res: any = await client('/me', { method: 'GET' })
    username.value = res.user.username
    id.value = res.user.id
    getBalance();

  } catch (error) {
    console.error(error)
  }  
} 
</script>
