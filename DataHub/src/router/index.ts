// DATEI: src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  // 1. Dashboard (Startseite) - Lädt Dashboard.vue (Nur 2 Kacheln)
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue') 
  },

  // 2. Dienstleistungen (Service Context)
  {
    path: '/services',
    // Hier gruppieren wir die Routen für Dienstleistungen
    children: [
      {
        path: '', 
        redirect: { name: 'ServiceSearch' }
      },
      {
        // Die Such-Seite
        path: 'search', 
        name: 'ServiceSearch',
        component: () => import('@/pages/lab/ProjectSearchView.vue') 
      },
      {
        // Der Editor (Bearbeiten)
        // Hier ist der Name "ServiceProjectEdit", den die Fehlermeldung vermisst hat!
        path: 'project/:projectId',
        name: 'ServiceProjectEdit',
        component: () => import('@/pages/lab/ProjectEditorView.vue'),
        props: true
      }
    ]
  },

  // 3. Antikörper (Antibody Context)
  {
    path: '/antibodies',
    name: 'Antibodies',
    component: () => import('@/pages/Antibodies.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;