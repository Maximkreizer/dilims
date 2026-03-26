import os
import re

VUE_DIR = '/opt/work/openclaw_data/dilims/DataHub/src'

for root, _, files in os.walk(VUE_DIR):
    for f in files:
        if f.endswith('.vue') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            
            # Remove store creations inside setup functions
            content = re.sub(r'const\s+\w*Store\s*=\s*use\w*Store\(\);?\n?', '', content)
            
            # Replace navStore. with state.nav.
            content = re.sub(r'navStore\.', 'state.nav.', content)
            
            # Replace projectStore. with state.projects.
            content = re.sub(r'projectStore\.', 'state.projects.', content)
            
            # Replace serviceStore. with state.services.
            content = re.sub(r'serviceStore\.', 'state.services.', content)
            
            # Remove any left-over useProjectStore / useNavigationStore imports (handled by previous but let's be sure)
            content = re.sub(r'import\s+{.*use\w*Store.*}\s*from\s*["\']@/state["\'];?\n?', '', content)

            if content != original_content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Replaced store usage in: {path}")
