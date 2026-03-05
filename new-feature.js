/* =========================================
   TYPEFLOW — NEW FEATURES
   Drop this AFTER script.js, before </body>

   Features:
   1. Custom Text  — paste / type / URL / .txt upload
   2. Languages    — FR / DE / JA (romaji) switcher
   3. Export       — CSV history download
   4. Mobile UX    — touch targets, tap-to-type, iOS zoom fix
   ========================================= */

'use strict';

// ============================================================
// 1. LANGUAGE WORD BANKS
// ============================================================
const EXTRA_WORD_BANKS = {
  fr: [
    "le","la","les","de","un","une","des","en","et","est","que","qui","il","elle","ce","nous","vous",
    "je","tu","me","te","se","son","sa","ses","mon","ma","mes","ton","ta","tes","leur","leurs",
    "au","aux","du","par","sur","dans","avec","pour","pas","plus","mais","ou","si","ne","tout","bien",
    "être","avoir","faire","dire","pouvoir","aller","voir","savoir","vouloir","venir","prendre","croire",
    "trouver","donner","tenir","partir","sembler","laisser","passer","rester","entendre","mettre","sentir",
    "parler","porter","chercher","appeler","regarder","penser","rendre","montrer","demander","connaître",
    "temps","année","monde","vie","homme","femme","jour","enfant","main","ville","pays","chose","nuit",
    "nom","voix","lieu","porte","maison","travail","amour","histoire","famille","coeur","tête","corps",
    "oeil","livre","question","problème","idée","chemin","moment","façon","point","genre","couleur",
    "manger","boire","dormir","courir","lire","écrire","chanter","jouer","aimer","vivre",
    "table","chaise","fenêtre","jardin","forêt","mer","soleil","lune","étoile","ciel","nuage","pluie",
    "fleur","arbre","oiseau","chat","chien","cheval","pain","fromage","vin","café","eau","feu","terre"
  ],
  de: [
    "der","die","das","ein","eine","und","ist","in","zu","den","von","mit","sich","des","nicht","auf",
    "dem","er","sie","es","wird","auch","ich","war","als","an","nach","bei","hat","wie","aus","oder",
    "aber","vor","doch","so","wir","wenn","über","einen","noch","sein","durch","uns","hier","dass",
    "diese","alle","nur","dann","werden","haben","mehr","gegen","weil","wieder","bis","seit","zur",
    "Zeit","Jahr","Mann","Frau","Kind","Stadt","Land","Haus","Tag","Nacht","Welt","Leben","Mensch",
    "Hand","Wasser","Name","Stimme","Tür","Buch","Frage","Weg","Liebe","Familie","Herz","Kopf","Auge",
    "Körper","Arbeit","Moment","Gedanke","Problem","Geschichte","Farbe","Form","Punkt","Idee","Platz",
    "machen","sagen","gehen","sehen","wissen","kommen","können","müssen","geben","nehmen","halten",
    "denken","finden","lassen","stehen","bleiben","liegen","fallen","sprechen","schreiben","lesen",
    "spielen","laufen","essen","trinken","schlafen","wohnen","arbeiten","helfen","zeigen","lernen",
    "Tisch","Stuhl","Fenster","Garten","Wald","Meer","Sonne","Mond","Stern","Himmel","Wolke","Regen",
    "Blume","Baum","Vogel","Katze","Hund","Brot","Käse","Wein","Kaffee","Milch","Feuer","Erde"
  ],
  // Common Japanese words written in romaji
  ja: [
    "watashi","anata","kare","kanojo","watashitachi","minasan","hito","kodomo","otoko","onna",
    "chichi","haha","ani","ane","tomodachi","sensei","gakusei","isha","kazoku","namae",
    "ie","heya","mado","tobira","niwa","machi","kuni","shizen","umi","yama",
    "sora","hi","tsuki","hoshi","kaze","ame","yuki","ki","hana","tori",
    "neko","inu","sakana","gohan","mizu","ocha","pan","tamago","yasai","kudamono",
    "hon","kami","koe","te","me","atama","kokoro","karada","ashi","kuchi",
    "jikan","toshi","ima","kyou","ashita","kinou","asa","hiru","yoru","mae",
    "suki","kirei","ookii","chiisai","hayai","osoi","atarashii","furui","takai","yasui",
    "iku","kuru","miru","kiku","hanasu","yomu","kaku","taberu","nomu","neru",
    "okiru","hashiru","aruku","asobu","hataraku","benkyou","oshieru","wakaru","omou","shiru",
    "ii","warui","tanoshii","kanashii","ureshii","kowai","isogashii","genki","shizuka","nigiyaka",
    "nihon","nihongo","gakkou","shigoto","ryokou","ongaku","eiga","ryouri","supootsu","densha",
    "arigatou","sumimasen","gomen","ohayou","konnichiwa","konbanwa","sayonara","daijoubu","onegai","hai"
  ]
};

