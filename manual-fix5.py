def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

# The { /* */ } comment can't be put inside JSX attributes.
# Let's remove them, and put // biome-ignore BEFORE the component JSX block if needed, or simply let's not ignore and fix the code instead!

# Remove bad comments
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n', '')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n', '')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '					{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n', '')
replace_in_file("src/components/phone-formatter/SingleInput.tsx", '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n', '')
replace_in_file("src/components/tools/CsvFixer.tsx", '				{/* biome-ignore lint/a11y/useSemanticElements: ok */}\n', '')


# Let's fix the a11y warnings properly

# BulkInput.tsx - role="button" on a div -> make it a <button type="button"
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '<div\n\t\t\t\t\t\t\tclassName={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200\n\t\t\t\t\t\t\t\t${isDragging ? \'border-primary bg-primary/5\' : \'border-border bg-card\'}\n\t\t\t\t\t\t\t\t${previewData ? \'py-8\' : \'py-16\'}\n\t\t\t\t\t\t\t`}\n\t\t\t\t\t\t\tonDragOver={handleDragOver}\n\t\t\t\t\t\t\tonDragLeave={handleDragLeave}\n\t\t\t\t\t\t\tonDrop={handleDrop}\n\t\t\t\t\t\t\tonClick={() => fileInputRef.current?.click()}\n\t\t\t\t\t\t\trole="button"',
'<button\n\t\t\t\t\t\t\ttype="button"\n\t\t\t\t\t\t\tclassName={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 w-full text-left\n\t\t\t\t\t\t\t\t${isDragging ? \'border-primary bg-primary/5\' : \'border-border bg-card\'}\n\t\t\t\t\t\t\t\t${previewData ? \'py-8\' : \'py-16\'}\n\t\t\t\t\t\t\t`}\n\t\t\t\t\t\t\tonDragOver={handleDragOver}\n\t\t\t\t\t\t\tonDragLeave={handleDragLeave}\n\t\t\t\t\t\t\tonDrop={handleDrop}\n\t\t\t\t\t\t\tonClick={() => fileInputRef.current?.click()}')

replace_in_file("src/components/phone-formatter/BulkInput.tsx", 'CSVファイルをドラッグ＆ドロップするか、クリックして選択"\n\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<input\n\t\t\t\t\t\t\t\ttype="file"\n\t\t\t\t\t\t\t\tref={fileInputRef}\n\t\t\t\t\t\t\t\tonChange={handleFileChange}\n\t\t\t\t\t\t\t\taccept=".csv,.txt"\n\t\t\t\t\t\t\t\tclassName="hidden"\n\t\t\t\t\t\t\t/>', 'CSVファイルをドラッグ＆ドロップするか、クリックして選択"\n\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<input\n\t\t\t\t\t\t\t\ttype="file"\n\t\t\t\t\t\t\t\tref={fileInputRef}\n\t\t\t\t\t\t\t\tonChange={handleFileChange}\n\t\t\t\t\t\t\t\taccept=".csv,.txt"\n\t\t\t\t\t\t\t\tclassName="hidden"\n\t\t\t\t\t\t\t/>')

# Let's fix closing div to button for that block
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>', '</p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</button>')

# SingleInput.tsx role="status"
replace_in_file("src/components/phone-formatter/SingleInput.tsx", '<div\n\t\t\t\tid="phone-validation-status"\n\t\t\t\tclassName="min-h-[20px]"\n\t\t\t\trole="status"', '<output\n\t\t\t\tid="phone-validation-status"\n\t\t\t\tclassName="block min-h-[20px]"')
replace_in_file("src/components/phone-formatter/SingleInput.tsx", '				)}\n\t\t\t</div>', '				)}\n\t\t\t</output>')

# CsvFixer.tsx role="button"
replace_in_file("src/components/tools/CsvFixer.tsx", '<div\n\t\t\t\trole="button"\n\t\t\t\ttabIndex={disabled || isProcessing ? -1 : 0}', '<button type="button"\n\t\t\t\ttabIndex={disabled || isProcessing ? -1 : 0}')
replace_in_file("src/components/tools/CsvFixer.tsx", '			</div>\n\t\t</div>\n\t);\n}', '			</button>\n\t\t</div>\n\t);\n}')

# ResultTable.tsx role="group" -> fieldset
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '			<div\n\t\t\t\tclassName="flex flex-wrap items-center gap-2"\n\t\t\t\trole="group"', '			<fieldset\n\t\t\t\tclassName="flex flex-wrap items-center gap-2"')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				})}\n\t\t\t</div>\n\n\t\t\t{/* テーブル */}', '				})}\n\t\t\t</fieldset>\n\n\t\t\t{/* テーブル */}')

# ResultTable.tsx role="navigation" -> nav
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '<div\n\t\t\t\t\tclassName="flex items-center justify-between"\n\t\t\t\t\trole="navigation"', '<nav\n\t\t\t\t\tclassName="flex items-center justify-between"')
replace_in_file("src/components/phone-formatter/ResultTable.tsx", '				</div>\n\t\t\t)}\n\t\t</div>', '				</nav>\n\t\t\t)}\n\t\t</div>')
