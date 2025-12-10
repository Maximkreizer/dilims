import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Definition der Routen
const routes: Array<RouteRecordRaw> = [
  // 1. DASHBOARD (Startseite)
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue')
  },

  // 2. DIENSTLEISTUNGEN
  {
    path: '/services',
    // Hinweis: Wenn hier kein 'component' steht, rendert Vue Router die Kinder direkt in das <router-view> der App/MainLayout
    children: [
      {
        path: '',
        redirect: { name: 'ServiceSearch' }
      },
      {
        path: 'search',
        name: 'ServiceSearch',
        component: () => import('@/pages/lab/ProjectSearchView.vue')
      },
      {
        path: 'project/:projectId',
        name: 'ServiceProjectEdit',
        component: () => import('@/pages/lab/ProjectEditorView.vue'),
        props: true
      },
      {
        path: 'project/:projectId/services',
        name: 'ServiceProjectServices',
        component: () => import('@/pages/lab/ProjectServicesView.vue'),
        props: true
      }
    ]
  },

  // 3. ANTIKÖRPER
  {
    path: '/antibodies',
    children: [
      {
        // Das Dashboard für Antikörper (Suche, Tabs etc.)
        path: '',
        name: 'AntibodyDashboard',
        component: () => import('@/pages/Antibodies.vue')
      },
      {
        // Der Editor für Färbeverläufe
        path: 'run/:id',
        name: 'StainingRunEditor',
        component: () => import('@/pages/antibodies/StainingRunEditorView.vue'),
        props: true
      }
      // Hier können später weitere Editoren folgen (z.B. Lots, Orders)
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;