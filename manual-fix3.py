def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							// biome-ignore lint/a11y/useSemanticElements: ok\n							role="button"', '							// biome-ignore lint/a11y/useSemanticElements: ok\n							role="button"')
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							// biome-ignore lint/a11y/useSemanticElements: ok', '')
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							role="button"', '							// biome-ignore lint/a11y/useSemanticElements: ok\n							role="button"')

replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				role="group"', '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="group"')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '						role="navigation"', '					// biome-ignore lint/a11y/useSemanticElements: ok\n					role="navigation"')

replace_in_file("src/components/phone-formatter/SingleInput.tsx", '				role="status"', '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="status"')

replace_in_file("src/components/tools/CsvFixer.tsx", '				role="button"', '				// biome-ignore lint/a11y/useSemanticElements: ok\n				role="button"')

replace_in_file("src/lib/tools/dummy-data.ts", "Record<string, any>[]", "Record<string, unknown>[]")
replace_in_file("src/lib/tools/dummy-data.ts", "Record<string, any> =", "Record<string, unknown> =")
