/* =========================================
   TYPEFLOW — NEW FEATURES PATCH
   Add this BEFORE the closing </body> tag,
   after script.js. It extends the existing app.
   =========================================

   Features added:
   1. Custom Text Mode  — paste, type, or upload .txt
   2. Language Support  — ES / FR / DE / PT word banks + switcher
   3. Export / Share    — results image card + CSV history download
   4. Mobile UX         — floating soft keyboard dismiss, better touch targets
   ========================================= */

// ============================================================
// 1. LANGUAGE WORD BANKS
// ============================================================
const LANGUAGE_WORD_BANKS = {
    en: null, // uses existing baseWords
    es: [
        "el","la","de","en","y","a","que","los","se","del","las","un","por","con","una","su","para","es","al","lo",
        "como","más","pero","sus","le","ya","o","este","fue","bien","cuando","muy","sin","sobre","también","tiene",
        "hasta","hay","donde","quien","desde","todo","nos","durante","estados","todos","uno","les","ni","contra",
        "otros","ese","eso","ante","ellos","entre","esta","ser","dos","años","otro","haber","si","nombre","misma",
        "casa","tiempo","vida","mundo","mano","agua","noche","ciudad","parte","hombre","mujer","día","año","vez",
        "trabajo","manera","lugar","amor","familia","cosa","forma","país","punto","momento","tipo","persona","historia",
        "palabra","pregunta","verdad","problema","camino","idea","tarde","mañana","libro","gente","voz","puerta",
        "noche","tierra","madre","padre","hijo","amigo","ciudad","color","cuerpo","ojos","cara","cabeza","corazón",
        "través","tanto","hacer","decir","saber","poder","querer","llegar","pasar","deber","poner","creer","hablar",
        "llevar","dejar","seguir","encontrar","llamar","venir","pensar","salir","volver","tomar","conocer","vivir",
        "sentir","mirar","contar","empezar","esperar","buscar","existir","entrar","trabajar","escribir","perder",
        "producir","ocurrir","entender","pedir","recibir","recordar","terminar","permitir","aparecer","conseguir"
    ],
    fr: [
        "le","la","les","de","un","une","des","en","et","est","que","qui","il","elle","ce","nous","vous","ils",
        "elles","je","tu","me","te","se","son","sa","ses","mon","ma","mes","ton","ta","tes","leur","leurs","y",
        "au","aux","du","par","sur","dans","avec","pour","pas","plus","mais","ou","si","ne","tout","bien","être",
        "avoir","faire","dire","pouvoir","aller","voir","savoir","vouloir","venir","prendre","falloir","croire",
        "trouver","donner","tenir","partir","sembler","laisser","passer","rester","entendre","mettre","sentir",
        "parler","porter","chercher","appeler","regarder","penser","rendre","montrer","demander","connaître",
        "temps","année","monde","vie","homme","femme","jour","enfant","main","ville","pays","chose","nuit","eau",
        "nom","voix","lieu","porte","maison","travail","amour","histoire","famille","coeur","tête","corps","yeux",
        "livre","question","problème","idée","chemin","moment","façon","point","genre","type","couleur","nature"
    ],
    de: [
        "der","die","das","ein","eine","und","ist","in","zu","den","von","mit","sich","des","nicht","auf","dem",
        "er","sie","es","wird","auch","ich","war","als","an","nach","bei","hat","wie","aus","oder","aber","vor",
        "doch","so","wir","wenn","über","einen","noch","sein","durch","uns","hier","dass","diese","alle","nur",
        "dann","hat","ihm","werden","geworden","haben","mehr","seiner","gegen","weil","wieder","bis","seit","zur",
        "Zeit","Jahr","Mann","Frau","Kind","Stadt","Land","Haus","Tag","Nacht","Welt","Leben","Mensch","Hand",
        "Wasser","Namen","Stimme","Tür","Buch","Frage","Weg","Liebe","Familie","Herz","Kopf","Auge","Körper",
        "Arbeit","Moment","Gedanke","Problem","Geschichte","Farbe","Art","Form","Punkt","Idee","Sache","Platz",
        "machen","sagen","gehen","sehen","wissen","kommen","können","müssen","geben","nehmen","halten","heißen",
        "denken","finden","lassen","stehen","bleiben","liegen","fallen","sprechen","schreiben","lesen","zeigen"
    ],
    pt: [
        "o","a","de","que","e","do","da","em","um","para","com","uma","os","no","se","na","por","mais","as","dos",
        "como","mas","foi","ao","ele","das","tem","à","seu","sua","ou","ser","quando","muito","há","nos","já","está",
        "eu","também","só","pelo","pela","até","isso","ela","entre","era","depois","sem","mesmo","aos","ter","seus",
        "suas","numa","pelos","pelas","esse","eles","tão","havia","foram","todo","essa","bem","este","esta","isso",
        "tempo","ano","mundo","vida","homem","mulher","dia","filho","mão","cidade","país","coisa","noite","água",
        "nome","voz","lugar","porta","casa","trabalho","amor","história","família","coração","cabeça","corpo","olho",
        "livro","pergunta","problema","ideia","caminho","momento","forma","ponto","tipo","cor","natureza","gente",
        "fazer","dizer","poder","ir","ver","saber","querer","vir","ter","dar","ficar","falar","partir","deixar",
        "passar","encontrar","sentir","olhar","pensar","contar","começar","esperar","buscar","entrar","trabalhar"
    ]
};

