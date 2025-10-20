// vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify'; // WICHTIG: Dieser Import muss da sein
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // HIER IST DIE MAGIE: Das Vuetify-Plugin wird aktiviert
    // autoImport: true sorgt dafür, dass Komponenten wie v-row automatisch erkannt werden.
    vuetify({
      autoImport: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});