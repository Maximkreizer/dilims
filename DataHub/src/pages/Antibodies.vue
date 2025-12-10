<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column">
    
    <!-- OBERER BEREICH: SUCHE -->
    <div class="flex-grow-0 mb-4">
      <v-card border>
        <v-card-text>
          
          <!-- HAUPT-SUCHLEISTE -->
          <div class="d-flex align-center ga-2 mb-2">
            <v-text-field
              v-model="filters.generalSearch"
              :label="searchLabel"
              clearable
              prepend-inner-icon="mdi-magnify"
              variant="outlined" 
              density="compact" 
              hide-details 
              class="flex-grow-1"
              @keydown.enter="performSearch"
              @click:clear="performSearch"
            ></v-text-field>
            <v-btn color="primary" height="40" prepend-icon="mdi-magnify" @click="performSearch" :loading="loading">Search</v-btn>
          </div>

          <!-- SEARCH OPTIONS (Tabs für die 4 Bereiche) -->
          <v-expansion-panels v-model="panel" variant="accordion" class="mt-2">
            <v-expansion-panel elevation="0" style="border: 1px solid #e0e0e0; border-radius: 4px;">
              <v-expansion-panel-title>
                <v-icon start class="text-medium-emphasis">mdi-filter-variant</v-icon> 
                Such-Kategorie & Filter
              </v-expansion-panel-title>
              
              <v-expansion-panel-text class="pt-0">
                
                <!-- TABS: Hier wählt man die Datenbank -->
                <v-tabs v-model="activeTab" density="compact" color="primary" class="mb-4 border-b">
                  <v-tab value="antibody">Antikörper</v-tab>
                  <v-tab value="project">Projekte</v-tab>
                  <v-tab value="run">Färbeverläufe</v-tab>
                  <v-tab value="order">Bestellungen</v-tab>
                </v-tabs>

                <!-- FILTER-FELDER (Wechseln je nach Tab) -->
                <v-window v-model="activeTab">
                  
                  <!-- 1. ANTIKÖRPER SUCHE -->
                  <v-window-item value="antibody">
                    <v-row dense>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.akId" label="AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.antibody.name" label="AK_Name" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.refNr" label="Ref-Nr" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.lotNr" label="Lot-Nr" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.antibody.manufacturer" label="Hersteller" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-select v-model="filters.antibody.status" label="Status" :items="['Aktiv', 'Leer', 'Verworfen']" density="compact" variant="outlined"></v-select></v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 2. PROJEKTSUCHE (Spezifisch für Antikörper-Projekte) -->
                  <v-window-item value="project">
                    <v-row dense>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.project.number" label="Projektnummer" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.status" label="Projektstatus" :items="statusOptions" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.workgroup" label="Arbeitsgruppe" :items="['AG Immunologie', 'AG Onkologie']" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.project.date" label="Datum" type="date" density="compact" variant="outlined"></v-text-field></v-col>
                      
                      <v-col cols="12" md="6" class="d-flex align-center ga-4 mt-2">
                        <v-checkbox v-model="filters.project.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
                        <v-checkbox v-model="filters.project.longTerm" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 3. FÄRBEVERLÄUFE -->
                  <v-window-item value="run">
                    <v-row dense>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.run.runId" label="Färbe-ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.run.akId" label="AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.run.akName" label="AK_Name" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.run.date" label="Färbe-Datum" type="date" density="compact" variant="outlined"></v-text-field></v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 4. BESTELLUNGEN -->
                  <v-window-item value="order">
                    <v-row dense>
                      <v-col cols="12" md="4"><v-select v-model="filters.order.workgroup" label="AG" :items="['AG Immunologie', 'AG Onkologie']" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="4"><v-text-field v-model="filters.order.applicant" label="Antragssteller" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="4"><v-select v-model="filters.order.status" label="Status" :items="['Bestellt', 'Geliefert']" density="compact" variant="outlined"></v-select></v-col>
                    </v-row>
                  </v-window-item>

                </v-window>

                <!-- ACTIONS -->
                <v-row dense class="mt-2">
                  <v-col cols="12" class="d-flex justify-end ga-2">
                    <v-btn variant="text" color="grey-darken-1" @click="resetFilters">Clean</v-btn>
                    <v-btn color="primary" @click="performSearch">Search</v-btn>
                  </v-col>
                </v-row>

              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </div>

    <!-- UNTERER BEREICH: Generische Tabelle -->
    <div class="flex-grow-1" style="min-height: 0;">
      <!-- 
         Wir nutzen hier ResizableGenericTable, weil die Spalten sich ändern.
         Die Tabelle ist read-only (nur Anzeige).
      -->
      <ResizableGenericTable 
        :items="results"
        :headers="currentHeaders"
        :loading="loading"
        @open="handleOpen"
      />
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import ResizableGenericTable from '@/components/lab/shared/ResizableGenericTable.vue';

const router = useRouter();
const navStore = useNavigationStore();

const loading = ref(false);
const panel = ref<number[]>([0]); // Default: Filter ausgeklappt
const activeTab = ref('antibody'); // Start-Tab: Antikörper
const results = ref<any[]>([]);

