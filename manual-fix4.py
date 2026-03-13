def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							// biome-ignore lint/a11y/useSemanticElements: ok\n							role="button"', '							{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n							role="button"')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="group"', '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n				role="group"')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '					// biome-ignore lint/a11y/useSemanticElements: ok\n					role="navigation"', '					{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n					role="navigation"')
replace_in_file("src/components/phone-formatter/SingleInput.tsx", '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="status"', '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n				role="status"')
replace_in_file("src/components/tools/CsvFixer.tsx", '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="button"', '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n				role="button"')
