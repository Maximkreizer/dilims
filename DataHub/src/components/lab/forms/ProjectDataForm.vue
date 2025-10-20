<!-- src/components/lab/forms/ProjectDataForm.vue -->
<template>
  <!-- v-if stellt sicher, dass das Formular erst gerendert wird, wenn Daten da sind -->
  <v-form v-if="formData">
    <v-row>
      <!-- ===================================== -->
      <!-- LINKE SPALTE: Das Haupt-Formular      -->
      <!-- ===================================== -->
      <v-col cols="12" lg="6">
        <v-card border>
          <v-card-text>
            <!-- Projekttyp -->
            <v-select
              v-model="selectedProjectType"
              :items="props.projectTypes"
              item-title="title"
              item-value="value"
              label="Projekttyp"
              density="compact"
              variant="outlined"
              class="mb-4"
            ></v-select>
            
            <!-- ProjektNr & Folgeprojekt -->
            <div class="d-flex align-center ga-4 mb-4">
              <v-text-field v-model="formData.projectNumber" label="Projekt-Nr." density="compact" variant="outlined" hide-details></v-text-field>
              <v-checkbox v-model="formData.isFollowUpProject" label="Folgeprojekt" density="compact" hide-details></v-checkbox>
            </div>

            <!-- Bearbeitung -->
            <v-select v-model="formData.status" label="Bearbeitung" :items="props.statusOptions" item-title="title" item-value="value" density="compact" variant="outlined" class="mb-4"></v-select>
            
            <!-- Aufgaben & Projektstand -->
            <v-textarea v-model="formData.taskDescription" label="Aufgaben" rows="3" variant="outlined" class="mb-4"></v-textarea>
            <v-textarea v-model="formData.projectStatusText" label="Projektstand" rows="2" variant="outlined" class="mb-4"></v-textarea>

            <!-- TA & Arzt -->
            <v-select v-model="formData.technicalAssistantId" label="TA" :items="props.assistantOptions" item-title="fullName" item-value="id" density="compact" variant="outlined" class="mb-4"></v-select>
            <v-select v-model="formData.cooperationPartnerId" label="Arzt / Koop.-Partner" :items="props.partnerOptions" item-title="fullName" item-value="id" density="compact" variant="outlined" class="mb-4"></v-select>
            
            <!-- Daten -->
            <div class="d-flex ga-4 mb-4">
              <v-text-field v-model="estimatedDateForInput" type="date" label="Voraussichtl. Abgabe" density="compact" variant="outlined" hide-details></v-text-field>
              <v-select v-model="formData.lastThursdayOfMonth" label="Letzter Do./Monat" :items="[]" density="compact" variant="outlined" hide-details></v-select>
            </div>

            <!-- NEUES FELD: Abgabedatum -->
            <v-text-field v-model="completionDateForInput" type="date" label="Abgabe" density="compact" variant="outlined" hide-details class="mb-4"></v-text-field>

            <!-- NEUE CHECKBOXEN -->
            <div class="d-flex flex-wrap ga-x-6">
              <v-checkbox v-model="formData.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
              <v-checkbox v-model="formData.isLongTermProject" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
            </div>
            
            <!-- Arbeitsgruppe -->
            <div class="d-flex align-center ga-4 mt-4">
              <v-select v-model="formData.workgroupId" label="Arbeitsgruppe" :items="props.workgroupOptions" item-title="name" item-value="id" density="compact" variant="outlined" hide-details></v-select>
              <v-text-field :model-value="formData.workgroupId" label="ID" density="compact" variant="outlined" readonly hide-details style="max-width: 80px;"></v-text-field>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ===================================== -->
      <!-- RECHTE SPALTE: Antragsbearbeitung     -->
      <!-- ===================================== -->
      <v-col cols="12" lg="6">
        <v-card border>
          <v-card-title class="text-subtitle-1">Antragsbearbeitung (zur Ansicht)</v-card-title>
          <v-card-text>
            <v-btn
              block size="large" class="mb-4"
              @click="onFetchApplicationData"
              :loading="props.isFetchingData"
              prepend-icon="mdi-database-import-outline"
            >
              Hole Daten aus Antragsbearbeitung
            </v-btn>
            <!-- FÜGEN SIE HIER UND BEI DEN FOLGENDEN FELDER 'disabled' HINZU -->
            <v-select label="AB_Studie" v-model="formData.applicationStudy" readonly disabled density="compact" variant="outlined" class="mb-4"></v-select>
            <v-text-field label="AB_Bearbeitung" v-model="formData.applicationProcessingStatus" readonly disabled density="compact" variant="outlined" class="mb-4"></v-text-field>
            
            <!-- Diese zwei bleiben editierbar -->
            <v-textarea label="AB_Projekttitel" v-model="formData.applicationTitle" density="compact" variant="outlined" rows="2" class="mb-4"></v-textarea>
            <v-textarea label="AB_Anforderung" v-model="formData.applicationRequest" density="compact" variant="outlined" rows="3" class="mb-4"></v-textarea>
            
            <v-text-field label="AB_Koop_Partner" v-model="formData.applicationCoopPartner" readonly disabled density="compact" variant="outlined" class="mb-4"></v-text-field>
            
            <v-row>
              <v-col cols="8"><v-text-field label="AB_Rückmeldung" v-model="formData.applicationFeedback" readonly disabled density="compact" variant="outlined" hide-details></v-text-field></v-col>
              <v-col cols="4"><v-text-field label="AB_Genehmigung" v-model="formData.applicationApproval" readonly disabled density="compact" variant="outlined" hide-details></v-text-field></v-col>
            </v-row>
            
            <v-row class="mt-2">
              <v-col cols="8"><v-text-field label="AB_Abgabe" v-model="formData.applicationCompletionDate" readonly disabled density="compact" variant="outlined" hide-details></v-text-field></v-col>
              <v-col cols="4" class="d-flex align-center"><v-checkbox v-model="formData.applicationIsLongTermProject" label="Langzeit" readonly disabled density="compact" hide-details></v-checkbox></v-col>
            </v-row>

            <v-text-field label="AB_Projektleiter" v-model="formData.applicationProjectLead" readonly disabled density="compact" variant="outlined" class="mt-4"></v-text-field>
            <v-text-field label="AB_Ansprechpartner" v-model="formData.applicationContactPerson" readonly disabled density="compact" variant="outlined" class="mt-2"></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div class="d-flex align-center mt-4">
      <v-btn v-if="formData && formData.id !== 0" variant="text" prepend-icon="mdi-beaker-check-outline" @click="onEditServices" > Dienstleistungen bearbeiten </v-btn>
      <v-spacer></v-spacer>
      <v-btn size="large" color="primary" @click="onSave" prepend-icon="mdi-content-save" :loading="props.isFetchingData" > Projekt speichern </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Project, TechnicalAssistant, CooperationPartner, Workgroup } from '@/mocks/db';
