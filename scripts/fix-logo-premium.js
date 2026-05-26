const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changed = false;

const oldHeaderWithBox = `<div class="header">
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

const headerWithoutBox = `<div class="header">
  <div class="brand-area">
    <img class="brand-logo" src="./IV.png" alt="Logo Instituto de Vencedores">
    <div>
      <div class="header-logo">Instituto de <span>Vencedores</span></div>
      <div class="header-subtitle">Sistema premium de gestão de presença</div>
    </div>
  </div>
  <div class="header-right">`;

if (html.includes(oldHeaderWithBox)) {
  html = html.replace(oldHeaderWithBox, headerWithoutBox);
  changed = true;
}

const originalHeader = `<div class="header">
  <div>
    <div class="header-logo">Instituto de <span>Vencedores</span></div>
    <div style="font-size:11px;color:var(--muted);margin-top:2px">Sistema de Gestão de Presença</div>
  </div>
  <div class="header-right">`;

if (html.includes(originalHeader)) {
  html = html.replace(originalHeader, headerWithoutBox);
  changed = true;
}

const oldLoadingWithBox = `<div id="loading-overlay">
  <div class="loading-brand-mark"><img src="./IV.png" alt="Logo Instituto de Vencedores"></div>
  <div class="spinner"></div>
  <div class="loading-txt">Instituto de <span style="color:var(--blue-l)">Vencedores</span></div>
  <div class="loading-sub">Carregando dados...</div>
</div>`;

const loadingWithoutBox = `<div id="loading-overlay">
  <img class="loading-logo" src="./IV.png" alt="Logo Instituto de Vencedores">
  <div class="spinner"></div>
  <div class="loading-txt">Instituto de <span style="color:var(--blue-l)">Vencedores</span></div>
  <div class="loading-sub">Carregando dados...</div>
</div>`;

if (html.includes(oldLoadingWithBox)) {
  html = html.replace(oldLoadingWithBox, loadingWithoutBox);
  changed = true;
}

const originalLoading = `<div id="loading-overlay">
  <div class="spinner"></div>
  <div class="loading-txt">Instituto de <span style="color:var(--blue-l)">Vencedores</span></div>
  <div class="loading-sub">Carregando dados...</div>
</div>`;

if (html.includes(originalLoading)) {
  html = html.replace(originalLoading, loadingWithoutBox);
  changed = true;
}

const logoFixCss = String.raw`

/* ═════════════════════════════════════════════════════
   LOGO PREMIUM FIX — sem círculo, maior e mais visível
   ═════════════════════════════════════════════════════ */
.brand-mark,
.loading-brand-mark{
  width:auto !important;
  height:auto !important;
  border-radius:0 !important;
  background:transparent !important;
  border:none !important;
  box-shadow:none !important;
  overflow:visible !important;
  padding:0 !important;
}

.brand-area{
  display:flex !important;
  align-items:center !important;
  gap:18px !important;
}

.brand-logo,
.brand-mark img{
  width:96px !important;
  max-width:96px !important;
  height:auto !important;
  object-fit:contain !important;
  display:block !important;
  background:transparent !important;
  border:none !important;
  border-radius:0 !important;
  box-shadow:none !important;
  filter:
    brightness(1.42)
    contrast(1.20)
    saturate(1.24)
    drop-shadow(0 0 8px rgba(255,255,255,.10))
    drop-shadow(0 0 14px rgba(126,200,240,.28))
    drop-shadow(0 12px 22px rgba(0,0,0,.46))
    drop-shadow(0 0 30px rgba(47,128,237,.24)) !important;
}

.loading-logo,
.loading-brand-mark img{
  width:132px !important;
  max-width:46vw !important;
  height:auto !important;
  object-fit:contain !important;
  display:block !important;
  background:transparent !important;
  border:none !important;
  border-radius:0 !important;
  box-shadow:none !important;
  filter:
    brightness(1.38)
    contrast(1.18)
    saturate(1.22)
    drop-shadow(0 0 10px rgba(255,255,255,.10))
    drop-shadow(0 0 16px rgba(126,200,240,.30))
    drop-shadow(0 14px 26px rgba(0,0,0,.50))
    drop-shadow(0 0 34px rgba(47,128,237,.26)) !important;
}

@media(max-width:700px){
  .brand-logo,
  .brand-mark img{
    width:78px !important;
    max-width:78px !important;
  }

  .loading-logo,
  .loading-brand-mark img{
    width:104px !important;
  }
}
`;

if (!html.includes('LOGO PREMIUM FIX — sem círculo')) {
  html = html.replace('</style>', `${logoFixCss}\n</style>`);
  changed = true;
}

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Logo premium fix applied to index.html');
} else {
  console.log('No logo changes needed.');
}
