<template>
  <v-card border class="d-flex flex-column" :style="{ height: tableHeight + 'px' }" style="overflow: hidden;">
    
    <v-card-title class="d-flex align-center bg-grey-lighten-5 py-2 flex-grow-0 flex-shrink-0 user-select-none" style="min-height: 48px;">
      <span class="text-subtitle-1 font-weight-bold">Projektliste</span>
      <v-chip size="small" color="primary" class="ml-4" variant="flat">{{ projects.length }}</v-chip>
      <v-spacer></v-spacer>
      <span class="text-caption text-grey">Drag header to resize • Drag bottom to expand</span>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
      :headers="headers"
      :items="projects"
      :loading="loading"
      density="compact"
      fixed-header
      hover
      class="project-table flex-grow-1"
      style="overflow-y: auto;" 
    >
      <!-- HEADER RESIZER -->
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

      <!-- ==================== ACTION SPALTEN ==================== -->

      <!-- 1. ÖFFNEN -->
      <template v-slot:item.action_open="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="primary" @click.stop="$emit('open', item)">
            <v-icon>mdi-open-in-new</v-icon>
            <v-tooltip activator="parent" location="top">Projekt öffnen</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- 2. NEUER TAB -->
      <template v-slot:item.action_tab="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="grey-darken-3" @click.stop="$emit('open-in-tab', item)">
            <v-icon>mdi-tab-plus</v-icon>
            <v-tooltip activator="parent" location="top">In neuem Tab öffnen</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- 3. LÖSCHEN (Nur anzeigen, wenn NICHT readonly, oder explizit gewünscht?) 
           Falls Löschen auch in der Suche erlaubt sein soll, lassen wir es so. 
           Wenn Löschen als "Bearbeiten" gilt, fügen wir v-if="!readonly" hinzu.
           Ich lasse es erstmal drin, da Löschen oft auch in Listenansichten gewünscht ist.
      -->
      <template v-slot:item.action_delete="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon size="x-small" variant="text" color="error" @click.stop="confirmDelete(item)">
            <v-icon>mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="top">Projekt löschen</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- ==================== DATEN SPALTEN (Jetzt mit Readonly-Check) ==================== -->

      <template v-slot:item.ProjektNr="{ item }">
        <div 
          @click="startEdit(item, 'ProjektNr')" 
          :class="readonly ? 'readonly-cell' : 'editable-cell'" 
          class="text-wrap"
        >
          <DidataTextField v-if="editingCellId === item.ORIGREC + '-ProjektNr'" v-model="editingValue" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'ProjektNr')" @blur="cancelEdit"></DidataTextField>
          <span v-else>{{ item.ProjektNr }}</span>
        </div>
      </template>

      <template v-slot:item.Bearbeitung="{ item }">
        <div 
          @click.stop="startEdit(item, 'Bearbeitung')" 
          :class="readonly ? 'readonly-cell' : 'editable-cell'"
        >
          <DidataSelect v-if="editingCellId === item.ORIGREC + '-Bearbeitung'" v-model="editingValue" :items="options.statuses" item-title="title" item-value="value" variant="plain" density="compact" hide-details menu-icon="" open-on-mount @update:model-value="saveEdit(item, 'Bearbeitung')"></DidataSelect>
          <v-chip v-else size="x-small" :color="getStatusColor(item.Bearbeitung)" class="px-1" style="max-width: 100%;"><span class="text-truncate">{{ getStatusText(item.Bearbeitung) }}</span></v-chip>
        </div>
      </template>

      <template v-slot:item.Aufgaben="{ item }">
        <div 
          @click="startEdit(item, 'Aufgaben')" 
          :class="readonly ? 'readonly-cell' : 'editable-cell'" 
          class="text-wrap"
        >
          <DidataTextField v-if="editingCellId === item.ORIGREC + '-Aufgaben'" v-model="editingValue" variant="plain" density="compact" hide-details autofocus @keydown.enter="saveEdit(item, 'Aufgaben')" @blur="cancelEdit"></DidataTextField>
          <span v-else>{{ item.Aufgaben || '...' }}</span>
        </div>
      </template>

      <template v-slot:item.TA="{ item }">
        <div 
          @click.stop="startEdit(item, 'TA')" 
          :class="readonly ? 'readonly-cell' : 'editable-cell'"
        >
          <DidataSelect v-if="editingCellId === item.ORIGREC + '-TA'" v-model="editingValue" :items="options.technicalAssistants" item-title="LANGTEXT" item-value="ORIGREC" variant="plain" density="compact" hide-details menu-icon="" open-on-mount @update:model-value="saveEdit(item, 'TA')"></DidataSelect>
          <span v-else class="text-truncate">{{ taMap[item.TA] || '-' }}</span>
        </div>
      </template>

      <template v-slot:item.Arzt="{ value }">{{ cpMap[value] || '-' }}</template>
      <template v-slot:item.AB_P_Kundennummer="{ value }">{{ wgMap[value] || '-' }}</template>
      
      <!-- Checkboxen: Wenn readonly, dann disabled -->
      <template v-slot:item.Abschlusskontrolle="{ item }">
        <v-checkbox-btn v-model="item.Abschlusskontrolle" density="compact" :disabled="readonly" @change="quickSave(item)"></v-checkbox-btn>
      </template>
      <template v-slot:item.Langzeitprojekt="{ item }">
        <v-checkbox-btn v-model="item.Langzeitprojekt" density="compact" :disabled="readonly" @change="quickSave(item)"></v-checkbox-btn>
      </template>
    </v-data-table>

    <div class="height-resizer bg-grey-lighten-3 d-flex justify-center align-center flex-shrink-0" @mousedown.prevent="startHeightResize">
      <div style="width: 40px; height: 4px; background-color: #bdbdbd; border-radius: 2px;"></div>
    </div>

    <!-- Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">Projekt löschen?</v-card-title>
        <v-card-text>Möchten Sie das Projekt <strong>{{ itemToDelete?.ProjektNr }}</strong> wirklich löschen?</v-card-text>
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
import { ref, onUnmounted, computed } from 'vue';
import { api } from '@/services/api';
import type { Project } from '@/mocks/db';

