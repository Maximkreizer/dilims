import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Alle Seiten werden jetzt "lazy" geladen. Das verbessert die Performance,
// da der Code für eine Seite erst dann heruntergeladen wird, wenn sie besucht wird.

const routes: Array<RouteRecordRaw> = [
  // --- Standard-Routen (auf Lazy Loading umgestellt) ---
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/Search.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/pages/Services.vue')
  },
  {
    path: '/antibodies',
    name: 'Antibodies',
    component: () => import('@/pages/Antibodies.vue')
  },

  // =========================================================================
  // NEU: Der gesamte Labor-Workflow als verschachtelte Route
  // =========================================================================
  {
    path: '/lab',
    // Alle Kind-Routen werden innerhalb des LabLayout.vue gerendert
    component: () => import('@/layouts/LabLayout.vue'),
    children: [
      {
        // Das ist die "Navigation"-Seite zum Suchen von Projekten
        // URL: /lab/search
        path: 'search',
        name: 'LabProjectSearch',
        component: () => import('@/pages/lab/ProjectSearchView.vue'),
      },
      {
        // Diese Route fängt die Ergebnisse der Suche ab
        path: 'projects',
        name: 'LabProjectList', // <-- Der Name, den der Router gesucht hat
        component: () => import('@/pages/lab/ProjectEditorView.vue'),
        props: route => ({ query: route.query })
      },
      {
        // Die "Labor_Projekterfassung" für ein NEUES Projekt
        // URL: /lab/project/new
        path: 'project/new',
        name: 'LabProjectCreate',
        component: () => import('@/pages/lab/ProjectEditorView.vue'),
      },
      {
        // Die "Labor_Projekterfassung" zum Bearbeiten eines BESTEHENDEN Projekts
        // URL: /lab/project/42
        path: 'project/:projectId',
        name: 'LabProjectEdit',
        component: () => import('@/pages/lab/ProjectEditorView.vue'),
        props: true, // Übergibt 'projectId' als Prop an die Komponente
      },
      {
        // Das "Labor_Dienstleistungserfassung"-Fenster für ein bestimmtes Projekt
        // URL: /lab/project/42/services
        path: 'project/:projectId/services',
        name: 'LabProjectServices',
        component: () => import('@/pages/lab/ProjectServicesView.vue'),
        props: true, // Übergibt 'projectId' als Prop
      },
      // Ein Redirect sorgt dafür, dass Nutzer, die nur /lab aufrufen,
      // direkt zur Suchseite weitergeleitet werden.
      {
        path: '',
        redirect: { name: 'LabProjectSearch' }
      }
    ]
  }
];

const router = createRouter({
  // process.env.BASE_URL ist der Standardweg in Vue-Projekten, um die Basis-URL zu setzen.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;