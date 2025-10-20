<!-- src/pages/lab/ProjectServicesView.vue -->
<template>
  <div>
    <!-- Header mit Projektinformationen -->
    <div class="d-flex align-center mb-6">
      <v-icon size="large" class="mr-3" color="primary">mdi-beaker-check-outline</v-icon>
      <div>
        <h1 class="text-h4 font-weight-regular">Dienstleistungen</h1>
        <div v-if="projectStore.activeProject" class="text-medium-emphasis">
          Für Projekt: <strong>{{ projectStore.activeProject.projectNumber }}</strong>
          <v-chip v-if="projectStore.activeProject.isFollowUpProject" size="small" class="ml-2" label>Folgeprojekt</v-chip>
        </div>
      </div>
    </div>

    <!-- Master-Detail Layout -->
    <v-row>
      <!-- LINKE SPALTE: Service-Liste -->
      <v-col cols="12" md="4">
        <ServiceList 
          :services="serviceStore.services"
          :loading="serviceStore.isLoading"
          @select="serviceStore.loadService($event)"
          @create-new="serviceStore.prepareNewService()"
        />
      </v-col>

      <!-- RECHTE SPALTE: Service-Editor / Workbench -->
      <v-col cols="12" md="8">
        <ServiceEditorForm
          :active-service="serviceStore.activeService"
          @select-type="serviceStore.selectServiceType($event)"
          @save="serviceStore.saveActiveService()"
          @cancel="serviceStore.cancelEditing()"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { useServiceStore } from '@/stores/serviceStore';
import ServiceList from '@/components/lab/services/ServiceList.vue';
import ServiceEditorForm from '@/components/lab/services/ServiceEditorForm.vue';

const projectStore = useProjectStore();
const serviceStore = useServiceStore();

// Holt die Daten, wenn die Seite geladen wird
onMounted(() => {
  // TODO: Wenn man direkt auf diese Seite kommt, muss das Projekt erst geladen werden.
  // if (!projectStore.activeProject) { projectStore.loadProjectById(props.projectId); }
  serviceStore.fetchServicesForActiveProject();
});
</script>