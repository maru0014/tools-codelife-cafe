def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/tools/UnicodeConverter.tsx", "} catch (err: any) {\n\t\t\t// biome-ignore lint/suspicious/noExplicitAny: ok", "// biome-ignore lint/suspicious/noExplicitAny: ok\n\t\t} catch (err: any) {")
replace_in_file("src/lib/tools/csv-editor.ts", "} catch (err: any) {\n\t\t// biome-ignore lint/suspicious/noExplicitAny: ok", "// biome-ignore lint/suspicious/noExplicitAny: ok\n\t} catch (err: any) {")
replace_in_file("src/lib/tools/regex-tester.ts", "} catch (err: any) {\n\t\t// biome-ignore lint/suspicious/noExplicitAny: ok", "// biome-ignore lint/suspicious/noExplicitAny: ok\n\t} catch (err: any) {")
replace_in_file("src/lib/tools/sql-formatter.ts", "} catch (error: any) {\n\t\t// biome-ignore lint/suspicious/noExplicitAny: ok", "// biome-ignore lint/suspicious/noExplicitAny: ok\n\t} catch (error: any) {")
