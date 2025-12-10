<template>
  <v-container fluid class="pa-4 d-flex flex-column ga-4">
    
    <!-- Initialer Lader -->
    <div v-if="initialLoading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else>
      
      <!-- FORMULAR KARTE -->
      <v-card border class="position-relative">
        
        <v-overlay 
          :model-value="isFormLoading" 
          contained persistent 
          class="align-center justify-center"
          scrim="rgba(255, 255, 255, 0.6)"
          style="z-index: 10;"
        >
          <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
        </v-overlay>

        <v-card-text>
           <ProjectDataForm
            :project="projectData || emptyProject"
            :status-options="options.statuses"
            :assistant-options="options.technicalAssistants"
            :partner-options="options.cooperationPartners"
            :workgroup-options="options.workgroups"
            :project-types="options.projectTypes"
            :is-fetching-data="isFetchingExternal"
            @update:project="handleFormInput" 
            @fetch-application-data="handleFetchApplicationData"
          />
        </v-card-text>

        <v-divider></v-divider>
        
        <!-- BUTTON LEISTE UNTEN -->
        <v-card-actions class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5">
           
           <!-- 1. LINKS: CLEAR (Formular leeren) -->
           <v-btn 
             variant="text" 
             color="error" 
             prepend-icon="mdi-eraser" 
             @click="confirmClearForm" 
             :disabled="isFormLoading"
           >
             Formular leeren
           </v-btn>

           <div class="d-flex ga-3">
             <!-- 2. MITTE: DIENSTLEISTUNGEN (Wichtig) -->
             <v-btn 
               variant="outlined" 
               color="primary" 
               prepend-icon="mdi-beaker-check-outline" 
               @click="goToServices(projectData?.id || 0)" 
               :disabled="isFormLoading"
               class="font-weight-bold"
             >
               Dienstleistung bearbeiten
             </v-btn>

             <!-- 3. RECHTS: SPEICHERN -->
             <v-btn 
               color="primary" 
               variant="flat" 
               prepend-icon="mdi-content-save" 
               @click="triggerSave" 
               :loading="isSaving" 
               :disabled="isFormLoading"
             >
               Projekt speichern
             </v-btn>
           </div>

        </v-card-actions>
      </v-card>

      <!-- TABELLE -->
      <div class="mt-4">
        <ResizableProjectTable 
          :projects="allProjects" 
          :loading="isTableLoading" 
          :options="options"
          @open="handleProjectSelect"
          @project-updated="handleTableUpdate"
          @open-in-tab="handleOpenInNewTab"
          @delete="handleDeleteProject"
        />
      </div>

    </div>

    <!-- DIALOG: FORMULAR LEEREN -->
    <v-dialog v-model="clearDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-warning">Formular leeren?</v-card-title>
        <v-card-text>
          Möchten Sie alle Eingaben verwerfen und das Formular zurücksetzen?
          Nicht gespeicherte Änderungen gehen verloren.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="clearDialog = false">Abbrechen</v-btn>
          <v-btn color="error" variant="flat" @click="executeClear">Leeren</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { Project } from '@/mocks/db';

import ProjectDataForm from '@/components/lab/forms/ProjectDataForm.vue';
import ResizableProjectTable from '@/components/lab/shared/ResizableProjectTable.vue';

const props = defineProps<{ projectId: string | number; }>();
const router = useRouter();
const navStore = useNavigationStore();

const initialLoading = ref(true);
const isFormLoading = ref(false);
const isSaving = ref(false);
const isTableLoading = ref(false);
const isFetchingExternal = ref(false);

// Dialog State
const clearDialog = ref(false);

const projectData = ref<Project | null>(null);
const allProjects = ref<Project[]>([]);

const emptyProject = { id: 0, projectNumber: '', status: 'inquiry', services: [], isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false, isFollowUpProject: false, isLongTermProject: false, finalCheck: false, taskDescription: '', projectStatusText: '', technicalAssistantId: null, cooperationPartnerId: null, workgroupId: null, estimatedCompletionDate: null, lastThursdayOfMonth: null, completionDate: null } as Project;

const options = reactive({ technicalAssistants: [] as any[], cooperationPartners: [] as any[], workgroups: [] as any[], projectTypes: [] as any[], statuses: [] as any[] });

watch(() => props.projectId, async (newId, oldId) => {
  if (newId !== oldId) await switchProjectData(newId);
});

// Watcher für Tab-Wechsel (Icon Fix)
watch(() => navStore.activeTabId, () => updateNavigation());

