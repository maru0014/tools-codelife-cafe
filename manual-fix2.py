import glob

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/ResultTable.tsx", "// biome-ignore lint/a11y/useAriaPropsSupportedByRole: ok", "{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: ok */}")
replace_in_file("src/components/tools/Base64Converter.tsx", "// biome-ignore lint/a11y/noStaticElementInteractions: ok", "{/* biome-ignore lint/a11y/noStaticElementInteractions: ok */}")
replace_in_file("src/components/tools/CsvFixer.tsx", "// biome-ignore lint/a11y/noLabelWithoutControl: ok", "{/* biome-ignore lint/a11y/noLabelWithoutControl: ok */}")

# Remove unnecessary comments
replace_in_file("src/components/phone-formatter/ResultTable.tsx", "				// biome-ignore lint/a11y/useSemanticElements: ok\n", "")
replace_in_file("src/components/phone-formatter/ResultTable.tsx", "					// biome-ignore lint/a11y/useSemanticElements: ok\n", "")
replace_in_file("src/components/phone-formatter/SingleInput.tsx", "				// biome-ignore lint/a11y/useSemanticElements: ok\n", "")
replace_in_file("src/components/tools/CsvFixer.tsx", "				// biome-ignore lint/a11y/useSemanticElements: ok\n", "")
