def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				})}\n			</div>\n\n			{/* テーブル */}', '				})}\n			</fieldset>\n\n			{/* テーブル */}')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '<div\n					className="flex items-center justify-between"\n						role="navigation"', '<nav\n					className="flex items-center justify-between"\n						role="navigation"')
replace_in_file("src/components/tools/CsvFixer.tsx", '					/>\n				)}\n			</div>\n\n			{error && (', '					/>\n				)}\n			</button>\n\n			{error && (')
