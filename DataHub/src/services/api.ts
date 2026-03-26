// src/services/api.ts
/**
API-Layer (Service) für das Frontend.
Umgestellt auf PHP-Backend in Phase 3.
*/

import type { Project, Antibody, AntibodyOrder, StainingRun, TechnicalAssistant, CooperationPartner, Workgroup } from '@/mocks/db';

const BASE_URL = '/src/backend';

/**
 * Hilfsfunktion für Fetch-Requests
 */
async function fetchBackend<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Backend-Fehler: ${response.statusText} (${response.status})`);
  }
  return await response.json();
}

function formatDateForSearch(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('de-DE').format(date);
  } catch (e) {
    return '';
  }
}

export const api = {
  
  /**
   * Lädt Projekte vom PHP-Backend und filtert sie im Frontend.
   */
  async findProjects(filters: any): Promise<Project[]> {
    const allProjects = await fetchBackend<Project[]>('Projekte_Labor.php');
    let results = [...allProjects];

    // --- 1. INTELLIGENTE VOLLTEXTSUCHE ---
    if (filters.generalSearch && filters.generalSearch.trim() !== '') {
      const term = filters.generalSearch.toLowerCase().trim();
      
      // Wir brauchen die Optionen für die Namensauflösung im Frontend-Filter
      const options = await this.getSearchOptions();

      results = results.filter(p => {
        const searchTerms: string[] = [];

        searchTerms.push(p.projectNumber);
        searchTerms.push(p.taskDescription);
        searchTerms.push(p.projectStatusText);

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

        if (p.finalCheck) searchTerms.push('Abschlusskontrolle');
        if (p.isLongTermProject) searchTerms.push('Langzeitprojekt');
        if (p.isFollowUpProject) searchTerms.push('Folgeprojekt');
        if (p.isSfb118Project) searchTerms.push('SFB118');
        
        if (p.isNctTbb) searchTerms.push('NCT', 'NCT-TBB');
        if (p.isPccc) searchTerms.push('PCCC');
        if (p.isDzif) searchTerms.push('DZIF');
        if (p.isCmcp) searchTerms.push('CMCP');

        const ta = options.technicalAssistants.find(t => t.id === p.technicalAssistantId);
        if (ta) {
          searchTerms.push(ta.fullName);
          searchTerms.push(ta.code);
        }

        const partner = options.cooperationPartners.find(c => c.id === p.cooperationPartnerId);
        if (partner) {
          searchTerms.push(partner.fullName);
          searchTerms.push(partner.code);
        }

        const wg = options.workgroups.find(w => w.id === p.workgroupId);
        if (wg) {
          searchTerms.push(wg.name);
        }

        if (p.completionDate) searchTerms.push(p.completionDate);
        if (p.estimatedCompletionDate) searchTerms.push(p.estimatedCompletionDate);
        
        searchTerms.push(formatDateForSearch(p.completionDate));
        searchTerms.push(formatDateForSearch(p.estimatedCompletionDate));
        if (p.lastThursdayOfMonth) {
            searchTerms.push(p.lastThursdayOfMonth);
            searchTerms.push(formatDateForSearch(p.lastThursdayOfMonth));
        }

        return searchTerms.some(text => text && text.toLowerCase().includes(term));
      });
    }

    // --- 2. RESTLICHE FILTER ---
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
   * Ruft Optionen von verschiedenen PHP-Skripten ab.
   */
  async getSearchOptions() {
    const [tas, partners, wgs] = await Promise.all([
      fetchBackend<TechnicalAssistant[]>('Kuerzel.php'),
      fetchBackend<CooperationPartner[]>('Kunden.php'),
      fetchBackend<Workgroup[]>('Lookup_Values.php') // Annahme: WGs sind hier
    ]);

    return {
      technicalAssistants: tas,
      cooperationPartners: partners,
      workgroups: wgs,
      projectTypes: [
        { value: 'isNctTbb', title: 'NCT-TBB' },
        { value: 'isDzif', title: 'DZIF' },
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
    const response = await fetch(`${BASE_URL}/Projekte_Labor.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Fehler beim Speichern');
    return await response.json();
  },

  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/Projekte_Labor.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Fehler beim Löschen');
  },
  
  async fetchApplicationData() {
    // Hier könnte ein spezifisches PHP-Skript für Antragsdaten stehen
    // Falls noch nicht vorhanden, nutzen wir ein Fallback oder das Hauptskript
    return await fetchBackend<any>('Projekte_Labor.php?type=application_data');
  },

  // --- ANTIKÖRPER DATENBANK ---

  async searchAntibodyProjects(filters: any): Promise<Project[]> {
    // In der Mock-Welt war dies getrennt, im PHP-Backend evtl. über denselben Endpunkt mit Filter
    const all = await fetchBackend<Project[]>('Projekte_Labor.php?context=antibody');
    let results = [...all];

    if (filters.generalSearch) {
      const term = filters.generalSearch.toLowerCase();
      results = results.filter(p => 
        p.projectNumber.toLowerCase().includes(term) || 
        p.taskDescription.toLowerCase().includes(term)
      );
    }
    return results;
  },

  async searchAntibodies(filters: any): Promise<Antibody[]> {
    const all = await fetchBackend<Antibody[]>('Antikoerper.php');
    let results = [...all];

    const term = filters.general ? filters.general.toLowerCase() : '';
    if (term) {
      results = results.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.akId.toLowerCase().includes(term) ||
        a.manufacturer.toLowerCase().includes(term)
      );
    }

    if (filters.name) results = results.filter(a => a.name.toLowerCase().includes(filters.name.toLowerCase()));
    if (filters.akId) results = results.filter(a => a.akId.toLowerCase().includes(filters.akId.toLowerCase()));
    if (filters.status) results = results.filter(a => a.status === filters.status);

    return results;
  },

  async searchOrders(filters: any): Promise<AntibodyOrder[]> {
    const all = await fetchBackend<AntibodyOrder[]>('Bestellungen.php');
    let results = [...all];
    
    const term = filters.general ? filters.general.toLowerCase() : '';
    if (term) {
      results = results.filter(o => 
        o.applicant.toLowerCase().includes(term) || 
        (o.workgroup && o.workgroup.toLowerCase().includes(term))
      );
    }
    return results;
  },

  async searchStainingRuns(filters: any): Promise<StainingRun[]> {
    const all = await fetchBackend<StainingRun[]>('Faerbelaeufe.php');
    let results = [...all];
    
    const term = filters.general ? filters.general.toLowerCase() : '';
    if (term) {
      results = results.filter(r => 
        r.runId.toLowerCase().includes(term) || 
        (r.antibodyName && r.antibodyName.toLowerCase().includes(term))
      );
    }
    return results;
  }
};