import sys
import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Apply some basic automatic fixes:

    # 1. lint/a11y/useButtonType -> Add type="button" to <button> tags that don't have a type.
    content = re.sub(r'<button(?![^>]*type=)', r'<button type="button"', content)

    # 2. lint/a11y/useSemanticElements
    # role="button" -> replace div with button (might need manual fix, ignoring for simple script)

    # 3. noExplicitAny
    # We will manually fix these where possible, but could just add eslint-disable equivalent for biome

    with open(filename, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        fix_file(sys.argv[1])
