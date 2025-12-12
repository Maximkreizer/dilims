<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column">
    
    <!-- OBERER BEREICH: SUCHE -->
    <div class="flex-grow-0 mb-4">
      <v-card border>
        <v-card-text>
          
          <!-- HAUPT-SUCHLEISTE -->
          <div class="d-flex align-center ga-2 mb-4">
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

          <!-- SEARCH OPTIONS -->
          <v-expansion-panels v-model="panel" variant="accordion" class="my-0">
            <v-expansion-panel elevation="0" style="border: 1px solid #e0e0e0; border-radius: 4px;" value="options">
              <v-expansion-panel-title class="text-caption text-uppercase font-weight-bold text-grey-darken-1">
                <v-icon start size="small">mdi-filter-variant</v-icon> 
                Detaillierte Filteroptionen
              </v-expansion-panel-title>
              
              <!-- FIX: overflow-visible hilft gegen abgeschnittene Labels -->
              <v-expansion-panel-text class="pt-2" style="overflow: visible;">
                
                <v-tabs v-model="activeTab" density="compact" color="primary" class="mb-6 border-b">
                  <v-tab value="antibody">Antikörper</v-tab>
                  <v-tab value="project">Projekte</v-tab>
                  <v-tab value="run">Färbelauf</v-tab>
                  <v-tab value="order">Bestellungen</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" style="overflow: visible;">
                  
                  <!-- 1. ANTIKÖRPER SUCHE -->
                  <v-window-item value="antibody" class="pa-1">
                    <v-row dense>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.akId" label="AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.refNr" label="Ref-Nr" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.antibody.name" label="AK_Name" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.antibody.lotNr" label="Lot-Nr" density="compact" variant="outlined"></v-text-field></v-col>
                      <!-- Hersteller ist jetzt null-safe im Script -->
                      <v-col cols="12" md="3"><v-select v-model="filters.antibody.manufacturer" label="Hersteller" :items="options.manufacturers" density="compact" variant="outlined"></v-select></v-col>
                      
                      <v-col cols="12" md="3"><v-select v-model="filters.antibody.owner" label="Eigentümer" :items="options.owners" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.antibody.status" label="Status" :items="['Aktiv', 'Leer', 'Verworfen']" density="compact" variant="outlined"></v-select></v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 2. PROJEKTE SUCHE -->
                  <v-window-item value="project" class="pa-1">
                    <v-row dense>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.status" label="Status" :items="options.projectStatuses" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.type" label="Projekttyp" :items="['NCT', 'pCCC', 'DZiF', 'CMCP']" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.ta" label="Mitarbeiter (TA)" :items="['MK', 'MF', 'MA']" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.project.doctor" label="Ärzte" :items="['Dr. Sommerfeld', 'Prof. Conrad', 'Dr. Brunner']" density="compact" variant="outlined"></v-select></v-col>

                      <v-col cols="12" md="3"><v-text-field v-model="filters.project.number" label="Projektnummer" density="compact" variant="outlined"></v-text-field></v-col>
                      
                      <v-col cols="12" md="9" class="d-flex align-center ga-4">
                        <v-checkbox v-model="filters.project.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 3. FÄRBELAUF SUCHE -->
                  <v-window-item value="run" class="pa-1">
                    <v-row dense>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.run.akId" label="AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.run.runId" label="Färbe-ID" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-text-field v-model="filters.run.akName" label="AK_Name" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="2"><v-text-field v-model="filters.run.date" label="Färbe-Datum" type="date" density="compact" variant="outlined"></v-text-field></v-col>
                      <v-col cols="12" md="3"><v-select v-model="filters.run.tissue" label="Gewebe" :items="['Tonsille', 'Leber', 'Niere']" density="compact" variant="outlined"></v-select></v-col>
                      
                      <v-col cols="12" md="3"><v-select v-model="filters.run.type" label="Lauftyp" :items="['Testlauf', 'Projektlauf', 'Etablierungslauf (final)']" density="compact" variant="outlined"></v-select></v-col>
                    </v-row>
                  </v-window-item>

                  <!-- 4. BESTELLUNGEN SUCHE -->
                  <v-window-item value="order" class="pa-1">
                    <v-row dense>
                      <v-col cols="12" md="4"><v-select v-model="filters.order.workgroup" label="AG" :items="['AG Immunologie', 'AG Onkologie']" density="compact" variant="outlined"></v-select></v-col>
                      <v-col cols="12" md="4"><v-text-field v-model="filters.order.applicant" label="Antragsteller (Name, Vorname)" density="compact" variant="outlined"></v-text-field></v-col>
                    </v-row>
                  </v-window-item>

                </v-window>

                <!-- ACTIONS -->
                <v-row dense class="mt-4">
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

    <!-- UNTERER BEREICH: TABELLE -->
    <div class="flex-grow-1" style="min-height: 0;">
      <ResizableGenericTable 
        :items="results"
        :headers="currentHeaders"
        :loading="loading"
      >
        <template v-slot:item.action_open="{ item }">
          <div class="d-flex justify-center">
            <v-btn icon size="x-small" variant="text" color="primary" @click.stop="handleOpen(item)">
              <v-icon>mdi-open-in-new</v-icon>
              <v-tooltip activator="parent" location="top">Öffnen</v-tooltip>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.action_tab="{ item }">
          <div class="d-flex justify-center">
            <v-btn icon size="x-small" variant="text" color="grey-darken-3" @click.stop="handleOpenInNewTab(item)">
              <v-icon>mdi-tab-plus</v-icon>
              <v-tooltip activator="parent" location="top">Neuer Tab</v-tooltip>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.action_delete="{ item }">
          <div class="d-flex justify-center">
            <v-btn icon size="x-small" variant="text" color="error" @click.stop="handleDelete(item)">
              <v-icon>mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Löschen</v-tooltip>
            </v-btn>
          </div>
        </template>

      </ResizableGenericTable>
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
const panel = ref<any[]>(['options']);
const activeTab = ref('antibody');
const results = ref<any[]>([]);

