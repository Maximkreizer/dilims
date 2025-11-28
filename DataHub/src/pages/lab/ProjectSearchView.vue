<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column">
    
    <!-- OBERER BEREICH: Suche (Unverändert) -->
    <div class="flex-grow-0 mb-4">
      <v-card border>
        <v-card-text>
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
                    <v-col cols="12" md="3"><v-select v-model="filters.cooperationArztId" label="Arzt" :items="options.cooperationPartners" item-title="fullName" item-value="id" density="compact" variant="outlined"></v-select></v-col>
                    
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
    <!-- UNTERER BEREICH: Custom Resizable Table       -->
    <!-- ============================================= -->
    
    <v-card border class="d-flex flex-column" :style="{ height: tableContainerHeight + 'px' }">
      
      <v-card-title class="d-flex align-center bg-grey-lighten-5 py-2 flex-grow-0 user-select-none">
        <span class="text-subtitle-1 font-weight-bold">Ergebnisse</span>
        <v-chip size="small" color="primary" class="ml-4" variant="flat">{{ projects.length }}</v-chip>
      </v-card-title>
      <v-divider></v-divider>
      
      <v-data-table
        :headers="tableHeaders"
        :items="projects"
        :loading="loading"
        density="compact"
        fixed-header
        hover
        height="100%"
        class="project-table flex-grow-1"
      >
        <!-- CUSTOM HEADER (Für Spalten-Resizing) -->
        <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
          <tr>
            <template v-for="column in columns" :key="column.key">
              <th 
                :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
                class="custom-header position-relative"
                @click="() => toggleSort(column)"
                @open="handleProjectSelect"
                @open-in-tab="handleOpenInNewTab"
                @delete="handleDeleteProject"
              >
                <!-- Header Titel -->
                <span class="mr-2 cursor-pointer font-weight-bold">{{ column.title }}</span>
                <v-icon v-if="isSorted(column)" size="small">{{ getSortIcon(column) }}</v-icon>
                
                <!-- DER MAGIC RESIZER (Der unsichtbare Griff am rechten Rand) -->
                <div 
                  class="column-resizer"
                  @click.stop
                  @mousedown.stop.prevent="startColumnResize($event, column)"
                ></div>
              </th>
            </template>
          </tr>
        </template>


        <!-- INHALT SPALTEN -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="x-small" variant="text" color="primary" @click.stop="handleProjectSelect(item)"><v-icon>mdi-open-in-new</v-icon></v-btn>
        </template>

        <!-- Editierbares Feld: Projektnummer -->
        <template v-slot:item.projectNumber="{ item }">
          <div @click="startEdit(item, 'projectNumber')" class="editable-cell text-wrap">
             <v-text-field v-if="isEditing(item, 'projectNumber')" v-model="editingValue" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'projectNumber')" @blur="cancelEdit"></v-text-field>
             <span v-else>{{ item.projectNumber }}</span>
          </div>
        </template>

        <!-- Editierbares Feld: Aufgabe -->
        <template v-slot:item.taskDescription="{ item }">
          <div @click="startEdit(item, 'taskDescription')" class="editable-cell text-wrap">
             <v-text-field v-if="isEditing(item, 'taskDescription')" v-model="editingValue" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'taskDescription')" @blur="cancelEdit"></v-text-field>
             <span v-else>{{ item.taskDescription || '...' }}</span>
          </div>
        </template>

        <!-- Standard Spalten -->
        <template v-slot:item.status="{ item }">
          <v-chip size="x-small" :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</v-chip>
        </template>

        <template v-slot:item.technicalAssistantId="{ value }">{{ getName(value, options.technicalAssistants, 'fullName') }}</template>
        <template v-slot:item.cooperationPartnerId="{ value }">{{ getName(value, options.cooperationPartners, 'fullName') }}</template>
        <template v-slot:item.workgroupId="{ value }">{{ getName(value, options.workgroups, 'name') }}</template>
        
        <template v-slot:item.finalCheck="{ item }"><v-checkbox-btn v-model="item.finalCheck" density="compact" @change="quickSave(item)"></v-checkbox-btn></template>
        <template v-slot:item.isLongTermProject="{ item }"><v-checkbox-btn v-model="item.isLongTermProject" density="compact" @change="quickSave(item)"></v-checkbox-btn></template>

      </v-data-table>
      
      <!-- HÖHEN-RESIZER -->
      <div 
        class="height-resizer bg-grey-lighten-3 d-flex justify-center align-center"
        @mousedown.prevent="startHeightResize"
      >
        <div style="width: 40px; height: 4px; background-color: #bdbdbd; border-radius: 2px;"></div>
      </div>
    </v-card>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { Project } from '@/mocks/db';

const router = useRouter();
const navStore = useNavigationStore();

const loading = ref(false);
const projects = ref<Project[]>([]);
const panel = ref<number[]>([0]);

// Initiale Höhe der Tabelle
const tableContainerHeight = ref(400);

// Filter & Options
const filters = reactive<any>({ generalSearch: '', status: null });
const options = reactive<any>({ projectTypes: [], statuses: [], technicalAssistants: [], cooperationPartners: [], workgroups: [] });

