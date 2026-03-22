const fs = require('fs');
const path = require('path');

const dir = '/opt/work/dilims/DataHub/src/stores';

// projectStore.ts
let projStore = fs.readFileSync(path.join(dir, 'projectStore.ts'), 'utf8');
if (!projStore.includes('shallowRef')) {
  projStore = projStore.replace(/import \{ defineStore \} from 'pinia';/, "import { defineStore } from 'pinia';\nimport { shallowRef } from 'vue';");
  projStore = projStore.replace(/projects: \[\] as Project\[\],/, "projects: shallowRef<Project[]>([]),");
}
fs.writeFileSync(path.join(dir, 'projectStore.ts'), projStore);

// serviceStore.ts
let servStore = fs.readFileSync(path.join(dir, 'serviceStore.ts'), 'utf8');
if (!servStore.includes('shallowRef')) {
  servStore = servStore.replace(/import \{ defineStore \} from 'pinia';/, "import { defineStore } from 'pinia';\nimport { shallowRef } from 'vue';");
  servStore = servStore.replace(/services: \[\] as ProjectService\[\],/, "services: shallowRef<ProjectService[]>([]),");
}
fs.writeFileSync(path.join(dir, 'serviceStore.ts'), servStore);

console.log("Stores updated");
