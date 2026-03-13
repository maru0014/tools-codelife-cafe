def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/BulkInput.tsx", 'onClick={() => fileInputRef.current?.click()}\n\t\t\t\t\t\t\t// biome-ignore lint/a11y/useSemanticElements: ok\n\t\t\t\t\t\t\trole="button"\n\t\t\t\t\t\t\ttabIndex={0}', 'onClick={() => fileInputRef.current?.click()}')
