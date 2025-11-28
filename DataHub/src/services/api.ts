// src/services/api.ts
/**
Simulierter API-Layer (Service) für das Frontend.

Funktionalität:
- Stellt Methoden bereit (findProjects, saveProject), die sich verhalten wie echte HTTP-Requests.
- Simuliert Netzwerklatenz (Delay), um Ladezustände in der UI testen zu können.
- Implementiert die Geschäftslogik zum Filtern und Aktualisieren der lokalen Mock-Datenbank.
*/

import type { Project } from '@/mocks/db';
// Korrekter Import der Mock-Daten-Arrays aus unserer db.ts
import {
  mockProjects,
  mockTechnicalAssistants,
  mockCooperationPartners,
  mockWorkgroups,
} from '@/mocks/db';

/**
 * Eine Hilfsfunktion, die eine künstliche Verzögerung erzeugt.
 * Dies simuliert eine echte Netzwerkanfrage und hilft uns, Lade-Indikatoren
 * in der Benutzeroberfläche zu testen.
 * @param ms - Die Zeit in Millisekunden, die gewartet werden soll.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Dies ist unser "Fake-API"-Objekt für die Frontend-Entwicklung in Phase 1.
 * Es hat dieselben Funktionen und liefert dieselben Datenstrukturen
 * wie die spätere, echte Backend-API.
 */
export const api = {
  
  /**
   * Simuliert die Suche/Filterung von Projekten.
   * @param filters - Ein Objekt mit den Suchkriterien aus der ProjectSearchView.
   * @returns Eine Promise, die ein Array von Projekten zurückgibt.
   */

async findProjects(filters: any): Promise<Project[]> {
    await delay(400); // Kurze Ladezeit simuliert
    // console.log('API-SIMULATION: Wende Filter an:', filters);

    let results = [...mockProjects];

    // --- 1. ALLGEMEINE SUCHE (Das Suchfeld oben) ---
    if (filters.generalSearch) {
      const term = filters.generalSearch.toLowerCase().trim();
      
      results = results.filter(p => {
        // Wir suchen in Projektnummer...
        const inNumber = p.projectNumber.toLowerCase().includes(term);
        // ...oder in der Aufgabenbeschreibung...
        const inTask = p.taskDescription.toLowerCase().includes(term);
        // ...oder im Status
        const inStatus = p.status.toLowerCase().includes(term);
        
        // Wenn EINES davon zutrifft, ist das Projekt ein Treffer
        return inNumber || inTask || inStatus;
      });
    }

    // --- 2. SPEZIFISCHE FILTER (Die Search Options) ---
    
    // Status (Dropdown)
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }

    // Mitarbeiter-ID
    if (filters.technicalAssistantId) {
      results = results.filter(p => p.technicalAssistantId === Number(filters.technicalAssistantId));
    }
    
    // Arzt/Partner-ID
    if (filters.cooperationPartnerId) {
      results = results.filter(p => p.cooperationPartnerId === Number(filters.cooperationPartnerId));
    }

    // Arbeitsgruppe
    if (filters.workgroupId) {
      results = results.filter(p => p.workgroupId === Number(filters.workgroupId));
    }

    // Spezifische Projektnummer (aus den Optionen)
    if (filters.projectNumber) {
      results = results.filter(p => p.projectNumber.toLowerCase().includes(filters.projectNumber.toLowerCase()));
    }
    
    // Projekttyp-Flags (Dropdown)
    if (filters.projectType) { 
       // Wir prüfen dynamisch, ob das Flag (z.B. 'isNctTbb') auf true steht
       results = results.filter(p => (p as any)[filters.projectType] === true); 
    }

    // Checkbox-Flags
    if (filters.finalCheck) { results = results.filter(p => p.finalCheck === true); }
    if (filters.isLongTermProject) { results = results.filter(p => p.isLongTermProject === true); }
    if (filters.isSfb118Project) { results = results.filter(p => p.isSfb118Project === true); }

    return results;
  },
  /**
   * Simuliert das Abrufen der Optionen für die Dropdown-Felder im Suchformular.
   * @returns Eine Promise, die ein Objekt mit den Optionslisten zurückgibt.
   */
  async getSearchOptions() {
    await delay(300); // Simuliert eine schnelle Ladezeit für Optionsdaten
    
    return {
      technicalAssistants: mockTechnicalAssistants,
      cooperationPartners: mockCooperationPartners,
      workgroups: mockWorkgroups,
      projectTypes: [
        { value: 'isNctTbb', title: 'NCT-TBB' },
        { value: 'isPccc', title: 'pCCC' },
        { value: 'isDzif', title: 'DZIF' },
        { value: 'isCmcp', title: 'CMCP' },
      ],
      statuses: [
        { value: 'in_progress', title: 'In Bearbeitung' },
        { value: 'completed', title: 'Abgeschlossen' },
        { value: 'inquiry', title: 'Anfrage' },
        { value: 'on_hold', title: 'Zurückgestellt' },
        { value: 'clarified', title: 'Abgeklärt' },
        { value: 'pending_number', title: 'Nr. nicht vergeben' },
        { value: 'rejected', title: 'Abgelehnt' },
        { value: 'cancelled', title: 'Storniert' },
      ]
    };
  },

async saveProject(projectData: Project): Promise<Project> {
    await delay(500);
    // console.log("API-SIMULATION: Speichere Projekt", projectData);

    // WICHTIG: Erstelle eine tiefe Kopie der eingehenden Daten, 
    // um Referenz-Probleme mit Proxies zu vermeiden
    const dataToSave = JSON.parse(JSON.stringify(projectData));

    if (dataToSave.id && dataToSave.id !== 0) {
      // --- UPDATE ---
      const index = mockProjects.findIndex(p => p.id === dataToSave.id);
      if (index !== -1) {
        mockProjects[index] = dataToSave;
        return dataToSave;
      }
    }
    
    // --- CREATE ---
    const newId = Math.max(...mockProjects.map(p => p.id), 0) + 1;
    const newProject = { ...dataToSave, id: newId }; // Neue ID zuweisen
    
    // Ganz oben in die Liste einfügen, damit man es sofort sieht
    mockProjects.unshift(newProject); 
    
    return newProject;
  },

  async deleteProject(id: number): Promise<void> {
    await delay(300);
    const index = mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProjects.splice(index, 1);
      console.log(`API-SIMULATION: Projekt ${id} gelöscht.`);
    }
  },
  
  async fetchApplicationData() {
      console.log("API-SIMULATION: Starte 5-sekündige Abfrage der Antragsdaten...");
      await delay(5000); // Simuliert 5 Sekunden Ladezeit
      
      // Gibt ein festes Set von Beispieldaten zurück
      const fetchedData = {
        applicationStudy: 'Klinische Studie Phase II',
        applicationProcessingStatus: 'Genehmigt',
        // applicationTitle: 'Bestehender Titel', // absichtlich auskommentiert
        // applicationRequest: 'Bestehende Anforderung', // absichtlich auskommentiert
        applicationCoopPartner: 'Prof. Dr. Weber',
        applicationFeedback: 'Rückmeldung vom Ethikkomitee erhalten.',
        applicationApproval: 'Genehmigt unter Auflagen',
        applicationCompletionDate: '2023-12-31T00:00:00.000Z',
        applicationIsLongTermProject: true,
        applicationProjectLead: 'Dr. Neumann',
        applicationContactPerson: 'Fr. Walter',
      };
      
      console.log("API-SIMULATION: Antragsdaten erfolgreich geholt.");
      return fetchedData;
  }
};