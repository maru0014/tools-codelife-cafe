import json

with open("biome_output.json") as f:
    text = f.read()
    start_idx = text.find('{')
    if start_idx != -1:
        data = json.loads(text[start_idx:])
    else:
        data = {}

diagnostics = data.get("diagnostics", [])

files_to_fix = {}

for d in diagnostics:
    path = d.get("location", {}).get("path")
    if not path:
        continue
    if path not in files_to_fix:
        files_to_fix[path] = []
    files_to_fix[path].append(d)

for path, diags in files_to_fix.items():
    with open(path, "r") as f:
        lines = f.readlines()

    diags.sort(key=lambda x: x.get("location", {}).get("start", {}).get("line", 0), reverse=True)

    for d in diags:
        category = d.get("category")
        start_line = d.get("location", {}).get("start", {}).get("line", 1) - 1

        if category == "lint/suspicious/noImplicitAnyLet":
            # auto fix let match; -> let match: RegExpExecArray | null;
            if "let match" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("let match;", "let match: RegExpExecArray | null;")
            elif "let replacedText" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("let replacedText;", "let replacedText: string | undefined;")
        elif category == "lint/correctness/useExhaustiveDependencies":
            pass # these often require actual code change

    with open(path, "w") as f:
        f.writelines(lines)
