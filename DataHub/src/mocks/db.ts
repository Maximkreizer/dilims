/**
 * =======================================================================================
 * DATA CONTRACT & MOCK DATABASE (UPDATED)
 * =======================================================================================
 */

export interface TechnicalAssistant {
  id: number;
  code: string;
  fullName: string;
}

export interface CooperationPartner {
  id: number;
  code: string;
  fullName: string;
}

export interface Workgroup {
  id: number;
  name: string;
}

// Basis-Eigenschaften für alle Services
export interface BaseService {
  id: number;
  serviceType: string; // Wichtig für die Unterscheidung
  remarks: string;     // Bemerkung
  deliveryDate: string | null; // Abgabedatum
}

/**
 * HIER ERWEITERN WIR DIE INTERFACES FÜR DIE NEUEN FORMULARE
 */

// 1. & 2. Paraffin (Schnitte & Tubes) & 3. Einbettung
export interface ParaffinService extends BaseService {
  serviceType: 'paraffin_sections' | 'paraffin_tubes' | 'paraffin_embedding';
  sampleCount?: number;             // P_Anz_Proben
  slidesPerSample?: number;         // P_Anz_OT_pro_Probe
  tubesPerSample?: number;          // P_Anz_Tubes_pro_Probe
  scrollsPerTubeCount?: number;     // P_Röllchen pro Tube
  heRequestor?: number;             // P_HE_Schnitte für Antragssteller
  heTissueBank?: number;            // P_HE_Schnitte für Gewebebank
  archiveSlidesCases?: number;      // P_Archiv_Anz_Schnittpräperate (Fälle)
  archiveBlocksCases?: number;      // P_Archiv_Anz_Blöcke (Fälle) / Anz_Einbettung
}

// 4. & 5. Kryo (Schnitte, Tubes, Service)
export interface CryoService extends BaseService {
  serviceType: 'cryo_sections' | 'cryo_tubes' | 'cryo_service';
  sampleCount?: number;             // K_Anz_Proben
  slidesPerSample?: number;         // K_Anz_OT_pro_Probe
  tubesPerSample?: number;          // K_Anz_Tubes_pro_Probe
  scrollsPerTubeCount?: number;     // K_Röllchen pro Tube (Anzahl)
  scrollsPerTubeWeight?: number;    // K_Röllchen pro Tube (Gewicht) - NEU!
  heRequestor?: number;
  heTissueBank?: number;
  archiveSampleCases?: number;      // K_Archiv_Anz_Proben (Fälle)
}

// 6. IHC
export interface IhcService extends BaseService {
  serviceType: 'ihc';
  slideCount: number;               // IHC_Schnitte
  stainingDevice: string | null;    // IHC_Faerbegerät ('Dako', 'Ventana'...)
}

// 10. TMA Erstellung
export interface TmaCreationService extends BaseService {
  serviceType: 'tma_creation';
  tmaNumber: string;                // TMA_Nr
  tmaHeCount: number;               // TMA_Anz_HE_Schnitte
  tmaDate: string | null;           // Datum
  punchesPerBlock: number;          // TMA_Anz_Stanzen_pro_Bl
  blockNumbers: string;             // Blocknummern
  patientCount: number;             // TMA_Anz_Patienten
  excludedCount: number;            // Ausgeschieden
}

// 11. TMA Schnitte
export interface TmaSectionService extends BaseService {
  serviceType: 'tma_sections';
  tmaName: string;                  // TMA_NAME
  tmaNumber: string;                // TMA_NR
  blockCount: number;               // Anz_Bloecke
  sectionsPerBlock: number;         // Anz_Schnitte_pro_Bloecke
  blockNumbers: string;             // Blocknummern
}

// 12. Virtuelle Mikroskopie
export interface VirtualMicroscopyService extends BaseService {
  serviceType: 'virtual_microscopy';
  archiveSlidesCases: number;       // P_Archiv_Anz_Schnittpräperate
  archiveBlocksCases: number;       // P_Anz_Blöcke
  scanCount: number;                // Virtuelle_Mikroskopie (Anz. Scans)
  isBrightfield: boolean;           // Hellfeld
  isFluorescence: boolean;          // Floureszenz
}

// Einfache Zähler (DNA, Patho)
export interface SimpleCountService extends BaseService {
  serviceType: 'dna_rna_extraction' | 'pathological_assessment';
  extractionCount?: number;         // Anz_DNA_RNA_Extraktion
  assessmentCount?: number;         // Anz_Pathol_Beurteilung
}

// Generisch (Färbung, Daten, Ethik, Archiv)
export interface GenericService extends BaseService {
  serviceType: 'staining' | 'data' | 'ethics' | 'archival_work';
  // Archivarbeit nutzt z.T. Felder von Paraffin (Slides/Blocks), daher optional hier:
  archiveSlidesCases?: number;
  archiveBlocksCases?: number;
}