import { useProjectStore } from '@/stores/projectStore';
const projectStore = useProjectStore();

const props = defineProps<{
  project: Project | null;
  statusOptions: Array<{ value: string; title: string }>;
  assistantOptions: Array<TechnicalAssistant>;
  partnerOptions: Array<CooperationPartner>;
  workgroupOptions: Array<Workgroup>;
  projectTypes: Array<{ value: string; title: string }>;
  isFetchingData: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', project: Project): void;
  (e: 'fetch-application-data'): void;
  (e: 'edit-services', projectId: number): void;
}>();

const formData = ref<any>(null);

watch(
  [() => props.project, () => projectStore.projectVersion], 
  ([newProject]) => {
    formData.value = newProject ? { ...newProject } : null;
  }, 
  { immediate: true, deep: true }
);

// Übersetzt zwischen dem Dropdown-Wert (string) und den boolean-Flags im Datenobjekt
const selectedProjectType = computed({
  get() {
    if (!formData.value) return null;
    if (formData.value.isNctTbb) return 'isNctTbb';
    if (formData.value.isPccc) return 'isPccc';
    if (formData.value.isDzif) return 'isDzif';
    if (formData.value.isCmcp) return 'isCmcp';
    return null;
  },
  set(newValue) {
    if (!formData.value) return;
    ['isNctTbb', 'isPccc', 'isDzif', 'isCmcp'].forEach(flag => { formData.value[flag] = false; });
    if (newValue) { formData.value[newValue] = true; }
  }
});

// Übersetzt zwischen dem ISO-Datum (string) und dem HTML-Date-Input-Format ('YYYY-MM-DD')
const estimatedDateForInput = computed({
  get: () => formData.value?.estimatedCompletionDate?.split('T')[0] || '',
  set: (value) => { if (formData.value) { formData.value.estimatedCompletionDate = value ? `${value}T00:00:00.000Z` : null; } }
});

const completionDateForInput = computed({
  get: () => formData.value?.completionDate?.split('T')[0] || '',
  set: (value) => { if (formData.value) { formData.value.completionDate = value ? `${value}T00:00:00.000Z` : null; } }
});

// ======================================================================

function onFetchApplicationData() {
  emit('fetch-application-data');
}

function onEditServices() {
  if (formData.value && formData.value.id) {
    emit('edit-services', formData.value.id);
  }
}

function onSave() {
  if (formData.value) {
    emit('save', formData.value);
  }
}
</script>

<style scoped>
.disabled-card { position: relative; }
</style>