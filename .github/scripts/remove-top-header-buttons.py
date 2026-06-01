from pathlib import Path
import re

p = Path('index.html')
h = p.read_text(encoding='utf-8')

old = '''  <div class="header-right">
    <button class="btn btn-ghost btn-sm" onclick="exportarDados()">💾 Salvar Backup</button>
    <button class="btn btn-blue btn-sm" onclick="showPage('exportar')">📤 Gerar Relatório</button>
  </div>
'''

if old in h:
    h = h.replace(old, '')
else:
    h = re.sub(
        r'\s*<div class="header-right">\s*<button class="btn btn-ghost btn-sm" onclick="exportarDados\(\)">.*?</button>\s*<button class="btn btn-blue btn-sm" onclick="showPage\(\'exportar\'\)">.*?</button>\s*</div>\s*',
        '\n',
        h,
        count=1,
        flags=re.S,
    )

p.write_text(h, encoding='utf-8')
