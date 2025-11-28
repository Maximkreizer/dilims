<!-- src/components/lab/services/ServiceForm.vue -->
<template>
  <v-card border flat>
    <v-card-title class="bg-grey-lighten-4 text-subtitle-1 font-weight-bold d-flex align-center">
      <v-icon start color="primary">mdi-pencil</v-icon>
      Dienstleistung bearbeiten: <span class="text-primary ml-2">{{ getLabel(formData.serviceType) }}</span>
    </v-card-title>
    
    <v-divider></v-divider>

    <!-- INFO HEADER: Projektnummer & Folgeprojekt (Anforderung 6) -->
    <div class="pa-2 bg-blue-grey-lighten-5 d-flex align-center ga-4 text-caption">
      <div><strong>Projekt-Nr:</strong> {{ projectNumber }}</div>
      <div><strong>Folgeprojekt:</strong> 
        <v-icon v-if="isFollowUp" color="success" size="small">mdi-check</v-icon>
        <v-icon v-else color="grey" size="small">mdi-close</v-icon>
      </div>
    </div>
    <v-divider></v-divider>

    <v-card-text style="max-height: 600px; overflow-y: auto;">
      <v-form ref="form">
        <v-row dense>
          
          <!-- ======================================================= -->
          <!-- DYNAMISCHE FELDER BASIEREND AUF SERVICE TYPE            -->
          <!-- ======================================================= -->

          <!-- 1. PARAFFIN SCHNITTE -->
          <template v-if="formData.serviceType === 'paraffin_sections'">
            <v-col cols="6"><v-text-field v-model.number="formData.sampleCount" label="P_Anz_Proben" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.slidesPerSample" label="P_Anz_OT_pro_Probe (ohne HE)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heRequestor" label="P_HE_Schnitte für Antragsteller" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heTissueBank" label="P_HE_Schnitte für Gewebebank" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveSlidesCases" label="P_Archiv_Anz_Schnittpräparate (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveBlocksCases" label="P_Archiv_Anz_Blöcke (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 2. PARAFFIN TUBE -->
          <template v-if="formData.serviceType === 'paraffin_tubes'">
            <v-col cols="6"><v-text-field v-model.number="formData.sampleCount" label="P_Anz_Proben" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.tubesPerSample" label="P_Anz_Tubes_pro_Probe" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.scrollsPerTubeCount" label="P_Röllchen pro Tube" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heRequestor" label="P_HE_Schnitte für Antragsteller" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heTissueBank" label="P_HE_Schnitte für Gewebebank" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveSlidesCases" label="P_Archiv_Anz_Schnittpräparate (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveBlocksCases" label="P_Archiv_Anz_Blöcke (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 3. PARAFFIN EINBETTUNG -->
          <template v-if="formData.serviceType === 'paraffin_embedding'">
            <v-col cols="12"><v-text-field v-model.number="formData.archiveBlocksCases" label="Anz_Einbettung" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 4. KRYO SCHNITTE -->
          <template v-if="formData.serviceType === 'cryo_sections'">
            <v-col cols="6"><v-text-field v-model.number="formData.sampleCount" label="K_Anz_Proben" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.slidesPerSample" label="K_Anz_OT_pro_Probe (ohne HE)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heRequestor" label="K_HE_Schnitte für Antragsteller" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heTissueBank" label="K_HE_Schnitte für Gewebebank" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model.number="formData.archiveSampleCases" label="K_Archiv_Anz_Proben (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 5. KRYO SERVICE -->
          <template v-if="formData.serviceType === 'cryo_service' || formData.serviceType === 'cryo_tubes'">
            <v-col cols="6"><v-text-field v-model.number="formData.sampleCount" label="K_Anz_Proben" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.tubesPerSample" label="K_Anz_Tubes_pro_Probe" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.scrollsPerTubeCount" label="K_Röllchen pro Tube (Anzahl)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.scrollsPerTubeWeight" label="K_Röllchen pro Tube (Gewicht)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heRequestor" label="K_HE_Schnitte für Antragsteller" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.heTissueBank" label="K_HE_Schnitte für Gewebebank" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model.number="formData.archiveSampleCases" label="K_Archiv_Anz_Proben (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 6. IHC -->
          <template v-if="formData.serviceType === 'ihc'">
            <v-col cols="6"><v-text-field v-model.number="formData.slideCount" label="IHC_Schnitte" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6">
              <v-select v-model="formData.stainingDevice" label="IHC_Färbegerät" :items="['Dako', 'Ventana', 'Bond', 'Manuell']" density="compact" variant="outlined"></v-select>
            </v-col>
          </template>

          <!-- 7. FÄRBUNG (Nur Bemerkung & Datum, siehe unten) -->

          <!-- 8. DNA/RNA EXTRAKTION -->
          <template v-if="formData.serviceType === 'dna_rna_extraction'">
            <v-col cols="12"><v-text-field v-model.number="formData.extractionCount" label="Anz_DNA_RNA_Extraktion" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 9. PATHOLOGISCHE BEURTEILUNG -->
          <template v-if="formData.serviceType === 'pathological_assessment'">
            <v-col cols="12"><v-text-field v-model.number="formData.assessmentCount" label="Anz_Pathol_Beurteilung" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 10. TMA ERSTELLUNG -->
          <template v-if="formData.serviceType === 'tma_creation'">
            <v-col cols="6"><v-text-field v-model="formData.tmaNumber" label="TMA_Nr" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.tmaHeCount" label="TMA_Anz_HE_Schnitte" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="formData.tmaDate" label="Datum" type="date" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.punchesPerBlock" label="TMA_Anz_Stanzen_pro_Bl" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="formData.blockNumbers" label="Blocknummern" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.patientCount" label="TMA_Anz_Patienten" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.excludedCount" label="Ausgeschieden" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 11. TMA SCHNITTE -->
          <template v-if="formData.serviceType === 'tma_sections'">
            <v-col cols="6"><v-text-field v-model="formData.tmaName" label="TMA_NAME" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="formData.tmaNumber" label="TMA_NR" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.blockCount" label="Anz_Bloecke" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.sectionsPerBlock" label="Anz_Schnitte_pro_Bloecke" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="formData.blockNumbers" label="Blocknummern" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- 12. VIRTUELLE MIKROSKOPIE -->
          <template v-if="formData.serviceType === 'virtual_microscopy'">
            <v-col cols="6"><v-text-field v-model.number="formData.archiveSlidesCases" label="P_Archiv_Anz_Schnittpräparate (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveBlocksCases" label="P_Anz_Blöcke (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model.number="formData.scanCount" label="Virtuelle_Mikroskopie (Anz. Scans)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-checkbox v-model="formData.isBrightfield" label="Hellfeld" density="compact" hide-details></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox v-model="formData.isFluorescence" label="Fluoreszenz" density="compact" hide-details></v-checkbox></v-col>
          </template>

          <!-- 13. ARCHIVARBEIT -->
          <template v-if="formData.serviceType === 'archival_work'">
            <v-col cols="6"><v-text-field v-model.number="formData.archiveSlidesCases" label="P_Archiv_Anz_Schnittpräparate (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="formData.archiveBlocksCases" label="P_Anz_Blöcke (Fälle)" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </template>

          <!-- ======================================================= -->
          <!-- ALLGEMEINE FELDER (Für fast alle sichtbar)              -->
          <!-- ======================================================= -->
          
          <v-col cols="12">
            <v-divider class="my-2"></v-divider>
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="formData.remarks" label="Bemerkung" rows="2" density="compact" variant="outlined"></v-textarea>
          </v-col>
          
          <v-col cols="12">
            <v-text-field v-model="deliveryDateInput" label="Abgabedatum" type="date" density="compact" variant="outlined"></v-text-field>
          </v-col>

        </v-row>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>
    
    <v-card-actions class="pa-4 bg-grey-lighten-5">
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="$emit('cancel')">Abbrechen</v-btn>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" @click="save">Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ProjectService } from '@/mocks/db';

const props = defineProps<{
  service: ProjectService;
  projectNumber: string;
  isFollowUp: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', service: ProjectService): void;
  (e: 'cancel'): void;
}>();

// Lokale Kopie der Daten
const formData = ref<any>({});

// Wenn eine neue Dienstleistung reinkommt, kopieren wir sie
watch(() => props.service, (newVal) => {
  formData.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true });

// Datumskonvertierung für Input
const deliveryDateInput = computed({
  get: () => formData.value.deliveryDate ? formData.value.deliveryDate.split('T')[0] : '',
  set: (val) => { formData.value.deliveryDate = val ? `${val}T00:00:00.000Z` : null; }
});

// Mapping für Titel
const labels: Record<string, string> = {
  paraffin_sections: 'Paraffin-Schnitte',
  paraffin_tubes: 'Paraffin-Tubes',
  paraffin_embedding: 'Paraffin-Einbettung',
  cryo_sections: 'Kryo-Schnitte',
  cryo_tubes: 'Kryo-Tubes',
  cryo_service: 'Kryoservice',
  ihc: 'IHC',
  staining: 'Färbung',
  dna_rna_extraction: 'DNA/RNA-Extraktion',
  pathological_assessment: 'Pathol. Beurteilung',
  tma_creation: 'TMA-Erstellung',
  tma_sections: 'TMA-Schnitte',
  virtual_microscopy: 'Virtuelle Mikroskopie',
  archival_work: 'Archivarbeit',
  data: 'Daten',
  ethics: 'Ethik'
};

function getLabel(type: string) { return labels[type] || type; }

function save() {
  // Sende die bearbeiteten Daten zurück
  emit('save', formData.value);
}
</script>