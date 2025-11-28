<!--
Startseite / Dashboard der Anwendung.

Funktionalität:
- Zeigt eine zentrierte Auswahl an großen Navigations-Kacheln (Tiles).
- Iteriert über ein Konfigurations-Array, um Route und Icon pro Kachel zu rendern.
- Leitet den Nutzer per Vue Router zum gewählten Modul (Suche, Labor, Antikörper).
-->

<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh; padding: 0;">
    <v-row class="d-flex flex-row justify-center align-center" style="margin: 0;" no-gutters>
      <v-col
        v-for="tile in tiles"
        :key="tile.route"
        >
        <v-btn class="nav-tile" @click="goTo(tile.route)">
          <v-icon size="72" class="petrol">{{ tile.icon }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// Der Typ bleibt derselbe
type Tile = { route: string; icon: string; aria: string };

// useRouter wird direkt aufgerufen
const router = useRouter();

// Die Daten sind direkt verfügbar
const tiles: Tile[] = [
  { route: '/search',     icon: 'mdi-magnify',     aria: 'Suche öffnen' },
  { route: '/lab',   icon: 'mdi-beaker-check-outline', aria: 'Dienstleistungen öffnen' },
  { route: '/antibodies', icon: 'mdi-molecule',   aria: 'Antikörper öffnen' },
];

// Die Funktion ist direkt verfügbar
const goTo = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
.nav-tile {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  padding: 0;
}
.nav-tile:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.14);
}
.petrol {
  color: #0e6f6f;
}
</style>