const LANG_META = {
  en: { flag: '🇬🇧', label: 'EN', name: 'English'  },
  fr: { flag: '🇫🇷', label: 'FR', name: 'Français' },
  de: { flag: '🇩🇪', label: 'DE', name: 'Deutsch'  },
  ja: { flag: '🇯🇵', label: 'JA', name: 'Romaji'   },
};

let currentLang = safeLocalStorage.getItem('typeflow-language') || 'en';

function getWordBank() {
  return EXTRA_WORD_BANKS[currentLang] || baseWords;
}

// Patch TestEngine.generateText to swap in the active word bank
(function patchLang() {
  const orig = TestEngine.prototype.generateText;
  TestEngine.prototype.generateText = function () {
    const bank = getWordBank();
    if (bank === baseWords) return orig.call(this);
    const saved = baseWords.splice(0);        // snapshot
    baseWords.push(...bank);                  // swap in
    const text = orig.call(this);
    baseWords.splice(0); baseWords.push(...saved); // restore
    return text;
  };
})();

function buildLanguageSwitcher() {
  if (document.getElementById('lang-switcher')) return;
  const nav = document.querySelector('.mode-nav');
  if (!nav) return;

  const wrap = document.createElement('div');
  wrap.id = 'lang-switcher';
  wrap.style.cssText = `
    display:flex; gap:4px; justify-content:center; flex-wrap:wrap;
    margin-bottom:14px; padding:5px 8px;
    background:rgba(255,255,255,0.42); backdrop-filter:blur(10px);
    border-radius:999px; border:1px solid rgba(255,255,255,0.65);
    width:fit-content; margin-left:auto; margin-right:auto;
    box-shadow:0 2px 12px rgba(0,0,0,0.06);
  `;
  nav.insertAdjacentElement('afterend', wrap);

  function renderBtns() {
    wrap.innerHTML = '';
    Object.entries(LANG_META).forEach(([code, meta]) => {
      const active = code === currentLang;
      const btn = document.createElement('button');
      btn.title = meta.name;
      btn.textContent = `${meta.flag} ${meta.label}`;
      btn.style.cssText = `
        border:none; border-radius:999px; padding:5px 14px;
        font-size:0.82rem; font-weight:600; cursor:pointer; font-family:inherit;
        transition:all 0.18s; background:${active ? 'var(--accent)' : 'transparent'};
        color:${active ? '#fff' : 'var(--muted)'};
      `;
      btn.addEventListener('click', () => {
        currentLang = code;
        safeLocalStorage.setItem('typeflow-language', code);
        renderBtns();
        if (typeof testEngine !== 'undefined' && !testEngine.isActive) testEngine.loadNewText();
        showToast(`${meta.flag} ${meta.name}`, '', 1500);
      });
      wrap.appendChild(btn);
    });
  }
  renderBtns();

  // Adapt colours for dark mode
  new MutationObserver(() => {
    const dark = document.body.getAttribute('data-theme') === 'dark';
    wrap.style.background  = dark ? 'rgba(20,27,36,0.48)'      : 'rgba(255,255,255,0.42)';
    wrap.style.borderColor = dark ? 'rgba(255,255,255,0.08)'   : 'rgba(255,255,255,0.65)';
  }).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
}


// ============================================================
// 2. CUSTOM TEXT MODE
// ============================================================
let _switchPatched = false;

