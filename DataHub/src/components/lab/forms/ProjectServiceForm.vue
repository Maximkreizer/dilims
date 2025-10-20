<template>
  <v-card border variant="tonal">
    <v-card-text class="text-center">
      <v-icon size="x-large" class="mb-2">mdi-toolbox-outline</v-icon>
      <h3 class="text-h6">Platzhalter: Dienstleistungs-Formular</h3>
      <p class="text-medium-emphasis mt-1">
        Hier wird in einem zukünftigen Sprint das Formular zur Erfassung und Bearbeitung
        von projektspezifischen Dienstleistungen implementiert.
      </p>
      <p class="text-medium-emphasis font-italic mt-4">
        (Komponente: src/components/lab/forms/ProjectServiceForm.vue)
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
// In der aktuellen Phase (Sprint 1) ist hier keine Logik erforderlich.

// Für die Zukunft: Diese Komponente wird Props empfangen (z.B. die Projekt-ID)
// und Events senden (z.B. @save), aber sie wird keine direkte
// Verbindung zum Store oder Router haben.
//
// defineProps<{ projectId: number }>();
// defineEmits<{ (e: 'save', serviceData: any): void }>();
</script>