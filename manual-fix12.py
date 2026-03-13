def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/BulkInput.tsx", '						<div\n							onDragOver={handleDragOver}\n							onDragLeave={handleDragLeave}\n							onDrop={handleDrop}\n							onClick={() => fileInputRef.current?.click()}\n							aria-label="CSVファイルをドラッグ＆ドロップするか、クリックして選択"', '						<button\n							type="button"\n							onDragOver={handleDragOver}\n							onDragLeave={handleDragLeave}\n							onDrop={handleDrop}\n							onClick={() => fileInputRef.current?.click()}\n							aria-label="CSVファイルをドラッグ＆ドロップするか、クリックして選択"')

replace_in_file("src/components/phone-formatter/BulkInput.tsx", '						</div>\n					)}\n				</div>', '						</button>\n					)}\n				</div>')