function buildCustomMode() {
  if (document.querySelector('[data-mode="custom"]')) return;

  // Nav tab
  const nav = document.querySelector('.mode-nav');
  const tab = document.createElement('button');
  tab.className = 'mode-tab';
  tab.dataset.mode = 'custom';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', 'false');
  tab.innerHTML = `<span class="tab-icon">✏️</span><span class="tab-label">Custom</span>`;
  nav.appendChild(tab);
  tab.addEventListener('click', () => switchMode('custom'));

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
      e.preventDefault(); switchMode('custom'); showToast('✏️ Custom Text', '', 1500);
    }
  });

  // Section
  const sec = document.createElement('section');
  sec.className = 'mode-section';
  sec.id = 'custom-mode';
  sec.setAttribute('role', 'tabpanel');
  sec.style.cssText = 'display:none;opacity:0;transform:translateY(18px);pointer-events:none;transition:opacity .32s cubic-bezier(.4,0,.2,1),transform .32s cubic-bezier(.4,0,.2,1);';

  sec.innerHTML = `
<div class="panel">
  <div>
    <h2 class="section-title">Custom Text</h2>
    <p class="section-subtitle">Practice with any text you choose</p>
  </div>

  <div id="custom-source-area">
    <!-- Source tabs -->
    <div id="custom-src-tabs" style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;"></div>

    <!-- Paste / Type -->
    <div class="csrc-panel" id="csrc-type">
      <textarea id="cst-ta" rows="6" placeholder="Paste or type any text here… (min 20 characters)"
        style="width:100%;padding:16px;border-radius:12px;border:2px solid rgba(0,0,0,0.08);
               font-size:1rem;font-family:inherit;resize:vertical;background:transparent;
               color:var(--ink);outline:none;box-sizing:border-box;
               transition:border-color .2s,box-shadow .2s;"></textarea>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;align-items:center;">
        <button class="btn primary" id="cst-start-btn" disabled style="opacity:.4;">▶ Start</button>
        <button class="btn ghost"   id="cst-clear-btn">✕ Clear</button>
        <span id="cst-char-count" style="color:var(--muted);font-size:.85rem;margin-left:auto;">0 chars</span>
      </div>
    </div>

    <!-- URL -->
    <div class="csrc-panel" id="csrc-url" style="display:none;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start;">
        <input id="cst-url" type="url" placeholder="https://en.wikipedia.org/wiki/Touch_typing"
          style="flex:1;min-width:200px;padding:13px 16px;border-radius:12px;
                 border:2px solid rgba(0,0,0,0.08);font-size:1rem;font-family:inherit;
                 background:transparent;color:var(--ink);outline:none;
                 transition:border-color .2s,box-shadow .2s;" />
        <button class="btn primary" id="cst-fetch-btn">⬇ Fetch</button>
      </div>
      <p style="color:var(--muted);font-size:.82rem;margin-top:8px;">
        Works best with Wikipedia articles and plain-text pages.
        CORS-restricted sites will fail — paste the text manually instead.
      </p>
      <div id="cst-url-preview" style="display:none;margin-top:12px;"></div>
    </div>

    <!-- Upload -->
    <div class="csrc-panel" id="csrc-upload" style="display:none;">
      <div id="cst-dropzone" style="
          border:2px dashed rgba(224,122,95,.45);border-radius:16px;
          padding:44px 24px;text-align:center;cursor:pointer;
          transition:all .2s;background:rgba(224,122,95,.03);">
        <div style="font-size:2.5rem;margin-bottom:10px;">📂</div>
        <div style="font-weight:600;margin-bottom:6px;">Drop a .txt file here</div>
        <div style="color:var(--muted);font-size:.9rem;margin-bottom:16px;">or click to browse</div>
        <input type="file" id="cst-file" accept=".txt,text/plain" style="display:none;">
        <button class="btn ghost" id="cst-browse-btn" type="button">Browse files</button>
      </div>
      <div id="cst-upload-preview" style="display:none;margin-top:12px;"></div>
    </div>
  </div>

  <!-- Live typing area -->
  <div id="custom-typing-area" style="display:none;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px;">
      <div class="stat-card"><span class="stat-label">WPM</span><span class="stat-value" id="ct-wpm">0</span></div>
      <div class="stat-card"><span class="stat-label">Accuracy</span><span class="stat-value" id="ct-acc">100%</span></div>
      <div class="stat-card"><span class="stat-label">Progress</span><span class="stat-value" id="ct-prog">0%</span></div>
    </div>
    <div class="text-card" style="cursor:text;" onclick="document.getElementById('ct-input').focus()">
      <div class="text-display" id="ct-display"></div>
    </div>
    <div class="input-card">
      <input type="text" id="ct-input" placeholder="Start typing…" autocomplete="off" spellcheck="false">
      <p class="hint">Tab = restart &nbsp;·&nbsp; Esc = back to source</p>
    </div>
    <div class="actions" style="margin-top:10px;">
      <button class="btn primary" id="ct-restart-btn">↺ Restart</button>
      <button class="btn ghost"   id="ct-back-btn">← Change Text</button>
    </div>
  </div>
</div>`;

  document.querySelector('.app').appendChild(sec);

  // ---- source tab logic ----
  const srcDefs = [
    { id: 'type',   icon: '✍️', label: 'Type / Paste' },
    { id: 'url',    icon: '🔗', label: 'From URL'     },
    { id: 'upload', icon: '📂', label: 'Upload .txt'  },
  ];
  const tabBar = document.getElementById('custom-src-tabs');
  srcDefs.forEach((def, i) => {
    const btn = document.createElement('button');
    btn.className = 'custom-src-tab';
    btn.dataset.src = def.id;
    btn.textContent = `${def.icon} ${def.label}`;
    btn.style.cssText = srcTabCSS(i === 0);
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.custom-src-tab').forEach(b => { b.style.background = 'rgba(0,0,0,0.05)'; b.style.color = 'var(--muted)'; });
      sec.querySelectorAll('.csrc-panel').forEach(p => { p.style.display = 'none'; });
      btn.style.background = 'var(--accent)'; btn.style.color = '#fff';
      document.getElementById(`csrc-${def.id}`).style.display = '';
    });
    tabBar.appendChild(btn);
  });

  // ---- textarea ----
  const ta        = document.getElementById('cst-ta');
  const startBtn  = document.getElementById('cst-start-btn');
  const charCount = document.getElementById('cst-char-count');
  function syncCount() {
    const n = ta.value.trim().length;
    charCount.textContent  = `${n.toLocaleString()} chars`;
    startBtn.disabled      = n < 20;
    startBtn.style.opacity = n >= 20 ? '1' : '.4';
  }
  ta.addEventListener('input', syncCount);
  ta.addEventListener('focus', () => { ta.style.borderColor = 'var(--accent)'; ta.style.boxShadow = '0 0 0 4px rgba(224,122,95,.12)'; });
  ta.addEventListener('blur',  () => { ta.style.borderColor = 'rgba(0,0,0,.08)'; ta.style.boxShadow = 'none'; });
  document.getElementById('cst-clear-btn').addEventListener('click', () => { ta.value = ''; syncCount(); });
  startBtn.addEventListener('click', () => { const t = ta.value.trim(); if (t.length >= 20) launchCustom(t); });

  // ---- URL fetch ----
  const urlIn   = document.getElementById('cst-url');
  const fetchBtn = document.getElementById('cst-fetch-btn');
  focusStyle(urlIn);
  fetchBtn.addEventListener('click', async () => {
    const url = urlIn.value.trim();
    if (!url) { showToast('Enter a URL first', 'warning'); return; }
    fetchBtn.textContent = '⏳ Fetching…'; fetchBtn.disabled = true;
    try {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res   = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json  = await res.json();
      const tmp   = document.createElement('div');
      tmp.innerHTML = json.contents || '';
      ['script','style','nav','footer','header','aside','noscript'].forEach(t => tmp.querySelectorAll(t).forEach(el => el.remove()));
      const text = (tmp.innerText || tmp.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
      if (text.length < 20) throw new Error('Not enough readable text on that page');
      const prev = document.getElementById('cst-url-preview');
      prev.style.display = '';
      prev.innerHTML = previewCard(`✅ ${text.length.toLocaleString()} chars extracted`, text.slice(0, 180) + '…', 'cst-url-go');
      document.getElementById('cst-url-go').addEventListener('click', () => launchCustom(text));
    } catch(err) {
      showToast(`⚠ ${err.message || 'Fetch failed — try pasting instead'}`, 'warning', 4000);
    } finally {
      fetchBtn.textContent = '⬇ Fetch'; fetchBtn.disabled = false;
    }
  });
  urlIn.addEventListener('keydown', e => { if (e.key === 'Enter') fetchBtn.click(); });

  // ---- file upload ----
  const fileIn    = document.getElementById('cst-file');
  const dropzone  = document.getElementById('cst-dropzone');
  document.getElementById('cst-browse-btn').addEventListener('click', e => { e.stopPropagation(); fileIn.click(); });
  dropzone.addEventListener('click', () => fileIn.click());
  dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.style.borderColor = 'var(--accent)'; dropzone.style.background = 'rgba(224,122,95,.07)'; });
  dropzone.addEventListener('dragleave', ()  => resetDropzone());
  dropzone.addEventListener('drop', e => { e.preventDefault(); resetDropzone(); handleFile(e.dataTransfer.files[0]); });
  fileIn.addEventListener('change', e => handleFile(e.target.files[0]));

  function resetDropzone() { dropzone.style.borderColor = 'rgba(224,122,95,.45)'; dropzone.style.background = 'rgba(224,122,95,.03)'; }
  function handleFile(file) {
    if (!file || (!file.name.endsWith('.txt') && file.type !== 'text/plain')) {
      showToast('Please upload a .txt file', 'warning'); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result.trim().slice(0, 5000);
      if (text.length < 20) { showToast('File too short (min 20 chars)', 'warning'); return; }
      const prev = document.getElementById('cst-upload-preview');
      prev.style.display = '';
      prev.innerHTML = previewCard(`📄 ${file.name}`, `${text.length.toLocaleString()} characters loaded`, 'cst-upload-go');
      document.getElementById('cst-upload-go').addEventListener('click', () => launchCustom(text));
    };
    reader.onerror = () => showToast('Could not read file', 'warning');
    reader.readAsText(file);
  }

  // ---- typing controls ----
  document.getElementById('ct-restart-btn').addEventListener('click', () => customTyper.restart());
  document.getElementById('ct-back-btn').addEventListener('click',    () => {
    document.getElementById('custom-typing-area').style.display = 'none';
    document.getElementById('custom-source-area').style.display = '';
    customTyper.reset();
  });

  // ---- patch switchMode ----
  if (!_switchPatched) {
    _switchPatched = true;
    const _orig = window.switchMode;
    window.switchMode = function(mode) {
      _orig(mode);
      const customSec = document.getElementById('custom-mode');
      if (!customSec) return;
      if (mode === 'custom') {
        customSec.style.display = 'block';
        void customSec.offsetWidth;
        customSec.classList.add('active');
        customSec.style.opacity       = '1';
        customSec.style.transform     = 'translateY(0)';
        customSec.style.pointerEvents = 'auto';
      } else {
        customSec.classList.remove('active');
        customSec.style.opacity       = '0';
        customSec.style.transform     = 'translateY(18px)';
        customSec.style.pointerEvents = 'none';
        setTimeout(() => { if (!customSec.classList.contains('active')) customSec.style.display = 'none'; }, 350);
      }
    };
  }
}