const LANGUAGE_LABELS = { en: '🇬🇧 EN', es: '🇪🇸 ES', fr: '🇫🇷 FR', de: '🇩🇪 DE', pt: '🇧🇷 PT' };
let currentLanguage = safeLocalStorage.getItem('typeflow-language') || 'en';

function getActiveWordBank() {
    if (currentLanguage === 'en' || !LANGUAGE_WORD_BANKS[currentLanguage]) return baseWords;
    return LANGUAGE_WORD_BANKS[currentLanguage];
}

function injectLanguageSwitcher() {
    // Add language pill row under the mode nav
    const modeNav = document.querySelector('.mode-nav');
    if (!modeNav || document.getElementById('language-switcher')) return;

    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    switcher.style.cssText = `
        display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
        margin-bottom: 14px; padding: 6px 10px;
        background: rgba(255,255,255,0.38); backdrop-filter: blur(10px);
        border-radius: 999px; border: 1px solid rgba(255,255,255,0.6);
        width: fit-content; margin-left: auto; margin-right: auto;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        transition: background 0.2s;
    `;
    modeNav.insertAdjacentElement('afterend', switcher);

    Object.entries(LANGUAGE_LABELS).forEach(([code, label]) => {
        const btn = document.createElement('button');
        btn.dataset.lang = code;
        btn.textContent = label;
        btn.style.cssText = `
            border: none; border-radius: 999px; padding: 5px 14px;
            font-size: 0.82rem; font-weight: 600; cursor: pointer;
            transition: all 0.18s ease; font-family: inherit;
            background: ${code === currentLanguage ? 'var(--accent)' : 'transparent'};
            color: ${code === currentLanguage ? '#fff' : 'var(--muted)'};
        `;
        btn.addEventListener('click', () => {
            currentLanguage = code;
            safeLocalStorage.setItem('typeflow-language', code);
            document.querySelectorAll('#language-switcher button').forEach(b => {
                const active = b.dataset.lang === code;
                b.style.background = active ? 'var(--accent)' : 'transparent';
                b.style.color      = active ? '#fff' : 'var(--muted)';
            });
            if (typeof testEngine !== 'undefined' && !testEngine.isActive) {
                testEngine.loadNewText();
            }
            showToast(`Language: ${label}`, '', 1500);
        });
        switcher.appendChild(btn);
    });

    // Dark mode adaptation
    const observer = new MutationObserver(() => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        switcher.style.background = isDark
            ? 'rgba(20,27,36,0.45)'
            : 'rgba(255,255,255,0.38)';
        switcher.style.borderColor = isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.6)';
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
}

