const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changed = false;

const faviconBlock = `<link rel="icon" type="image/png" href="./IV.png">
<link rel="apple-touch-icon" href="./IV.png">
<meta name="theme-color" content="#030712">`;

if (!html.includes('href="./IV.png"')) {
  html = html.replace(
    '<title>Instituto de Vencedores — Sistema de Gestão</title>',
    `<title>Instituto de Vencedores — Sistema de Gestão</title>\n${faviconBlock}`
  );
  changed = true;
}

const oldHeader = `<div class="header">
  <div>
    <div class="header-logo">Instituto de <span>Vencedores</span></div>
    <div style="font-size:11px;color:var(--muted);margin-top:2px">Sistema de Gestão de Presença</div>
  </div>
  <div class="header-right">`;

const newHeader = `<div class="header">
  <div class="brand-area">
    <div class="brand-mark">
      <img src="./IV.png" alt="Logo Instituto de Vencedores">
    </div>
    <div>
      <div class="header-logo">Instituto de <span>Vencedores</span></div>
      <div class="header-subtitle">Sistema premium de gestão de presença</div>
    </div>
  </div>
  <div class="header-right">`;

if (html.includes(oldHeader) && !html.includes('class="brand-area"')) {
  html = html.replace(oldHeader, newHeader);
  changed = true;
}

const loadingOld = `<div id="loading-overlay">
  <div class="spinner"></div>
  <div class="loading-txt">Instituto de <span style="color:var(--blue-l)">Vencedores</span></div>
  <div class="loading-sub">Carregando dados...</div>
</div>`;

const loadingNew = `<div id="loading-overlay">
  <div class="loading-brand-mark"><img src="./IV.png" alt="Logo Instituto de Vencedores"></div>
  <div class="spinner"></div>
  <div class="loading-txt">Instituto de <span style="color:var(--blue-l)">Vencedores</span></div>
  <div class="loading-sub">Carregando dados...</div>
</div>`;

if (html.includes(loadingOld) && !html.includes('loading-brand-mark')) {
  html = html.replace(loadingOld, loadingNew);
  changed = true;
}

