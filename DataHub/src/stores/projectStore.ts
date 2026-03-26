// src/stores/projectStore.ts
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
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
    projects: shallowRef<Project[]>([]),
    activeProject: null as Project | null,
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
      this.projectVersion++;
      this.isLoading = false;
    },
    loadProject(project: Project) {
      this.activeProject = project;
      this.projectVersion++;
    },
    prepareNewProject() {
      this.activeProject = {
        ORIGREC: 0,
        ProjektNr: '',
        Bearbeitung: 'in_progress',
        isNctTbb: false, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
        isFollowUpProject: false, Langzeitprojekt: false, Abschlusskontrolle: false,
        Aufgaben: '',
        Projektstand: '',
        TA: null,
        Arzt: null,
        AB_P_Kundennummer: null,
        estimatedCompletionDate: null,
        lastThursdayOfMonth: null,
        Abgabedatum: null,
        services: []
      } as any;
      this.projects = [];
      this.projectVersion++;
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
        this.projectVersion++;
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
          AB_Projekttitel: this.activeProject.AB_Projekttitel || '',
          AB_Anforderung: this.activeProject.AB_Anforderung || '',
        };
        this.projectVersion++;
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