// FIX: 'ref<any[]>' verwenden statt 'reactive', damit TypeScript bei den komplexen Vuetify-Typen nicht meckert.
const tableHeaders = ref<any[]>([
  { title: 'Öffnen', key: 'actions', width: 70, sortable: false },
  { title: 'Nr.', key: 'projectNumber', width: 100 },
  { title: 'Status', key: 'status', width: 130 },
  { title: 'Aufgabe', key: 'taskDescription', width: 350 },
  { title: 'TA', key: 'technicalAssistantId', width: 120 },
  { title: 'Partner', key: 'cooperationPartnerId', width: 140 },
  { title: 'AG', key: 'workgroupId', width: 100 },
  { title: 'Abschl.', key: 'finalCheck', width: 80, align: 'center' },
  { title: 'Langzeit', key: 'isLongTermProject', width: 80, align: 'center' },
]);

// --- RESIZING LOGIC ---

function startColumnResize(event: MouseEvent, column: any) {
  const startX = event.pageX;
  const startWidth = column.width || 100; 

  const onMouseMove = (moveEvent: MouseEvent) => {
    const diffX = moveEvent.pageX - startX;
    column.width = Math.max(50, startWidth + diffX);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = ''; 
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'col-resize'; 
}

function startHeightResize(event: MouseEvent) {
  const startY = event.pageY;
  const startHeight = tableContainerHeight.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const diffY = moveEvent.pageY - startY;
    tableContainerHeight.value = Math.max(150, startHeight + diffY);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'ns-resize';
}

// --- EDITING & LOGIK ---
const editingCell = ref<{ id: number, field: string } | null>(null);
const editingValue = ref<any>(null);

function isEditing(item: Project, field: string) { return editingCell.value?.id === item.id && editingCell.value?.field === field; }
function startEdit(item: Project, field: string) { if(editingCell.value) cancelEdit(); editingCell.value = { id: item.id, field }; editingValue.value = (item as any)[field]; }
function cancelEdit() { setTimeout(() => { editingCell.value = null; editingValue.value = null; }, 100); }
async function saveEdit(item: Project, field: string) { if (editingCell.value) { (item as any)[field] = editingValue.value; await api.saveProject(item); cancelEdit(); } }
async function quickSave(item: Project) { await api.saveProject(item); }

function handleOpenInNewTab(project: Project) {
  navStore.addTab(`/services/project/${project.id}`);
}

async function handleDeleteProject(project: Project) {
  loading.value = true;
  try {
    await api.deleteProject(project.id);
    // Liste aktualisieren
    await performSearch(); 
  } finally {
    loading.value = false;
  }
}

async function performSearch() {
  loading.value = true;
  try {
    // KORREKTUR: Wir geben 'filters' direkt weiter.
    // Die API kümmert sich jetzt darum, dass 'generalSearch' überall sucht.
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
function handleProjectSelect(item: Project) { router.push({ name: 'ServiceProjectEdit', params: { projectId: item.id } }); }
function getStatusColor(s: string) { return s === 'completed' ? 'success' : 'info'; }
function getStatusText(s: string) { return options.statuses.find((x:any)=>x.value===s)?.title || s; }
function getName(id: number, l: any[], f: string) { return l.find(i=>i.id===id)?.[f] || '-'; }

onMounted(async () => {
  navStore.setContext('mdi-beaker-check-outline', [{ title: 'Navigation', to: '/' }, { title: 'Projekterfassung', disabled: true }], true);
  navStore.setNewAction(() => router.push({ name: 'ServiceProjectEdit', params: { projectId: 'new' } }));
  const opts = await api.getSearchOptions();
  Object.assign(options, opts);
  performSearch();
});
</script>

<style scoped>
/* TABELLE LAYOUT */
.project-table {
  table-layout: fixed; 
}

/* HEADER STYLE */
.custom-header {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: #f5f5f5;
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
  height: 48px;
  vertical-align: middle;
}

/* SPALTEN RESIZER */
.column-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px; 
  height: 100%;
  cursor: col-resize;
  background-color: transparent; 
  z-index: 10;
  transition: background-color 0.2s;
}
.column-resizer:hover {
  background-color: rgba(0, 0, 0, 0.1); 
}

/* HÖHEN RESIZER */
.height-resizer {
  height: 12px;
  cursor: ns-resize;
  border-top: 1px solid #e0e0e0;
}
.height-resizer:hover {
  background-color: #e0e0e0 !important;
}

/* TEXT WRAPPING */
.text-wrap {
  white-space: normal !important; 
  word-break: break-word; 
  overflow-wrap: anywhere;
  line-height: 1.4;
  padding: 8px 0;
}

.project-table :deep(.v-table__wrapper) {
  overflow-x: auto; 
}

.editable-cell {
  cursor: text;
  min-height: 32px;
  display: flex;
  align-items: center;
}
.editable-cell:hover {
  background-color: #fafafa;
  outline: 1px dashed #bdbdbd;
}
</style>