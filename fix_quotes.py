import glob

for filepath in [
    'app/page.tsx',
    'app/tool/[slug]/page.tsx',
    'components/layout/Navbar.tsx',
    'components/layout/Footer.tsx'
]:
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace('name="\"', 'name="').replace('\""', '"')
    # For tool.icon which became name="{tool.icon}"
    # Wait, the regex captured '{tool.icon}', so it became name="{tool.icon}" which is valid JSX!
    # Let's fix name=""something"" -> name="something"
    content = content.replace('name=\'\"', 'name="').replace('\"\'', '"')
    content = content.replace('name=\"\"', 'name=\"').replace('\"\"', '\"')
    # Actually just re-write the regex to fix the exact string pattern
    import re
    content = re.sub(r'name="["\']?([^"\'}]+)["\']?"', r'name="\1"', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
