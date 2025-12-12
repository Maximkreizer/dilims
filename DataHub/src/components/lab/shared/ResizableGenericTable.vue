<template>
  <v-card border class="d-flex flex-column" :style="{ height: tableHeight + 'px' }" style="overflow: hidden;">
    <v-card-title class="d-flex align-center bg-grey-lighten-5 py-2 flex-grow-0 flex-shrink-0 user-select-none" style="min-height: 48px;">
      <span class="text-subtitle-1 font-weight-bold">Ergebnisse</span>
      <v-chip size="small" color="primary" class="ml-4" variant="flat">{{ items.length }} Treffer</v-chip>
      <v-spacer></v-spacer>
      <span class="text-caption text-grey">Drag header to resize</span>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      density="compact"
      fixed-header
      hover
      class="generic-table flex-grow-1"
      style="overflow-y: auto;" 
    >
      <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
        <tr>
          <!-- FIX: index hinzugefügt und key sicher gemacht -->
          <template v-for="(column, index) in columns" :key="column.key || index">
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

      <!-- SLOTS FÜR BUTTONS -->
      <template v-slot:item.action_open="{ item }">
        <slot name="item.action_open" :item="item"></slot>
      </template>
      <template v-slot:item.action_tab="{ item }">
        <slot name="item.action_tab" :item="item"></slot>
      </template>
      <template v-slot:item.action_delete="{ item }">
        <slot name="item.action_delete" :item="item"></slot>
      </template>

    </v-data-table>

    <div class="height-resizer bg-grey-lighten-3 d-flex justify-center align-center flex-shrink-0" @mousedown.prevent="startHeightResize">
      <div style="width: 40px; height: 4px; background-color: #bdbdbd; border-radius: 2px;"></div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  items: any[];
  headers: any[];
  loading: boolean;
}>();

const tableHeight = ref(400);

function startColumnResize(event: MouseEvent, column: any) {
  const startX = event.pageX; const startWidth = column.width || 50;
  const onMouseMove = (e: MouseEvent) => { column.width = Math.max(20, startWidth + (e.pageX - startX)); };
  const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); document.body.style.cursor = ''; };
  document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'col-resize';
}
function startHeightResize(event: MouseEvent) {
  const startY = event.pageY; const startHeight = tableHeight.value;
  const onMouseMove = (e: MouseEvent) => { if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 10); tableHeight.value = Math.max(150, startHeight + (e.pageY - startY)); };
  const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); document.body.style.cursor = ''; };
  document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); document.body.style.cursor = 'ns-resize';
}
</script>

<style scoped>
.generic-table { table-layout: fixed; }
.custom-header { border-bottom: thin solid rgba(0,0,0,0.12); border-right: 1px solid rgba(0,0,0,0.12); background-color: #f5f5f5; white-space: nowrap; overflow: hidden; padding: 0 4px !important; height: 48px; vertical-align: middle; font-size: 0.75rem; }
.column-resizer { position: absolute; top: 0; right: -5px; width: 10px; height: 100%; cursor: col-resize; background-color: transparent; z-index: 10; }
.column-resizer:hover { background-color: rgba(33, 150, 243, 0.3); }
.height-resizer { height: 12px; cursor: ns-resize; border-top: 1px solid #e0e0e0; }
.project-table :deep(.v-table__wrapper) { overflow-x: auto; }
</style>