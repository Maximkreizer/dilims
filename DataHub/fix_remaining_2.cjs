const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]@\/stores\/[^'"]+['"];?/g, '');
  content = content.replace(/router\.push/g, 'push');
  content = content.replace(/router\.back/g, 'back');
  content = content.replace(/router\.replace/g, 'push');
  content = content.replace(/push\(\s*['"][^'"]+['"]\s*\)/g, "push({ name: 'Dashboard' })");
  content = content.replace(/push\(\s*`[^`]+`\s*\)/g, "push({ name: 'Dashboard' })");

  if (file.endsWith('ProjectDataForm.vue')) {
    content = content.replace(/const projectStore = useProjectStore\(\);/g, '');
    content = content.replace(/projectStore\./g, 'state.projects.');
    if (!content.includes("import { state }")) {
      content = content.replace(/<script setup[^>]*>/, "$&\nimport { state } from '@/state';");
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
}

fixFile('src/components/lab/forms/ProjectDataForm.vue');
fixFile('src/pages/Home.vue');
fixFile('src/pages/lab/ProjectEditorView.vue');
