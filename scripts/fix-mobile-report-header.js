const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changed = false;

const fixes = [
  ["text-align:center;position:relative;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.35)}'", "position:relative;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.35)}'"],
  ["radial-gradient(circle at 50% 0%,rgba(126,200,240,.20),transparent 48%)", "radial-gradient(circle at 18% 0%,rgba(126,200,240,.18),transparent 42%)"],
  ["radial-gradient(ellipse 80% 50% at 50% 0%,rgba(126,200,240,.16) 0%,transparent 70%)", "radial-gradient(ellipse 80% 50% at 18% 0%,rgba(126,200,240,.14) 0%,transparent 70%)"],
  ["padding:26px 16px 18px", "padding:18px 16px 16px"],
  ["width:56px;max-width:22vw;height:auto;object-fit:contain;position:relative;z-index:2;margin-bottom:8px", "width:48px;min-width:48px;max-width:48px;height:auto;object-fit:contain;position:relative;z-index:2;margin:0;display:block"],
  ["display:inline-block;margin-bottom:8px;padding:5px 13px", "display:inline-flex;align-items:center;margin:0 0 6px 0;padding:5px 11px"],
  ["font-size:10px;font-weight:700;letter-spacing:2px", "font-size:9px;font-weight:700;letter-spacing:1.4px"],
  ["position:relative;z-index:2;box-shadow:0 10px 25px rgba(0,0,0,.22)}'", "box-shadow:0 10px 25px rgba(0,0,0,.22);white-space:nowrap}'"],
  ["font-size:24px;font-weight:900;margin-bottom:5px;position:relative;z-index:2;", "font-size:19px;font-weight:900;line-height:1.08;margin:0 0 4px 0;"],
  ["color:#9CB8D6;font-size:11px;position:relative;z-index:2;letter-spacing:.06em", "color:#9CB8D6;font-size:11px;letter-spacing:.03em;margin:0"]
];

for (const [from, to] of fixes) {
  if (html.includes(from)) {
    html = html.replaceAll(from, to);
    changed = true;
  }
}

const marker = "+'.header-top{display:flex;align-items:center;gap:14px;position:relative;z-index:2;max-width:100%}'";
if (!html.includes(marker)) {
  const before = "+'.header::before{content:\"\";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 18% 0%,rgba(126,200,240,.14) 0%,transparent 70%)}'";
  const after = before + "\n    +'.header-top{display:flex;align-items:center;gap:14px;position:relative;z-index:2;max-width:100%}'\n    +'.header-info{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left}'";
  if (html.includes(before)) {
    html = html.replace(before, after);
    changed = true;
  }
}

const oldTop = "+'<div class=\"header\"><img class=\"report-logo\" src=\"'+logoSrc+'\" alt=\"Logo Instituto de Vencedores\"><div class=\"hbadge\">&#128203; Relatorio Mobile</div>'\n    +'<h1>Instituto de <span>Vencedores</span></h1>'\n    +'<p class=\"hsub\">Gerado em '+dt+'</p></div>'";
const newTop = "+'<div class=\"header\"><div class=\"header-top\"><img class=\"report-logo\" src=\"'+logoSrc+'\" alt=\"Logo Instituto de Vencedores\"><div class=\"header-info\"><div class=\"hbadge\">&#128203; Relatorio Mobile</div>'\n    +'<h1>Instituto de <span>Vencedores</span></h1>'\n    +'<p class=\"hsub\">Gerado em '+dt+'</p></div></div></div>'";

if (html.includes(oldTop)) {
  html = html.replace(oldTop, newTop);
  changed = true;
}

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Mobile report header fixed.');
} else {
  console.log('No changes needed.');
}
