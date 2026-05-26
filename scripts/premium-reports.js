// Trigger premium reports workflow
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changed = false;

if (!html.includes("var logoSrc=new URL('IV.png', window.location.href).href;")) {
  html = html.replace(
    "  var dt=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});\n  var PAL=",
    "  var dt=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});\n  var logoSrc=new URL('IV.png', window.location.href).href;\n  var PAL="
  );
  changed = true;
}

if (!html.includes("const logoSrc=new URL('IV.png', window.location.href).href;")) {
  html = html.replace(
    "  const dt=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});\n  let body='';",
    "  const dt=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});\n  const logoSrc=new URL('IV.png', window.location.href).href;\n  let body='';"
  );
  changed = true;
}

const mobileOldCss = "    +'*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}'\n    +'body{background:#050A14;color:#E8F0FF;font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",Arial,sans-serif;overflow-x:hidden;-webkit-text-size-adjust:100%}'\n    +'.header{background:linear-gradient(160deg,#071020,#0A1A40 60%,#071020);border-bottom:1px solid #1E2E4A;padding:22px 16px 16px;text-align:center;position:relative;overflow:hidden}'\n    +'.header::before{content:\"\";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(74,144,217,.18) 0%,transparent 70%)}'\n    +'.hbadge{display:inline-block;margin-bottom:8px;padding:3px 12px;border-radius:20px;border:1px solid rgba(74,144,217,.4);background:rgba(74,144,217,.1);font-size:10px;font-weight:600;letter-spacing:2px;color:#7EC8F0;text-transform:uppercase}'\n    +'.header h1{font-size:22px;font-weight:900;color:#fff;margin-bottom:4px}'\n    +'.header h1 span{color:#7EC8F0}'\n    +'.hsub{color:#6B8AB0;font-size:11px}'\n    +'.top-nav{display:flex;background:#0D1626;border-bottom:1px solid #1E2E4A;position:sticky;top:0;z-index:100}'\n    +'::-webkit-scrollbar{display:none}'";

const mobileNewCss = "    +'*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}'\n    +'body{background:radial-gradient(circle at 15% 0%,rgba(47,128,237,.26),transparent 32%),radial-gradient(circle at 90% 8%,rgba(34,211,238,.16),transparent 28%),linear-gradient(145deg,#020611 0%,#07111F 48%,#030712 100%);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,\"Helvetica Neue\",Arial,sans-serif;overflow-x:hidden;-webkit-text-size-adjust:100%}'\n    +'body::before{content:\"\";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:38px 38px;opacity:.65}'\n    +'.header{background:linear-gradient(135deg,rgba(7,17,31,.96),rgba(16,40,70,.84)),radial-gradient(circle at 50% 0%,rgba(126,200,240,.20),transparent 48%);border-bottom:1px solid rgba(126,200,240,.18);padding:26px 16px 18px;text-align:center;position:relative;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.35)}'\n    +'.header::before{content:\"\";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(126,200,240,.16) 0%,transparent 70%)}'\n    +'.report-logo{width:86px;max-width:38vw;height:auto;object-fit:contain;position:relative;z-index:2;margin-bottom:10px;filter:brightness(1.35) contrast(1.18) saturate(1.22) drop-shadow(0 0 10px rgba(126,200,240,.25)) drop-shadow(0 12px 24px rgba(0,0,0,.48)) drop-shadow(0 0 28px rgba(47,128,237,.22))}'\n    +'.hbadge{display:inline-block;margin-bottom:8px;padding:5px 13px;border-radius:20px;border:1px solid rgba(126,200,240,.36);background:rgba(126,200,240,.09);font-size:10px;font-weight:700;letter-spacing:2px;color:#BFEAFF;text-transform:uppercase;position:relative;z-index:2;box-shadow:0 10px 25px rgba(0,0,0,.22)}'\n    +'.header h1{font-size:24px;font-weight:900;margin-bottom:5px;position:relative;z-index:2;background:linear-gradient(90deg,#fff,#DDF4FF 55%,#7EC8F0);-webkit-background-clip:text;background-clip:text;color:transparent}'\n    +'.header h1 span{color:inherit}'\n    +'.hsub{color:#9CB8D6;font-size:11px;position:relative;z-index:2;letter-spacing:.06em}'\n    +'.top-nav{display:flex;background:rgba(7,17,31,.86);border-bottom:1px solid rgba(126,200,240,.16);position:sticky;top:0;z-index:100;backdrop-filter:blur(14px);box-shadow:0 12px 30px rgba(0,0,0,.22)}'\n    +'#modulos{position:relative;z-index:2}'\n    +'::-webkit-scrollbar{display:none}'";

if (html.includes(mobileOldCss)) {
  html = html.replace(mobileOldCss, mobileNewCss);
  changed = true;
}

const mobileOldHeader = "    +'<div class=\"header\"><div class=\"hbadge\">&#128203; Relatorio Mobile</div>'\n    +'<h1>Instituto de <span>Vencedores</span></h1>'\n    +'<p class=\"hsub\">Gerado em '+dt+'</p></div>'";

const mobileNewHeader = "    +'<div class=\"header\"><img class=\"report-logo\" src=\"'+logoSrc+'\" alt=\"Logo Instituto de Vencedores\"><div class=\"hbadge\">&#128203; Relatorio Mobile</div>'\n    +'<h1>Instituto de <span>Vencedores</span></h1>'\n    +'<p class=\"hsub\">Gerado em '+dt+'</p></div>'";

if (html.includes(mobileOldHeader)) {
  html = html.replace(mobileOldHeader, mobileNewHeader);
  changed = true;
}

const webOldReturn = "  return `<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"><title>${titulo}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050A14;color:#E8F0FF;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:32px 24px;max-width:900px;margin:0 auto}</style></head><body><h1 style=\"font-size:32px;font-weight:900;color:#fff;margin-bottom:4px\">Instituto de <span style=\"color:#7EC8F0\">Vencedores</span></h1><p style=\"color:#6B8AB0;font-size:13px;margin-bottom:32px\">Gerado em ${dt}</p>${body}</body></html>`;";

const webNewReturn = `  return \`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>\${titulo}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;background:radial-gradient(circle at 15% 0%,rgba(47,128,237,.24),transparent 32%),radial-gradient(circle at 88% 8%,rgba(34,211,238,.15),transparent 28%),radial-gradient(circle at 50% 100%,rgba(214,181,109,.08),transparent 36%),linear-gradient(145deg,#020611 0%,#07111F 46%,#030712 100%);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;padding:34px 24px;}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:42px 42px;opacity:.62;}
.report-shell{max-width:1040px;margin:0 auto;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),rgba(10,24,44,.78);border:1px solid rgba(126,200,240,.18);border-radius:26px;box-shadow:0 26px 80px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.06);overflow:hidden;position:relative;z-index:2;}
.report-header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px 34px;background:linear-gradient(135deg,rgba(7,17,31,.96),rgba(16,40,70,.82)),radial-gradient(circle at 20% 0%,rgba(126,200,240,.20),transparent 42%);border-bottom:1px solid rgba(126,200,240,.16);}
.report-brand{display:flex;align-items:center;gap:20px;}
.report-logo{width:92px;height:auto;object-fit:contain;filter:brightness(1.36) contrast(1.18) saturate(1.22) drop-shadow(0 0 10px rgba(126,200,240,.25)) drop-shadow(0 14px 26px rgba(0,0,0,.48)) drop-shadow(0 0 30px rgba(47,128,237,.24));}
.report-title{font-size:34px;font-weight:900;line-height:1.05;background:linear-gradient(90deg,#fff,#DDF4FF 58%,#7EC8F0);-webkit-background-clip:text;background-clip:text;color:transparent;}
.report-subtitle{margin-top:8px;color:#9CB8D6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;}
.report-meta{text-align:right;color:#9CB8D6;font-size:13px;}
.report-badge{display:inline-block;margin-bottom:9px;padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);color:#fff;font-size:12px;font-weight:800;box-shadow:0 12px 28px rgba(47,128,237,.28);}
.report-content{padding:30px 34px 38px;}
.report-content h2{background:linear-gradient(90deg,currentColor,rgba(126,200,240,.55));-webkit-background-clip:text;background-clip:text;}
.report-content>div{box-shadow:0 16px 40px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.04)!important;background:linear-gradient(145deg,rgba(255,255,255,.052),rgba(255,255,255,.016)),rgba(7,17,31,.76)!important;border:1px solid rgba(126,200,240,.15)!important;border-radius:18px!important;}
table{background:rgba(7,17,31,.62);border-radius:14px;overflow:hidden;}
thead th{background:linear-gradient(180deg,rgba(16,40,70,.96),rgba(9,22,40,.96));}
tbody tr:nth-child(even){background:rgba(255,255,255,.018);}
.report-footer{text-align:center;color:#8FAACB;font-size:12px;padding:0 34px 28px;}
@media(max-width:700px){body{padding:16px 10px}.report-header{flex-direction:column;text-align:center;padding:26px 18px}.report-brand{flex-direction:column;gap:12px}.report-logo{width:82px}.report-title{font-size:27px}.report-meta{text-align:center}.report-content{padding:20px 14px 26px}}
@media print{body{background:#fff!important;color:#0B1A2D!important;padding:0}.report-shell{box-shadow:none;border:1px solid #d9e3ef}.report-header{-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-content>div{break-inside:avoid}}
</style></head><body><main class="report-shell"><header class="report-header"><div class="report-brand"><img class="report-logo" src="\${logoSrc}" alt="Logo Instituto de Vencedores"><div><div class="report-title">Instituto de Vencedores</div><div class="report-subtitle">Relatório de Gestão de Presença</div></div></div><div class="report-meta"><div class="report-badge">Relatório Oficial</div><div>Gerado em \${dt}</div></div></header><section class="report-content">\${body}</section><div class="report-footer">Instituto de Vencedores • Sistema de Gestão de Presença</div></main></body></html>\`;`;

if (html.includes(webOldReturn)) {
  html = html.replace(webOldReturn, webNewReturn);
  changed = true;
}

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Premium report design applied to index.html');
} else {
  console.log('No premium report changes needed.');
}
