<template>
  <div>
    <h1 class="text-h4 font-weight-regular mb-2">Projektsuche</h1>
    <p class="text-medium-emphasis mb-6">
      Geben Sie Suchbegriffe ein oder klappen Sie die erweiterten Optionen für weitere Filter auf.
    </p>

    <!-- Die neue "Kommandozentrale" als einzelne Karte -->
    <v-card border>
      <v-form @submit.prevent="handleSearch">
        
        <!-- ===================================== -->
        <!-- Sektion 1: Haupt-Filter (Die Toolbar) -->
        <!-- ===================================== -->
        <v-card-text>
          <v-row>
            <!-- Suchbares Dropdown für Mitarbeiter -->
            <v-col cols="12" sm="6" md="4">
              <v-autocomplete
                v-model="filters.technicalAssistantId"
                :items="projectStore.searchOptions.technicalAssistants"
                item-title="fullName"
                item-value="id"
                label="Mitarbeiter"
                placeholder="Namen tippen..."
                clearable
                density="compact"
                variant="outlined"
              ></v-autocomplete>
            </v-col>

            <!-- Suchbares Dropdown für Ärzte -->
            <v-col cols="12" sm="6" md="4">
              <v-autocomplete
                v-model="filters.cooperationPartnerId"
                :items="projectStore.searchOptions.cooperationPartners"
                item-title="fullName"
                item-value="id"
                label="Arzt / Partner"
                placeholder="Namen tippen..."
                clearable
                density="compact"
                variant="outlined"
              ></v-autocomplete>
            </v-col>

            <!-- Suchbares Dropdown für Status -->
            <v-col cols="12" sm="6" md="4">
              <v-autocomplete
                v-model="filters.status"
                :items="projectStore.searchOptions.statuses"
                item-title="title"
                item-value="value"
                label="Projektstatus"
                clearable
                density="compact"
                variant="outlined"
              ></v-autocomplete>
            </v-col>
            
            <!-- Dropdown für Projekttyp (jetzt in der Hauptleiste) -->
            <v-col cols="12" sm="6" md="8">
              <v-autocomplete
                v-model="filters.projectType"
                :items="projectStore.searchOptions.projectTypes"
                item-title="title"
                item-value="value"
                label="Projekttyp"
                clearable
                density="compact"
                variant="outlined"
              ></v-autocomplete>
            </v-col>
            
            <!-- Textfeld für Projektnummer -->
            <v-col cols="12" sm="12" md="4">
              <v-text-field
                v-model="filters.projectNumber"
                label="Projektnummer"
                placeholder="z.B. j123"
                clearable
                density="compact"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Sekundäre Optionen (Checkboxen) -->
          <v-divider class="my-4"></v-divider>
          <p class="text-caption text-medium-emphasis mb-1">Weitere Optionen:</p>
          <div class="d-flex flex-wrap ga-x-6">
            <v-checkbox v-model="filters.finalCheck" label="Abschlusskontrolle" density="compact" hide-details></v-checkbox>
            <v-checkbox v-model="filters.isLongTermProject" label="Langzeitprojekt" density="compact" hide-details></v-checkbox>
            <v-checkbox v-model="filters.isSfb118Project" label="SFB1118-Projekt" density="compact" hide-details></v-checkbox>
          </div>
        </v-card-text>

        <!-- ===================================== -->
        <!-- Sektion 3: Aktionen                 -->
        <!-- ===================================== -->
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-btn :to="{ name: 'LabProjectCreate' }" variant="text" prepend-icon="mdi-plus">
            Neues Projekt anlegen
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="resetFilters" variant="text">
            Filter zurücksetzen
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            variant="flat"
            size="large"
            prepend-icon="mdi-magnify"
            :loading="isLoading"
            min-width="180"
          >
            Suchen
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { LocationQueryRaw } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';

const projectStore = useProjectStore();
const router = useRouter();

// Alle Filter leben jetzt an einem einzigen Ort.
const getInitialFilters = () => ({
  technicalAssistantId: null,
  cooperationPartnerId: null,
  status: null,
  projectNumber: '',
  projectType: null,
  finalCheck: false,
  isLongTermProject: false,
  isSfb118Project: false,
});

const filters = ref(getInitialFilters());
const isLoading = computed(() => projectStore.isLoading);

onMounted(() => {
  projectStore.fetchSearchOptions();
});

async function handleSearch() {
  // 1. Übersetze den Projekttyp in die booleanschen Flags
  const searchPayload: any = { ...filters.value };
  if (searchPayload.projectType) {
    ['isNctTbb', 'isPccc', 'isDzif', 'isCmcp'].forEach(flag => searchPayload[flag] = false);
    searchPayload[searchPayload.projectType] = true;
  }
  delete searchPayload.projectType;

  // 2. Rufe die Store Action auf
  await projectStore.searchProjects(searchPayload);

  // 3. Bereite die URL-Parameter vor und navigiere
  const queryParams: LocationQueryRaw = {};
  for (const [key, value] of Object.entries(searchPayload)) {
    if (value) { // "truthy"-Check ist hier ausreichend und robust
      queryParams[key] = String(value);
    }
  }
  router.push({ name: 'LabProjectList', query: queryParams });
}

function resetFilters() {
  filters.value = getInitialFilters();
}
</script>