<template>
  <v-card border class="d-flex flex-column" :style="{ height: tableHeight + 'px' }" style="overflow: hidden;">
    
    <v-card-title class="d-flex align-center bg-grey-lighten-5 py-2 flex-grow-0 flex-shrink-0 user-select-none" style="min-height: 48px;">
      <span class="text-subtitle-1 font-weight-bold">Erfasste Dienstleistungen</span>
      <v-chip size="small" color="primary" class="ml-4" variant="flat">{{ services.length }}</v-chip>
      <v-spacer></v-spacer>
      <span class="text-caption text-grey">Drag header to resize • Drag bottom to expand</span>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
      :headers="headers"
      :items="services"
      :loading="loading"
      density="compact"
      fixed-header
      hover
      class="service-table flex-grow-1"
      style="overflow-y: auto;" 
    >
      <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
        <tr>
          <template v-for="column in columns" :key="column.key">
            <th 
              :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
              class="custom-header position-relative"
              @click="() => toggleSort(column)"
            >
              <div class="d-flex align-center justify-center w-100 h-100" style="overflow: hidden;">
                <span class="font-weight-bold text-truncate">{{ column.title }}</span>
                <v-icon v-if="isSorted(column)" size="x-small">{{ getSortIcon(column) }}</v-icon>
              </div>
              <div class="column-resizer" @click.stop @mousedown.stop.prevent="startColumnResize($event, column)"></div>
            </th>
          </template>
        </tr>
      </template>

      <!-- SPALTEN -->
      
      <template v-slot:item.action_open="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="primary" @click.stop="$emit('open', item)">
            <v-icon>mdi-open-in-new</v-icon>
            <v-tooltip activator="parent" location="top">Dienstleistung bearbeiten</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.action_tab="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="grey-darken-3" @click.stop="$emit('open-in-tab', item)">
            <v-icon>mdi-tab-plus</v-icon>
            <v-tooltip activator="parent" location="top">In neuem Tab öffnen</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.action_delete="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="error" @click.stop="confirmDelete(item)">
            <v-icon>mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="top">Dienstleistung löschen</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template v-slot:item.serviceType="{ item }">
        <div class="d-flex align-center px-1" style="height: 32px;">
          <v-icon size="small" class="mr-2" color="grey-darken-2">{{ getIcon(item.serviceType) }}</v-icon>
          <span class="text-truncate">{{ getLabel(item.serviceType) }}</span>
        </div>
      </template>

      <template v-slot:item.smartCount="{ item }">
        <div @click="startEdit(item, 'smartCount')" class="editable-cell">
          <v-text-field 
            v-if="isEditing(item, 'smartCount')" 
            v-model.number="editingValue" 
            type="number"
            variant="plain" density="compact" hide-details autofocus 
            @keydown.enter="saveSmartCount(item)" 
            @blur="cancelEdit"
            @click.stop
          ></v-text-field>
          <span v-else>{{ getSmartCount(item) }}</span>
        </div>
      </template>

      <template v-slot:item.remarks="{ item }">
        <div @click="startEdit(item, 'remarks')" class="editable-cell text-wrap">
          <v-text-field v-if="isEditing(item, 'remarks')" v-model="editingValue" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'remarks')" @blur="cancelEdit" @click.stop></v-text-field>
          <span v-else>{{ item.remarks || '-' }}</span>
        </div>
      </template>

      <template v-slot:item.deliveryDate="{ item }">
        <div @click="startEdit(item, 'deliveryDate')" class="editable-cell">
          <v-text-field v-if="isEditing(item, 'deliveryDate')" v-model="editingValue" type="date" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'deliveryDate')" @blur="cancelEdit" @click.stop></v-text-field>
          <span v-else>{{ formatDate(item.deliveryDate) }}</span>
        </div>
      </template>

    </v-data-table>

    <div class="height-resizer bg-grey-lighten-3 d-flex justify-center align-center flex-shrink-0" @mousedown.prevent="startHeightResize">
      <div style="width: 40px; height: 4px; background-color: #bdbdbd; border-radius: 2px;"></div>
    </div>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">Dienstleistung löschen?</v-card-title>
        <v-card-text>Möchten Sie diese Dienstleistung ({{ itemToDelete ? getLabel(itemToDelete.serviceType) : '' }}) wirklich löschen?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog = false">Abbrechen</v-btn>
          <v-btn color="error" variant="flat" @click="executeDelete">Löschen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProjectService } from '@/mocks/db';

