<template>
  <v-form ref="form">
    
    <!-- 1. ALLGEMEIN -->
    <v-card border flat class="mb-4">
      <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2">Allgemein</v-card-title>
      <v-card-text class="pt-4">
        <v-row dense>
          <v-col cols="12" md="3"><v-text-field v-model="formData.projectNumber" label="Projekt" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="formData.runId" label="Lauf n berechnen (ID)" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="3"><v-select v-model="formData.technicalAssistantId" label="TA" :items="assistantOptions" item-title="fullName" item-value="id" density="compact" variant="outlined"></v-select></v-col>
          <v-col cols="12" md="3"><v-select v-model="formData.stainingType" label="Färb.-Typ" :items="['IHC', 'HE', 'Spezial']" density="compact" variant="outlined"></v-select></v-col>
          
          <v-col cols="12" md="3"><v-text-field v-model="dateInput" type="date" label="Datum" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="formData.device" label="Gerät" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="formData.kit" label="KIT" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="formData.cutCount" label="Anzahl Schnitte" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          
          <v-col cols="12" md="6"><v-text-field v-model="formData.tissue" label="Gewebe" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="formData.material" label="Material" density="compact" variant="outlined"></v-text-field></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 2. VORBEHANDLUNG -->
    <v-card border flat class="mb-4">
      <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2">Vorbehandlung</v-card-title>
      <v-card-text class="pt-4">
        <v-row dense>
          <v-col cols="12" md="4"><v-text-field v-model="formData.pretreatDemasking" label="Demaskierung" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.pretreatReagent" label="Reagenz" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.pretreatTime" label="Vorbehandlungszeit" density="compact" variant="outlined"></v-text-field></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 3. BLOCKING (DAKO & VENTANA) -->
    <v-row dense class="mb-4">
      <v-col cols="12" md="6">
        <v-card border flat class="h-100">
          <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2">DAKO-Blocking Schritte</v-card-title>
          <v-card-text class="pt-2">
            <v-checkbox v-model="formData.blockH2O2" label="BL_H2O2" density="compact" hide-details></v-checkbox>
            <v-checkbox v-model="formData.blockAvidinBiotin" label="BL_AVIDIN_BIOTIN" density="compact" hide-details></v-checkbox>
            <v-checkbox v-model="formData.blockBsaNgs" label="BL_BSA_NGS" density="compact" hide-details></v-checkbox>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card border flat class="h-100">
          <v-card-title class="text-subtitle-2 font-weight-bold bg-grey-lighten-4 py-2">VENTANA-OptiView</v-card-title>
          <v-card-text class="pt-4">
            <v-text-field v-model="formData.ventanaHqLinkerTime" label="HQ_LINKER_ZEIT" density="compact" variant="outlined"></v-text-field>
            <v-text-field v-model="formData.ventanaHqMultiTime" label="HQ_MULTI_ZEIT" density="compact" variant="outlined"></v-text-field>
            <v-checkbox v-model="formData.ventanaPeroxidaseInhibitor" label="PEROXIDASE HEMMER" density="compact" hide-details></v-checkbox>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 4. FÄRBUNG 1 -->
    <v-card border flat class="mb-4 border-primary" style="border-width: 1px;">
      <v-card-title class="text-subtitle-2 font-weight-bold bg-blue-grey-lighten-5 py-2 text-primary">1. Färbung</v-card-title>
      <v-card-text class="pt-4">
        <!-- Primär AK -->
        <div class="text-caption font-weight-bold text-grey-darken-1 mb-2">Primär-Antikörper</div>
        <v-row dense>
          <v-col cols="6" md="2"><v-text-field v-model="formData.primaryAkLotId" label="PRI_AK_LOT_ID" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.primaryAkId" label="P_AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.primaryAkName" label="PRI_AK_NAME" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.primaryDilution" label="PRI_VERDÜNNUNG" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.primaryIncubationTime" label="PRI_INKUBATIONSZEIT" density="compact" variant="outlined"></v-text-field></v-col>
        </v-row>
        
        <v-divider class="my-3"></v-divider>

        <!-- Sekundär AK -->
        <div class="text-caption font-weight-bold text-grey-darken-1 mb-2">Sekundär-Antikörper</div>
        <v-row dense>
          <v-col cols="6" md="2"><v-text-field v-model="formData.secondaryAkLotId" label="SEK_AK_LOT_ID" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.secondaryAkId" label="S_AK_ID" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="formData.secondaryAkName" label="SEK_AK_NAME" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.secondaryDilution" label="SEK_VERDÜNNUNG" density="compact" variant="outlined"></v-text-field></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="formData.secondaryIncubationTime" label="SEK_INKUBATIONSZEIT" density="compact" variant="outlined"></v-text-field></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 5. FÄRBUNG 2 (Optional / Aufklappbar) -->
    <v-expansion-panels variant="accordion" class="mb-4">
      <v-expansion-panel elevation="0" style="border: 1px solid #e0e0e0;">
        <v-expansion-panel-title class="text-subtitle-2 font-weight-bold">
          2. Färbung (Doppelfärbung)
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pt-4">
          <!-- Kopie der Struktur von Färbung 1, gemappt auf andere Variablen (simuliert) -->
          <!-- In einer echten App würden hier formData.secondRun... Felder stehen -->
          <div class="text-center text-grey">Struktur identisch zu 1. Färbung (Felder müssen im Interface ergänzt werden)</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-textarea v-model="formData.remarks" label="Bemerkung" variant="outlined" rows="3"></v-textarea>

  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { StainingRun } from '@/mocks/db';

const props = defineProps<{
  data: StainingRun | null;
  assistantOptions: any[];
}>();

const emit = defineEmits<{
  (e: 'update', data: StainingRun): void;
}>();

const formData = ref<any>({});

watch(() => props.data, (newVal) => {
  if (newVal) {
    formData.value = JSON.parse(JSON.stringify(newVal));
  }
}, { immediate: true });

watch(formData, (newVal) => {
  emit('update', newVal);
}, { deep: true });

const dateInput = computed({
  get: () => formData.value.date ? formData.value.date.split('T')[0] : '',
  set: (val) => { formData.value.date = val ? val : null; }
});
</script>