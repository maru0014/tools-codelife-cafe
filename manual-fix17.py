def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/ExportButtons.tsx", "results,\n\tvisibleColumns,\n}: ExportButtonsProps)", "results,\n\t// biome-ignore lint/correctness/noUnusedFunctionParameters: ok\n\tvisibleColumns,\n}: ExportButtonsProps)")
replace_in_file("src/components/tools/JsonFormatter.tsx", "const [errorLine, _errorLine] = useState<number | null>(null);", "const [errorLine] = useState<number | null>(null);")