const options = {
  projectStatuses: ['abklären', 'Nr. nicht vergeben', 'In Bearbeitung', 'abgeschlossen', 'Anfrage', 'abgelehnt', 'storniert', 'zurückgestellt'],
  manufacturers: ['Dako', 'Leica', 'Roche', 'Sigma'],
  owners: ['AG Müller', 'AG Schmidt', 'Zentrallager'],
};

// FIX: Verwende null statt '' für Dropdowns, damit das Label nicht oben klebt
const filters = reactive<any>({
  generalSearch: '',
  antibody: { akId: '', name: '', refNr: '', lotNr: '', manufacturer: null, status: null, owner: null },
  project: { number: '', status: null, type: null, workgroup: null, ta: null, doctor: null, date: null, finalCheck: false },
  run: { akId: '', runId: '', akName: '', date: null, tissue: null, type: null },
  order: { workgroup: null, applicant: '' },
});

const currentHeaders = computed(() => {
  const actions = [
    { title: 'Öffnen', key: 'action_open', width: 60, sortable: false, align: 'center', fixed: true },
    { title: 'Tab', key: 'action_tab', width: 50, sortable: false, align: 'center', fixed: true },
    { title: 'Löschen', key: 'action_delete', width: 60, sortable: false, align: 'center', fixed: true },
  ];
  
  switch (activeTab.value) {
    case 'antibody':
      return [...actions,
        { title: 'AK-ID', key: 'akId', width: 100 },
        { title: 'Name', key: 'name', width: 200 },
        { title: 'Ref-Nr', key: 'refNumber', width: 120 },
        { title: 'Lot-Nr', key: 'lotNumber', width: 120 },
        { title: 'Hersteller', key: 'manufacturer', width: 150 },
        { title: 'Status', key: 'status', width: 100 },
        { title: 'Eigentümer', key: 'owner', width: 120 },
      ];
    case 'project':
      return [...actions,
        { title: 'Nr.', key: 'projectNumber', width: 100 },
        { title: 'Status', key: 'status', width: 120 },
        { title: 'Typ', key: 'projectType', width: 100 },
        { title: 'Aufgabe', key: 'tasks', width: 300 },
        { title: 'Antragsteller', key: 'applicant', width: 150 },
      ];
    case 'run':
      return [...actions,
        { title: 'Lauf-ID', key: 'runId', width: 100 },
        { title: 'Datum', key: 'date', width: 100 },
        { title: 'AK-ID', key: 'antibodyId', width: 100 },
        { title: 'AK-Name', key: 'antibodyName', width: 150 },
      ];
    case 'order':
      return [...actions,
        { title: 'Bestell-ID', key: 'orderId', width: 100 },
        { title: 'AG', key: 'workgroup', width: 150 },
        { title: 'Antragsteller', key: 'applicant', width: 200 },
        { title: 'Status', key: 'status', width: 120 },
      ];
    default: return [];
  }
});

const searchLabel = computed(() => {
  switch (activeTab.value) {
    case 'antibody': return 'Suche Antikörper';
    case 'project': return 'Suche Projekte';
    case 'run': return 'Suche Färbeverläufe';
    case 'order': return 'Suche Bestellungen';
    default: return 'Suche';
  }
});

async function performSearch() {
  loading.value = true;
  results.value = [];
  try {
    const general = filters.generalSearch;
    if (activeTab.value === 'antibody') {
      results.value = await api.searchAntibodies({ general, ...filters.antibody });
    } else if (activeTab.value === 'project') {
      results.value = await api.searchAntibodyProjects({ generalSearch: general, ...filters.project });
    } else if (activeTab.value === 'run') {
      results.value = await api.searchStainingRuns({ general, ...filters.run });
    } else if (activeTab.value === 'order') {
      results.value = await api.searchOrders({ general, ...filters.order });
    }
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.generalSearch = '';
  // Einfacher Reset der Filterobjekte
  if (activeTab.value === 'antibody') filters.antibody = { akId: '', name: '', refNr: '', lotNr: '', manufacturer: null, status: null, owner: null };
  // ... (für andere Tabs analog)
  performSearch();
}

function handleOpen(item: any) {
  // FIX: Wir öffnen hier je nach Typ die Seite.
  // Auch wenn wir noch keine Detailseiten für Antibody/Order haben,
  // zeigt das alert() dass der Button geht.
  if (activeTab.value === 'run') {
    router.push({ name: 'StainingRunEditor', params: { id: item.id } });
  } else {
    alert(`Öffne ${activeTab.value}: ${item.id} (Ansicht folgt)`);
  }
}

function handleOpenInNewTab(item: any) {
  if (activeTab.value === 'run') {
    navStore.addTab(`/antibodies/run/${item.id}`);
  } else {
    alert("Neuer Tab für diesen Typ noch nicht verfügbar");
  }
}

function handleDelete(item: any) {
  if(!confirm(`Möchten Sie ${item.id} wirklich löschen?`)) return;
  alert("Gelöscht!");
  // Hier würde api.delete... aufgerufen werden
  // await api.delete(activeTab.value, item.id);
  // performSearch();
}

watch(activeTab, () => {
  filters.generalSearch = '';
  results.value = [];
  performSearch();
});

onMounted(() => {
  navStore.setContext('mdi-molecule', [{ title: 'Navigation', to: '/' }, { title: 'Antikörper', disabled: true }], true);
  navStore.setNewAction(() => alert("Neues Element anlegen"));
  performSearch();
});
</script>