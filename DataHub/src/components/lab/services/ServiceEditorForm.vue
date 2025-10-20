<!-- src/components/lab/services/ServiceEditorForm.vue -->
<template>
  <v-card border min-height="400" class="d-flex flex-column">
    <v-fade-transition mode="out-in">

      <!-- ZUSTAND 1: Service-Katalog -->
      <div v-if="activeService && 'status' in activeService && activeService.status === 'selecting'" class="pa-4">
        <v-row dense>
          <template v-for="item in serviceCatalog" :key="item.type || item.title">
            <!-- Kategorien-Überschrift -->
            <v-col v-if="item.isHeader" cols="12" class="mt-4 mb-1">
              <v-divider></v-divider>
              <div class="text-overline text-medium-emphasis pa-1">{{ item.title }}</div>
            </v-col>
            <!-- Service-Karte -->
            <v-col v-else-if="item.type" cols="12" md="6">
                <v-card outlined hover @click="$emit('selectType', item.type)">
                <div class="d-flex align-center pa-3">
                  <v-icon size="x-large" color="primary" class="mr-4">{{ item.icon }}</v-icon>
                  <div>
                    <div class="font-weight-medium">{{ item.title }}</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </div>

      <!-- ZUSTAND 2: Dynamisches Formular -->
      <div v-else-if="activeService && 'serviceType' in activeService" class="d-flex flex-column flex-grow-1">
        <v-card-title>
          Service bearbeiten: <span class="font-weight-bold ml-2 text-primary">{{ activeService.serviceType }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="flex-grow-1" style="overflow-y: auto;">
          <!-- Gemeinsame Felder -->
          <v-textarea v-model="activeService.remarks" label="Bemerkung" rows="2" variant="outlined" class="mb-4"></v-textarea>
          <!-- ... (Hier könnten weitere gemeinsame Felder wie Abgabedatum hin) ... -->
          <v-divider class="my-6"></v-divider>
          
          <!-- Spezifische Felder -->
          <div v-if="activeService.serviceType === 'ihc'">
            <v-text-field v-model.number="activeService.slideCount" label="Anzahl IHC Schnitte" type="number" variant="outlined"></v-text-field>
            <v-select v-model="activeService.stainingDevice" label="Färbegerät" :items="ihcStainingDevices" variant="outlined" class="mt-4"></v-select>
          </div>
          <div v-if="activeService.serviceType === 'paraffin_sections'">
             <v-text-field v-model.number="activeService.sampleCount" label="Anzahl Proben" type="number" variant="outlined"></v-text-field>
             <v-text-field v-model.number="activeService.unstainedSectionsPerSample" label="OT pro Probe (ohne HE)" type="number" variant="outlined" class="mt-4"></v-text-field>
             <!-- Fügen Sie hier weitere Paraffin-Felder hinzu -->
          </div>
          <!-- ... Fügen Sie hier v-if Blöcke für JEDEN anderen Service-Typ mit Feldern hinzu ... -->
          <div v-if="activeService.serviceType === 'paraffin_embedding'">
            <v-text-field v-model.number="activeService.count" label="Anzahl Einbettungen" type="number" variant="outlined"></v-text-field>
          </div>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="$emit('cancel')">Abbrechen</v-btn>
          <v-btn variant="flat" color="primary" @click="$emit('save')">Speichern</v-btn>
        </v-card-actions>
      </div>
      
      <!-- ZUSTAND 3: Leerzustand -->
      <div v-else class="d-flex align-center justify-center flex-grow-1">
        <div class="text-center text-medium-emphasis">
          <v-icon size="x-large">mdi-arrow-left</v-icon>
          <p class="mt-2">Service aus der Liste auswählen<br>oder einen neuen erstellen.</p>
        </div>
      </div>
    </v-fade-transition>
  </v-card>
</template>

<script setup lang="ts">
import type { ProjectService } from '@/mocks/db';

defineProps<{
  activeService: ProjectService | { status: 'selecting' } | null;
}>();

defineEmits<{
  (e: 'selectType', type: string): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();

const ihcStainingDevices = ['Dako', 'Ventana', 'Sonstiges+AK', 'Sonstiges-AK', 'Bond', 'ARTISAN'];

const serviceCatalog = [
  { isHeader: true, title: 'Gewebeverarbeitung' },
  { type: 'paraffin_sections', icon: 'mdi-layers-outline', title: 'Paraffin-Schnitte' },
  { type: 'paraffin_tubes', icon: 'mdi-test-tube', title: 'Paraffin-Tubes' },
  { type: 'paraffin_embedding', icon: 'mdi-archive-outline', title: 'Paraffin-Einbettung' },
  { type: 'cryo_sections', icon: 'mdi-snowflake-thermometer', title: 'Kryo-Schnitte' },
  { type: 'cryo_tubes', icon: 'mdi-snowflake-melt', title: 'Kryo-Tubes' },
  { type: 'cryo_service', icon: 'mdi-snowflake-alert', title: 'Kryoservice' },
  
  { isHeader: true, title: 'Spezial-Analyse & Färbung' },
  { type: 'ihc', icon: 'mdi-eyedropper-variant', title: 'IHC' },
  { type: 'staining', icon: 'mdi-brush', title: 'Färbung (Allgemein)' },
  { type: 'dna_rna_extraction', icon: 'mdi-dna', title: 'DNA/RNA-Extraktion' },
  { type: 'pathological_assessment', icon: 'mdi-clipboard-text-search-outline', title: 'Pathologische Beurteilung' },

  { isHeader: true, title: 'Tissue Microarray (TMA)' },
  { type: 'tma_creation', icon: 'mdi-dots-grid', title: 'TMA-Erstellung' },
  { type: 'tma_sections', icon: 'mdi-grid', title: 'TMA-Schnitte' },

  { isHeader: true, title: 'Digitale Pathologie & Archiv' },
  { type: 'virtual_microscopy', icon: 'mdi-scanner', title: 'Virtuelle Mikroskopie' },
  { type: 'archival_work', icon: 'mdi-archive-search-outline', title: 'Archivarbeit' },

  { isHeader: true, title: 'Allgemein & Administrativ' },
  { type: 'data', icon: 'mdi-database-cog-outline', title: 'Daten' },
  { type: 'ethics', icon: 'mdi-gavel', title: 'Ethik' },
];
</script>