const props = defineProps<{
  projects: Project[];
  loading: boolean;
  options: any;
  readonly?: boolean; // NEU: Optionale Prop
}>();

const emit = defineEmits<{
  (e: 'open', project: Project): void;
  (e: 'open-in-tab', project: Project): void;
  (e: 'project-updated', project: Project): void;
  (e: 'delete', project: Project): void;
}>();

const tableHeight = ref(400);
const deleteDialog = ref(false);
const itemToDelete = ref<Project | null>(null);

// Header-Definition (Reihenfolge: Öffnen, Tab, Löschen)
const headers = ref<any[]>([
  { title: 'Öffnen', key: 'action_open', width: 60, sortable: false, align: 'center', fixed: true },
  { title: 'Tab', key: 'action_tab', width: 50, sortable: false, align: 'center', fixed: true },
  { title: 'Löschen', key: 'action_delete', width: 60, sortable: false, align: 'center', fixed: true },
  
  { title: 'Nr.', key: 'ProjektNr', width: 80 },
  { title: 'Status', key: 'Bearbeitung', width: 100 },
  { title: 'Aufgabe', key: 'Aufgaben', width: 300 },
  { title: 'TA', key: 'TA', width: 100 },
  { title: 'Partner', key: 'Arzt', width: 120 },
  { title: 'AG', key: 'AB_P_Kundennummer', width: 100 },
  { title: 'Abschl.', key: 'Abschlusskontrolle', width: 60, align: 'center' },
  { title: 'Langzeit', key: 'Langzeitprojekt', width: 60, align: 'center' },
]);


// O(1) Lookups for relations
const taMap = computed(() => { const m: Record<string, string> = {}; (props.options.technicalAssistants || []).forEach((x:any) => m[x.ORIGREC] = x.LANGTEXT); return m; });
const cpMap = computed(() => { const m: Record<string, string> = {}; (props.options.cooperationPartners || []).forEach((x:any) => m[x.ID] = x.Vorname_Name); return m; });
const wgMap = computed(() => { const m: Record<string, string> = {}; (props.options.workgroups || []).forEach((x:any) => m[x.ID] = x.LOOKUP_VALUE); return m; });
const statusMap = computed(() => { const m: Record<string, string> = {}; (props.options.statuses || []).forEach((x:any) => m[x.value] = x.title); return m; });