// Patch TestEngine.generateText to use active language word bank
(function patchTestEngineLanguage() {
    const _originalGenerate = TestEngine.prototype.generateText;
    TestEngine.prototype.generateText = function() {
        // Swap baseWords for current language temporarily
        const originalBank = window._baseWordsOverride;
        const langBank = getActiveWordBank();
        // We patch by temporarily swapping out baseWords
        const saved = baseWords.slice();
        if (langBank !== baseWords) {
            baseWords.splice(0, baseWords.length, ...langBank);
        }
        const result = _originalGenerate.call(this);
        // Restore
        baseWords.splice(0, baseWords.length, ...saved);
        return result;
    };
})();


// ============================================================
// 2. CUSTOM TEXT MODE
// ============================================================
function injectCustomTextMode() {
    // Add tab to nav
    const nav = document.querySelector('.mode-nav');
    if (!nav || document.querySelector('[data-mode="custom"]')) return;

    const tab = document.createElement('button');
    tab.className = 'mode-tab';
    tab.dataset.mode = 'custom';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    tab.innerHTML = `<span class="tab-icon">✏️</span><span class="tab-label">Custom</span>`;
    nav.appendChild(tab);
    tab.addEventListener('click', () => switchMode('custom'));

    // Register keyboard shortcut Ctrl+Shift+T
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
            e.preventDefault();
            switchMode('custom');
            showToast('✏️ Custom Text mode', '', 1500);
        }
    });

    // Create the section HTML
    const section = document.createElement('section');
    section.className = 'mode-section';
    section.id = 'custom-mode';
    section.setAttribute('role', 'tabpanel');
    section.setAttribute('hidden', '');
    section.style.display = 'none';
    section.style.opacity = '0';
    section.innerHTML = `
        <div class="panel">
            <div class="custom-header">
                <h2 class="section-title">Custom Text</h2>
                <p class="section-subtitle">Type any text you want to practice</p>
            </div>

            <div class="custom-input-area" id="custom-input-area">
                <div class="custom-tabs">
                    <button class="custom-tab active" data-ctab="paste">📋 Paste / Type</button>
                    <button class="custom-tab" data-ctab="upload">📂 Upload .txt</button>
                </div>

                <!-- Paste/Type panel -->
                <div class="custom-panel active" id="ctab-paste">
                    <textarea
                        id="custom-text-source"
                        placeholder="Paste or type your custom text here... (min 20 characters)"
                        rows="6"
                        style="width:100%;padding:16px;border-radius:12px;border:2px solid rgba(0,0,0,0.08);
                               font-size:1rem;font-family:inherit;resize:vertical;
                               background:transparent;color:var(--ink);outline:none;
                               transition:border-color 0.2s;"
                    ></textarea>
                    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;align-items:center;">
                        <button class="btn primary" id="custom-start-btn" disabled>▶ Start Typing</button>
                        <button class="btn ghost" id="custom-clear-btn">✕ Clear</button>
                        <span id="custom-char-count" style="color:var(--muted);font-size:0.85rem;margin-left:auto;">0 chars</span>
                    </div>
                </div>

                <!-- Upload panel -->
                <div class="custom-panel" id="ctab-upload" style="display:none;">
                    <div id="custom-dropzone" style="
                        border: 2px dashed rgba(224,122,95,0.4); border-radius: 16px;
                        padding: 48px 24px; text-align: center; cursor: pointer;
                        transition: all 0.2s; background: rgba(224,122,95,0.03);
                    ">
                        <div style="font-size:2.5rem;margin-bottom:12px;">📂</div>
                        <div style="font-weight:600;margin-bottom:6px;">Drop a .txt file here</div>
                        <div style="color:var(--muted);font-size:0.9rem;margin-bottom:16px;">or click to browse</div>
                        <input type="file" id="custom-file-input" accept=".txt" style="display:none;">
                        <button class="btn ghost" onclick="document.getElementById('custom-file-input').click()">Browse files</button>
                    </div>
                    <div id="custom-file-preview" style="display:none;margin-top:12px;">
                        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;
                                    background:rgba(47,133,90,0.08);border-radius:10px;
                                    border:1px solid rgba(47,133,90,0.2);">
                            <span style="font-size:1.5rem;">📄</span>
                            <div>
                                <div id="custom-file-name" style="font-weight:600;font-size:0.95rem;"></div>
                                <div id="custom-file-chars" style="color:var(--muted);font-size:0.82rem;"></div>
                            </div>
                            <button class="btn ghost" id="custom-file-start" style="margin-left:auto;padding:8px 18px;font-size:0.9rem;">▶ Start</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Live typing area (hidden until started) -->
            <div id="custom-typing-area" style="display:none;">
                <div class="custom-typing-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px;">
                    <div class="stat-card"><span class="stat-label">WPM</span><span class="stat-value" id="custom-wpm">0</span></div>
                    <div class="stat-card"><span class="stat-label">Accuracy</span><span class="stat-value" id="custom-accuracy">100%</span></div>
                    <div class="stat-card"><span class="stat-label">Progress</span><span class="stat-value" id="custom-progress">0%</span></div>
                </div>
                <div class="text-card" aria-live="polite">
                    <div class="text-display" id="custom-text-display"></div>
                </div>
                <div class="input-card">
                    <input type="text" id="custom-typing-input" placeholder="Start typing..." autocomplete="off" spellcheck="false">
                    <p class="hint">Tab = restart this text</p>
                </div>
                <div class="actions" style="margin-top:10px;">
                    <button class="btn primary" id="custom-restart-btn">↺ Restart</button>
                    <button class="btn ghost" id="custom-change-text-btn">← Change Text</button>
                </div>
            </div>
        </div>
    `;
    document.querySelector('.app').appendChild(section);

    // Wire up custom text tab switching
    section.querySelectorAll('.custom-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.custom-tab').forEach(b => b.classList.remove('active'));
            section.querySelectorAll('.custom-panel').forEach(p => p.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(`ctab-${btn.dataset.ctab}`).style.display = '';
        });
    });

    // Char count + enable/disable start button
    const sourceTA = document.getElementById('custom-text-source');
    const startBtn = document.getElementById('custom-start-btn');
    const charCount = document.getElementById('custom-char-count');
    sourceTA.addEventListener('input', () => {
        const len = sourceTA.value.trim().length;
        charCount.textContent = `${len} chars`;
        startBtn.disabled = len < 20;
        startBtn.style.opacity = len < 20 ? '0.4' : '1';
    });
    // Focus style
    sourceTA.addEventListener('focus', () => { sourceTA.style.borderColor = 'var(--accent)'; sourceTA.style.boxShadow = '0 0 0 4px rgba(224,122,95,0.12)'; });
    sourceTA.addEventListener('blur',  () => { sourceTA.style.borderColor = 'rgba(0,0,0,0.08)'; sourceTA.style.boxShadow = 'none'; });

    document.getElementById('custom-clear-btn').addEventListener('click', () => {
        sourceTA.value = ''; charCount.textContent = '0 chars'; startBtn.disabled = true; startBtn.style.opacity = '0.4';
    });

    startBtn.addEventListener('click', () => {
        const text = sourceTA.value.trim();
        if (text.length >= 20) startCustomTyping(text);
    });

    // File upload
    const fileInput  = document.getElementById('custom-file-input');
    const dropzone   = document.getElementById('custom-dropzone');
    const filePreview = document.getElementById('custom-file-preview');
    let uploadedText = '';

    function handleFile(file) {
        if (!file || !file.name.endsWith('.txt')) { showToast('Please upload a .txt file', 'warning'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedText = e.target.result.trim();
            document.getElementById('custom-file-name').textContent  = file.name;
            document.getElementById('custom-file-chars').textContent = `${uploadedText.length.toLocaleString()} characters`;
            filePreview.style.display = '';
        };
        reader.readAsText(file);
    }

    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--accent)'; dropzone.style.background = 'rgba(224,122,95,0.06)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'rgba(224,122,95,0.4)'; dropzone.style.background = 'rgba(224,122,95,0.03)'; });
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.style.borderColor = 'rgba(224,122,95,0.4)'; dropzone.style.background = 'rgba(224,122,95,0.03)'; handleFile(e.dataTransfer.files[0]); });
    dropzone.addEventListener('click', () => fileInput.click());

    document.getElementById('custom-file-start').addEventListener('click', () => {
        if (uploadedText.length >= 20) startCustomTyping(uploadedText);
        else showToast('File is too short (min 20 chars)', 'warning');
    });

    document.getElementById('custom-change-text-btn').addEventListener('click', () => {
        document.getElementById('custom-typing-area').style.display = 'none';
        document.getElementById('custom-input-area').style.display  = '';
        customEngine.reset();
    });

    document.getElementById('custom-restart-btn').addEventListener('click', () => customEngine.restart());

    // Register with switchMode
    const _origSwitchMode = window.switchMode;
    window.switchMode = function(mode) {
        _origSwitchMode(mode);
        if (mode === 'custom') {
            // Show/hide custom section properly
            const customSec = document.getElementById('custom-mode');
            if (customSec) {
                customSec.style.display = 'block';
                customSec.hidden = false;
                void customSec.offsetWidth;
                customSec.classList.add('active');
                customSec.style.opacity = '1';
                customSec.style.pointerEvents = 'auto';
                customSec.style.transform = 'translateY(0)';
            }
        } else {
            const customSec = document.getElementById('custom-mode');
            if (customSec) {
                customSec.classList.remove('active');
                customSec.style.opacity  = '0';
                customSec.style.transform = 'translateY(18px)';
                customSec.style.pointerEvents = 'none';
                setTimeout(() => { if (!customSec.classList.contains('active')) customSec.style.display = 'none'; }, 350);
            }
        }
    };
}

