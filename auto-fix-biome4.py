import json

with open("biome_output2.json") as f:
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

    # Let's fix JSX comments that we messed up
    for i in range(len(lines)):
        if " // biome-ignore" in lines[i] and "{" not in lines[i]:
            # if the next line has a JSX tag <, we probably need {/* */}
            if i+1 < len(lines) and ("<" in lines[i+1].strip() or "{" in lines[i+1].strip()):
                if "import" not in lines[i] and "function" not in lines[i]:
                    lines[i] = lines[i].replace("// biome-ignore", "{/* biome-ignore").replace("\n", " */}\n")

    with open(path, "w") as f:
        f.writelines(lines)
