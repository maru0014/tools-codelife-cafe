def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)

replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							</div>\n						</div>\n					)}\n', '							</div>\n						</button>\n					)}\n')
replace_in_file("src/components/phone-formatter/BulkInput.tsx", '							)}\n						</button>\n					)}\n				</div>', '							)}\n						</div>\n					)}\n				</div>')