// Shared helpers
function srcTabCSS(active) {
  return `border:none;border-radius:999px;padding:8px 18px;font-size:.9rem;font-weight:600;
          cursor:pointer;font-family:inherit;transition:all .18s;
          background:${active ? 'var(--accent)' : 'rgba(0,0,0,.05)'};
          color:${active ? '#fff' : 'var(--muted)'};`;
}
function focusStyle(el) {
  el.addEventListener('focus', () => { el.style.borderColor = 'var(--accent)'; el.style.boxShadow = '0 0 0 4px rgba(224,122,95,.12)'; });
  el.addEventListener('blur',  () => { el.style.borderColor = 'rgba(0,0,0,.08)'; el.style.boxShadow = 'none'; });
}
function previewCard(title, body, btnId) {
  return `<div style="background:rgba(47,133,90,.07);border:1px solid rgba(47,133,90,.22);
                      border-radius:12px;padding:14px 16px;">
            <div style="font-weight:600;margin-bottom:6px;">${title}</div>
            <div style="color:var(--muted);font-size:.85rem;margin-bottom:12px;
                        max-height:56px;overflow:hidden;">${body}</div>
            <button class="btn primary" id="${btnId}" style="padding:8px 18px;font-size:.9rem;">▶ Start Typing</button>
          </div>`;
}

