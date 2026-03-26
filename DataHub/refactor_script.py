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
            
            # Remove vue-router imports
            content = re.sub(r'import\s+{([^}]*)}\s+from\s+[\'"]vue-router[\'"];?\n?', r'import {\1} from "@/state";\n', content)
            
            # Remove pinia imports
            content = re.sub(r'import\s+.*?\s+from\s+[\'"]pinia[\'"];?\n?', '', content)
            
            # Rewrite store imports to state
            content = re.sub(r'import\s+{([^}]*Store)}\s+from\s+[\'"]@/stores/[^\'"]+[\'"];?\n?', r'import { state, \1 } from "@/state";\n', content)
            
            if content != original_content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Refactored: {path}")

