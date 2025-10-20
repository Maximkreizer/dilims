<!-- src/pages/lab/ProjectEditorView.vue -->
<template>
  <div>
    <v-row>
      <v-col cols="12" md="5">
        <div v-if="projectStore.projects.length > 0">
          <p class="text-medium-emphasis mb-4">
            Wählen Sie ein Projekt aus der Liste, um es zu bearbeiten.
          </p>
          <ProjectDataTable 
            :items="projectStore.projects" 
            :loading="isLoading"
            @select="selectProjectForEditing"
          />
        </div>
        <v-alert v-else-if="!projectStore.activeProject" border="start" variant="tonal">
          Keine Suchergebnisse. Starten Sie eine neue Suche oder legen Sie ein neues Projekt an.
        </v-alert>
      </v-col>

      <v-col cols="12" md="7">
        <p v-if="projectStore.activeProject?.id === 0" class="text-medium-emphasis mb-4">
          Füllen Sie die Felder aus, um ein **neues Projekt** anzulegen.
        </p>
        <p v-else-if="projectStore.activeProject" class="text-medium-emphasis mb-4">
          Bearbeiten Sie die Daten für das Projekt: <strong>{{ projectStore.activeProject.projectNumber }}</strong>
        </p>
        
        <ProjectDataForm 
          v-if="projectStore.activeProject"
          :project="projectStore.activeProject"
          :status-options="projectStore.searchOptions.statuses"
          :assistant-options="projectStore.searchOptions.technicalAssistants"
          :partner-options="projectStore.searchOptions.cooperationPartners"
          :workgroup-options="projectStore.searchOptions.workgroups"
          :project-types="projectStore.searchOptions.projectTypes"
          :is-fetching-data="isLoading"

          @save="saveProject"
          @fetch-application-data="fetchAppData"
          @edit-services="goToServices"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore';
import { onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProjectDataTable from '@/components/lab/shared/ProjectDataTable.vue';
import ProjectDataForm from '@/components/lab/forms/ProjectDataForm.vue';
import type { Project } from '@/mocks/db';

const projectStore = useProjectStore();
const route = useRoute();
const router = useRouter();
const isLoading = computed(() => projectStore.isLoading);

onBeforeMount(() => {
  projectStore.fetchSearchOptions();
});

// onMounted wurde durch diese direktere Logik ersetzt
if (route.name === 'LabProjectCreate') {
  projectStore.prepareNewProject();
}

function selectProjectForEditing(project: Project) {
  projectStore.loadProject(project);
}

// KORREKTUR: Die Funktion empfängt jetzt die Daten vom Formular und leitet sie an den Store weiter
function saveProject(updatedProject: Project) {
  projectStore.saveProject(updatedProject);
}

function fetchAppData() {
  projectStore.fetchApplicationDataForActiveProject();
}

function goToServices(projectId: number) {
  router.push({ 
    name: 'LabProjectServices', 
    params: { projectId: projectId } 
  });
}
</script>