const statusOptions = ['In Bearbeitung', 'Abgeschlossen', 'Storniert'];

// Filter State
const filters = reactive({
  generalSearch: '',
  // Unterobjekte für jeden Tab
  antibody: { akId: '', name: '', refNr: '', lotNr: '', status: null, manufacturer: '' },
  project: { number: '', status: null, workgroup: null, ta: null, doctor: null, date: null, finalCheck: false, longTerm: false },
  run: { akId: '', akName: '', runId: '', date: null },
  order: { workgroup: null, applicant: '', status: null },
});

// --- DYNAMISCHE HEADER ---
// Je nachdem, welcher Tab aktiv ist, zeigen wir andere Spalten an.
const currentHeaders = computed(() => {
  // Gemeinsame Spalte "Öffnen"
  const common = [{ title: 'Öffnen', key: 'actions', width: 60, sortable: false, align: 'center', fixed: true }];
  
  switch (activeTab.value) {
    case 'antibody':
      return [
        ...common,
        { title: 'AK-ID', key: 'akId', width: 100 },
        { title: 'Name', key: 'name', width: 150 },
        { title: 'Ref-Nr', key: 'refNumber', width: 120 },
        { title: 'Lot-Nr', key: 'lotNumber', width: 120 },
        { title: 'Hersteller', key: 'manufacturer', width: 150 },
        { title: 'Status', key: 'status', width: 100 },
      ];
    case 'project':
      return [
        ...common,
        { title: 'Nr.', key: 'projectNumber', width: 100 },
        { title: 'Status', key: 'status', width: 120 },
        { title: 'Aufgabe', key: 'taskDescription', width: 300 },
        { title: 'Abgabe', key: 'completionDate', width: 120 },
      ];
    case 'run':
      return [
        ...common,
        { title: 'Färbe-ID', key: 'runId', width: 120 },
        { title: 'Datum', key: 'date', width: 120 },
        { title: 'AK-Name', key: 'antibodyName', width: 150 },
        { title: 'AK-ID', key: 'antibodyId', width: 100 },
      ];
    case 'order':
      return [
        ...common,
        { title: 'AG', key: 'workgroup', width: 150 },
        { title: 'Antragsteller', key: 'applicant', width: 200 },
        { title: 'Datum', key: 'orderDate', width: 120 },
        { title: 'Status', key: 'status', width: 120 },
      ];
    default: return [];
  }
});

// Label für das Hauptsuchfeld
const searchLabel = computed(() => {
  switch (activeTab.value) {
    case 'antibody': return 'Suche Antikörper (Name, ID, Hersteller...)';
    case 'project': return 'Suche Projekte';
    case 'run': return 'Suche Färbeverläufe';
    case 'order': return 'Suche Bestellungen';
    default: return 'Suche';
  }
});

// --- API AUFRUFE ---

async function performSearch() {
  loading.value = true;
  results.value = []; // Liste leeren
  
  try {
    const general = filters.generalSearch;

    // Je nach Tab rufen wir eine ANDERE Funktion in der API auf
    // (Diese Funktionen haben wir im Schritt zuvor in api.ts erstellt)
    if (activeTab.value === 'antibody') {
      results.value = await api.searchAntibodies({ general, ...filters.antibody });
    } 
    else if (activeTab.value === 'project') {
      results.value = await api.searchAntibodyProjects({ generalSearch: general, ...filters.project });
    }
    else if (activeTab.value === 'run') {
      results.value = await api.searchStainingRuns({ general, ...filters.run });
    }
    else if (activeTab.value === 'order') {
      results.value = await api.searchOrders({ general, ...filters.order });
    }
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.generalSearch = '';
  // Reset Logik für Unterobjekte (vereinfacht)
  // Man könnte hier rekursiv alle Felder leeren
  performSearch();
}

// --- AKTIONEN ---

function handleOpen(item: any) {
  if (activeTab.value === 'run') {
    // Der Router sucht nach "StainingRunEditor". 
    // Dieser Name MUSS in router/index.ts exakt so definiert sein.
    router.push({ 
      name: 'StainingRunEditor', 
      params: { id: item.id } 
    });
  } 
}
// --- INIT ---

// Wenn man den Tab wechselt, leeren wir die Suche oder suchen automatisch neu
watch(activeTab, () => {
  filters.generalSearch = '';
  results.value = [];
  performSearch();
});

onMounted(() => {
  // Layout Context setzen
  navStore.setContext(
    'mdi-molecule', // Icon
    [
      { title: 'Navigation', to: '/' },
      { title: 'Antikörper', disabled: true }
    ],
    true // Neu Button anzeigen
  );
  
  // "Neu" Button Logik
  navStore.setNewAction(() => {
    // Hier müsste ein Dialog kommen: "Was wollen Sie anlegen? Neuer AK? Neue Bestellung?"
    alert("Neues Element anlegen (noch nicht implementiert)");
  });

  // Start-Suche
  performSearch();
});
</script>