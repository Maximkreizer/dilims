import { reactive, ref, shallowRef, markRaw } from 'vue';
import { api } from '@/services/api';
import type { Project, ProjectService } from '@/mocks/db';

import Dashboard from '@/pages/Dashboard.vue';
import ProjectSearchView from '@/pages/lab/ProjectSearchView.vue';
import ProjectEditorView from '@/pages/lab/ProjectEditorView.vue';
import ProjectServicesView from '@/pages/lab/ProjectServicesView.vue';
import Antibodies from '@/pages/Antibodies.vue';
import StainingRunEditorView from '@/pages/antibodies/StainingRunEditorView.vue';

export const views: Record<string, any> = {
  Dashboard: markRaw(Dashboard),
  ServiceSearch: markRaw(ProjectSearchView),
  ServiceProjectEdit: markRaw(ProjectEditorView),
  ServiceProjectServices: markRaw(ProjectServicesView),
  AntibodyDashboard: markRaw(Antibodies),
  StainingRunEditor: markRaw(StainingRunEditorView)
};

export const state = reactive({
  currentView: { name: 'Dashboard', params: {} as Record<string, any> },
  
  nav: {
    tabs: [
      {
        id: 'tab-1',
        icon: 'mdi-monitor-dashboard',
        viewName: 'Dashboard',
        params: {},
        breadcrumbs: [{ title: 'Navigation', disabled: true }],
        showNewButton: false
      }
    ],
    activeTabId: 'tab-1',
    onNewButtonClick: null as (() => void) | null,
    
    switchTab(id: string) {
      const tab = state.nav.tabs.find(t => t.id === id);
      if (tab) {
        state.nav.activeTabId = id;
        state.nav.onNewButtonClick = null;
        state.currentView = { name: tab.viewName, params: tab.params };
      }
    },
    closeTab(id: string) {
      const index = state.nav.tabs.findIndex(t => t.id === id);
      if (index === -1) return;
      if (state.nav.tabs.length === 1) {
        const t = state.nav.tabs[0];
        t.viewName = 'Dashboard';
        t.params = {};
        t.icon = 'mdi-monitor-dashboard';
        t.breadcrumbs = [{ title: 'Navigation', disabled: true }];
        t.showNewButton = false;
        state.currentView = { name: 'Dashboard', params: {} };
        return;
      }
      state.nav.tabs.splice(index, 1);
      if (id === state.nav.activeTabId) {
        const newIndex = Math.max(0, index - 1);
        const newTab = state.nav.tabs[newIndex];
        if (newTab) state.nav.switchTab(newTab.id);
      }
    },
    addTab(viewName: string = 'Dashboard', params: any = {}) {
      if (state.nav.tabs.length >= 8) return;
      const newId = `tab-${Date.now()}`;
      const initialIcon = viewName !== 'Dashboard' ? 'mdi-loading' : 'mdi-monitor-dashboard';
      state.nav.tabs.push({
        id: newId,
        icon: initialIcon,
        viewName,
        params,
        breadcrumbs: [{ title: 'Laden...', disabled: true }],
        showNewButton: false
      });
      state.nav.switchTab(newId);
    },
    setContext(icon: string, crumbs: any[], enableNewBtn = false) {
      const tab = state.nav.tabs.find(t => t.id === state.nav.activeTabId);
      if (tab) {
        tab.icon = icon;
        tab.breadcrumbs = crumbs;
        tab.showNewButton = enableNewBtn;
        state.nav.onNewButtonClick = null;
      }
    },
    updateActiveTabPath(viewName: string, params: any) {
      const tab = state.nav.tabs.find(t => t.id === state.nav.activeTabId);
      if (tab) {
        tab.viewName = viewName;
        tab.params = params;
      }
    },
    setNewAction(callback: () => void) {
      state.nav.onNewButtonClick = callback;
    }
  },

  projects: {
    projects: [] as Project[],
    activeProject: null as Project | null,
    projectVersion: 0,
    isLoading: false,
    searchOptions: {
      technicalAssistants: [] as any[],
      cooperationPartners: [] as any[],
      projectTypes: [] as any[],
      workgroups: [] as any[],
      statuses: [] as any[],
    } as any,
    async searchProjects(filters: any) {
      this.isLoading = true;
      this.projects = await api.findProjects(filters);
      this.activeProject = null;
      this.projectVersion++;
      this.isLoading = false;
    },
    loadProject(project: Project) {
      this.activeProject = project;
      this.projectVersion++;
    },
    prepareNewProject() {
      this.activeProject = {
        ORIGREC: 0, ProjektNr: '', Bearbeitung: 'in_progress',
        isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
        isFollowUpProject: false, Langzeitprojekt: false, Abschlusskontrolle: false,
        Aufgaben: '', Projektstand: '', TA: null, Arzt: null, AB_P_Kundennummer: null,
        estimatedCompletionDate: null, lastThursdayOfMonth: null, Abgabedatum: null, services: []
      } as any;
      this.projects = [];
      this.projectVersion++;
    },
    async fetchSearchOptions() {
      if (this.searchOptions.technicalAssistants.length > 0) return;
      this.searchOptions = await api.getSearchOptions();
    },
    async saveProject(projectData: Project) {
      if (!projectData) return;
      this.isLoading = true;
      try {
        const savedProject = await api.saveProject(projectData);
        this.activeProject = savedProject;
        this.projectVersion++;
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchApplicationDataForActiveProject() {
      if (!this.activeProject) return;
      this.isLoading = true;
      try {
        const appData = await api.fetchApplicationData();
        this.activeProject = { ...this.activeProject, ...appData };
        this.projectVersion++;
      } finally {
        this.isLoading = false;
      }
    }
  },

  services: {
    services: [] as ProjectService[],
    activeService: null as any,
    isLoading: false,
    async fetchServicesForActiveProject() {
      if (!state.projects.activeProject) return;
      this.isLoading = true;
      this.services = state.projects.activeProject.services || [];
      this.isLoading = false;
    },
    prepareNewService() { this.activeService = { status: 'selecting' }; },
    loadService(service: ProjectService) { this.activeService = service; },
    cancelEditing() { this.activeService = null; },
    selectServiceType(type: string) {
      const base = { id: 0, remarks: '', deliveryDate: null, serviceType: type as any };
      this.activeService = base; // simplified
    },
    async saveActiveService() {
      if (!this.activeService || 'status' in this.activeService) return;
      if (!state.projects.activeProject) return;
      this.isLoading = true;
      const serviceData = this.activeService;
      const index = state.projects.activeProject.services.findIndex((s: any) => s.ORIGREC === serviceData.ORIGREC);
      if (index !== -1 && serviceData.ORIGREC !== 0) {
        state.projects.activeProject.services[index] = serviceData;
      } else {
        serviceData.ORIGREC = Date.now();
        state.projects.activeProject.services.push(serviceData);
      }
      this.services = [...state.projects.activeProject.services];
      this.activeService = null;
      this.isLoading = false;
    }
  }
});

// Helper functions replacing router methods
export function push(route: { name: string, params?: any }) {
  state.currentView = { name: route.name, params: route.params || {} };
  state.nav.updateActiveTabPath(route.name, route.params || {});
}
export function back() {
  // Simplistic fallback for router.back()
  push({ name: 'Dashboard' });
}
export const navigateTo = push;
export const navigateBack = back;