// ---- Custom typing micro-engine ----
const customTyper = {
  text:'', pos:0, correct:0, incorrect:0, active:false, t0:null, _iv:null,
  start(text) {
    this.text=text; this.pos=0; this.correct=0; this.incorrect=0; this.active=false; this.t0=null;
    clearInterval(this._iv);
    const inp = document.getElementById('ct-input');
    // Clone to remove old listeners
    const fresh = inp.cloneNode(true);
    inp.parentNode.replaceChild(fresh, inp);
    fresh.value=''; fresh.disabled=false; fresh.focus();
    fresh.addEventListener('input',   () => this._onInput());
    fresh.addEventListener('keydown', e => {
      playKeyClick();
      if (e.key==='Tab')    { e.preventDefault(); this.restart(); }
      if (e.key==='Escape') { document.getElementById('ct-back-btn')?.click(); }
    });
    this._render(); this._stats(true);
  },
  restart() { if(this.text) this.start(this.text); },
  reset()   { this.text=''; clearInterval(this._iv); },
  _onInput() {
    const inp = document.getElementById('ct-input');
    if (!inp) return;
    if (!this.active && inp.value.length>0) {
      this.active=true; this.t0=Date.now();
      this._iv = setInterval(()=>this._stats(), 500);
    }
    this.pos=inp.value.length; this.correct=0; this.incorrect=0;
    for (let i=0;i<inp.value.length;i++) {
      if (inp.value[i]===this.text[i]) this.correct++; else this.incorrect++;
    }
    this._render(); this._stats();
    if (this.pos>=this.text.length) this._done();
  },
  _render() {
    const val  = document.getElementById('ct-input')?.value||'';
    const disp = document.getElementById('ct-display');
    if (!disp) return;
    let html='';
    for (let i=0;i<this.text.length;i++) {
      const ch=this.text[i]; let cls='char';
      if      (i<this.pos)  cls+=val[i]===ch?' correct':' incorrect';
      else if (i===this.pos) cls+=' current';
      const safe=ch===' '?' ':ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html+=`<span class="${cls}">${safe}</span>`;
    }
    disp.innerHTML=html;
    disp.querySelector('.current')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  },
  _stats(reset=false) {
    const w=document.getElementById('ct-wpm'), a=document.getElementById('ct-acc'), p=document.getElementById('ct-prog');
    if (!w) return;
    if (reset){ w.textContent='0'; a.textContent='100%'; p.textContent='0%'; return; }
    const elapsed=Math.max((Date.now()-this.t0)/60000,1/60);
    w.textContent = Math.round((this.correct/5)/elapsed)||0;
    const tot=this.correct+this.incorrect;
    a.textContent = `${tot?Math.round(this.correct/tot*100):100}%`;
    p.textContent = `${Math.round(this.pos/this.text.length*100)}%`;
  },
  _done() {
    clearInterval(this._iv);
    const inp=document.getElementById('ct-input'); if(inp) inp.disabled=true;
    const wpm=parseInt(document.getElementById('ct-wpm')?.textContent||'0');
    const acc=parseInt(document.getElementById('ct-acc')?.textContent||'100');
    if (typeof progressManager!=='undefined') {
      const xp=Math.floor(wpm*1.5);
      progressManager.addXP(xp); progressManager.updateStreak(); progressManager.save();
      showToast(`✅ ${wpm} WPM · ${acc}% accuracy · +${xp} XP`, 'success', 4000);
    } else {
      showToast(`✅ ${wpm} WPM · ${acc}% accuracy`, 'success', 3000);
    }
  }
};