// Custom typing mini-engine
const customEngine = {
    text: '', position: 0, correct: 0, incorrect: 0,
    isActive: false, startTime: null, timerInterval: null,

    start(text) {
        this.text = text; this.position = 0; this.correct = 0; this.incorrect = 0;
        this.isActive = false; this.startTime = null;
        clearInterval(this.timerInterval);
        const input = document.getElementById('custom-typing-input');
        input.value = ''; input.disabled = false;
        this.render();
        this.updateStats(true);
        input.focus();
        input.addEventListener('input',   () => this.handleInput(),  { once: false });
        input.addEventListener('keydown', (e) => {
            playKeyClick();
            if (e.key === 'Tab') { e.preventDefault(); this.restart(); }
        });
    },

    restart() { this.start(this.text); },
    reset()   { this.text = ''; clearInterval(this.timerInterval); },

    render() {
        const typed = document.getElementById('custom-typing-input').value;
        const display = document.getElementById('custom-text-display');
        let html = '';
        for (let i = 0; i < this.text.length; i++) {
            const ch = this.text[i];
            let cls = 'char';
            if (i < this.position) cls += typed[i] === ch ? ' correct' : ' incorrect';
            else if (i === this.position) cls += ' current';
            const safe = ch === ' ' ? ' ' : ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            html += `<span class="${cls}">${safe}</span>`;
        }
        display.innerHTML = html;
        const cur = display.querySelector('.current');
        if (cur) cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    handleInput() {
        const input = document.getElementById('custom-typing-input');
        if (!this.isActive && input.value.length > 0) {
            this.isActive = true; this.startTime = Date.now();
            this.timerInterval = setInterval(() => this.updateStats(), 500);
        }
        this.position = input.value.length;
        this.correct = 0; this.incorrect = 0;
        for (let i = 0; i < input.value.length; i++) {
            if (input.value[i] === this.text[i]) this.correct++; else this.incorrect++;
        }
        this.render(); this.updateStats();
        if (this.position >= this.text.length) this.complete();
    },

    updateStats(reset = false) {
        if (reset) {
            document.getElementById('custom-wpm').textContent      = '0';
            document.getElementById('custom-accuracy').textContent = '100%';
            document.getElementById('custom-progress').textContent = '0%';
            return;
        }
        const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1/60);
        document.getElementById('custom-wpm').textContent      = Math.round((this.correct / 5) / elapsed) || 0;
        const total = this.correct + this.incorrect;
        document.getElementById('custom-accuracy').textContent = `${total ? Math.round((this.correct / total) * 100) : 100}%`;
        document.getElementById('custom-progress').textContent = `${Math.round((this.position / this.text.length) * 100)}%`;
    },

    complete() {
        clearInterval(this.timerInterval);
        const input = document.getElementById('custom-typing-input');
        input.disabled = true;
        const wpm = parseInt(document.getElementById('custom-wpm').textContent);
        const acc = parseInt(document.getElementById('custom-accuracy').textContent);
        showToast(`✅ Done! ${wpm} WPM · ${acc}% accuracy`, 'success', 4000);
        const xp = Math.floor(wpm * 1.5);
        if (typeof progressManager !== 'undefined') {
            progressManager.addXP(xp);
            showToast(`✨ +${xp} XP earned`, '', 2500);
        }
    }
};

