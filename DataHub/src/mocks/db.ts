/**
 * =======================================================================================
 * DATA CONTRACT & MOCK DATABASE
 * =======================================================================================
 * This file serves as both the formal Data Contract (via TypeScript Interfaces) and
 * the mock database for the entire application.
 *
 * PART 1: The Data Contract defines the shape of our data (the "Bauplan").
 * PART 2: The Mock Data provides realistic sample data based on that contract.
 * =======================================================================================
 */

// =======================================================================================
// PART 1: THE DATA CONTRACT (INTERFACES)
// (This part remains unchanged as our blueprint is solid)
// =======================================================================================

// ... [Der gesamte INTERFACE-Teil von "Section 1.1" bis "Section 1.3" bleibt exakt derselbe wie zuvor] ...
// HINWEIS: Aus Gründen der Übersichtlichkeit wird der unveränderte Interface-Teil hier nicht wiederholt.
// Die folgenden Mock-Daten halten sich exakt an die zuvor definierten Interfaces.

/**
 * Represents a Technical Assistant (TA) from the fixed list.
 */
export interface TechnicalAssistant {
  id: number;
  code: string; // e.g., "MM"
  fullName: string;
}

/**
 * Represents a Doctor or Cooperation Partner from the fixed list.
 */
export interface CooperationPartner {
  id: number;
  code: string; // e.g., "SMI"
  fullName: string;
}

/**
 * Represents a Workgroup. The 'field' number is the ID.
 */
export interface Workgroup {
  id: number; // The 'Feld' number
  name: string;
}
interface BaseService {
  id: number;
  remarks: string;
  deliveryDate: string | null;
}

// Sparte 1: Gewebeverarbeitung
export interface ParaffinSectionService extends BaseService {
  serviceType: 'paraffin_sections';
  sampleCount: number;
  unstainedSectionsPerSample: number;
  tubesPerSample: number;
  scrollsPerTube: number; 
  heSectionsForRequestor: number;
  heSectionsForTissueBank: number;
  archiveSectionCount: number;
  archiveBlockCount: number;
}

export interface ParaffinTubeService extends BaseService {
  serviceType: 'paraffin_tubes';
  sampleCount: number;
  tubesPerSample: number;
  scrollsPerTube: number;
  heSectionsForRequestor: number;
  heSectionsForTissueBank: number;
  archiveSectionCount: number;
  archiveBlockCount: number;
}
export interface CryoSectionService extends BaseService {
  serviceType: 'cryo_sections';
  sampleCount: number;
  unstainedSectionsPerSample: number;
  heSectionsForRequestor: number;
  heSectionsForTissueBank: number;
  archiveSampleCount: number;
}
export interface CryoTubeService extends BaseService {
  serviceType: 'cryo_tubes';
  sampleCount: number;
  tubesPerSample: number;
  scrollsPerTubeCount: number;
  scrollsPerTubeWeight: number;
  heSectionsForRequestor: number;
  heSectionsForTissueBank: number;
  archiveSampleCount: number;
}

export interface CryoService extends BaseService {
  serviceType: 'cryo_service';
  sampleCount: number;
  unstainedSectionsPerSample: number;
  heSectionsForRequestor: number;
  heSectionsForTissueBank: number;
}

// Sparte 2: Spezial-Analyse & Färbung
export interface IhcService extends BaseService {
  serviceType: 'ihc';
  slideCount: number;
  stainingDevice: 'dako' | 'ventana' | 'sonstiges_ak_plus' | 'sonstiges_ak_minus' | 'bond' | 'artisan' | null;
}

// Sparte 3: TMA
export interface TmaSectionService extends BaseService {
  serviceType: 'tma_sections';
  sourceTmaId: number;
  sourceTmaName: string;
  blockCount: number;
  blockNumbers: string;
  sectionsPerBlock: number;
}

// Sparte 4: Digitale Pathologie
export interface VirtualMicroscopyService extends BaseService {
  serviceType: 'virtual_microscopy';
  archiveSectionCount: number;
  archiveBlockCount: number;
  scanCount: number;
  isBrightfield: boolean;
  isFluorescence: boolean;
}

// Universelle Typen für einfache Zähler
export interface SimpleCountService extends BaseService {
  serviceType: 
    | 'paraffin_embedding'
    | 'pathological_assessment'
    | 'dna_rna_extraction';
  count: number;
}

// Universelle Typen ohne spezifische Felder
export interface GenericService extends BaseService {
  serviceType:
    | 'data'
    | 'ethics'
    | 'staining'
    | 'tma_creation'
    | 'archival_work';
}

export type ProjectService =
  | ParaffinSectionService
  | ParaffinTubeService
  | CryoSectionService
  | CryoTubeService
  | CryoService
  | IhcService
  | VirtualMicroscopyService
  | TmaSectionService
  | SimpleCountService
  | GenericService;

export interface Project {
  id: number;
  projectNumber: string;

  // --- Flags & Categories ---
  isNctTbb: boolean;
  isPccc: boolean;
  isDzif: boolean;
  isCmcp: boolean;
  isSfb118Project: boolean;
  isFollowUpProject: boolean;
  isLongTermProject: boolean; // Bereits vorhanden, wird jetzt im Formular verwendet
  finalCheck: boolean; // Bereits vorhanden, wird jetzt im Formular verwendet

  // --- Status & Descriptions ---
  status: 'clarified' | 'pending_number' | 'in_progress' | 'completed' | 'inquiry' | 'rejected' | 'cancelled' | 'on_hold';
  taskDescription: string;
  projectStatusText: string;

