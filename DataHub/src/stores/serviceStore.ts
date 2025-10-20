// src/stores/serviceStore.ts
import { defineStore } from 'pinia';
import type { 
  ProjectService, 
  GenericService,
  ParaffinSectionService,
  ParaffinTubeService,
  CryoSectionService,
  CryoTubeService,
  CryoService,
  IhcService,
  VirtualMicroscopyService,
  SimpleCountService,
  TmaSectionService
} from '@/mocks/db';
import { useProjectStore } from './projectStore';

export const useServiceStore = defineStore('services', {
  state: () => ({
    services: [] as ProjectService[],
    activeService: null as ProjectService | { status: 'selecting' } | null,
    isLoading: false,
  }),
  actions: {
    async fetchServicesForActiveProject() {
      const projectStore = useProjectStore();
      if (!projectStore.activeProject) return;
      this.isLoading = true;
      this.services = projectStore.activeProject.services || [];
      this.isLoading = false;
    },
    prepareNewService() { this.activeService = { status: 'selecting' }; },
    loadService(service: ProjectService) { this.activeService = service; },
    cancelEditing() { this.activeService = null; },

    selectServiceType(type: string) {
      const base = { id: 0, remarks: '', deliveryDate: null };
      let newService: ProjectService | null = null;

      switch (type) {
        // Sparte 1
        case 'paraffin_sections':
          newService = { ...base, serviceType: type, sampleCount: 0, unstainedSectionsPerSample: 0, tubesPerSample: 0, scrollsPerTube: 0, heSectionsForRequestor: 0, heSectionsForTissueBank: 0, archiveSectionCount: 0, archiveBlockCount: 0 };
          break;
        case 'paraffin_tubes':
          newService = { ...base, serviceType: type, sampleCount: 0, tubesPerSample: 0, scrollsPerTube: 0, heSectionsForRequestor: 0, heSectionsForTissueBank: 0, archiveSectionCount: 0, archiveBlockCount: 0 };
          break;
        case 'paraffin_embedding':
          newService = { ...base, serviceType: type, count: 0 };
          break;
        case 'cryo_sections':
          newService = { ...base, serviceType: type, sampleCount: 0, unstainedSectionsPerSample: 0, heSectionsForRequestor: 0, heSectionsForTissueBank: 0, archiveSampleCount: 0 };
          break;
        case 'cryo_tubes':
          newService = { ...base, serviceType: type, sampleCount: 0, tubesPerSample: 0, scrollsPerTubeCount: 0, scrollsPerTubeWeight: 0, heSectionsForRequestor: 0, heSectionsForTissueBank: 0, archiveSampleCount: 0 };
          break;
        case 'cryo_service':
          newService = { ...base, serviceType: type, sampleCount: 0, unstainedSectionsPerSample: 0, heSectionsForRequestor: 0, heSectionsForTissueBank: 0 };
          break;

        case 'ihc':
          newService = { ...base, serviceType: type, slideCount: 0, stainingDevice: null };
          break;
        case 'pathological_assessment':
          newService = { ...base, serviceType: type, count: 0 };
          break;
        case 'dna_rna_extraction':
          newService = { ...base, serviceType: type, count: 0 };
          break;
        case 'staining':
          newService = { ...base, serviceType: type };
          break;

        case 'tma_creation':
          newService = { ...base, serviceType: type };
          break;
        case 'tma_sections':
          newService = { ...base, serviceType: type, sourceTmaId: 0, sourceTmaName: '', blockCount: 0, blockNumbers: '', sectionsPerBlock: 0 };
          break;

        // Sparte 4
        case 'virtual_microscopy':
          newService = { ...base, serviceType: type, archiveSectionCount: 0, archiveBlockCount: 0, scanCount: 0, isBrightfield: false, isFluorescence: false };
          break;  
        case 'archival_work': // Explizit hinzugefügt
          newService = { ...base, serviceType: type };
          break;
        // Sparte 5
        case 'data':
          newService = { ...base, serviceType: type };
          break;
        case 'ethics':
          newService = { ...base, serviceType: type };
          break;

        // default
        default: newService = { ...base, serviceType: type as GenericService['serviceType'] };
      }
      this.activeService = newService;
    },
    
    async saveActiveService() {
      if (!this.activeService || 'status' in this.activeService) return;
      const projectStore = useProjectStore();
      if (!projectStore.activeProject) return;
      this.isLoading = true;
      const serviceData = this.activeService;
      const index = projectStore.activeProject.services.findIndex(s => s.id === serviceData.id);

      if (index !== -1 && serviceData.id !== 0) {
        projectStore.activeProject.services[index] = serviceData;
      } else {
        serviceData.id = Date.now();
        projectStore.activeProject.services.push(serviceData);
      }
      
      // Lade die Liste neu, um die Reaktivität sicherzustellen
      this.services = [...projectStore.activeProject.services];
      this.activeService = null;
      this.isLoading = false;
    },
  },
});