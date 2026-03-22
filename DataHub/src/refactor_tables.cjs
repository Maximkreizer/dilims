const fs = require('fs');
const path = require('path');

const dir = '/opt/work/dilims/DataHub/src';

// 1. & 2. ResizableProjectTable.vue
let projTable = fs.readFileSync(path.join(dir, 'components/lab/shared/ResizableProjectTable.vue'), 'utf8');

// replace imports
projTable = projTable.replace(/import \{ ref \} from 'vue';/, "import { ref, onUnmounted, computed } from 'vue';");

// Replace getName calls in template with map lookups
projTable = projTable.replace(/getName\(item\.technicalAssistantId, options\.technicalAssistants, 'fullName'\)/g, "taMap[item.technicalAssistantId] || '-'");
projTable = projTable.replace(/getName\(value, options\.cooperationPartners, 'fullName'\)/g, "cpMap[value] || '-'");
projTable = projTable.replace(/getName\(value, options\.workgroups, 'name'\)/g, "wgMap[value] || '-'");

// Add computed maps
const mapsCode = `
// O(1) Lookups for relations
const taMap = computed(() => { const m: Record<number, string> = {}; (props.options.technicalAssistants || []).forEach((x:any) => m[x.id] = x.fullName); return m; });
const cpMap = computed(() => { const m: Record<number, string> = {}; (props.options.cooperationPartners || []).forEach((x:any) => m[x.id] = x.fullName); return m; });
const wgMap = computed(() => { const m: Record<number, string> = {}; (props.options.workgroups || []).forEach((x:any) => m[x.id] = x.name); return m; });
const statusMap = computed(() => { const m: Record<string, string> = {}; (props.options.statuses || []).forEach((x:any) => m[x.value] = x.title); return m; });
`;
projTable = projTable.replace(/\/\/ Helper/, mapsCode + '\n// Helper');

// Remove getName function
projTable = projTable.replace(/function getName\(id: number \| null \| undefined, list: any\[\], field: string\) \{ if \(\!id\) return '-'; return list\?\.\[find\]\(i=>i\.id===id\)\?\.[field] \|\| '-'; \}\n?/g, '');
projTable = projTable.replace(/function getName\(id: number \| null \| undefined, list: any\[\], field: string\) \{ if \(\!id\) return '-'; return list\?\.find\(i=>i\.id===id\)\?\.(?:\[field\]|\w+) \|\| '-'; \}/g, '');
projTable = projTable.replace(/function getName.*\}\n/g, '');

// update getStatusText
projTable = projTable.replace(/function getStatusText\(s: string\) \{ return props\.options\.statuses\?\.find\(\(x:any\)=>x\.value===s\)\?\.title \|\| s; \}/g, "function getStatusText(s: string) { return statusMap.value[s] || s; }");

// Editing State Isolation (avoid isEditing inline)
// Instead of modifying template heavily, just create a computed for the currently editing cell string ID and do `editingCellStr === item.id + '-' + 'projectNumber'`
projTable = projTable.replace(/isEditing\(item, '([a-zA-Z0-9_]+)'\)/g, "editingCellId === item.id + '-$1'");

const editingComputedCode = `
const editingCellId = computed(() => editingCell.value ? editingCell.value.id + '-' + editingCell.value.field : null);
`;
projTable = projTable.replace(/const editingCell = ref/g, editingComputedCode + '\nconst editingCell = ref');

// Add onUnmounted for resizing
const resizingFixProj = `
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
`;

projTable = projTable.replace(/function startColumnResize.*?cursor = 'ns-resize';\n\}/s, resizingFixProj);
fs.writeFileSync(path.join(dir, 'components/lab/shared/ResizableProjectTable.vue'), projTable);

// 1. & 2. ResizableServiceTable.vue
let servTable = fs.readFileSync(path.join(dir, 'components/lab/shared/ResizableServiceTable.vue'), 'utf8');
servTable = servTable.replace(/import \{ ref \} from 'vue';/, "import { ref, onUnmounted, computed } from 'vue';");

servTable = servTable.replace(/isEditing\(item, '([a-zA-Z0-9_]+)'\)/g, "editingCellId === item.id + '-$1'");
servTable = servTable.replace(/const editingCell = ref/g, "const editingCellId = computed(() => editingCell.value ? editingCell.value.id + '-' + editingCell.value.field : null);\nconst editingCell = ref");

servTable = servTable.replace(/function startColumnResize.*?cursor = 'ns-resize'; \}/s, resizingFixProj.replace(/Math\.max\(10/g, 'Math.max(10').trim());
fs.writeFileSync(path.join(dir, 'components/lab/shared/ResizableServiceTable.vue'), servTable);

// 1. ResizableGenericTable.vue
let genTable = fs.readFileSync(path.join(dir, 'components/lab/shared/ResizableGenericTable.vue'), 'utf8');
genTable = genTable.replace(/import \{ ref \} from 'vue';/, "import { ref, onUnmounted } from 'vue';");
genTable = genTable.replace(/function startColumnResize.*?cursor = 'ns-resize';\n\}/s, resizingFixProj.replace(/Math\.max\(10/g, 'Math.max(20').trim() + '\n');
fs.writeFileSync(path.join(dir, 'components/lab/shared/ResizableGenericTable.vue'), genTable);

console.log("Tables updated");