const icons: Record<string, string> = { paraffin_sections: 'mdi-layers-outline', paraffin_tubes: 'mdi-test-tube', paraffin_embedding: 'mdi-archive-outline', cryo_sections: 'mdi-snowflake', cryo_tubes: 'mdi-snowflake-melt', cryo_service: 'mdi-snowflake-alert', ihc: 'mdi-eyedropper-variant', staining: 'mdi-brush', dna_rna_extraction: 'mdi-dna', pathological_assessment: 'mdi-clipboard-pulse', tma_creation: 'mdi-dots-grid', tma_sections: 'mdi-grid', virtual_microscopy: 'mdi-monitor-eye', archival_work: 'mdi-archive-search', data: 'mdi-database', ethics: 'mdi-gavel' };
const labels: Record<string, string> = { paraffin_sections: 'Paraffin-Schnitte', paraffin_tubes: 'Paraffin-Tubes', paraffin_embedding: 'Paraffin-Einbettung', cryo_sections: 'Kryo-Schnitte', cryo_tubes: 'Kryo-Tubes', cryo_service: 'Kryo-Service', ihc: 'IHC', staining: 'Färbung', dna_rna_extraction: 'DNA/RNA-Extraktion', pathological_assessment: 'Patho. Beurteilung', tma_creation: 'TMA-Erstellung', tma_sections: 'TMA-Schnitte', virtual_microscopy: 'Virtuelle Mikroskopie', archival_work: 'Archivarbeit', data: 'Daten', ethics: 'Ethik' };

const props = defineProps<{ services: ProjectService[]; loading: boolean; }>();
const emit = defineEmits<{ (e: 'update', service: ProjectService): void; (e: 'delete', service: ProjectService): void; (e: 'open', service: ProjectService): void; (e: 'open-in-tab', service: ProjectService): void; }>();

const tableHeight = ref(400);
const deleteDialog = ref(false);
const itemToDelete = ref<ProjectService | null>(null);

function confirmDelete(item: ProjectService) { itemToDelete.value = item; deleteDialog.value = true; }
function executeDelete() { if (itemToDelete.value) { emit('delete', itemToDelete.value); deleteDialog.value = false; itemToDelete.value = null; } }

const headers = ref<any[]>([
  { title: 'Öffnen', key: 'action_open', width: 60, sortable: false, align: 'center', fixed: true },
  { title: 'Tab', key: 'action_tab', width: 50, sortable: false, align: 'center', fixed: true },
  { title: 'Löschen', key: 'action_delete', width: 60, sortable: false, align: 'center', fixed: true },
  { title: 'Dienstleistung', key: 'serviceType', width: 200 },
  { title: 'Anzahl', key: 'smartCount', width: 80, align: 'end' },
  { title: 'Bemerkung', key: 'remarks', width: 300 },
  { title: 'Lieferdatum', key: 'deliveryDate', width: 120 },
]);

// Helper
function getIcon(type: string) { return icons[type] || 'mdi-circle-small'; }
function getLabel(type: string) { return labels[type] || type; }
function formatDate(iso: string | null) { return iso ? iso.split('T')[0] : '-'; }

// --- WICHTIG: KORRIGIERTE LOGIK FÜR DIE ANZAHL ---
function getSmartCount(item: any): number | string {
  // Wir prüfen den Typ, anstatt zu raten, welches Feld existiert
  switch (item.serviceType) {
    case 'paraffin_sections':
    case 'paraffin_tubes':
    case 'cryo_sections':
    case 'cryo_tubes':
    case 'cryo_service':
      return item.sampleCount ?? 0; // P/K Anz Proben
    
    case 'paraffin_embedding':
      return item.archiveBlocksCases ?? 0; // Anz Einbettung (mapped auf dieses Feld im Formular)

    case 'ihc':
      return item.slideCount ?? 0;

    case 'dna_rna_extraction':
      return item.extractionCount ?? 0;

    case 'pathological_assessment':
      return item.assessmentCount ?? 0;

    case 'virtual_microscopy':
      return item.scanCount ?? 0;

    case 'tma_creation':
      return item.patientCount ?? 0; // Oder tmaHeCount, je nachdem was "Anzahl" sein soll

    case 'tma_sections':
      return item.blockCount ?? 0;

    default:
      // Fallback für einfache Typen
      return item.count ?? '-';
  }
}