function launchCustom(text) {
  document.getElementById('custom-source-area').style.display = 'none';
  document.getElementById('custom-typing-area').style.display = '';
  customTyper.start(text);
}


// ============================================================
// 3. CSV EXPORT  (Dashboard)
// ============================================================
function buildCSVExport() {
  if (document.getElementById('export-csv-btn')) return;
  const panel = document.querySelector('#dashboard-mode .panel');
  if (!panel) return;

  const row = document.createElement('div');
  row.style.cssText = `
    display:flex; gap:12px; flex-wrap:wrap; align-items:center;
    padding-top:1.2em; border-top:1px solid rgba(0,0,0,.07); margin-top:.5em;
  `;
  row.innerHTML = `
    <span style="font-size:.88rem;color:var(--muted);font-weight:500;">Export:</span>
    <button class="btn ghost" id="export-csv-btn"  style="font-size:.88rem;padding:8px 16px;">⬇ CSV</button>
    <button class="btn ghost" id="export-json-btn" style="font-size:.88rem;padding:8px 16px;">⬇ JSON</button>
  `;
  const resetEl = panel.querySelector('#reset-progress-btn')?.parentElement;
  if (resetEl) panel.insertBefore(row, resetEl); else panel.appendChild(row);

  document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
  document.getElementById('export-json-btn').addEventListener('click', exportJSON);
}