function startCustomTyping(text) {
    document.getElementById('custom-input-area').style.display  = 'none';
    document.getElementById('custom-typing-area').style.display = '';
    customEngine.start(text);
}


// ============================================================
// 3. EXPORT / SHARE RESULTS
// ============================================================
function injectExportButtons() {
    // Add export buttons to the results modal
    const resultsActions = document.querySelector('.results-actions');
    if (!resultsActions || document.getElementById('export-share-btn')) return;

    const shareBtn = document.createElement('button');
    shareBtn.id = 'export-share-btn';
    shareBtn.className = 'btn ghost';
    shareBtn.innerHTML = '📤 Share';
    shareBtn.style.cssText = 'font-size:0.95rem;padding:10px 18px;';
    resultsActions.appendChild(shareBtn);

    shareBtn.addEventListener('click', () => generateShareCard());

    // Also add CSV export to dashboard
    const dashPanel = document.querySelector('#dashboard-mode .panel');
    if (dashPanel && !document.getElementById('export-csv-btn')) {
        const exportSection = document.createElement('div');
        exportSection.style.cssText = 'margin-top:1.5em;padding-top:1.5em;border-top:1px solid rgba(0,0,0,0.06);display:flex;gap:12px;flex-wrap:wrap;align-items:center;';
        exportSection.innerHTML = `
            <span style="font-size:0.9rem;color:var(--muted);font-weight:500;">Export your data:</span>
            <button class="btn ghost" id="export-csv-btn" style="font-size:0.9rem;padding:8px 16px;">⬇ Download CSV</button>
            <button class="btn ghost" id="export-json-btn" style="font-size:0.9rem;padding:8px 16px;">⬇ Download JSON</button>
        `;
        // Insert before the reset button row
        const resetRow = dashPanel.querySelector('#reset-progress-btn')?.parentElement;
        if (resetRow) dashPanel.insertBefore(exportSection, resetRow);
        else dashPanel.appendChild(exportSection);

        document.getElementById('export-csv-btn').addEventListener('click',  exportCSV);
        document.getElementById('export-json-btn').addEventListener('click', exportJSON);
    }
}

