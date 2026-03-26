<!-- src/components/lab/forms/ProjectDataForm.vue -->
<!-- 
 * UI-Komponente (Formular) zur Bearbeitung von Projekt-Stammdaten.
 * 
 * Funktionalität:
 * - Zweispaltiges Layout: Links editierbare Projektdaten, rechts schreibgeschützte Antragsdaten.
 * - Mappt Dropdown-Auswahlen auf Boolean-Flags (Projekttypen).
 * - Konvertiert Datumsformate für HTML-Inputs.
 * - Emittet 'save', 'fetch-application-data' und 'edit-services' an die Elternkomponente.
 -->
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
            <DidataSelect
              v-model="selectedProjectType"
              :items="props.projectTypes"
              item-title="title"
              item-value="value"
              label="Projekttyp"
              density="compact"
              variant="outlined"
              class="mb-4"
            ></DidataSelect>
            
            <!-- ProjektNr & Folgeprojekt -->
            <div class="d-flex align-center ga-4 mb-4">
              <DidataTextField v-model="formData.ProjektNr" label="Projekt-Nr." density="compact" variant="outlined" hide-details></DidataTextField>
              <v-checkbox v-model="formData.isFollowUpProject" label="Folgeprojekt" density="compact" hide-details></v-checkbox>
            </div>

            <!-- Bearbeitung -->
            <DidataSelect v-model="formData.Bearbeitung" label="Bearbeitung" :items="props.statusOptions" item-title="title" item-value="value" density="compact" variant="outlined" class="mb-4"></DidataSelect>
            
            <!-- Aufgaben -->
            <DidataTextarea v-model="formData.Aufgaben" label="Aufgaben" rows="3" variant="outlined" class="mb-4"></DidataTextarea>

            <!-- TA & Arzt -->
            <DidataSelect v-model="formData.TA" label="TA" :items="props.assistantOptions" item-title="LANGTEXT" item-value="ORIGREC" density="compact" variant="outlined" class="mb-4"></DidataSelect>
            <DidataSelect v-model="formData.Arzt" label="Arzt / Koop.-Partner" :items="props.partnerOptions" item-title="Vorname_Name" item-value="ID" density="compact" variant="outlined" class="mb-4"></DidataSelect>

            <!-- NEUES FELD: Abgabedatum -->
            <DidataTextField v-model="completionDateForInput" type="date" label="Ganzes Projekt Abgeschlossen" density="compact" variant="outlined" hide-details class="mb-4"></DidataTextField>

            <!-- NEUE CHECKBOXEN -->
            <div class="d-flex flex-wrap ga-x-6">
              <v-checkbox v-model="formData.Abschlusskontrolle" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
              <v-checkbox v-model="formData.Langzeitprojekt" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
            </div>
            
            <!-- Arbeitsgruppe -->
            <div class="d-flex align-center ga-4 mt-4">
              <DidataSelect v-model="formData.AB_P_Kundennummer" label="Arbeitsgruppe" :items="props.workgroupOptions" item-title="LOOKUP_VALUE" item-value="ID" density="compact" variant="outlined" hide-details></DidataSelect>
              <DidataTextField :model-value="formData.AB_P_Kundennummer" label="ID" density="compact" variant="outlined" readonly hide-details style="max-width: 80px;"></DidataTextField>
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
            <DidataSelect label="AB_Studie" v-model="formData.AB_Studie" readonly disabled density="compact" variant="outlined" class="mb-4"></DidataSelect>
            <DidataTextField label="AB_Bearbeitung" v-model="formData.AB_Bearbeitung" readonly disabled density="compact" variant="outlined" class="mb-4"></DidataTextField>
            
            <!-- Diese zwei bleiben editierbar -->
            <DidataTextarea label="AB_Projekttitel" v-model="formData.AB_Projekttitel" density="compact" variant="outlined" rows="2" class="mb-4"></DidataTextarea>
            <DidataTextarea label="AB_Anforderung" v-model="formData.AB_Anforderung" density="compact" variant="outlined" rows="3" class="mb-4"></DidataTextarea>
            
            <DidataTextField label="AB_Koop_Partner" v-model="formData.AB_Koop_Vorname_Nachname" readonly disabled density="compact" variant="outlined" class="mb-4"></DidataTextField>
            
            <v-row>
              <v-col cols="8"><DidataTextField label="AB_Rückmeldung" v-model="formData.AB_Rueckmeldung" readonly disabled density="compact" variant="outlined" hide-details></DidataTextField></v-col>
              <v-col cols="4"><DidataTextField label="AB_Genehmigung" v-model="formData.AB_Genehmigung" readonly disabled density="compact" variant="outlined" hide-details></DidataTextField></v-col>
            </v-row>
            
            <v-row class="mt-2">
              <v-col cols="8"><DidataTextField label="AB_Abgabe" v-model="formData.AB_Abgabe" readonly disabled density="compact" variant="outlined" hide-details></DidataTextField></v-col>
              <v-col cols="4" class="d-flex align-center"><v-checkbox v-model="formData.AB_Langzeitprojekt" label="Langzeit" readonly disabled density="compact" hide-details></v-checkbox></v-col>
            </v-row>

            <DidataTextField label="AB_Projektleiter" v-model="formData.AB_P_Nachname_Vorname" readonly disabled density="compact" variant="outlined" class="mt-4"></DidataTextField>
            <DidataTextField label="AB_Ansprechpartner" v-model="formData.AB_Ansprechpartner" readonly disabled density="compact" variant="outlined" class="mt-2"></DidataTextField>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
  (e: 'update:project', project: Project): void;
  (e: 'fetch-application-data'): void;
}>();

const formData = ref<Project | null>(null);

// --- WATCHER 1: Daten kommen rein (Initial oder von Tabelle unten) ---
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      // Sicherheits-Check gegen Endlos-Schleifen
      if (JSON.stringify(formData.value) !== JSON.stringify(newProject)) {
        formData.value = JSON.parse(JSON.stringify(newProject));
      }
    } else {
      formData.value = null;
    }
  },
  { immediate: true, deep: true }
);

// --- WATCHER 2: Daten gehen raus (User tippt) ---
watch(
  formData, 
  (newValue) => {
    if (newValue) {
      emit('update:project', JSON.parse(JSON.stringify(newValue)));
    }
  }, 
  { deep: true }
);

// --- HELPER FUNCTION (Die hat gefehlt!) ---
function onFetchApplicationData() {
  emit('fetch-application-data');
}

// --- COMPUTED PROPERTIES ---

const selectedProjectType = computed({
  get() {
    if (!formData.value) return null;
    if (formData.value.isNctTbb) return 'isNctTbb';
    if (formData.value.isDzif) return 'isDzif';
    return null;
  },
  set(newValue) {
    if (!formData.value) return;
    formData.value.isNctTbb = false;
    formData.value.isDzif = false;
    if (newValue === 'isNctTbb') formData.value.isNctTbb = true;
    if (newValue === 'isDzif') formData.value.isDzif = true;
  }
});

const completionDateForInput = computed({
  get: () => formData.value?.Abgabedatum?.split('T')[0] || '',
  set: (value) => { if (formData.value) { formData.value.Abgabedatum = value ? `${value}T00:00:00.000Z` : null; } }
});

watch(() => formData.value?.Bearbeitung, (newStatus) => {
  if (newStatus === 'completed' && !formData.value?.Abgabedatum) {
    const today = new Date().toISOString().split('T')[0];
    formData.value.Abgabedatum = `${today}T00:00:00.000Z`;
  }
}, { flush: 'sync' });
</script>

<style scoped>
.disabled-card { position: relative; }
</style>