// UNION TYPE: Das ist wichtig, damit das Formular weiß, was alles möglich ist
export type ProjectService =
  | ParaffinService
  | CryoService
  | IhcService
  | TmaCreationService
  | TmaSectionService
  | VirtualMicroscopyService
  | SimpleCountService
  | GenericService;

export interface Project {
  id: number;
  projectNumber: string;

  // Flags
  isNctTbb: boolean;
  isPccc: boolean;
  isDzif: boolean;
  isCmcp: boolean;
  isSfb118Project: boolean;
  isFollowUpProject: boolean;
  isLongTermProject: boolean;
  finalCheck: boolean;

  // Status & Text
  status: 'clarified' | 'pending_number' | 'in_progress' | 'completed' | 'inquiry' | 'rejected' | 'cancelled' | 'on_hold';
  taskDescription: string;
  projectStatusText: string;

  // Relationen
  technicalAssistantId: number | null | undefined;
  cooperationPartnerId: number | null | undefined;
  workgroupId: number | null | undefined;

  // Daten
  estimatedCompletionDate: string | null | undefined;
  lastThursdayOfMonth: string | null | undefined;
  completionDate: string | null | undefined;
  
  // Die Liste der Services
  services: ProjectService[];

  // Antragsdaten (Readonly View)
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
// MOCK DATA (Deine existierenden Daten, leicht angepasst wo nötig)
// =======================================================================================

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

export const mockProjects: Project[] = [
  {
    id: 2001,
    projectNumber: 'j123',
    isNctTbb: false, isPccc: false, isDzif: true, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
    status: 'in_progress',
    taskDescription: '3x30 Lungenparaffinschnitte...',
    projectStatusText: '',
    technicalAssistantId: 1,
    cooperationPartnerId: 101,
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
        stainingDevice: 'Bond'
      }
    ]
  },
  {
    id: 2002,
    projectNumber: '1230',
    isNctTbb: true, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
    status: 'completed',
    taskDescription: 'Anfertigung einer unbestimmten Anzahl...',
    projectStatusText: '',
    technicalAssistantId: 2,
    cooperationPartnerId: 102,
    workgroupId: null,
    estimatedCompletionDate: '2021-11-23T00:00:00.000Z',
    lastThursdayOfMonth: '2021-11-25T00:00:00.000Z',
    completionDate: '2021-12-01T00:00:00.000Z',
    services: [
      {
        id: 3003, serviceType: 'paraffin_sections', remarks: '', deliveryDate: null,
        sampleCount: 13,
        slidesPerSample: 13,
        tubesPerSample: 13,
        scrollsPerTubeCount: 0,
        heRequestor: 0,
        heTissueBank: 13,
        archiveSlidesCases: 13,
        archiveBlocksCases: 13
      }
    ]
  },
  {
    id: 2003,
    projectNumber: '420',
    isNctTbb: true, isPccc: false, isDzif: false, isCmcp: false, isSfb118Project: false,
    isFollowUpProject: false, isLongTermProject: false, finalCheck: false,
    status: 'completed',
    taskDescription: 'Je ein Slide des TMA...',
    projectStatusText: '',
    technicalAssistantId: 3,
    cooperationPartnerId: 103,
    workgroupId: null,
    estimatedCompletionDate: null,
    lastThursdayOfMonth: null,
    completionDate: '2024-09-01T00:00:00.000Z',
    services: [
      {
        id: 3004, serviceType: 'tma_sections', remarks: '',
        deliveryDate: '2024-09-03T00:00:00.000Z',
        tmaName: 'CCC',
        blockCount: 10,
        blockNumbers: '1-10',
        sectionsPerBlock: 1,
        tmaNumber: '57'
      }
    ]
  }
];
// --- ANTIBODY KONTEXT ---


/// =======================================================================================
// TEIL 3: ANTIKÖRPER KONTEXT & DATEN
// =======================================================================================

// --- INTERFACES ---

export interface Antibody {
  id: number;
  akId: string;
  name: string;
  refNumber: string;
  lotNumber: string;
  status: string;
  manufacturer: string;
}

export interface AntibodyProject {
  id: number;
  projectNumber: string;
  status: string;
  projectType: string;
  technicalAssistantId: number | null;
  cooperationPartnerId: number | null;
  workgroupId: number | null;
  isFollowUp: boolean;
  tasks: string;
  projectStatusText: string;
  dueDate: string | null;
  applicant: string;
  additionalLeaders: string;
  finalCheck: boolean;
  isLongTerm: boolean;
}

