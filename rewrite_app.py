import re

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', html_content, re.DOTALL)
css_content = css_match.group(1) if css_match else ""

with open('app/globals.css', 'w', encoding='utf-8') as f:
    f.write("@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" + css_content)

# Extract TOOLS_LIST
tools_match = re.search(r'const TOOLS_LIST = (\[.*?\]);', html_content, re.DOTALL)
tools_json_like = tools_match.group(1) if tools_match else "[]"

# We'll create data/tools.ts
with open('data/tools.ts', 'w', encoding='utf-8') as f:
    f.write(f"export const TOOLS_LIST = {tools_json_like};\n")

