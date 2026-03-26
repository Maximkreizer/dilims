/**
 * =======================================================================================
 * DATA CONTRACT & MOCK DATABASE (UPDATED)
 * =======================================================================================
 */

export interface TechnicalAssistant {
  ORIGREC: number;
  KUERZEL: string;
  LANGTEXT: string;
}

export interface CooperationPartner {
  ID: number;
  KUERZEL?: string; // Optional, da Kunden oft kein Kürzel haben
  Vorname_Name: string;
}

export interface Workgroup {
  ID: number;
  LOOKUP_VALUE: string;
}

// Basis-Eigenschaften für alle Services
export interface BaseService {
  ORIGREC: number;
  serviceType: string; // Wichtig für die Unterscheidung
  remarks: string;     // Bemerkung
  Abgabedatum: string | null; // Abgabedatum
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
  ORIGREC: number;
  ProjektNr: string;

  // Flags (Legacy Access nutzt bit/Boolean-Werte)
  isNctTbb: boolean;
  isPccc: boolean;
  isDzif: boolean;
  isCmcp: boolean;
  isSfb118Project: boolean;
  isFollowUpProject: boolean;
  Langzeitprojekt: boolean;
  Abschlusskontrolle: boolean;

  // Status & Text
  Bearbeitung: 'clarified' | 'pending_number' | 'in_progress' | 'completed' | 'inquiry' | 'rejected' | 'cancelled' | 'on_hold' | string;
  Aufgaben: string;
  Projektstand: string;

  // Relationen (Legacy Access speichert meist die Fremdschlüssel-ID)
  TA: number | null | undefined;
  Arzt: number | null | undefined;
  AB_P_Kundennummer: number | null | undefined; // Korrespondiert oft mit Workgroup ID

  // Daten
  Abgabedatum: string | null | undefined;
  estimatedCompletionDate: string | null | undefined;
  lastThursdayOfMonth: string | null | undefined;
  
  // Die Liste der Services (Sub-Entitäten)
  services: ProjectService[];

  // Antragsdaten (Readonly View)
  AB_Studie?: string | null;
  AB_Bearbeitung?: string | null;
  AB_Projekttitel?: string | null;
  AB_Anforderung?: string | null;
  AB_Koop_Vorname_Nachname?: string | null;
  AB_Rueckmeldung?: string | null;
  AB_Genehmigung?: string | null;
  AB_Abgabe?: string | null;
  AB_Langzeitprojekt?: boolean;
  AB_P_Nachname_Vorname?: string | null;
  AB_Ansprechpartner?: string | null;
}

// =======================================================================================
// MOCK DATA (Entfernt in Phase 3 - API nutzt PHP-Backend)
// =======================================================================================

export const mockTechnicalAssistants: TechnicalAssistant[] = [];
export const mockCooperationPartners: CooperationPartner[] = [];
export const mockWorkgroups: Workgroup[] = [];
export const mockProjects: Project[] = [];
export const mockAntibodies: Antibody[] = [];
export const mockAntibodyProjects: Project[] = [];
export const mockStainingRuns: StainingRun[] = [];
export const mockAntibodyLots: AntibodyLot[] = [];
export const mockAntibodyOrders: AntibodyOrder[] = [];
