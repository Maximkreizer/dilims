// src/stores/projectStore.ts
import { defineStore } from 'pinia';
import { api } from '@/services/api';
import type { Project, TechnicalAssistant, CooperationPartner, Workgroup } from '@/mocks/db';

interface StatusOption {
  value: string;
  title: string;
}

interface SearchOptions {
  technicalAssistants: TechnicalAssistant[];
  cooperationPartners: CooperationPartner[];
  projectTypes: { value: string; title: string }[];
  workgroups: Workgroup[];
  statuses: StatusOption[];
}

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    activeProject: null as Project | null,
    // NEU HINZUGEFÜGT: Ein Zähler, der sich bei jeder signifikanten Änderung am activeProject erhöht.
    projectVersion: 0,
    isLoading: false,
    searchOptions: {
      technicalAssistants: [],
      cooperationPartners: [],
      projectTypes: [],
      workgroups: [],
      statuses: [],
    } as SearchOptions,
  }),
  actions: {
    async searchProjects(filters: any) {
      this.isLoading = true;
      this.projects = await api.findProjects(filters);
      this.activeProject = null;
      this.projectVersion++; // Auch hier erhöhen, um das Formular sicher zu leeren
      this.isLoading = false;
    },
    loadProject(project: Project) {
      this.activeProject = project;
      this.projectVersion++; // Signalisiert, dass ein neues Projekt geladen wurde
    },
    prepareNewProject() {
      this.activeProject = {
        id: 0,
        projectNumber: '',
        status: 'in_progress',
        isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
        isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
        taskDescription: '',
        projectStatusText: '',
        technicalAssistantId: null,
        cooperationPartnerId: null,
        workgroupId: null,
        estimatedCompletionDate: null,
        lastThursdayOfMonth: null,
        completionDate: null,
        services: []
      };
      this.projects = [];
      this.projectVersion++; // Signalisiert, dass ein neues, leeres Projekt bereit ist
    },
    async fetchSearchOptions() {
      if (this.searchOptions.technicalAssistants.length > 0) return;
      const options = await api.getSearchOptions();
      this.searchOptions = options;
    },
    async saveProject(projectData: Project) {
      if (!projectData) return;
      this.isLoading = true;
      try {
        const savedProject = await api.saveProject(projectData);
        this.activeProject = savedProject;
        // ... (Logik zur Aktualisierung der `projects`-Liste) ...
        this.projectVersion++; // Signalisiert, dass das Projekt gespeichert wurde
      } catch (error) {
        console.error("Fehler beim Speichern des Projekts:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchApplicationDataForActiveProject() {
      if (!this.activeProject) return;
      this.isLoading = true;
      try {
        const appData = await api.fetchApplicationData();
        this.activeProject = {
          ...this.activeProject,
          ...appData,
          applicationTitle: this.activeProject.applicationTitle || '',
          applicationRequest: this.activeProject.applicationRequest || '',
        };
        this.projectVersion++; // Das ist das entscheidende Signal, dass sich die Daten geändert haben!
        alert('Daten aus der Antragsbearbeitung wurden erfolgreich geladen!');
      } catch (error) {
        console.error("Fehler beim Holen der Antragsdaten:", error);
        alert('Fehler: Die Antragsdaten konnten nicht geladen werden.');
      } finally {
        this.isLoading = false;
      }
    }
  }
});