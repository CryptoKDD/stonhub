import re
import sys

# Reconfigure stdout to use utf-8
sys.stdout.reconfigure(encoding='utf-8')

file_path = r"c:\Users\danii\Desktop\STONHUB\app\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

cyrillic_pattern = re.compile(r"[а-яА-ЯёЁ]")

print("Scanning for untranslated Russian text in page.tsx...")
for idx, line in enumerate(lines):
    line_num = idx + 1
    if line_num > 1200:  # Focus on JSX / logic area after definitions
        if cyrillic_pattern.search(line):
            # Print line number and trimmed content
            print(f"Line {line_num}: {line.strip()}")
