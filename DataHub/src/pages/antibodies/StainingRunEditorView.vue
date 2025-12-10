<template>
  <v-container fluid class="pa-4 d-flex flex-column ga-4">
    
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else>
      <v-card border>
        <v-card-text>
          <!-- DAS FORMULAR -->
        <StainingRunForm 
          :data="runData"
          :assistant-options="technicalAssistants"
          @update="(val: any) => runData = val"
        />
        </v-card-text>

        <v-divider></v-divider>
        
        <!-- BUTTONS -->
        <v-card-actions class="d-flex justify-end pa-4 bg-grey-lighten-5 ga-2">
          <v-btn variant="outlined" color="error" prepend-icon="mdi-delete" @click="handleDelete">Löschen</v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="router.back()">Abbrechen</v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="handleSave" :loading="saving">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { StainingRun } from '@/mocks/db';
import StainingRunForm from '@/components/lab/forms/StainingRunForm.vue';

const props = defineProps<{ id: string }>(); // ID aus URL
const router = useRouter();
const navStore = useNavigationStore();

const loading = ref(true);
const saving = ref(false);
const runData = ref<StainingRun | null>(null);
const technicalAssistants = ref<any[]>([]);

async function loadData() {
  loading.value = true;
  try {
    // 1. Optionen laden
    const opts = await api.getSearchOptions();
    technicalAssistants.value = opts.technicalAssistants;

    // 2. Daten laden
    if (props.id === 'new') {
      // Leeres Objekt initialisieren
      runData.value = {
        id: 0, runId: '', projectId: null, technicalAssistantId: null, stainingType: '', date: null, device: '', kit: '', cutCount: 0, tissue: '', material: '',
        pretreatDemasking: '', pretreatReagent: '', pretreatTime: '',
        blockH2O2: false, blockAvidinBiotin: false, blockBsaNgs: false,
        ventanaHqLinkerTime: '', ventanaHqMultiTime: '', ventanaPeroxidaseInhibitor: false,
        primaryAkLotId: '', primaryAkId: '', primaryAkName: '', primaryDilution: '', primaryIncubationTime: '',
        secondaryAkLotId: '', secondaryAkId: '', secondaryAkName: '', secondaryDilution: '', secondaryIncubationTime: '',
        remarks: ''
      } as StainingRun;
    } else {
      // API Mock Call (simuliert GetById über Search)
      const all = await api.searchStainingRuns({});
      const found = all.find(r => r.id === Number(props.id));
      if (found) {
        runData.value = JSON.parse(JSON.stringify(found));
      }
    }
    
    updateNav();
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  if (!runData.value) return;
  saving.value = true;
  // Hier API Call zum Speichern (Mock)
  // await api.saveStainingRun(runData.value); // Müssten wir in api.ts noch anlegen
  await new Promise(r => setTimeout(r, 500)); // Simuliere Speichern
  saving.value = false;
  router.back(); // Oder auf der Seite bleiben
}

async function handleDelete() {
  if(confirm("Löschen?")) {
    // await api.deleteStainingRun(runData.value.id);
    router.back();
  }
}

function updateNav() {
  const title = props.id === 'new' ? 'Neuer Färbelauf' : `Färbelauf ${runData.value?.runId || props.id}`;
  navStore.setContext('mdi-palette-swatch', [
    { title: 'Navigation', to: '/' },
    { title: 'Antikörper', to: { name: 'AntibodyDashboard' } }, // Zurück zur Suche
    { title: title, disabled: true }
  ]);
}

onMounted(loadData);
</script>