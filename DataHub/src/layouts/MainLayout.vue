<!-- DATEI: src/layouts/MainLayout.vue -->
<template>
  <v-app>
    <!-- ===================================== -->
    <!-- LINKS: Sidebar (Tab-Liste)            -->
    <!-- ===================================== -->
    <v-navigation-drawer rail permanent class="didata-sidebar">
      <div class="d-flex flex-column align-center py-4 fill-height">
        
        <!-- SCHLEIFE: Alle offenen Tabs -->
        <div v-for="(tab, index) in state.nav.tabs" :key="tab.id" class="mb-3">
          <v-tooltip :text="`Tab ${index + 1}`" location="end">
            <template v-slot:activator="{ props }">
              <v-card
                v-bind="props"
                :color="state.nav.activeTabId === tab.id ? 'primary' : 'white'"
                :variant="state.nav.activeTabId === tab.id ? 'flat' : 'outlined'"
                class="d-flex align-center justify-center rounded-lg transition-swing"
                :class="state.nav.activeTabId === tab.id ? 'elevation-4' : 'elevation-0 opacity-70'"
                width="48"
                height="48"
                link
                @click="state.nav.switchTab(tab.id)"
              >
                <v-icon :color="state.nav.activeTabId === tab.id ? 'white' : 'grey-darken-1'">
                  {{ tab.icon }}
                </v-icon>
              </v-card>
            </template>
          </v-tooltip>
        </div>

        <!-- PLUS BUTTON: Neuer Tab (Max 8) -->
        <v-fade-transition>
          <v-btn 
            v-if="state.nav.tabs.length < 8"
            icon="mdi-plus" 
            variant="text" 
            color="grey-darken-2"
            size="large"
            @click="state.nav.addTab()"
          >
            <v-icon size="28">mdi-plus</v-icon>
            <v-tooltip activator="parent" location="end">Neuen Tab öffnen</v-tooltip>
          </v-btn>
        </v-fade-transition>
        
        <v-spacer></v-spacer>
        
      </div>
    </v-navigation-drawer>

    <!-- ===================================== -->
    <!-- OBEN: Header                          -->
    <!-- ===================================== -->
    <v-app-bar flat border="b" height="64" color="white" class="primary-action-bar">
      <div class="d-flex align-center px-4 cursor-pointer" style="min-width: 200px;" @click="push({name: 'Dashboard'})">
        <v-icon color="primary" class="mr-2">mdi-flask-outline</v-icon>
        <span class="font-weight-bold text-h6 text-grey-darken-3">LAB<span class="text-primary">OS</span></span>
      </div>

      <v-divider vertical inset></v-divider>

      <!-- Breadcrumbs aus dem Store -->
      <v-breadcrumbs :items="(state.nav.tabs.find(t => t.id === state.nav.activeTabId)?.breadcrumbs || [])" class="px-4">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right"></v-icon>
        </template>
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :to="item.to" :disabled="item.disabled" link>
            {{ item.title }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <!-- Action Buttons -->
      <div class="d-flex align-center px-4 ga-2">
        <v-btn 
          v-if="(state.nav.tabs.find(t => t.id === state.nav.activeTabId)?.showNewButton || false)"
          prepend-icon="mdi-plus" 
          variant="tonal" 
          color="primary"
          @click="handleNewClick"
        >
          Neu
        </v-btn>

        <v-divider vertical class="mx-2" style="height: 24px"></v-divider>

        <v-btn icon variant="text" color="grey-darken-2" @click="back()" :disabled="isDashboard">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-btn 
          icon 
          variant="text" 
          color="error" 
          @click="state.nav.closeTab(state.nav.activeTabId)"
        >
          <v-icon>mdi-close-box-outline</v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{ state.nav.tabs.length === 1 ? 'Zurück zum Dashboard' : 'Tab schließen' }}
          </v-tooltip>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- ===================================== -->
    <!-- MITTE: Content                        -->
    <!-- ===================================== -->
    <v-main class="bg-grey-lighten-5" style="height: 100vh; overflow: auto;">  
    <component :is="views[state.currentView.name]" v-bind="state.currentView.params" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { push, back, state, views } from '@/state';





const isDashboard = computed(() => state.currentView.name === 'Dashboard');

// WICHTIG: Wenn sich die URL ändert (User klickt irgendwo),
// speichern wir den Pfad im aktuellen Tab.
watch(
  () => state.currentView,
  (newView) => {
    state.nav.updateActiveTabPath(newView.name, newView.params);
  },
  { deep: true }
);

function handleNewClick() {
  if (state.nav.onNewButtonClick) {
    state.nav.onNewButtonClick();
  }
}
</script>

<style scoped>
.v-navigation-drawer__content {
  overflow-y: hidden; 
}
/* Kleine Animation beim Tab-Wechsel */
.transition-swing {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-70:hover {
  opacity: 1;
}
</style>