function generateShareCard() {
    const wpm      = document.getElementById('result-wpm')?.textContent      || '0 WPM';
    const accuracy = document.getElementById('result-accuracy')?.textContent  || '100%';
    const correct  = document.getElementById('result-correct')?.textContent   || '0';
    const xp       = document.getElementById('xp-amount')?.textContent        || '0';
    const best     = progressManager?.data?.bestWPM || 0;
    const streak   = progressManager?.data?.streakDays || 0;
    const isDark   = document.body.getAttribute('data-theme') === 'dark';

    const canvas  = document.createElement('canvas');
    canvas.width  = 640;
    canvas.height = 360;
    const ctx     = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 640, 360);
    if (isDark) {
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#0f172a');
    } else {
        grad.addColorStop(0, '#fef5ea');
        grad.addColorStop(1, '#e9edf5');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    // Accent stripe
    const accentGrad = ctx.createLinearGradient(0, 0, 640, 0);
    accentGrad.addColorStop(0, isDark ? '#f4a261' : '#e07a5f');
    accentGrad.addColorStop(1, isDark ? '#e98645' : '#cc5b3e');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, 640, 6);

    // Brand
    ctx.fillStyle = isDark ? '#e6edf3' : '#1f2933';
    ctx.font = 'bold 28px Poppins, sans-serif';
    ctx.fillText('Typeflow', 40, 60);

    ctx.fillStyle = isDark ? '#a8b2c1' : '#7b8794';
    ctx.font = '14px Poppins, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }), 40, 84);

    // Main WPM number
    const wpmNum = wpm.replace(' WPM','');
    ctx.fillStyle = isDark ? '#f4a261' : '#e07a5f';
    ctx.font = 'bold 120px Poppins, sans-serif';
    ctx.fillText(wpmNum, 36, 230);

    ctx.fillStyle = isDark ? '#a8b2c1' : '#7b8794';
    ctx.font = 'bold 24px Poppins, sans-serif';
    ctx.fillText('WPM', 40, 268);

    // Stats grid (right side)
    const stats = [
        { label: 'Accuracy', value: accuracy },
        { label: 'Correct chars', value: correct },
        { label: 'XP earned', value: `+${xp} XP` },
        { label: 'Best ever', value: `${best} WPM` },
        { label: 'Day streak', value: `🔥 ${streak}` },
    ];

    let x = 340, y = 100;
    stats.forEach((s, i) => {
        if (i === 3) { x = 490; y = 100; }
        const bx = x, by = y;
        // Card bg
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
        roundRect(ctx, bx, by, 130, 70, 10);
        ctx.fill();
        ctx.fillStyle = isDark ? '#a8b2c1' : '#7b8794';
        ctx.font = '11px Poppins, sans-serif';
        ctx.fillText(s.label.toUpperCase(), bx + 10, by + 22);
        ctx.fillStyle = isDark ? '#e6edf3' : '#1f2933';
        ctx.font = 'bold 20px Poppins, sans-serif';
        ctx.fillText(s.value, bx + 10, by + 52);
        y += 82;
    });

    // Footer
    ctx.fillStyle = isDark ? '#a8b2c1' : '#7b8794';
    ctx.font = '13px Poppins, sans-serif';
    ctx.fillText('typeflow.app', 40, 340);

    // Show download UI
    showShareCardUI(canvas);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function showShareCardUI(canvas) {
    // Remove any existing share overlay
    document.getElementById('share-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'share-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:4000;
        background:rgba(0,0,0,0.65);backdrop-filter:blur(10px);
        display:flex;align-items:center;justify-content:center;padding:20px;
        animation: fadeIn 0.2s ease;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
        background:var(--surface-elev);border-radius:20px;padding:28px;
        max-width:700px;width:100%;box-shadow:0 40px 100px rgba(0,0,0,0.3);
        animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        display:flex;flex-direction:column;gap:16px;
    `;

    canvas.style.cssText = 'width:100%;border-radius:12px;display:block;';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn primary';
    downloadBtn.innerHTML = '⬇ Save Image';
    downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = `typeflow-result-${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn ghost';
    copyBtn.innerHTML = '📋 Copy Image';
    copyBtn.addEventListener('click', async () => {
        try {
            canvas.toBlob(async (blob) => {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                showToast('✅ Image copied to clipboard!', 'success', 2500);
            });
        } catch { showToast('Copy not supported — use Save Image', 'warning'); }
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn ghost';
    closeBtn.innerHTML = '✕ Close';
    closeBtn.addEventListener('click', () => overlay.remove());

    actions.append(downloadBtn, copyBtn, closeBtn);
    card.append(canvas, actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function exportCSV() {
    let history = {};
    try { history = JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}'); } catch {}
    const rows = Object.entries(history)
        .map(([idx, e]) => ({ idx: parseInt(idx), ...e }))
        .sort((a, b) => a.idx - b.idx);

    if (rows.length === 0) { showToast('No test history to export yet', 'warning'); return; }

    const header = 'Test #,Date,WPM,Accuracy\n';
    const csv = header + rows.map(r => `${r.idx},"${r.date || ''}",${r.wpm || 0},${r.accuracy || 0}`).join('\n');
    downloadFile(csv, 'typeflow-history.csv', 'text/csv');
    showToast(`✅ Exported ${rows.length} tests`, 'success', 2500);
}

function exportJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        progress:   progressManager?.data || {},
        history:    JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}'),
        keyStats:   JSON.parse(safeLocalStorage.getItem('typeflow-key-stats')   || '{}'),
    };
    downloadFile(JSON.stringify(data, null, 2), 'typeflow-data.json', 'application/json');
    showToast('✅ Full data exported as JSON', 'success', 2500);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}


// ============================================================
// 4. MOBILE UX IMPROVEMENTS
// ============================================================
function injectMobileImprovements() {
    // Add viewport meta fix if missing
    if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
        document.head.appendChild(meta);
    }

    // Floating "tap to type" banner on mobile when test is active and input unfocused
    const isMobile = () => window.innerWidth <= 768 || ('ontouchstart' in window);

    if (!isMobile()) return;

    // Add a sticky "Tap here to type" banner at the bottom for mobile
    const tapBanner = document.createElement('div');
    tapBanner.id = 'mobile-tap-banner';
    tapBanner.innerHTML = '⌨️ Tap to type';
    tapBanner.style.cssText = `
        display: none;
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: var(--accent); color: #fff;
        padding: 12px 28px; border-radius: 999px;
        font-weight: 600; font-size: 0.95rem;
        box-shadow: 0 8px 24px rgba(224,122,95,0.4);
        z-index: 500; cursor: pointer;
        animation: tapBannerPulse 2s ease infinite;
        white-space: nowrap;
    `;
    document.body.appendChild(tapBanner);

    // CSS for pulse
    const style = document.createElement('style');
    style.textContent = `
        @keyframes tapBannerPulse {
            0%, 100% { box-shadow: 0 8px 24px rgba(224,122,95,0.4); transform: translateX(-50%) scale(1); }
            50%       { box-shadow: 0 12px 32px rgba(224,122,95,0.6); transform: translateX(-50%) scale(1.04); }
        }
        /* Bigger touch targets on mobile */
        @media (max-width: 768px) {
            .timer-btn, .word-count-btn, .segmented-btn {
                min-height: 44px !important;
                min-width: 44px !important;
            }
            .mode-tab { min-height: 52px !important; }
            .toggle   { min-height: 44px !important; padding: 10px 16px !important; }
            .btn      { min-height: 48px !important; }

            /* Prevent zoom on input focus (iOS) */
            #typing-input, #lesson-input, #practice-input, #custom-typing-input {
                font-size: 16px !important;
            }

            /* Better text card tap area */
            .text-card { cursor: pointer; -webkit-tap-highlight-color: transparent; }

            /* Larger stat cards */
            .stat-card { padding: 14px 12px !important; }
            .stat-value { font-size: 1.8rem !important; }
            .stat-label { font-size: 0.75rem !important; }
        }
    `;
    document.head.appendChild(style);

    tapBanner.addEventListener('click', () => {
        const activeInput = document.querySelector('#test-mode.active #typing-input') ||
                            document.querySelector('#custom-mode.active #custom-typing-input') ||
                            document.querySelector('#practice-mode.active #practice-input');
        if (activeInput) { activeInput.focus(); tapBanner.style.display = 'none'; }
    });

    // Show/hide banner based on focus state
    document.addEventListener('focusin',  () => { tapBanner.style.display = 'none'; });
    document.addEventListener('focusout', (e) => {
        const testActive = document.getElementById('test-mode')?.classList.contains('active');
        if (testActive && e.target?.id === 'typing-input') {
            setTimeout(() => {
                if (document.activeElement !== document.getElementById('typing-input')) {
                    tapBanner.style.display = 'block';
                }
            }, 300);
        }
    });

    // Prevent iOS double-tap zoom on buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    });

    // Dismiss soft keyboard on Esc on mobile
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobile()) {
            document.activeElement?.blur();
        }
    });
}


// ============================================================
// INIT — run all injections after DOM is ready
// ============================================================
function initNewFeatures() {
    injectLanguageSwitcher();
    injectCustomTextMode();
    injectExportButtons();
    injectMobileImprovements();

    // Also patch the helpmodal shortcut list to include new shortcuts
    const helpList = document.querySelector('#help-modal ul');
    if (helpList && !helpList.querySelector('[data-new]')) {
        const newItems = [
            ['Ctrl + Shift + T', 'Switch to Custom Text mode'],
            ['Language switcher', 'Below the nav tabs — switch word language'],
        ];
        newItems.forEach(([key, desc]) => {
            const li = document.createElement('li');
            li.setAttribute('data-new', '1');
            li.innerHTML = `<b>${key}</b>: ${desc}`;
            helpList.appendChild(li);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewFeatures);
} else {
    // DOM already ready (script loaded after DOMContentLoaded)
    setTimeout(initNewFeatures, 0);
}