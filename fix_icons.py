import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    def repl(m):
        icon_name = m.group(1)
        classes = m.group(2)
        style_block = m.group(3)
        
        # Check if the icon name is a variable like {tool.icon}
        if icon_name.startswith('{') and icon_name.endswith('}'):
            name_prop = f'name={icon_name}'
        else:
            name_prop = f'name="{icon_name}"'
            
        # Try to extract width
        size = 20
        if style_block:
            w_match = re.search(r'width:\s*(\d+)', style_block)
            if w_match:
                size = w_match.group(1)
                
        class_prop = f' className="{classes}"' if classes else ''
        
        # We drop the style because Icon handles size, but if there's other styles we lose them. 
        # Only search-icon, faq-icon had extra stuff like transition, let's just keep it simple.
        # Check if style has color
        color_prop = ''
        if style_block:
            c_match = re.search(r'color:\s*[\'"]([^\'"]+)[\'"]', style_block)
            if c_match:
                color_prop = f' color="{c_match.group(1)}"'

        return f'<Icon {name_prop} size={{{size}}}{class_prop}{color_prop} />'

    # Regex to match <i data-lucide="...">...</i>
    # Group 1: icon name (or variable)
    # Group 2: className (optional)
    # Group 3: style object (optional)
    pattern = r'<i\s+data-lucide=(["{][^"}]+["}])(?:[^>]*?className="([^"]+)")?(?:[^>]*?style={{([^}]+)}})?[^>]*><\/i>'
    
    content = re.sub(pattern, repl, content)
    
    if content != original:
        # Add import if missing
        if 'import { Icon }' not in content:
            if 'import ' in content:
                content = content.replace('import React', 'import React\nimport { Icon } from "@/components/common/Icon";', 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

files = [
    'app/page.tsx',
    'app/tool/[slug]/page.tsx',
    'components/layout/Navbar.tsx',
    'components/layout/Footer.tsx'
]

for f in files:
    process_file(f)
