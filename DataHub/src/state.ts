import { reactive, ref } from 'vue';
import { api } from '@/services/api';
import type { ProjectFilters } from '@/services/api';

// Zentraler State (DiLims-kompatibel, keine globalen Plugins)
export const globalState = reactive({
  // Routing-Ersatz
  currentView: 'Dashboard',
  routeParams: {} as Record<string, any>,

  // Project-State (Ehemals projectStore)
  projects: [] as any[],
  activeProject: null as any | null,
  filters: {} as ProjectFilters,
  searchOptions: {
    technicalAssistants: [],
    cooperationPartners: [],
    workgroups: [],
    projectTypes: [],
    statuses: []
  } as any,
  isLoading: false,

  // Service-State (Ehemals serviceStore)
  services: [] as any[]
});

// Aktionen (Methoden zur State-Manipulation)
export const actions = {
  // Navigation
  navigateTo(viewName: string, params: Record<string, any> = {}) {
    globalState.routeParams = params;
    globalState.currentView = viewName;
    window.scrollTo(0,0);
  },

  // Projects
  async loadProjects() {
    globalState.isLoading = true;
    try {
      globalState.projects = await api.findProjects(globalState.filters);
    } catch (e) {
      console.error("Fehler beim Laden der Projekte:", e);
    } finally {
      globalState.isLoading = false;
    }
  },
  
  async loadSearchOptions() {
    try {
      globalState.searchOptions = await api.getSearchOptions();
    } catch (e) {
      console.error("Fehler beim Laden der Suchoptionen:", e);
    }
  },

  async loadProjectDetails(id: number) {
    globalState.isLoading = true;
    try {
      globalState.activeProject = await api.fetchProjectDetails(id);
    } catch (e) {
      console.error("Fehler beim Laden der Projektdetails:", e);
    } finally {
      globalState.isLoading = false;
    }
  },

  // Services
  async loadServices(projectId: number) {
    try {
      globalState.services = await api.fetchServices(projectId);
    } catch (e) {
      console.error("Fehler beim Laden der Services:", e);
    }
  }
};
