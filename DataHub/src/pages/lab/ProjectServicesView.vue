<template>
  <v-container fluid class="pa-4 h-100 d-flex flex-column ga-4">
    
    <!-- LADEANZEIGE -->
    <div v-if="loading" class="d-flex justify-center align-center flex-grow-1">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="d-flex flex-column h-100">
      
      <!-- ============================================= -->
      <!-- OBERER BEREICH: SPLIT VIEW (Katalog | Form)   -->
      <!-- ============================================= -->
      
      <!-- 
         NEU: height: 500px fixiert die Höhe. 
         Damit springt der Rest der Seite nicht, wenn man links einklappt.
      -->
      <div class="flex-grow-0 mb-4 d-flex align-stretch" style="height: 500px; position: relative;">
        
        <!-- 1. LINKES PANEL: KATALOG -->
        <div 
          class="catalog-pane d-flex flex-column"
          :class="{ 'catalog-closed': !isCatalogOpen }"
        >
          <v-card border class="h-100 d-flex flex-column" style="overflow: hidden;">
            <v-card-title class="bg-grey-lighten-4 font-weight-bold text-primary py-3 flex-shrink-0">
              <v-icon start>mdi-plus-box-multiple</v-icon>
              Neue Dienstleistung
            </v-card-title>
            
            <!-- catalog-scroll-area sorgt für Scrollbalken INNERHALB der Karte -->
            <v-card-text class="pa-0 catalog-scroll-area flex-grow-1">
              
              <!-- GEWEBEVERARBEITUNG -->
              <div class="px-3 mb-2 mt-3 text-overline text-grey-darken-1 font-weight-bold">Gewebeverarbeitung</div>
              <v-row dense class="px-2">
                <v-col cols="12" md="4" v-for="item in paraffinItems" :key="item.type">
                  <v-card 
                    variant="tonal" :color="item.color" hover border
                    class="d-flex flex-column align-center justify-center py-4 cursor-pointer h-100"
                    @click="createNewService(item.type)"
                  >
                    <v-icon size="36" class="mb-2">{{ item.icon }}</v-icon>
                    <div class="text-caption font-weight-bold text-center lh-1">{{ item.label }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-4 mx-3 border-dashed"></v-divider>

              <v-row dense class="px-2">
                <v-col cols="12" md="4" v-for="item in cryoItems" :key="item.type">
                  <v-card 
                    variant="tonal" :color="item.color" hover border
                    class="d-flex flex-column align-center justify-center py-4 cursor-pointer h-100"
                    @click="createNewService(item.type)"
                  >
                    <v-icon size="36" class="mb-2">{{ item.icon }}</v-icon>
                    <div class="text-caption font-weight-bold text-center lh-1">{{ item.label }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- ANDERE KATEGORIEN -->
              <template v-for="cat in otherCategories" :key="cat.title">
                <div class="px-3 mb-2 mt-4 text-overline text-grey-darken-1 font-weight-bold">{{ cat.title }}</div>
                <v-row dense class="px-2 mb-1">
                  <v-col cols="12" md="4" v-for="item in cat.items" :key="item.type">
                    <v-card 
                      variant="tonal" :color="item.color" hover border
                      class="d-flex flex-column align-center justify-center py-3 cursor-pointer h-100"
                      @click="createNewService(item.type)"
                    >
                      <v-icon size="28" class="mb-1">{{ item.icon }}</v-icon>
                      <div class="text-caption font-weight-bold text-center text-truncate w-100 px-1">{{ item.label }}</div>
                    </v-card>
                  </v-col>
                </v-row>
              </template>

              <div class="mb-4"></div>
            </v-card-text>
          </v-card>
        </div>

        <!-- 2. MITTE: DER TOGGLE-STREIFEN -->
        <div class="toggle-strip d-flex align-center justify-center flex-shrink-0" @click="toggleCatalog">
          <div class="strip-line"></div>
          <v-btn icon size="x-small" variant="flat" color="grey-lighten-2" class="toggle-btn" elevation="2">
            <v-icon size="small" color="grey-darken-3">
              {{ isCatalogOpen ? 'mdi-chevron-left' : 'mdi-chevron-right' }}
            </v-icon>
          </v-btn>
        </div>

        <!-- 3. RECHTES PANEL: EDITOR -->
        <div class="editor-pane flex-grow-1 h-100" style="min-width: 0; overflow: hidden;">
          <v-fade-transition mode="out-in">
            
            <div v-if="isEditorOpen" class="h-100 d-flex flex-column">
              <!-- Alert Wrapper entfernt für mehr Platz, direkt die Form -->
              <div class="h-100 border rounded bg-white" style="overflow: hidden;">
                <ServiceForm
                  v-if="currentService"
                  :service="currentService"
                  :project-number="project?.projectNumber || '-'"
                  :is-follow-up="project?.isFollowUpProject || false"
                  @save="handleSave"
                  @cancel="closeEditor"
                />
              </div>
            </div>
            
            <!-- Fallback (sollte eigentlich durch Auto-Load nicht sichtbar sein) -->
            <div v-else class="d-flex justify-center align-center h-100 bg-grey-lighten-5 rounded border border-dashed">
              <div class="text-center text-grey-darken-1">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="text-caption mt-2">Lade Dienstleistung...</div>
              </div>
            </div>

          </v-fade-transition>
        </div>

      </div>

      <!-- ============================================= -->
      <!-- UNTERER BEREICH: TABELLE                      -->
      <!-- ============================================= -->
      <div class="flex-grow-1" style="min-height: 0;">
         <ResizableServiceTable 
            :services="services"
            :loading="loading"
            @update="handleTableUpdate"
            @delete="handleDelete"
            @open="openServiceForEdit" 
            @open-in-tab="handleOpenInNewTab"
         />
      </div>

    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { Project, ProjectService } from '@/mocks/db';
import ResizableServiceTable from '@/components/lab/shared/ResizableServiceTable.vue';
import ServiceForm from '@/components/lab/services/ServiceForm.vue';

const props = defineProps<{ projectId: string | number }>();
const router = useRouter();
const navStore = useNavigationStore();

const loading = ref(true);
const project = ref<Project | null>(null);
const services = ref<ProjectService[]>([]);

// UI State
const isCatalogOpen = ref(true);
const currentService = ref<ProjectService | null>(null);
const isEditorOpen = computed(() => currentService.value !== null);

function toggleCatalog() {
  isCatalogOpen.value = !isCatalogOpen.value;
}

// --- KATALOG DATEN ---
const paraffinItems = [
  { label: 'Paraffin-Schnitte', type: 'paraffin_sections', icon: 'mdi-layers-outline', color: 'orange-darken-2' },
  { label: 'Paraffin-Tubes', type: 'paraffin_tubes', icon: 'mdi-test-tube', color: 'orange-darken-2' },
  { label: 'Paraffin-Einbettung', type: 'paraffin_embedding', icon: 'mdi-archive-outline', color: 'orange-darken-2' },
];
const cryoItems = [
  { label: 'Kryo-Schnitte', type: 'cryo_sections', icon: 'mdi-snowflake', color: 'light-blue-darken-2' },
  { label: 'Kryo-Tubes', type: 'cryo_tubes', icon: 'mdi-snowflake-melt', color: 'light-blue-darken-2' },
  { label: 'Kryoservice', type: 'cryo_service', icon: 'mdi-snowflake-alert', color: 'light-blue-darken-2' },
];
const otherCategories = [
  {
    title: 'Spezialanalyse',
    items: [
      { label: 'IHC', type: 'ihc', icon: 'mdi-eyedropper-variant', color: 'purple-darken-1' },
      { label: 'Färbung', type: 'staining', icon: 'mdi-brush', color: 'purple-darken-1' },
      { label: 'DNA/RNA', type: 'dna_rna_extraction', icon: 'mdi-dna', color: 'green-darken-2' },
      { label: 'Patho. Beurt.', type: 'pathological_assessment', icon: 'mdi-clipboard-pulse', color: 'red-darken-2' },
    ]
  },
  {
    title: 'Tissue Microarray',
    items: [ 
      { label: 'TMA-Erstellung', type: 'tma_creation', icon: 'mdi-dots-grid', color: 'indigo-darken-1' }, 
      { label: 'TMA-Schnitte', type: 'tma_sections', icon: 'mdi-grid', color: 'indigo-darken-1' } 
    ]
  },
  {
    title: 'Digitale Pathologie',
    items: [ 
      { label: 'Virt. Mikro.', type: 'virtual_microscopy', icon: 'mdi-monitor-eye', color: 'teal-darken-2' }, 
      { label: 'Archivarbeit', type: 'archival_work', icon: 'mdi-archive-search', color: 'brown' } 
    ]
  },
  {
    title: 'Admin',
    items: [ 
      { label: 'Daten', type: 'data', icon: 'mdi-database', color: 'blue-grey' }, 
      { label: 'Ethik', type: 'ethics', icon: 'mdi-gavel', color: 'blue-grey' } 
    ]
  }
];

// --- ACTIONS ---

async function createNewService(type: string) {
  // Erstellt ein neues Dummy-Objekt für den Editor (ID 0 = noch nicht gespeichert)
  currentService.value = {
    id: 0, 
    serviceType: type,
    remarks: '',
    deliveryDate: null
  } as any;
}

function openServiceForEdit(service: ProjectService) {
  currentService.value = JSON.parse(JSON.stringify(service));
}

function closeEditor() {
  // Wenn wir schließen, laden wir die Default-Logik erneut, 
  // oder wir lassen es einfach leer. Hier: Erneut Default laden.
  if (services.value.length > 0) openServiceForEdit(services.value[0]);
  else createNewService('paraffin_sections');
}

function handleOpenInNewTab(service: ProjectService) {
  // Da ein Service keine eigene "Page" hat, öffnen wir das Projekt-Dienstleistungs-Fenster
  // im neuen Tab. Das ist hilfreich, um z.B. 2 Projekte nebeneinander zu vergleichen.
  navStore.addTab(`/services/project/${props.projectId}/services`);
}

async function handleSave(serviceToSave: ProjectService) {
  if (!project.value) return;

  const list = [...project.value.services];
  if (serviceToSave.id === 0) {
    serviceToSave.id = Math.floor(Math.random() * 1000000);
    list.push(serviceToSave);
  } else {
    const idx = list.findIndex(s => s.id === serviceToSave.id);
    if (idx !== -1) list[idx] = serviceToSave;
  }

  project.value.services = list;
  await api.saveProject(project.value);
  services.value = list;
  
  // Nach Speichern nicht schließen, sondern den gespeicherten Eintrag aktiv lassen
  openServiceForEdit(serviceToSave);
}

async function handleTableUpdate(service: ProjectService) {
  if (!project.value) return;
  const idx = services.value.findIndex(s => s.id === service.id);
  if (idx !== -1) services.value[idx] = service;
  project.value.services = services.value;
  await api.saveProject(project.value);
  
  // Wenn das geänderte Item gerade offen ist, aktualisieren
  if (currentService.value && currentService.value.id === service.id) {
    currentService.value = JSON.parse(JSON.stringify(service));
  }
}

async function handleDelete(service: ProjectService) {
  if (!confirm('Löschen?')) return;
  if (!project.value) return;
  services.value = services.value.filter(s => s.id !== service.id);
  project.value.services = services.value;
  await api.saveProject(project.value);
  
  // Wenn gelöschtes Item offen war, Default laden
  if (currentService.value && currentService.value.id === service.id) {
    if (services.value.length > 0) openServiceForEdit(services.value[0]);
    else createNewService('paraffin_sections');
  }
}

// --- LOAD LOGIC ---
async function loadData() {
  loading.value = true;
  try {
    const all = await api.findProjects({});
    const found = all.find(p => p.id === Number(props.projectId));
    if (found) {
      project.value = found;
      services.value = found.services || [];
      updateNav();

      // --- NEU: DEFAULT SELECTION LOGIC ---
      if (services.value.length > 0) {
        // 1. Wenn Services da sind -> Lade den Ersten
        openServiceForEdit(services.value[0]);
      } else {
        // 2. Wenn keine da sind -> Lade leeres Paraffin-Formular
        await createNewService('paraffin_sections');
      }

    }
  } finally {
    loading.value = false;
  }
}

function updateNav() {
  navStore.setContext('mdi-beaker-check-outline', [
    { title: 'Projekterfassung', to: {name:'ServiceSearch'} },
    { title: `Projekt ${project.value?.projectNumber}`, to: {name:'ServiceProjectEdit', params:{projectId: props.projectId}} },
    { title: 'Dienstleistungen', disabled: true }
  ]);
}

onMounted(loadData);
</script>

<style scoped>
/* Transition für das Katalog-Panel */
.catalog-pane {
  width: 40%; /* Breite wenn offen */
  min-width: 350px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  opacity: 1;
}

/* Zustand: Eingeklappt */
.catalog-closed {
  width: 0 !important;
  min-width: 0 !important;
  opacity: 0;
  padding: 0;
  margin: 0;
}

/* Der Streifen in der Mitte */
.toggle-strip {
  width: 20px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: background-color 0.2s;
}
.toggle-strip:hover {
  background-color: rgba(0,0,0,0.03);
}
.toggle-strip:hover .strip-line {
  background-color: var(--v-theme-primary);
}

.strip-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: #e0e0e0;
  transition: background-color 0.2s;
}

.toggle-btn {
  z-index: 3;
  border: 1px solid #e0e0e0;
}

/* Scrollbereich im Katalog */
.catalog-scroll-area {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.lh-1 {
  line-height: 1.1;
}
</style>