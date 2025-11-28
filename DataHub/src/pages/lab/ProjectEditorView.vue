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
           <!-- 
              WICHTIG: Hier rufen wir jetzt 'handleFormInput' auf, statt es inline zu machen.
           -->
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
        <v-card-actions class="d-flex justify-end ga-3 pa-4 bg-grey-lighten-5">
           <v-btn variant="outlined" prepend-icon="mdi-plus" @click="createNewProject" :disabled="isFormLoading">Neues Projekt</v-btn>
           <v-btn variant="outlined" color="primary" prepend-icon="mdi-beaker-check-outline" @click="goToServices(projectData?.id || 0)" :disabled="isFormLoading">Dienstleistung bearbeiten</v-btn>
           <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="triggerSave" :loading="isSaving" :disabled="isFormLoading">Projekt speichern</v-btn>
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

const projectData = ref<Project | null>(null);
const allProjects = ref<Project[]>([]);

const emptyProject = { id: 0, projectNumber: '', status: 'inquiry', services: [], isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false, isFollowUpProject: false, isLongTermProject: false, finalCheck: false, taskDescription: '', projectStatusText: '', technicalAssistantId: null, cooperationPartnerId: null, workgroupId: null, estimatedCompletionDate: null, lastThursdayOfMonth: null, completionDate: null } as Project;

const options = reactive({ technicalAssistants: [] as any[], cooperationPartners: [] as any[], workgroups: [] as any[], projectTypes: [] as any[], statuses: [] as any[] });

watch(() => props.projectId, async (newId, oldId) => {
  if (newId !== oldId) await switchProjectData(newId);
});

// --- WICHTIG: DIE NEUE SYNC FUNKTION ---

function handleFormInput(updatedProject: Project) {
  // 1. Das Formular-Objekt aktualisieren (damit man weitertippen kann)
  projectData.value = updatedProject;

  // 2. Die Tabelle unten SOFORT aktualisieren
  // Wir suchen das Projekt in der Liste und überschreiben es mit den neuen Daten
  const index = allProjects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    allProjects.value[index] = updatedProject;
  }
}

// --- STANDARD LOGIC ---

function handleProjectSelect(project: Project) {
  router.push({ name: 'ServiceProjectEdit', params: { projectId: project.id } });
}
async function createNewProject() {
  router.push({ name: 'ServiceProjectEdit', params: { projectId: 'new' } });
}
async function handleDeleteProject(project: Project) {
  isTableLoading.value = true;
  try {
    await api.deleteProject(project.id);
    
    // Fall A: Wir haben das Projekt gelöscht, das gerade oben offen ist
    if (projectData.value && projectData.value.id === project.id) {
      await createNewProject(); // Formular resetten
    }
    
    // Liste aktualisieren
    await loadTableData();
  } finally {
    isTableLoading.value = false;
  }
}

// NEU: Tab-Logik (falls noch nicht vorhanden)
function handleOpenInNewTab(project: Project) {
  navStore.addTab(`/services/project/${project.id}`);
}

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
      } else {
        // Fallback API call
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

// Update von unten (Tabelle -> Formular)
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
    
    // Liste sicherheitshalber neu holen, aber da wir live synchronisieren,
    // sollte die Tabelle schon aktuell sein. Das hier ist der "Double Check".
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
  navStore.setContext('mdi-beaker-check-outline', [{ title: 'Navigation', to: '/' }, { title: 'Projekterfassung', to: {name: 'ServiceSearch'} }, { title: title, disabled: true }], false);
}

function goToServices(id: number) {
  // Sicherheits-Check: Wenn das Projekt noch nicht gespeichert ist (ID 0), darf man nicht hin
  if (!id || id === 0) {
    alert("Bitte speichern Sie das Projekt zuerst, bevor Sie Dienstleistungen erfassen.");
    return;
  }

  // Navigation zur neuen Route
  router.push({ 
    name: 'ServiceProjectServices', 
    params: { projectId: id } 
  });
}
async function handleFetchApplicationData() { /* ... */ }

onMounted(loadPage);
</script>