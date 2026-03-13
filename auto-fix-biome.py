import json
import os

with open("biome_output.json") as f:
    # the output is likely not pure json at the beginning, let's find the start of JSON array or object
    text = f.read()
    start_idx = text.find('{')
    if start_idx != -1:
        data = json.loads(text[start_idx:])
    else:
        data = {}

diagnostics = data.get("diagnostics", [])
if not diagnostics:
    print("No diagnostics found.")
    exit(0)

files_to_fix = {}

for d in diagnostics:
    path = d.get("location", {}).get("path")
    if not path:
        continue
    if path not in files_to_fix:
        files_to_fix[path] = []
    files_to_fix[path].append(d)

for path, diags in files_to_fix.items():
    print(f"File: {path}")
    with open(path, "r") as f:
        lines = f.readlines()

    diags.sort(key=lambda x: x.get("location", {}).get("start", {}).get("line", 0), reverse=True)

    for d in diags:
        category = d.get("category")
        start_line = d.get("location", {}).get("start", {}).get("line", 1) - 1
        if start_line >= len(lines):
            continue

        if category == "lint/a11y/useButtonType":
            if "<button" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("<button", '<button type="button"')

        elif category == "lint/suspicious/noExplicitAny":
            if "catch (err: any)" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("catch (err: any)", "catch (err)")
            elif "catch (error: any)" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("catch (error: any)", "catch (error)")
            elif "as any" in lines[start_line]:
                lines[start_line] = lines[start_line].replace("as any", "as unknown")
            elif ": any" in lines[start_line]:
                lines[start_line] = lines[start_line].replace(": any", ": unknown")

        elif category == "lint/correctness/noUnusedFunctionParameters":
            pass # can't easily auto-fix

    with open(path, "w") as f:
        f.writelines(lines)