export interface StainingRun {
  id: number;
  runId: string;
  projectId: number | null;
  technicalAssistantId: number | null;
  stainingType: string;
  date: string | null;
  device: string;
  kit: string;
  cutCount: number;
  tissue: string;
  material: string;
  pretreatDemasking: string;
  pretreatReagent: string;
  pretreatTime: string;
  blockH2O2: boolean;
  blockAvidinBiotin: boolean;
  blockBsaNgs: boolean;
  ventanaHqLinkerTime: string;
  ventanaHqMultiTime: string;
  ventanaPeroxidaseInhibitor: boolean;
  primaryAkLotId: string;
  primaryAkId: string;
  primaryAkName: string;
  primaryDilution: string;
  primaryIncubationTime: string;
  secondaryAkLotId: string;
  secondaryAkId: string;
  secondaryAkName: string;
  secondaryDilution: string;
  secondaryIncubationTime: string;
  remarks: string;
  antibodyName?: string; // Für Suche
  antibodyId?: string;   // Für Suche
}

export interface AntibodyLot {
  id: number;
  lotId: string;
  akName: string;
  manufacturer: string;
  refNumber: string;
  lotNumber: string;
  concentration: string;
  host: string;
  isotype: string;
  clone: string;
  storage: string;
  controlTissue: string;
  reactivity: string;
  owner: string;
  status: string;
  isSecondary: boolean;
  remarks: string;
}

export interface AntibodyOrder {
  id: number;
  orderId?: string; // Optional, da in einem Mock evtl. vorhanden, im anderen nicht
  workgroup: string | null; // String oder ID, je nach Nutzung
  applicant: string;
  material?: string;
  otherMaterial?: string;
  price?: number;
  orderDate?: string; // Datum wann bestellt
  deliveryDate: string | null; // Datum wann geliefert
  status?: string;
  remarks?: string;
  balanceAg?: string;
}


// --- MOCK DATEN (Nur EINMAL definiert!) ---

export const mockAntibodies: Antibody[] = [
  { id: 1, akId: 'AK-100', name: 'Ki-67', refNumber: 'A123', lotNumber: 'L-99', status: 'Aktiv', manufacturer: 'Dako' },
  { id: 2, akId: 'AK-101', name: 'CD3', refNumber: 'B456', lotNumber: 'L-55', status: 'Leer', manufacturer: 'Leica' },
  { id: 3, akId: 'AK-102', name: 'CD20', refNumber: 'C789', lotNumber: 'L-11', status: 'Aktiv', manufacturer: 'Roche' },
];

export const mockAntibodyProjects: AntibodyProject[] = [
  { 
    id: 1, projectNumber: 'AK-2024-01', status: 'in_progress', projectType: 'Validierung', 
    technicalAssistantId: 1, cooperationPartnerId: 101, workgroupId: 21, isFollowUp: false,
    tasks: 'Testung neuer Lots', projectStatusText: 'Laufend', dueDate: '2024-12-31',
    applicant: 'Dr. Müller', additionalLeaders: '', finalCheck: false, isLongTerm: false 
  }
];

export const mockStainingRuns: StainingRun[] = [
  {
    id: 1, runId: 'RUN-100', projectId: 1, technicalAssistantId: 1, stainingType: 'IHC', date: '2024-01-10',
    device: 'Bond', kit: 'Standard', cutCount: 10, tissue: 'Tonsille', material: 'Paraffin',
    pretreatDemasking: 'pH 9', pretreatReagent: 'ER2', pretreatTime: '20min',
    blockH2O2: true, blockAvidinBiotin: false, blockBsaNgs: true,
    ventanaHqLinkerTime: '', ventanaHqMultiTime: '', ventanaPeroxidaseInhibitor: false,
    primaryAkLotId: 'L-123', primaryAkId: 'AK-55', primaryAkName: 'Ki-67', primaryDilution: '1:100', primaryIncubationTime: '30min',
    secondaryAkLotId: 'L-999', secondaryAkId: 'S-01', secondaryAkName: 'Anti-Mouse', secondaryDilution: '1:200', secondaryIncubationTime: '20min',
    remarks: 'Gute Färbung', antibodyName: 'Ki-67', antibodyId: 'AK-100'
  }
];

export const mockAntibodyLots: AntibodyLot[] = [
  {
    id: 1, lotId: 'LOT-500', akName: 'CD3', manufacturer: 'Dako', refNumber: 'REF-1', lotNumber: 'CH-99',
    concentration: '0.5mg/ml', host: 'Mouse', isotype: 'IgG1', clone: 'F7.2.38', storage: '4°C',
    controlTissue: 'Tonsille', reactivity: 'Human', owner: 'AG Müller', status: 'active', isSecondary: false, remarks: ''
  }
];

export const mockAntibodyOrders: AntibodyOrder[] = [
  { 
    id: 1, orderId: 'ORD-20', workgroup: 'AG Immunologie', applicant: 'Dr. Müller', 
    orderDate: '2023-11-01', status: 'Bestellt', material: 'CD3 Antikörper', 
    price: 250.00, deliveryDate: null, balanceAg: '5000.00' 
  },
  { 
    id: 2, orderId: 'ORD-21', workgroup: 'AG Onkologie', applicant: 'Prof. Weber', 
    orderDate: '2023-11-05', status: 'Geliefert', material: 'Ki-67', 
    price: 120.00, deliveryDate: '2023-11-10', balanceAg: '2000.00' 
  },
];