// Helper
function getStatusColor(s: string) { return s === 'completed' ? 'success' : 'info'; }
function getStatusText(s: string) { return statusMap.value[s] || s; }


// Delete
function confirmDelete(item: Project) { itemToDelete.value = item; deleteDialog.value = true; }
function executeDelete() { if (itemToDelete.value) { emit('delete', itemToDelete.value); deleteDialog.value = false; itemToDelete.value = null; } }

// Editing

const editingCellId = computed(() => editingCell.value ? editingCell.value.ORIGREC + '-' + editingCell.value.field : null);

const editingCell = ref<{ ORIGREC: number, field: string } | null>(null);
const editingValue = ref<any>(null);


function startEdit(item: Project, field: string) { 
  // WICHTIG: Wenn Readonly, brich sofort ab!
  if (props.readonly) return;

  if(editingCell.value) cancelEdit(); 
  editingCell.value = { ORIGREC: item.ORIGREC, field }; 
  editingValue.value = (item as any)[field]; 
}

function cancelEdit() { setTimeout(() => { editingCell.value = null; editingValue.value = null; }, 150); }
async function saveEdit(item: Project, field: string) { if (editingCell.value) { (item as any)[field] = editingValue.value; const saved = await api.saveProject(item); emit('project-updated', saved); editingCell.value = null; editingValue.value = null; } }
async function quickSave(item: Project) { if(props.readonly) return; const saved = await api.saveProject(item); emit('project-updated', saved); }

// Resizing

const activeListeners = { move: null as any, up: null as any };
function cleanupListeners() {
  if (activeListeners.move) document.removeEventListener('mousemove', activeListeners.move);
  if (activeListeners.up) document.removeEventListener('mouseup', activeListeners.up);
  activeListeners.move = null; activeListeners.up = null;
  document.body.style.cursor = '';
}
onUnmounted(() => cleanupListeners());

function startColumnResize(event: MouseEvent, column: any) {
  cleanupListeners();
  const startX = event.pageX; const startWidth = column.width || 50;
  const onMouseMove = (e: MouseEvent) => { column.width = Math.max(10, startWidth + (e.pageX - startX)); };
  const onMouseUp = () => cleanupListeners();
  activeListeners.move = onMouseMove; activeListeners.up = onMouseUp;
  document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'col-resize';
}
function startHeightResize(event: MouseEvent) {
  cleanupListeners();
  const startY = event.pageY; const startHeight = tableHeight.value;
  const onMouseMove = (e: MouseEvent) => { if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 10); tableHeight.value = Math.max(150, startHeight + (e.pageY - startY)); };
  const onMouseUp = () => cleanupListeners();
  activeListeners.move = onMouseMove; activeListeners.up = onMouseUp;
  document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'ns-resize';
}

</script>

<style scoped>
.project-table { table-layout: fixed; }
.custom-header {
  border-bottom: thin solid rgba(0,0,0,0.12); border-right: 1px solid rgba(0,0,0,0.12);
  background-color: #f5f5f5; white-space: nowrap; overflow: hidden; padding: 0 4px !important; height: 48px; vertical-align: middle; font-size: 0.75rem;
}
.column-resizer { position: absolute; top: 0; right: -5px; width: 10px; height: 100%; cursor: col-resize; background-color: transparent; z-index: 10; }
.height-resizer { height: 12px; cursor: ns-resize; border-top: 1px solid #e0e0e0; }
.text-wrap { white-space: normal !important; word-break: break-word; overflow-wrap: anywhere; line-height: 1.2; padding: 4px 0; font-size: 0.85rem; }
.project-table :deep(.v-table__wrapper) { overflow-x: auto; }

/* Bearbeitbar: Zeiger-Cursor und Hover-Effekt */
.editable-cell { cursor: text; min-height: 32px; display: flex; align-items: center; overflow: hidden; padding: 0 2px; }
.editable-cell:hover { background-color: #fafafa; outline: 1px dashed #bdbdbd; }

/* Readonly: Standard-Cursor, kein Hover-Effekt */
.readonly-cell { cursor: default; min-height: 32px; display: flex; align-items: center; overflow: hidden; padding: 0 2px; }

.editable-cell :deep(.v-field__input) { padding: 0 !important; min-height: 24px; font-size: 0.85rem; }
.editable-cell :deep(.v-field__append-inner) { display: none; }
</style>