// --- SYNC ---
function handleFormInput(updatedProject: Project) {
  projectData.value = updatedProject;
  const index = allProjects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) allProjects.value[index] = updatedProject;
}

// --- STANDARD LOGIC ---

function handleProjectSelect(project: Project) {
  router.push({ name: 'ServiceProjectEdit', params: { projectId: project.id } });
}

// WICHTIG: Das ist die Funktion für den "Neu"-Button oben rechts im Header
async function createNewProject() {
  router.push({ name: 'ServiceProjectEdit', params: { projectId: 'new' } });
}

function handleOpenInNewTab(project: Project) {
  navStore.addTab(`/services/project/${project.id}`);
}

async function handleDeleteProject(project: Project) {
  isTableLoading.value = true;
  try {
    await api.deleteProject(project.id);
    if (projectData.value && projectData.value.id === project.id) {
      await createNewProject();
    }
    await loadTableData();
  } finally {
    isTableLoading.value = false;
  }
}

// --- CLEAR LOGIC (Formular leeren) ---
function confirmClearForm() {
  clearDialog.value = true;
}

function executeClear() {
  // Wir setzen das Formular auf den "Leeren/Neuen" Zustand zurück
  projectData.value = JSON.parse(JSON.stringify(emptyProject));
  
  // Wir ändern die URL auf 'new', falls wir gerade ein bestehendes Projekt bearbeitet haben,
  // damit man nicht versehentlich das bestehende Projekt mit leeren Daten überschreibt.
  router.replace({ name: 'ServiceProjectEdit', params: { projectId: 'new' } });
  
  clearDialog.value = false;
  updateNavigation();
}

// --- DATA LOADING ---

async function switchProjectData(id: string | number) {
  isFormLoading.value = true;
  await new Promise(r => setTimeout(r, 200));
  try {
    if (id === 'new' || id === 0 || id === '0') {
      projectData.value = JSON.parse(JSON.stringify(emptyProject));
    } else {
      const found = allProjects.value.find(p => p.id === Number(id));
      if (found) {
        projectData.value = JSON.parse(JSON.stringify(found));
      }
    }
    updateNavigation();
  } finally {
    isFormLoading.value = false;
  }
}

async function loadPage() {
  initialLoading.value = true;
  try {
    const opts = await api.getSearchOptions();
    Object.assign(options, opts);
    allProjects.value = await api.findProjects({});
    await switchProjectData(props.projectId);
  } finally {
    initialLoading.value = false;
    isFormLoading.value = false;
  }
}

function handleTableUpdate(updatedProject: Project) {
  const index = allProjects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) allProjects.value[index] = updatedProject;
  if (projectData.value && projectData.value.id === updatedProject.id) {
    projectData.value = { ...updatedProject };
  }
}

async function triggerSave() {
  if (projectData.value) await handleSave(projectData.value);
}

async function handleSave(updatedProject: Project) {
  isSaving.value = true;
  try {
    const saved = await api.saveProject(updatedProject);
    projectData.value = saved;
    if (updatedProject.id === 0) {
       router.replace({ name: 'ServiceProjectEdit', params: { projectId: saved.id } });
    }
    await api.findProjects({}).then(res => allProjects.value = res);
    updateNavigation();
  } finally {
    isSaving.value = false;
  }
}

async function loadTableData() {
  allProjects.value = await api.findProjects({});
}

function updateNavigation() {
  const title = (!projectData.value?.id || projectData.value.id === 0) ? 'Neues Projekt' : `Projekt ${projectData.value?.projectNumber}`;
  
  // WICHTIG: Hier aktivieren wir den "Neu" Button oben rechts (3. Parameter = true)
  navStore.setContext(
    'mdi-beaker-check-outline', 
    [
      { title: 'Navigation', to: '/' }, 
      { title: 'Projekterfassung', to: {name: 'ServiceSearch'} }, 
      { title: title, disabled: true }
    ], 
    true // <--- Das aktiviert den "Neu"-Button im Header!
  );
  
  // Und wir sagen dem Button, was er tun soll (createNewProject aufrufen)
  navStore.setNewAction(createNewProject);
}

function goToServices(id: number) {
  if (!id || id === 0) {
    alert("Bitte speichern Sie das Projekt zuerst, bevor Sie Dienstleistungen erfassen.");
    return;
  }
  router.push({ name: 'ServiceProjectServices', params: { projectId: id } });
}

async function handleFetchApplicationData() { /* ... */ }

onMounted(() => {
  updateNavigation();
  loadPage();
});
</script>