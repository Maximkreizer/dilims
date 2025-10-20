<template>
  <!-- 
    Wir verwenden eine v-card mit einer Mindesthöhe, um das Gefühl einer
    eigenständigen "Arbeitsfläche" oder eines "Fensters" zu erzeugen.
  -->
  <v-card
    elevation="2"
    class="mx-auto"
    style="min-height: 85vh; display: flex; flex-direction: column;"
  >
    <!-- ======================================================= -->
    <!-- 1. HEADER: Konsistente Kopfzeile für den Labor-Workflow -->
    <!-- ======================================================= -->
    <div class="layout-header">
      <v-icon size="large" color="primary" class="mr-3">mdi-test-tube</v-icon>
      <h1 class="text-h5 font-weight-medium">Labor-Workflow</h1>
    </div>
    <v-divider></v-divider>

    <!-- ======================================================= -->
    <!-- 2. CONTENT: Hier werden die Seiten ausgetauscht       -->
    <!-- ======================================================= -->
    <v-card-text style="flex-grow: 1;">
      <!-- 
        Das ist der dynamische Bereich. Vue Router wird hier
        ProjectSearchView, ProjectEditorView etc. einfügen.
        Die Transition sorgt für einen weichen Übergang.
      -->
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-card-text>

    <v-divider></v-divider>

    <!-- ======================================================= -->
    <!-- 3. FOOTER: Persistente Aktionen für den Workflow       -->
    <!-- ======================================================= -->
    <v-card-actions class="pa-4">
      <!-- 
        Der von Ihnen gewünschte "Schließknopf".
        Er navigiert den Benutzer zurück zur Haupt-Startseite.
      -->
      <v-btn
        variant="text"
        prepend-icon="mdi-close"
        @click="closeWorkflow"
      >
        Workflow schließen
      </v-btn>

      <!-- 
        v-spacer schiebt alle nachfolgenden Elemente
        an das rechte Ende der Actions-Leiste.
      -->
      <v-spacer></v-spacer>

      <!-- Hier könnten zukünftig weitere Buttons platziert werden,
          z.B. ein "Hilfe"-Button. -->
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// Wir benötigen den Router, um die Navigation programmgesteuert auszulösen.
const router = useRouter();

/**
 * Navigiert den Benutzer aus dem Labor-Workflow zurück
 * zur Startseite der gesamten Anwendung.
 */
function closeWorkflow() {
  router.push('/'); // Annahme: '/' ist Ihre Haupt-Startseite/Dashboard
}
</script>

<style scoped>
.layout-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: rgba(0, 0, 0, 0.02); /* Sehr dezenter Hintergrund */
}
</style>