const premiumCss = String.raw`

/* ═════════════════════════════════════════════════════
   PREMIUM THEME — Instituto de Vencedores
   ═════════════════════════════════════════════════════ */
:root {
  --navy:#030712;
  --navy2:#07111F;
  --navy3:#0C1B30;
  --navy4:#102846;
  --glass:rgba(10,24,44,.74);
  --glass-strong:rgba(12,27,48,.94);
  --border:rgba(126,200,240,.16);
  --border-strong:rgba(126,200,240,.34);
  --blue:#2F80ED;
  --blue-l:#7EC8F0;
  --cyan:#22D3EE;
  --gold:#D6B56D;
  --green:#3EC97A;
  --green-l:#7EDBA8;
  --red:#E05555;
  --purple:#9B59B6;
  --text:#F4F8FF;
  --muted:#8FAACB;
  --r:18px;
  --shadow:0 22px 70px rgba(0,0,0,.42);
  --shadow-soft:0 12px 35px rgba(0,0,0,.26);
}

body{
  background:
    radial-gradient(circle at 15% 0%, rgba(47,128,237,.24), transparent 32%),
    radial-gradient(circle at 86% 10%, rgba(34,211,238,.15), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(214,181,109,.08), transparent 36%),
    linear-gradient(145deg,#020611 0%,#07111F 42%,#030712 100%);
  color:var(--text);
  letter-spacing:.01em;
}
body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size:42px 42px;
  -webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,.55), transparent 78%);
  mask-image:linear-gradient(to bottom, rgba(0,0,0,.55), transparent 78%);
  z-index:-1;
}

#loading-overlay{
  background:radial-gradient(circle at center, rgba(47,128,237,.22), transparent 34%),linear-gradient(145deg,#020611,#07111F 60%,#030712);
}
.loading-brand-mark{
  width:82px;height:82px;border-radius:26px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(145deg,rgba(126,200,240,.18),rgba(47,128,237,.08)),rgba(255,255,255,.035);
  border:1px solid rgba(126,200,240,.28);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 20px 55px rgba(0,0,0,.38),0 0 45px rgba(47,128,237,.20);
  overflow:hidden;
}
.loading-brand-mark img{width:74%;height:74%;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.38));}
.spinner{width:58px;height:58px;border:3px solid rgba(126,200,240,.13);border-top-color:var(--blue-l);border-right-color:var(--cyan);box-shadow:0 0 30px rgba(126,200,240,.18);}
.loading-txt{font-size:25px;letter-spacing:.02em;}
.loading-sub{color:var(--muted);}

.header{
  background:linear-gradient(135deg,rgba(7,17,31,.94),rgba(16,40,70,.78)),radial-gradient(circle at 20% 0%,rgba(126,200,240,.22),transparent 38%);
  border-bottom:1px solid var(--border);
  box-shadow:0 18px 45px rgba(0,0,0,.28);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
  padding:18px 24px;
}
.brand-area{display:flex;align-items:center;gap:14px;}
.brand-mark{width:54px;height:54px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,rgba(126,200,240,.16),rgba(47,128,237,.08)),rgba(255,255,255,.03);border:1px solid rgba(126,200,240,.26);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 16px 38px rgba(0,0,0,.32),0 0 35px rgba(47,128,237,.14);overflow:hidden;}
.brand-mark img{width:72%;height:72%;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,.35));}
.header-logo{font-size:23px;line-height:1;background:linear-gradient(90deg,#fff,#BFEAFF 55%,#7EC8F0);-webkit-background-clip:text;background-clip:text;color:transparent;}
.header-logo span{color:inherit;}
.header-subtitle{font-size:11px;color:var(--muted);margin-top:6px;letter-spacing:.12em;text-transform:uppercase;}
.header-right{gap:10px;}

.main-nav{background:rgba(5,10,20,.72);border-bottom:1px solid var(--border);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:12px 24px;gap:8px;}
.mnav{border:1px solid transparent;border-radius:999px;padding:9px 17px;}
.mnav.active{background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;box-shadow:0 12px 28px rgba(47,128,237,.26);}
.mnav:hover:not(.active){background:rgba(126,200,240,.08);color:var(--text);border-color:var(--border);}

.page{max-width:1180px;padding:28px 22px;}
.page.active{animation:pageIn .28s ease both;}
@keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.stitle{font-size:21px;color:#DFF6FF;border-bottom:1px solid var(--border);padding-bottom:12px;position:relative;}
.stitle::after{content:"";position:absolute;left:0;bottom:-1px;width:86px;height:2px;background:linear-gradient(90deg,var(--blue-l),transparent);}

.card,.kpi,.mod-block,.export-card,.modal{background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),var(--glass);border:1px solid var(--border);box-shadow:var(--shadow-soft);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.card,.kpi,.export-card{transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease;}
.card:hover,.kpi:hover,.export-card:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow);}
.kpi{padding:20px;}
.kpi::before{content:"";position:absolute;inset:-1px;background:radial-gradient(circle at 30% 0%,rgba(126,200,240,.16),transparent 42%);pointer-events:none;}
.kpi-num{font-size:38px;text-shadow:0 10px 32px rgba(0,0,0,.38);}
.kpi-lbl{color:var(--muted);}

.btn{border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.18);}
.btn-blue{background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;}
.btn-blue:hover{background:linear-gradient(135deg,#3B8BFF,#35E1F6);transform:translateY(-1px);}
.btn-green{background:linear-gradient(135deg,var(--green),var(--green-l));color:#02120A;}
.btn-ghost{background:rgba(255,255,255,.035);color:#B9CBE2;border:1px solid var(--border);}
.btn-ghost:hover{background:rgba(126,200,240,.10);color:#fff;border-color:var(--border-strong);}

input,select,textarea{background:rgba(5,14,28,.74);border:1px solid rgba(126,200,240,.16);border-radius:13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);}
input:focus,select:focus,textarea:focus{border-color:rgba(126,200,240,.58);box-shadow:0 0 0 4px rgba(47,128,237,.13);}

.tbl-wrap{border:1px solid var(--border);border-radius:18px;background:rgba(7,17,31,.62);box-shadow:var(--shadow-soft);}
thead th,.dash-eq-table th{background:linear-gradient(180deg,rgba(16,40,70,.95),rgba(9,22,40,.95));color:#BFEAFF;border-bottom:1px solid var(--border);}
tbody tr{border-bottom:1px solid rgba(126,200,240,.09);}
tbody tr:hover,.dash-eq-table tr:hover td{background:rgba(126,200,240,.065);}
.badge{border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.06);}
.modal-bg{background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.modal{border-radius:22px;box-shadow:0 35px 100px rgba(0,0,0,.55);}
.modal-title{font-size:21px;color:#DFF6FF;}
.export-card{min-height:170px;}
.export-icon{filter:drop-shadow(0 12px 22px rgba(0,0,0,.35));}

@media(max-width:700px){
  .header{align-items:flex-start;flex-direction:column;}
  .header-right{width:100%;margin-left:0;flex-wrap:wrap;}
  .header-right .btn{flex:1;justify-content:center;}
  .brand-mark{width:48px;height:48px;border-radius:16px;}
  .header-logo{font-size:20px;}
  .main-nav{padding:10px 14px;}
  .page{padding:18px 12px;}
  .kpi-row{grid-template-columns:repeat(2,minmax(0,1fr));}
}
`;

if (!html.includes('PREMIUM THEME — Instituto de Vencedores')) {
  html = html.replace('</style>', `${premiumCss}\n</style>`);
  changed = true;
}

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Premium theme applied to index.html');
} else {
  console.log('No changes needed. Premium theme already applied.');
}