  // --- Relationships ---
  technicalAssistantId: number | null | undefined;
  cooperationPartnerId: number | null | undefined;
  workgroupId: number | null | undefined;

  // --- Dates ---
  estimatedCompletionDate: string | null | undefined;
  lastThursdayOfMonth: string | null | undefined;
  completionDate: string | null | undefined; // Bereits vorhanden, wird jetzt hinzugefügt
  
  services: ProjectService[];

  // --- NEU: Felder für die Antragsbearbeitung (Application Processing) ---
  applicationStudy?: string | null;
  applicationProcessingStatus?: string | null;
  applicationTitle?: string | null;
  applicationRequest?: string | null;
  applicationCoopPartner?: string | null;
  applicationFeedback?: string | null;
  applicationApproval?: string | null;
  applicationCompletionDate?: string | null;
  applicationIsLongTermProject?: boolean;
  applicationProjectLead?: string | null;
  applicationContactPerson?: string | null;
}

// =======================================================================================
// PART 2: THE MOCK DATA (Updated with your real examples)
// =======================================================================================

// ---------------------------------------------------------------------------------------
// Section 2.1: Mock Lookup Data (Enriched with your data)
// ---------------------------------------------------------------------------------------

export const mockTechnicalAssistants: TechnicalAssistant[] = [
  { id: 1, code: 'MK', fullName: 'M. Klein' },
  { id: 2, code: 'MF', fullName: 'M. Fischer' },
  { id: 3, code: 'MA', fullName: 'M. Adler' },
];

export const mockCooperationPartners: CooperationPartner[] = [
  { id: 101, code: 'SOC', fullName: 'Dr. Sommerfeld' },
  { id: 102, code: 'CP', fullName: 'Prof. Conrad' },
  { id: 103, code: 'BRU', fullName: 'Dr. Brunner' },
];

export const mockWorkgroups: Workgroup[] = [
  { id: 21, name: 'AG Immunologie' },
  { id: 22, name: 'AG Onkologie' },
];

// ---------------------------------------------------------------------------------------
// Section 2.2: Mock Project Data (Generated from your 3 real projects)
// ---------------------------------------------------------------------------------------

export const mockProjects: Project[] = [
  // --- Projekt 1 (basierend auf Ihren Daten) ---
  {
    id: 2001,
    projectNumber: 'j123',
    isNctTbb: false, isPccc: false, isDzif: true, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
    status: 'in_progress',
    taskDescription: '3x30 Lungenparaffinschnitte von Patienten in versch. Krankheitsstadien',
    projectStatusText: '', // Nicht spezifiziert, kann leer bleiben
    technicalAssistantId: 1, // MK
    cooperationPartnerId: 101, // SOC
    workgroupId: null,
    estimatedCompletionDate: null,
    lastThursdayOfMonth: null,
    completionDate: null,
    services: [
      {
        id: 3001, serviceType: 'staining',
        remarks: 'IHC_Faerbegeraet: Bond',
        deliveryDate: '2024-01-22T00:00:00.000Z'
      },
      {
        id: 3002, serviceType: 'ihc',
        remarks: '',
        deliveryDate: '2024-01-22T00:00:00.000Z',
        slideCount: 18,
        stainingDevice: 'bond' // Annahme, basierend auf Bemerkung oben
      }
    ]
  },
  
  // --- Projekt 2 (basierend auf Ihren Daten) ---
  {
    id: 2002,
    projectNumber: '1230',
    isNctTbb: true, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false, // Annahme basierend auf fehlenden Daten
    status: 'completed',
    taskDescription: 'Anfertigung einer unbestimmten Anzahl an Gewebeschnitten (Paraffin- und Kryogewebe sowie TMA) diverser Organe zu Verwendung von Antikörpern',
    projectStatusText: '',
    technicalAssistantId: 2, // MF
    cooperationPartnerId: 102, // CP
    workgroupId: null,
    estimatedCompletionDate: '2021-11-23T00:00:00.000Z',
    lastThursdayOfMonth: '2021-11-25T00:00:00.000Z',
    completionDate: '2021-12-01T00:00:00.000Z',
    services: [
      {
        id: 3003, serviceType: 'paraffin_sections', remarks: '', deliveryDate: null,
        sampleCount: 13,
        unstainedSectionsPerSample: 13,
        tubesPerSample: 13,
        scrollsPerTube: 0,
        heSectionsForRequestor: 0,
        heSectionsForTissueBank: 13,
        archiveSectionCount: 13,
        archiveBlockCount: 13
      }
    ]
  },

  // --- Projekt 3 (basierend auf Ihren Daten) ---
  {
    id: 2003,
    projectNumber: '420',
    isNctTbb: true, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
    status: 'completed',
    taskDescription: 'Je ein Slide des TMA BCT-CCC NR. 57 1-10',
    projectStatusText: '',
    technicalAssistantId: 3, // MA
    cooperationPartnerId: 103, // BRU
    workgroupId: null,
    estimatedCompletionDate: null,
    lastThursdayOfMonth: null,
    completionDate: '2024-09-01T00:00:00.000Z',
    services: [
      {
        id: 3004, serviceType: 'tma_sections', remarks: '',
        deliveryDate: '2024-09-03T00:00:00.000Z',
        sourceTmaId: 54,
        sourceTmaName: 'CCC',
        blockCount: 10,
        blockNumbers: '1-10',
        sectionsPerBlock: 1
      }
    ]
  }
];