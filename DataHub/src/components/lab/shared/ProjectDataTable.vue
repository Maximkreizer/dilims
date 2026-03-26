<!-- src/components/lab/shared/ProjectDataTable.vue -->
 <!--  * UI-Komponente zur tabellarischen Darstellung von Suchergebnissen.
 * 
 * Funktionalität:
 * - Wrappt eine v-data-table mit vordefinierten Spalten für Projekte.
 * - Zeigt Meta-Informationen (Trefferanzahl) im Header.
 * - Normalisiert das 'click:row'-Event der Tabelle und emittet das 
 *   ausgewählte Datenobjekt ('select') an den Parent.
  -->
<template>
  <v-card border>
    <v-card-title class="d-flex align-center">
      <span class="text-subtitle-1 font-weight-medium">Suchergebnisse</span>
      <v-chip size="small" color="primary" class="ml-auto">{{ items.length }} Treffer</v-chip>
    </v-card-title>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      density="compact"
      hover
      @click:row="handleRowClick"
    >
      <template #loading>
        <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import type { Project } from '@/mocks/db';

defineProps<{
  items: Project[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', project: Project): void;
}>();

const headers = [
  { title: 'Projekt-Nr.', key: 'ProjektNr', width: '150px' },
  { title: 'Aufgabe', key: 'Aufgaben' },
  { title: 'Status', key: 'Bearbeitung', width: '150px' },
];

/**
 * KORREKTUR: Wir definieren hier eine typsichere Funktion, um den Klick-Event zu behandeln.
 * Die v-data-table sendet zwei Argumente: das DOM-Event und ein Objekt, das das Item enthält.
 * Wir sagen TypeScript, dass 'payload.item' vom Typ 'Project' ist.
 */
function handleRowClick(event: Event, payload: { item: Project }) {
  // Wir rufen die alte onRowClick-Logik auf, aber jetzt mit einem typsicheren 'item'.
  emit('select', payload.item);
}
</script>