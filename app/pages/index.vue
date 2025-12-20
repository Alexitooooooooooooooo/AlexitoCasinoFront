<template>
    <div class="w-full max-w-[95%] mx-auto p-4 md:p-6">
        <div class="flex flex-col gap-8">
            <!-- Hero / Banner -->
            <Card class="overflow-hidden border-none shadow-xl bg-surface-900">
                <template #header>
                    <div class="w-full relative h-[300px] md:h-[400px]">
                        <img src="/banner.png" alt="Welcome to Alexito Casino" class="w-full h-full object-cover" />
                    </div>
                </template>
            </Card>

            <!-- Games Grid -->
            <Card class="mt-8 border-none shadow-xl bg-surface-0 dark:bg-surface-900">
                <template #header>
                    <div class="p-4 border-b border-surface-200 dark:border-surface-700">
                        <span class="text-2xl font-bold text-primary-600 uppercase tracking-widest drop-shadow-sm flex items-center justify-center">Todos los Juegos</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                        <div v-for="game in paginatedGames" :key="game.id + '_grid'">
                            <!-- Click opens modal -->
                            <div @click="openGame(game)" class="block h-full cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                                <Card class="bg-transparent border-none shadow-none h-full">
                                    <template #content>
                                        <div class="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow">
                                             <img :src="game.image" :alt="game.name" class="w-full h-full object-cover" />
                                        </div>
                                    </template>
                                </Card>
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                     <Paginator :rows="rows" :totalRecords="games.length" :first="first" @page="onPage" class="border-t border-surface-200 dark:border-surface-700 mt-4" :template="{
                        '640px': 'PrevPageLink CurrentPageReport NextPageLink',
                        '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                        '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
                    }"></Paginator>
                </template>
            </Card>
        </div>
        
        <!-- Game Dialog -->
        <Dialog 
            v-model:visible="gameDialogVisible" 
            modal 
            :header="selectedGame?.name || 'Juego'" 
            class="w-full max-w-6xl mx-auto m-0 max-h-screen"
            :pt="{ 
                content: { class: '!p-0' },
                root: { class: '!max-h-screen !m-0 rounded-none md:rounded-xl' }
            }" 
            dismissableMask
        >
            <div v-if="selectedGame" class="relative">
                <!-- Generic Slot Game -->
                <SlotGame 
                    v-if="selectedGame.slug" 
                    :key="selectedGame.id"
                    :gameSlug="selectedGame.slug" 
                    :endpoint="selectedGame.endpoint"
                    :gameId="selectedGame.id"
                    @close="gameDialogVisible = false"
                />
                
                <!-- Fallback for other games -->
                <div v-else class="h-[400px] flex flex-col items-center justify-center bg-surface-900 text-white p-8 text-center">
                    <i class="pi pi-cog text-6xl mb-4 text-surface-500"></i>
                    <h2 class="text-2xl font-bold mb-2">Próximamente</h2>
                    <p class="text-surface-400">El juego "{{ selectedGame.name }}" aún se está cocinando.</p>
                    <Button label="Cerrar" class="mt-4" @click="gameDialogVisible = false" severity="secondary" />
                </div>
            </div>
        </Dialog>

        <!-- Login Required Dialog -->
        <Dialog 
            v-model:visible="loginWarningVisible" 
            modal 
            header="Atención" 
            class="w-full max-w-sm"
            dismissableMask
        >
            <div class="flex flex-col items-center gap-4 text-center">
                <p class="text-surface-600 dark:text-surface-300">Debes hacer login para continuar.</p>
                <div class="flex gap-2 w-full">
                    <Button label="Entendido" class="w-full" @click="loginWarningVisible = false" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
// Import game components
import SlotGame from '~/components/games/SlotGame.vue';

const client = useSanctumClient();
const { user } = useSanctumAuth(); 
let saldo = ref(0);

// UI State
const gameDialogVisible = useState('gameDialogVisible', () => false);
const selectedGame = ref<any>(null);

const games = ref<any[]>([]);


async function getSaldo() {
    try {
        const walletRes: any = await client('/wallet/1', { method: 'GET' });
        saldo.value = walletRes.data.Balance;
    } catch (error) {
        console.error("Error fetching saldo:", error);
    }
}

async function getData() {
    try {
        // Fetch Balance
        await getSaldo();

        // Fetch Games
        const slotsRes: any = await client('/slots', { method: 'GET' });
        const slotsData = Array.isArray(slotsRes) ? slotsRes : (slotsRes.data || []);
        
        games.value = slotsData.map((game: any) => ({
            ...game,
            // Convert Code to Slug (e.g. Minecraft_Slot -> minecraft-slot) config convention
            slug: game.code.toLowerCase().replace(/_/g, '-'), 
            endpoint: game.code,
            image: `/games/${game.code.toLowerCase().replace(/_/g, '-')}/cover.jpg` 
        }));
        

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

const loginWarningVisible = ref(false);

function openGame(game: any) {
    if (!user.value) {
        loginWarningVisible.value = true;
        return;
    }
    selectedGame.value = game;
    gameDialogVisible.value = true;
    console.log(`Opening game: ${game.name}`);
}

onMounted(() => {
    getData();
})

const first = ref(0);
const rows = ref(6);

const onPage = (event: any) => {
    first.value = event.first;
    rows.value = event.rows;
};

const paginatedGames = computed(() => {
    return games.value.slice(first.value, first.value + rows.value);
});
</script>