function exportCSV() {
  let hist = {};
  try { hist = JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history')||'{}'); } catch{}
  const rows = Object.entries(hist)
    .map(([i,e])=>({idx:parseInt(i,10),...e}))
    .sort((a,b)=>a.idx-b.idx);
  if (!rows.length) { showToast('No history to export yet', 'warning'); return; }
  const csv = 'Test #,Date,WPM,Accuracy\n' +
    rows.map(r=>`${r.idx},"${r.date||''}",${r.wpm||0},${r.accuracy||0}`).join('\n');
  dlFile(csv, 'typeflow-history.csv', 'text/csv');
  showToast(`✅ Exported ${rows.length} tests`, 'success', 2500);
}

function exportJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    progress:   progressManager?.data ?? {},
    history:    JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history')||'{}'),
    keyStats:   JSON.parse(safeLocalStorage.getItem('typeflow-key-stats')||'{}'),
  };
  dlFile(JSON.stringify(data,null,2), 'typeflow-data.json', 'application/json');
  showToast('✅ Full data exported', 'success', 2500);
}

function dlFile(content, filename, mime) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content],{type:mime})),
    download: filename
  });
  a.click(); URL.revokeObjectURL(a.href);
}


// ============================================================
// 4. MOBILE UX
// ============================================================
function buildMobileImprovements() {
  const mobile = () => window.innerWidth<=768 || 'ontouchstart' in window;
  if (!mobile()) return;

  // iOS: 16px+ prevents auto-zoom on input focus
  const s = document.createElement('style');
  s.textContent = `
    @media (max-width:768px) {
      #typing-input,#lesson-input,#practice-input,
      #ct-input,#cst-ta,#cst-url { font-size:16px !important; }
      .timer-btn,.word-count-btn,.segmented-btn,
      .custom-src-tab { min-height:44px !important; }
      .mode-tab  { min-height:52px !important; }
      .toggle    { min-height:44px !important; padding:10px 16px !important; }
      .btn       { min-height:48px !important; }
      .text-card { cursor:pointer; -webkit-tap-highlight-color:transparent; }
      .stat-value { font-size:1.8rem !important; }
    }
  `;
  document.head.appendChild(s);

  // Floating "Tap to type" banner
  const banner = document.createElement('div');
  banner.id = 'tap-banner';
  banner.textContent = '⌨️ Tap to type';
  banner.style.cssText = `
    display:none; position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:var(--accent); color:#fff; padding:12px 28px; border-radius:999px;
    font-weight:600; font-size:.95rem; z-index:500; cursor:pointer;
    white-space:nowrap; box-shadow:0 8px 24px rgba(224,122,95,.45);
    animation:tapPulse 2s ease infinite;
  `;
  document.body.appendChild(banner);
  const ps = document.createElement('style');
  ps.textContent = `@keyframes tapPulse{0%,100%{box-shadow:0 8px 24px rgba(224,122,95,.4)}50%{box-shadow:0 14px 36px rgba(224,122,95,.65)}}`;
  document.head.appendChild(ps);

  banner.addEventListener('click', () => {
    (document.querySelector('#test-mode.active #typing-input') ||
     document.querySelector('#custom-mode.active #ct-input')   ||
     document.querySelector('#practice-mode.active #practice-input'))?.focus();
    banner.style.display = 'none';
  });
  document.addEventListener('focusin',  () => { banner.style.display='none'; });
  document.addEventListener('focusout', e => {
    if (e.target?.id==='typing-input' && document.getElementById('test-mode')?.classList.contains('active')) {
      setTimeout(()=>{ if(document.activeElement?.id!=='typing-input') banner.style.display='block'; }, 400);
    }
  });
}


// ============================================================
// HELP MODAL — append new shortcuts
// ============================================================
function patchHelpModal() {
  const ul = document.querySelector('#help-modal ul');
  if (!ul || ul.dataset.patched) return;
  ul.dataset.patched = '1';
  [
    ['Ctrl+Shift+T', 'Custom Text mode'],
    ['Language switcher', 'Flag buttons below the nav bar (EN/FR/DE/JA)'],
    ['⬇ CSV / JSON', 'Export test history from Dashboard'],
  ].forEach(([k,v]) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${k}</b>: ${v}`;
    ul.appendChild(li);
  });
}

// ============================================================
// BOOT
// ============================================================
function initNewFeatures() {
  buildLanguageSwitcher();
  buildCustomMode();
  buildCSVExport();
  buildMobileImprovements();
  patchHelpModal();
}

if (document.readyState==='loading') {
  document.addEventListener('DOMContentLoaded', initNewFeatures);
} else {
  setTimeout(initNewFeatures, 0);
}