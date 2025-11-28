<template>
  <v-container fluid class="pa-4">
    
    <!-- Ladeanzeige, solange Daten geholt werden -->
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Das eigentliche Formular -->
    <div v-else>
      <ProjectDataForm
        :project="projectData"
        :status-options="options.statuses"
        :assistant-options="options.technicalAssistants"
        :partner-options="options.cooperationPartners"
        :workgroup-options="options.workgroups"
        :project-types="options.projectTypes"
        :is-fetching-data="isFetchingExternal"
        @save="handleSave"
        @fetch-application-data="handleFetchApplicationData"
        @edit-services="goToServices"
      />
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';
import { api } from '@/services/api';
import type { Project } from '@/mocks/db';

// Komponenten Import
import ProjectDataForm from '@/components/lab/forms/ProjectDataForm.vue';

// Props definieren (projectId kommt aus der URL)
const props = defineProps<{
  projectId: string | number;
}>();

const router = useRouter();
const navStore = useNavigationStore();

// State
const loading = ref(true);
const isFetchingExternal = ref(false);
const projectData = ref<Project | null>(null);

// Optionen für Dropdowns
const options = reactive({
  technicalAssistants: [] as any[],
  cooperationPartners: [] as any[],
  workgroups: [] as any[],
  projectTypes: [] as any[],
  statuses: [] as any[],
});

// Computed: Ist es ein neues Projekt?
const isNew = computed(() => props.projectId === 'new' || props.projectId === 0 || props.projectId === '0');

// --- LOGIK ---

async function loadData() {
  loading.value = true;
  try {
    // 1. Optionen laden (Dropdowns)
    const opts = await api.getSearchOptions();
    Object.assign(options, opts);

    // 2. Projekt laden oder leeres Template erstellen
    if (isNew.value) {
      projectData.value = {
        id: 0,
        projectNumber: '',
        status: 'inquiry',
        services: [],
        // ... Standardwerte für Booleans setzen ...
        isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false,
        isSfb118Project: false, isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
        taskDescription: '', projectStatusText: '',
        technicalAssistantId: null, cooperationPartnerId: null, workgroupId: null,
        estimatedCompletionDate: null, lastThursdayOfMonth: null, completionDate: null
      };
    } else {
      // Bestehendes Projekt suchen
      const allProjects = await api.findProjects({}); // In echt: api.getProjectById(id)
      const found = allProjects.find(p => p.id === Number(props.projectId));
      if (found) {
        // Kopie erstellen, um Reaktivität zu gewährleisten
        projectData.value = JSON.parse(JSON.stringify(found));
      } else {
        console.error("Projekt nicht gefunden");
        router.push({ name: 'ServiceSearch' }); // Zurück zur Suche bei Fehler
      }
    }

    // 3. NAVIGATION STORE UPDATEN (WICHTIG!)
    updateNavigation();

  } catch (e) {
    console.error("Fehler beim Laden:", e);
  } finally {
    loading.value = false;
  }
}

function updateNavigation() {
  const title = isNew.value ? 'Neues Projekt' : `Projekt ${projectData.value?.projectNumber || props.projectId}`;
  
  navStore.setContext(
    'mdi-beaker-check-outline', // Icon
    [
      { title: 'Navigation', to: '/' },
      { title: 'Projekterfassung', to: { name: 'ServiceSearch' } }, // Klickbar zurück zur Suche
      { title: title, disabled: true } // Aktuelle Seite
    ],
    false // Kein "Neu"-Button im Editor
  );
}

// --- EVENTS VOM FORMULAR ---

async function handleSave(updatedProject: Project) {
  loading.value = true;
  try {
    const saved = await api.saveProject(updatedProject);
    projectData.value = saved;
    
    // Wenn es neu war, URL aktualisieren ohne Reload
    if (isNew.value) {
      router.replace({ name: 'ServiceProjectEdit', params: { projectId: saved.id } });
    }
    
    // Feedback? (Könnte man Snackbar einbauen)
    console.log("Gespeichert:", saved);
    updateNavigation(); // Titel aktualisieren (falls Projektnummer geändert wurde)
  } catch (e) {
    console.error("Fehler beim Speichern:", e);
  } finally {
    loading.value = false;
  }
}

async function handleFetchApplicationData() {
  isFetchingExternal.value = true;
  try {
    const appData = await api.fetchApplicationData();
    if (projectData.value) {
      // Daten mergen
      Object.assign(projectData.value, appData);
    }
  } finally {
    isFetchingExternal.value = false;
  }
}

function goToServices(id: number) {
  // Navigation zur Dienstleistungs-Seite (Platzhalter)
  // router.push({ name: 'LabProjectServices', params: { projectId: id } });
  console.log("Navigiere zu Services für ID:", id);
  alert("Service-Seite folgt im nächsten Schritt!");
}

// Start
onMounted(() => {
  loadData();
});
</script>