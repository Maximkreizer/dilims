<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column">
    
    <!-- OBERER BEREICH: Suche (Fixiert) -->
    <div class="flex-grow-0 mb-4">
      <v-card border>
        <v-card-text>
          
          <!-- Haupt-Suchleiste -->
          <div class="d-flex align-center ga-2 mb-2">
            <DidataTextField
              v-model="filters.generalSearch"
              label="Allgemeine Suche"
              clearable
              prepend-inner-icon="mdi-magnify"
              variant="outlined" 
              density="compact" 
              hide-details 
              class="flex-grow-1"
              @keydown.enter="performSearch"
              @click:clear="performSearch"
            ></DidataTextField>
            <v-btn color="primary" height="40" prepend-icon="mdi-magnify" @click="performSearch" :loading="loading">Search</v-btn>
          </div>

          <!-- Ausklappbare Filter -->
          <v-expansion-panels v-model="panel" variant="accordion" class="mt-2">
            <v-expansion-panel elevation="0" style="border: 1px solid #e0e0e0; border-radius: 4px;">
              <v-expansion-panel-title>
                <v-icon start class="text-medium-emphasis">mdi-filter-variant</v-icon> Search Options
              </v-expansion-panel-title>
              <v-expansion-panel-text class="pt-4">
                 <v-row dense>
                    <v-col cols="12" md="3"><DidataSelect v-model="filters.projectType" label="Projekttyp" :items="options.projectTypes" item-title="title" item-value="value" density="compact" variant="outlined"></DidataSelect></v-col>
                    <v-col cols="12" md="3"><DidataSelect v-model="filters.status" label="Status" :items="options.statuses" item-title="title" item-value="value" density="compact" variant="outlined"></DidataSelect></v-col>
                    <v-col cols="12" md="3"><DidataSelect v-model="filters.technicalAssistantId" label="TA" :items="options.technicalAssistants" item-title="LANGTEXT" item-value="ORIGREC" density="compact" variant="outlined"></DidataSelect></v-col>
                    
                    <!-- KORREKTUR: Variable muss cooperationPartnerId heißen, damit API sie findet -->
                    <v-col cols="12" md="3"><DidataSelect v-model="filters.cooperationPartnerId" label="Arzt" :items="options.cooperationPartners" item-title="Vorname_Name" item-value="ID" density="compact" variant="outlined"></DidataSelect></v-col>
                    
                    <v-col cols="12" md="4"><DidataTextField v-model="filters.projectNumber" label="Projekt-Nr." density="compact" variant="outlined"></DidataTextField></v-col>
                    <v-col cols="12" md="4"><DidataSelect v-model="filters.workgroupId" label="Arbeitsgruppe" :items="options.workgroups" item-title="LOOKUP_VALUE" item-value="ID" density="compact" variant="outlined"></DidataSelect></v-col>
                    <v-col cols="12" md="4"><DidataTextField v-model="filters.date" type="date" label="Datum" density="compact" variant="outlined"></DidataTextField></v-col>
                    
                    <v-col cols="12">
                      <div class="d-flex flex-wrap ga-6">
                        <v-checkbox v-model="filters.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
                        <v-checkbox v-model="filters.isLongTermProject" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
                      </div>
                    </v-col>

                    <v-col cols="12" class="d-flex justify-end ga-2 mt-2">
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

    <!-- ============================================= -->
    <!-- UNTERER BEREICH: TABELLE (Wiederverwendbar)   -->
    <!-- ============================================= -->
    
    <div class="flex-grow-1" style="min-height: 0;">
      <!-- 
         :readonly="true" -> Tabelle ist schreibgeschützt (kein Editieren)
         Events (@open, @delete, etc.) sind verdrahtet
      -->
      <ResizableProjectTable 
        :projects="projects"
        :loading="loading"
        :options="options"
        :readonly="true"
        @open="handleProjectSelect"
        @open-in-tab="handleOpenInNewTab"
        @delete="handleDeleteProject"
      />
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from "@/state";
import { useNavigationStore } from '@/stores/navigationStore';
import { api, type ProjectFilters } from '@/services/api';
import type { Project, TechnicalAssistant, CooperationPartner, Workgroup } from '@/mocks/db';

// Importieren Sie die Komponente
import ResizableProjectTable from '@/components/lab/shared/ResizableProjectTable.vue';



const loading = ref(false);
const projects = ref<Project[]>([]);
const panel = ref<number[]>([0]);

interface SearchOptions {
  technicalAssistants: TechnicalAssistant[];
  cooperationPartners: CooperationPartner[];
  workgroups: Workgroup[];
  projectTypes: { value: string; title: string }[];
  statuses: { value: string; title: string }[];
}

// Filter & Options
const filters = reactive<ProjectFilters>({ generalSearch: '', status: undefined });
const options = reactive<SearchOptions>({ 
  projectTypes: [], 
  statuses: [], 
  technicalAssistants: [], 
  cooperationPartners: [], 
  workgroups: [] 
});

// --- ACTIONS ---

function handleProjectSelect(project: Project) {
  push({ name: 'ServiceProjectEdit', params: { projectId: project.ORIGREC } });
}

function handleOpenInNewTab(project: Project) {
  state.nav.addTab(`/services/project/${project.ORIGREC}`);
}

async function handleDeleteProject(project: Project) {
  loading.value = true;
  try {
    await api.deleteProject(project.ORIGREC);
    // Nach Löschen Liste aktualisieren
    await performSearch(); 
  } finally {
    loading.value = false;
  }
}

// --- SUCHE ---

async function performSearch() {
  loading.value = true;
  try {
    projects.value = await api.findProjects(filters);
  } finally {
    loading.value = false;
  }
}

function resetFilters() { 
  Object.keys(filters).forEach(k => { 
    const key = k as keyof ProjectFilters;
    (filters as any)[key] = (typeof filters[key] === 'boolean') ? false : undefined; 
  });
  filters.generalSearch = '';
  performSearch(); 
}

// --- INIT ---

onMounted(async () => {
  // 1. Overlay sofort setzen (Layout stabilisieren)
  state.nav.setContext('mdi-beaker-check-outline', [{ title: 'Navigation', to: '/' }, { title: 'Projekterfassung', disabled: true }], true);
  state.nav.setNewAction(() => push({ name: 'ServiceProjectEdit', params: { projectId: 'new' } }));
  
  // 2. Dann Daten laden
  loading.value = true; // Loading Spinner an
  try {
    const opts = await api.getSearchOptions();
    Object.assign(options, opts);
    // WICHTIG: Kein automatisches Search bei Initialisierung, 
    // wenn die Daten anonymisiert/leer sind oder die Filter noch nicht gesetzt wurden.
    // Aber für den ersten Testlauf laden wir die Liste.
    await performSearch();
  } catch (error) {
    console.error('Fehler beim Initialisieren der Suche:', error);
  } finally {
    loading.value = false;
  }
});
</script>