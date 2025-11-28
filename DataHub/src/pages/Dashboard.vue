<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <div class="d-flex flex-wrap justify-center ga-8">
      
      <!-- KACHEL 1: Dienstleistungen -->
      <v-card 
        width="240" height="240" 
        elevation="2" hover 
        class="d-flex flex-column align-center justify-center text-center cursor-pointer"
        @click="openServiceContext"
      >
        <v-icon size="80" color="primary" class="mb-4">mdi-beaker-check-outline</v-icon>
        <div class="text-h6 font-weight-bold text-grey-darken-2">Dienstleistungen</div>
        <div class="text-caption text-grey mt-1">Projekte & Analysen</div>
      </v-card>

      <!-- KACHEL 2: Antikörper -->
      <v-card 
        width="240" height="240" 
        elevation="2" hover 
        class="d-flex flex-column align-center justify-center text-center cursor-pointer"
        @click="openAntibodyContext"
      >
        <v-icon size="80" color="teal" class="mb-4">mdi-molecule</v-icon>
        <div class="text-h6 font-weight-bold text-grey-darken-2">Antikörper</div>
        <div class="text-caption text-grey mt-1">Verwaltung & Lots</div>
      </v-card>

    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigationStore';

const router = useRouter();
const navStore = useNavigationStore();

// Beim Laden des Dashboards setzen wir das Layout zurück
// (Standard-Icon, keine Breadcrumbs außer 'Navigation')
onMounted(() => {
  navStore.setContext(
    'mdi-monitor-dashboard', 
    [{ title: 'Navigation', disabled: true }]
  );
});

function openServiceContext() {
  // Leitet weiter zur Projektsuche im Bereich Dienstleistungen
  router.push('/services/search');
}

function openAntibodyContext() {
  // Leitet weiter zum Bereich Antikörper
  router.push('/antibodies');
}
</script>