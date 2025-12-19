<template>
    <div class="w-full max-w-[95%] mx-auto p-4 md:p-6">
        <div class="flex flex-col gap-8">
            <Card class="overflow-hidden border-none shadow-xl bg-surface-900">
                <template #header>
                    <div class="p-4 border-b border-surface-200 dark:border-surface-700">
                        <h2 class="text-2xl font-bold text-white flex justify-center">Historial de jugadas</h2>
                    </div>
                </template>
                <template #content>
                    <DataTable :value="transactions" :paginator="true" :rows="10" :rowsPerPageOptions="[10, 20, 50]" responsiveLayout="scroll"
                        class="p-datatable-sm" stripedRows v-model:filters="filters" p-datatable-header
                        :globalFilterFields="['game_type', 'reference', 'type', 'amount']">
                        
                        <template #header>
                            <div class="flex justify-between items-center flex-wrap gap-4">
                                <span class="text-xl font-bold">Transacciones</span>
                                <div class="flex gap-2 items-center">
                                    <DatePicker v-model="selectedDate" showIcon fluid iconDisplay="input" dateFormat="yy-mm-dd" placeholder="Filtrar por fecha" class="w-40" />
                                     <IconField iconPosition="left">
                                        <InputIcon class="pi pi-search" />
                                        <InputText v-model="filters['global'].value" placeholder="Buscar..." class="p-inputtext-sm" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <Column field="created_at" header="Fecha">
                             <template #body="slotProps">
                                {{ new Date(slotProps.data.created_at).toLocaleString() }}
                            </template>
                        </Column>
                        <Column field="game_type" header="Juego"></Column>
                        <Column field="amount" header="Monto">
                             <template #body="slotProps">
                                <span :class="(slotProps.data.type === 'win' || slotProps.data.type === 'deposit') ? 'text-green-400' : 'text-red-400'">
                                    {{ (slotProps.data.type === 'win' || slotProps.data.type === 'deposit') ? '+' : '-' }}{{ formatNumber(slotProps.data.amount) }}
                                </span>
                            </template>
                        </Column>
                        <Column field="type" header="Tipo">
                            <template #body="slotProps">
                                <Tag :severity="getSeverity(slotProps.data.type)" :value="getLabel(slotProps.data.type)" />
                            </template>
                        </Column>
                        <Column field="balance_before" header="Saldo antes">
                             <template #body="slotProps">
                                {{ formatNumber(slotProps.data.balance_before) }}
                            </template>
                        </Column>
                        <Column field="balance_after" header="Saldo despues">
                             <template #body="slotProps">
                                {{ formatNumber(slotProps.data.balance_after) }}
                            </template>
                        </Column>
                        <Column field="reference" header="Referencia"></Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import DatePicker from 'primevue/datepicker';
import { FilterMatchMode } from '@primevue/core/api';


const client = useSanctumClient()
const transactions = ref([])
const allTransactions = ref([])
const selectedDate = ref(new Date());

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    getTransactions()
})

watch(selectedDate, () => {
    filterByDate();
});

function filterByDate() {
    if (!selectedDate.value) {
        transactions.value = [...allTransactions.value];
    } else {
        const sel = new Date(selectedDate.value);
        const startOfDay = new Date(sel.setHours(0, 0, 0, 0));
        const endOfDay = new Date(sel.setHours(23, 59, 59, 999));

        transactions.value = allTransactions.value.filter((t: any) => {
            const tDate = new Date(t.created_at);
            return tDate >= startOfDay && tDate <= endOfDay;
        });
    }
}

async function getTransactions() {
    try{
        const userRes: any = await client('/me', { method: 'GET' })   
        const userid = userRes.user.id
        
        const res: any = await client(`/wallet/${userid}/transactions`, { method: 'GET' })
        
        let data = [];

            data = res.transactions;

        
        allTransactions.value = data;
        filterByDate();
        
    } catch (error) {
        console.error(error)
    }
}

function getSeverity(type: string) {
    switch(type) {
        case 'win': return 'success';
        case 'deposit': return 'success';
        case 'withdraw': return 'warn';
        case 'bet': return 'danger';
        default: return 'info';
    }
}

function getLabel(type: string) {
    switch(type) {
        case 'win': return 'Ganancia';
        case 'deposit': return 'Depósito';
        case 'withdraw': return 'Retiro';
        case 'bet': return 'Apuesta';
        default: return type.toUpperCase();
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