// src/services/api.ts
/**
Simulierter API-Layer (Service) für das Frontend.

Funktionalität:
- Stellt Methoden bereit (findProjects, saveProject), die sich verhalten wie echte HTTP-Requests.
- Simuliert Netzwerklatenz (Delay), um Ladezustände in der UI testen zu können.
- Implementiert die Geschäftslogik zum Filtern und Aktualisieren der lokalen Mock-Datenbank.
*/

import type { Project, Antibody, AntibodyOrder, StainingRun } from '@/mocks/db';
// Korrekter Import der Mock-Daten-Arrays aus unserer db.ts
import {
  mockProjects,
  mockTechnicalAssistants,
  mockCooperationPartners,
  mockWorkgroups,
   mockAntibodies, 
   mockAntibodyOrders, 
   mockStainingRuns, 
   mockAntibodyProjects 
} from '@/mocks/db';

/**
 * Eine Hilfsfunktion, die eine künstliche Verzögerung erzeugt.
 * Dies simuliert eine echte Netzwerkanfrage und hilft uns, Lade-Indikatoren
 * in der Benutzeroberfläche zu testen.
 * @param ms - Die Zeit in Millisekunden, die gewartet werden soll.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatDateForSearch(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('de-DE').format(date); // Macht "31.12.2024" daraus
  } catch (e) {
    return '';
  }
}

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
  await delay(400); 

  let results = [...mockProjects];

  // --- 1. INTELLIGENTE VOLLTEXTSUCHE ---
  if (filters.generalSearch && filters.generalSearch.trim() !== '') {
    const term = filters.generalSearch.toLowerCase().trim();
    
    results = results.filter(p => {
      // Wir bauen einen "Heuhaufen" (Array) aus allen lesbaren Werten dieses Projekts
      const searchTerms: string[] = [];

      // 1. Basis-Textfelder
      searchTerms.push(p.projectNumber);
      searchTerms.push(p.taskDescription);
      searchTerms.push(p.projectStatusText);
      // searchTerms.push(p.remarks || ''); // Falls vorhanden

      // 2. Status (Übersetzung ins Deutsche, damit "bearb" -> "In Bearbeitung" findet)
      const statusMap: Record<string, string> = {
        'in_progress': 'In Bearbeitung',
        'completed': 'Abgeschlossen',
        'inquiry': 'Anfrage',
        'on_hold': 'Zurückgestellt',
        'clarified': 'Abgeklärt',
        'pending_number': 'Nr. nicht vergeben',
        'rejected': 'Abgelehnt',
        'cancelled': 'Storniert'
      };
      if (p.status && statusMap[p.status]) {
        searchTerms.push(statusMap[p.status]);
      }

      // 3. Boolean Flags (Damit man nach "Abschlusskontrolle" oder "NCT" suchen kann)
      if (p.finalCheck) searchTerms.push('Abschlusskontrolle');
      if (p.isLongTermProject) searchTerms.push('Langzeitprojekt');
      if (p.isFollowUpProject) searchTerms.push('Folgeprojekt');
      if (p.isSfb118Project) searchTerms.push('SFB118');
      
      // Projekttypen
      if (p.isNctTbb) searchTerms.push('NCT', 'NCT-TBB');
      if (p.isPccc) searchTerms.push('PCCC');
      if (p.isDzif) searchTerms.push('DZIF');
      if (p.isCmcp) searchTerms.push('CMCP');

      // 4. Namen auflösen (IDs -> Text)
      
      // TA
      const ta = mockTechnicalAssistants.find(t => t.id === p.technicalAssistantId);
      if (ta) {
        searchTerms.push(ta.fullName);
        searchTerms.push(ta.code);
      }

      // Partner / Arzt
      const partner = mockCooperationPartners.find(c => c.id === p.cooperationPartnerId);
      if (partner) {
        searchTerms.push(partner.fullName);
        searchTerms.push(partner.code);
      }

      // Arbeitsgruppe (AG)
      const wg = mockWorkgroups.find(w => w.id === p.workgroupId);
      if (wg) {
        searchTerms.push(wg.name);
      }

      // 5. Datumsfelder (Sowohl ISO als auch Deutsches Format suchbar machen)
      // ISO (z.B. "2024")
      if (p.completionDate) searchTerms.push(p.completionDate);
      if (p.estimatedCompletionDate) searchTerms.push(p.estimatedCompletionDate);
      
      // Deutsch (z.B. "24.12")
      searchTerms.push(formatDateForSearch(p.completionDate));
      searchTerms.push(formatDateForSearch(p.estimatedCompletionDate));
      // Auch "Letzter Donnerstag" Feld
      if (p.lastThursdayOfMonth) {
          searchTerms.push(p.lastThursdayOfMonth);
          searchTerms.push(formatDateForSearch(p.lastThursdayOfMonth));
      }


      // --- PRÜFUNG ---
      // Ist der Suchbegriff in IRGENDEINEM dieser Werte enthalten?
      return searchTerms.some(text => text && text.toLowerCase().includes(term));
    });
  }

    // --- 2. RESTLICHE FILTER (Spezifische Felder) ---
    // (Diese Logik bleibt bestehen für die Dropdowns in "Search Options")
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }
    if (filters.technicalAssistantId) {
      results = results.filter(p => p.technicalAssistantId === Number(filters.technicalAssistantId));
    }
    if (filters.cooperationPartnerId) {
      results = results.filter(p => p.cooperationPartnerId === Number(filters.cooperationPartnerId));
    }
    if (filters.workgroupId) {
      results = results.filter(p => p.workgroupId === Number(filters.workgroupId));
    }
    if (filters.projectNumber && filters.projectNumber !== filters.generalSearch) {
      results = results.filter(p => p.projectNumber.toLowerCase().includes(filters.projectNumber.toLowerCase()));
    }
    if (filters.projectType) { 
       results = results.filter(p => (p as any)[filters.projectType] === true); 
    }
    if (filters.date) {
       // Spezifische Datumssuche (Checkt ob EINES der Datumsfelder übereinstimmt)
       results = results.filter(p => 
         (p.completionDate && p.completionDate.startsWith(filters.date)) ||
         (p.estimatedCompletionDate && p.estimatedCompletionDate.startsWith(filters.date))
       );
    }
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
  },

  
    // --- ANTIKÖRPER DATENBANK SUCHE ---

  // 1. Suche für Antikörper-Projekte (GETRENNT von Dienstleistungs-Projekten)
  async searchAntibodyProjects(filters: any): Promise<Project[]> {
    await delay(300);
    let results = [...mockAntibodyProjects]; // Greift auf die ANDERE Datenbank zu

    if (filters.generalSearch) {
      const term = filters.generalSearch.toLowerCase();
      results = results.filter(p => 
        p.projectNumber.toLowerCase().includes(term) || 
        p.taskDescription.toLowerCase().includes(term)
      );
    }
    // ... hier weitere Filterlogik analog zu findProjects einfügen, falls nötig
    return results;
  },

  // 2. Suche nach Antikörpern
  async searchAntibodies(filters: any): Promise<Antibody[]> {
    await delay(300);
    let results = [...mockAntibodies];

    const term = filters.general ? filters.general.toLowerCase() : '';
    
    // Allgemeine Suche
    if (term) {
      results = results.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.akId.toLowerCase().includes(term) ||
        a.manufacturer.toLowerCase().includes(term)
      );
    }

    // Spezifische Filter
    if (filters.name) results = results.filter(a => a.name.toLowerCase().includes(filters.name.toLowerCase()));
    if (filters.akId) results = results.filter(a => a.akId.toLowerCase().includes(filters.akId.toLowerCase()));
    if (filters.status) results = results.filter(a => a.status === filters.status);

    return results;
  },

  // 3. Suche nach Bestellungen
  async searchOrders(filters: any): Promise<AntibodyOrder[]> {
    await delay(300);
    let results = [...mockAntibodyOrders];
    
    const term = filters.general ? filters.general.toLowerCase() : '';
    if (term) {
      results = results.filter(o => 
        o.applicant.toLowerCase().includes(term) || 
        o.workgroup.toLowerCase().includes(term)
      );
    }
    return results;
  },

  // 4. Suche nach Färbeläufen
  async searchStainingRuns(filters: any): Promise<StainingRun[]> {
    await delay(300);
    let results = [...mockStainingRuns];
    
    const term = filters.general ? filters.general.toLowerCase() : '';
    if (term) {
      results = results.filter(r => 
        r.runId.toLowerCase().includes(term) || 
        r.antibodyName.toLowerCase().includes(term)
      );
    }
    return results;
  }
};