from pathlib import Path

p = Path('index.html')
h = p.read_text(encoding='utf-8')

marker = 'Oculta botões superiores: Salvar Backup e Gerar Relatório'
css = '''
/* Oculta botões superiores: Salvar Backup e Gerar Relatório */
.header-right{display:none!important;}
'''

if marker not in h:
    h = h.replace('</style>', css + '\n</style>', 1)

p.write_text(h, encoding='utf-8')