// --- WICHTIG: KORRIGIERTE LOGIK FÜR DAS SPEICHERN ---
function saveSmartCount(item: any) {
  if (editingCell.value) {
    const val = Number(editingValue.value);
    
    // Auch hier: Spezifisches Mapping basierend auf dem Typ
    switch (item.serviceType) {
      case 'paraffin_sections':
      case 'paraffin_tubes':
      case 'cryo_sections':
      case 'cryo_tubes':
      case 'cryo_service':
        item.sampleCount = val; break;
      
      case 'paraffin_embedding':
        item.archiveBlocksCases = val; break;

      case 'ihc':
        item.slideCount = val; break;

      case 'dna_rna_extraction':
        item.extractionCount = val; break;

      case 'pathological_assessment':
        item.assessmentCount = val; break;

      case 'virtual_microscopy':
        item.scanCount = val; break;
      
      case 'tma_creation':
        item.patientCount = val; break;

      case 'tma_sections':
        item.blockCount = val; break;

      default:
        item.count = val;
    }

    emit('update', item);
    editingCell.value = null;
  }
}

// Editing & Resizing
const editingCell = ref<{ id: number, field: string } | null>(null);
const editingValue = ref<any>(null);
function isEditing(item: ProjectService, field: string) { return editingCell.value?.id === item.id && editingCell.value?.field === field; }
function startEdit(item: ProjectService, field: string) { if(editingCell.value) cancelEdit(); editingCell.value = { id: item.id, field }; if (field === 'smartCount') { const val = getSmartCount(item); editingValue.value = val === '-' ? 0 : val; } else { editingValue.value = (item as any)[field]; } }
function cancelEdit() { setTimeout(() => { editingCell.value = null; editingValue.value = null; }, 150); }
function saveEdit(item: ProjectService, field: string) { if (editingCell.value) { (item as any)[field] = editingValue.value; emit('update', item); editingCell.value = null; } }
function startColumnResize(event: MouseEvent, column: any) { const startX = event.pageX; const startWidth = column.width || 50; const onMouseMove = (e: MouseEvent) => { column.width = Math.max(10, startWidth + (e.pageX - startX)); }; const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); document.body.style.cursor = ''; }; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'col-resize'; }
function startHeightResize(event: MouseEvent) { const startY = event.pageY; const startHeight = tableHeight.value; const onMouseMove = (e: MouseEvent) => { if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 10); tableHeight.value = Math.max(150, startHeight + (e.pageY - startY)); }; const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); document.body.style.cursor = ''; }; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'ns-resize'; }
</script>

<style scoped>
.service-table { table-layout: fixed; }
.custom-header { border-bottom: thin solid rgba(0,0,0,0.12); border-right: 1px solid rgba(0,0,0,0.12); background-color: #f5f5f5; white-space: nowrap; overflow: hidden; padding: 0 4px !important; height: 48px; vertical-align: middle; font-size: 0.75rem; }
.column-resizer { position: absolute; top: 0; right: -5px; width: 10px; height: 100%; cursor: col-resize; background-color: transparent; z-index: 10; }
.height-resizer { height: 12px; cursor: ns-resize; border-top: 1px solid #e0e0e0; }
.editable-cell { cursor: text; min-height: 32px; display: flex; align-items: center; overflow: hidden; padding: 0 2px; }
.editable-cell:hover { background-color: #fafafa; outline: 1px dashed #bdbdbd; }
.editable-cell :deep(.v-field__input) { padding: 0 !important; min-height: 24px; font-size: 0.85rem; }
</style>