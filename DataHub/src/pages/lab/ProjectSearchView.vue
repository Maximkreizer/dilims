<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column">
    
    <!-- OBERER BEREICH: Suche (Fixiert) -->
    <div class="flex-grow-0 mb-4">
      <v-card border>
        <v-card-text>
          
          <!-- Haupt-Suchleiste -->
          <div class="d-flex align-center ga-2 mb-2">
            <v-text-field
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
            ></v-text-field>
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
                    <v-col cols="12" md="3"><v-select v-model="filters.projectType" label="Projekttyp" :items="options.projectTypes" item-title="title" item-value="value" density="compact" variant="outlined"></v-select></v-col>
                    <v-col cols="12" md="3"><v-select v-model="filters.status" label="Status" :items="options.statuses" item-title="title" item-value="value" density="compact" variant="outlined"></v-select></v-col>
                    <v-col cols="12" md="3"><v-select v-model="filters.technicalAssistantId" label="TA" :items="options.technicalAssistants" item-title="fullName" item-value="id" density="compact" variant="outlined"></v-select></v-col>
                    
                    <!-- KORREKTUR: Variable muss cooperationPartnerId heißen, damit API sie findet -->
                    <v-col cols="12" md="3"><v-select v-model="filters.cooperationPartnerId" label="Arzt" :items="options.cooperationPartners" item-title="fullName" item-value="id" density="compact" variant="outlined"></v-select></v-col>
                    
                    <v-col cols="12" md="4"><v-text-field v-model="filters.projectNumber" label="Projekt-Nr." density="compact" variant="outlined"></v-text-field></v-col>
                    <v-col cols="12" md="4"><v-select v-model="filters.workgroupId" label="Arbeitsgruppe" :items="options.workgroups" item-title="name" item-value="id" density="compact" variant="outlined"></v-select></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model="filters.date" type="date" label="Datum" density="compact" variant="outlined"></v-text-field></v-col>
                    
                    <v-col cols="12">
                      <div class="d-flex flex-wrap ga-6">
                        <v-checkbox v-model="filters.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
                        <v-checkbox v-model="filters.isLongTermProject" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
                        <v-checkbox v-model="filters.isSfb118Project" label="SFB1118" density="compact" hide-details></v-checkbox>
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
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { Project } from '@/mocks/db';

// Importieren Sie die Komponente
import ResizableProjectTable from '@/components/lab/shared/ResizableProjectTable.vue';

const router = useRouter();
const navStore = useNavigationStore();

const loading = ref(false);
const projects = ref<Project[]>([]);
const panel = ref<number[]>([0]);

// Filter & Options
const filters = reactive<any>({ generalSearch: '', status: null });
const options = reactive<any>({ projectTypes: [], statuses: [], technicalAssistants: [], cooperationPartners: [], workgroups: [] });

// --- ACTIONS ---

function handleProjectSelect(project: Project) {
  router.push({ name: 'ServiceProjectEdit', params: { projectId: project.id } });
}

function handleOpenInNewTab(project: Project) {
  navStore.addTab(`/services/project/${project.id}`);
}

async function handleDeleteProject(project: Project) {
  loading.value = true;
  try {
    await api.deleteProject(project.id);
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
  Object.keys(filters).forEach(k => { (filters as any)[k] = (typeof (filters as any)[k] === 'boolean') ? false : null; });
  filters.generalSearch = '';
  performSearch(); 
}

// --- INIT ---

onMounted(async () => {
  // 1. Overlay sofort setzen (Layout stabilisieren)
  navStore.setContext('mdi-beaker-check-outline', [{ title: 'Navigation', to: '/' }, { title: 'Projekterfassung', disabled: true }], true);
  navStore.setNewAction(() => router.push({ name: 'ServiceProjectEdit', params: { projectId: 'new' } }));
  
  // 2. Dann Daten laden
  loading.value = true; // Loading Spinner an
  try {
    const opts = await api.getSearchOptions();
    Object.assign(options, opts);
    await performSearch();
  } finally {
    loading.value = false;
  }
});
</script>