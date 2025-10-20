// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// KORREKTUR 1: Importieren Sie 'createPinia' direkt aus der Pinia-Bibliothek
import { createPinia } from 'pinia';

// Vuetify-spezifische Imports
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Für die Icons

// Erstellen Sie eine Vuetify-Instanz mit allen Komponenten
const vuetify = createVuetify({
  components,
  directives,
});

// Erstellen Sie die Haupt-Vue-App-Instanz
const app = createApp(App);

// KORREKTUR 2: Erstellen Sie die Pinia-Instanz direkt hier
const pinia = createPinia();

// Verwenden Sie die Plugins in der richtigen Reihenfolge
app.use(pinia); // Pinia zuerst, damit Stores in Komponenten/Routen verfügbar sind
app.use(router);
app.use(vuetify);

// Mounten Sie die App an das DOM
app.mount('#app');