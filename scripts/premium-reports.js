// Trigger premium reports workflow - reduce report logo size only
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

const replacements = [
  [
    ".report-logo{width:86px;max-width:38vw;height:auto;object-fit:contain;position:relative;z-index:2;margin-bottom:10px;filter:brightness(1.35) contrast(1.18) saturate(1.22) drop-shadow(0 0 10px rgba(126,200,240,.25)) drop-shadow(0 12px 24px rgba(0,0,0,.48)) drop-shadow(0 0 28px rgba(47,128,237,.22))}",
    ".report-logo{width:56px;max-width:22vw;height:auto;object-fit:contain;position:relative;z-index:2;margin-bottom:8px;filter:brightness(1.34) contrast(1.16) saturate(1.18) drop-shadow(0 0 7px rgba(126,200,240,.20)) drop-shadow(0 8px 16px rgba(0,0,0,.40)) drop-shadow(0 0 18px rgba(47,128,237,.16))}"
  ],
  [
    ".report-header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px 34px;background:linear-gradient(135deg,rgba(7,17,31,.96),rgba(16,40,70,.82)),radial-gradient(circle at 20% 0%,rgba(126,200,240,.20),transparent 42%);border-bottom:1px solid rgba(126,200,240,.16);}",
    ".report-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 28px;background:linear-gradient(135deg,rgba(7,17,31,.96),rgba(16,40,70,.82)),radial-gradient(circle at 20% 0%,rgba(126,200,240,.20),transparent 42%);border-bottom:1px solid rgba(126,200,240,.16);}"
  ],
  [
    ".report-brand{display:flex;align-items:center;gap:20px;}",
    ".report-brand{display:flex;align-items:center;gap:14px;}"
  ],
  [
    ".report-logo{width:92px;height:auto;object-fit:contain;filter:brightness(1.36) contrast(1.18) saturate(1.22) drop-shadow(0 0 10px rgba(126,200,240,.25)) drop-shadow(0 14px 26px rgba(0,0,0,.48)) drop-shadow(0 0 30px rgba(47,128,237,.24));}",
    ".report-logo{width:58px;height:auto;object-fit:contain;filter:brightness(1.34) contrast(1.16) saturate(1.18) drop-shadow(0 0 7px rgba(126,200,240,.20)) drop-shadow(0 9px 16px rgba(0,0,0,.38)) drop-shadow(0 0 18px rgba(47,128,237,.16));}"
  ],
  [
    "@media(max-width:700px){body{padding:16px 10px}.report-header{flex-direction:column;text-align:center;padding:26px 18px}.report-brand{flex-direction:column;gap:12px}.report-logo{width:82px}.report-title{font-size:27px}.report-meta{text-align:center}.report-content{padding:20px 14px 26px}}",
    "@media(max-width:700px){body{padding:16px 10px}.report-header{flex-direction:column;text-align:center;padding:22px 16px}.report-brand{flex-direction:column;gap:10px}.report-logo{width:52px}.report-title{font-size:27px}.report-meta{text-align:center}.report-content{padding:20px 14px 26px}}"
  ]
];

replacements.forEach(([from, to]) => {
  if (html.includes(from)) {
    html = html.replaceAll(from, to);
    changed = true;
  }
});

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Premium report logo size fixed in index.html');
} else {
  console.log('No report logo size changes needed.');
}
