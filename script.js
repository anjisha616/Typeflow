// === TODAY'S GOAL WIDGET ===
const DAILY_GOAL = 3;
function updateGoalWidget() {
    const today = new Date().toDateString();
    let testsToday = 0;
    let wpmHistory = [];
    try { wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]'); } catch { wpmHistory = []; }
    testsToday = wpmHistory.filter(e => e.date === today).length;
    const goalTotal = document.getElementById('goal-total');
    const goalTotal2 = document.getElementById('goal-total-2');
    const goalProgressCount = document.getElementById('goal-progress-count');
    const goalBar = document.getElementById('goal-progress-bar');
    if (goalTotal) goalTotal.textContent = DAILY_GOAL;
    if (goalTotal2) goalTotal2.textContent = DAILY_GOAL;
    if (goalProgressCount) goalProgressCount.textContent = testsToday;
    if (goalBar) goalBar.style.width = Math.min(100, (testsToday / DAILY_GOAL) * 100) + '%';
}

/* =========================================
   TYPEFLOW - TYPING LEARNING PLATFORM
   ========================================= */

// --- Caps Lock warning UI ---
// BUG FIX #1: showCapsWarning was missing a closing brace for the outer if block,
// causing a syntax error that silently broke ALL code below it.
function showCapsWarning(show) {
    let warn = document.getElementById('caps-warning');
    if (!warn) {
        const inputCard = document.querySelector('.input-card');
        warn = document.createElement('div');
        warn.id = 'caps-warning';
        warn.textContent = 'Caps Lock is ON';
        warn.className = '';
        warn.style.display = 'none';
        if (inputCard) inputCard.appendChild(warn);
    }  // <-- THIS CLOSING BRACE WAS MISSING in original code
    if (show) {
        warn.classList.add('visible');
        warn.style.display = 'block';
        warn.style.opacity = '1';
    } else {
        warn.classList.remove('visible');
        warn.style.display = 'none';
        warn.style.opacity = '1';
    }
}

// ============ TOAST UTILITY ============

function showToast(message, type = '', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast${type ? ' ' + type : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(16px)';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ============ ACHIEVEMENTS ============
const ACHIEVEMENTS = [
    { id: 'first-test',    name: 'First Test',       desc: 'Complete your first typing test.',     icon: '🎉' },
    { id: '50wpm',         name: 'Speedster',         desc: 'Achieve 50 WPM or higher in a test.', icon: '🚀' },
    { id: '100accuracy',   name: 'Perfect Accuracy',  desc: 'Score 100% accuracy in a test.',      icon: '🎯' },
    { id: '10tests',       name: 'Test Veteran',      desc: 'Complete 10 typing tests.',            icon: '🏅' },
    { id: '7day-streak',   name: 'Streak Master',     desc: 'Practice for 7 days in a row.',       icon: '🔥' },
    { id: 'all-lessons',   name: 'Lesson Legend',     desc: 'Complete all lessons.',               icon: '🌟' }
];

const LESSON_DATA = [
    { id: 1, title: "Home Row Fundamentals", description: "Master the foundation - ASDF JKL;",        focusKeys: "asdf jkl;",           unlocked: true,  minAccuracy: 90, minWPM: 15, xpReward: 100 },
    { id: 2, title: "Top Row Basics",        description: "Expand upward - QWERT YUIOP",              focusKeys: "qwert yuiop",         unlocked: false, minAccuracy: 90, minWPM: 18, xpReward: 150 },
    { id: 3, title: "Bottom Row Training",   description: "Complete the alphabet - ZXCVBNM",          focusKeys: "zxcvbnm",             unlocked: false, minAccuracy: 90, minWPM: 20, xpReward: 150 },
    { id: 4, title: "Full Alphabet",         description: "Combine all letters with confidence",      focusKeys: "all letters",         unlocked: false, minAccuracy: 92, minWPM: 25, xpReward: 200 },
    { id: 5, title: "Numbers Integration",   description: "Add numeric proficiency",                  focusKeys: "0-9",                 unlocked: false, minAccuracy: 90, minWPM: 25, xpReward: 200 },
    { id: 6, title: "Symbols Mastery",       description: "Complete typing - symbols & punctuation",  focusKeys: "! @ # $ % & * + - ?", unlocked: false, minAccuracy: 88, minWPM: 30, xpReward: 250 }
];

const LEVEL_THRESHOLDS = [
    { level: 1, name: "Beginner",  minXP: 0,    maxXP: 500 },
    { level: 2, name: "Improving", minXP: 500,  maxXP: 1200 },
    { level: 3, name: "Fluent",    minXP: 1200, maxXP: 2500 },
    { level: 4, name: "Fast",      minXP: 2500, maxXP: 5000 },
    { level: 5, name: "Elite",     minXP: 5000, maxXP: Infinity }
];

// ============ STATE MANAGEMENT ============

class ProgressManager {
    constructor() {
        this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('typeflow-progress');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = {
                bestWPM: 0, averageAccuracy: 0, totalPracticeTime: 0,
                completedLessons: [], weakKeys: {}, streakDays: 0,
                lastPracticeDate: null, testsTaken: 0, totalTests: 0,
                xp: 0, level: 1, achievements: []
            };
        }
    }

    save() { localStorage.setItem('typeflow-progress', JSON.stringify(this.data)); }

    hasAchievement(id) { return (this.data.achievements || []).includes(id); }

    unlockAchievement(id) {
        if (!this.data.achievements) this.data.achievements = [];
        if (!this.data.achievements.includes(id)) {
            this.data.achievements.push(id);
            this.save();
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (ach) showToast(`🏆 Achievement unlocked: ${ach.icon} ${ach.name}`, 'success', 4000);
        }
    }

    updateTestStats(wpm, accuracy, duration, mistakes) {
        if (wpm > this.data.bestWPM) this.data.bestWPM = wpm;
        const totalTests = this.data.totalTests || 0;
        const currentAvg = this.data.averageAccuracy || 0;
        this.data.averageAccuracy = Math.round((currentAvg * totalTests + accuracy) / (totalTests + 1));
        this.data.totalPracticeTime += duration;
        this.data.testsTaken  = (this.data.testsTaken  || 0) + 1;
        this.data.totalTests  = (this.data.totalTests  || 0) + 1;
        if (mistakes && typeof mistakes === 'object') {
            Object.keys(mistakes).forEach(key => {
                this.data.weakKeys[key] = (this.data.weakKeys[key] || 0) + mistakes[key];
            });
        }
        this.updateStreak();
        this.save();
    }

    updateStreak() {
        const today    = new Date().toDateString();
        const lastDate = this.data.lastPracticeDate;
        if (!lastDate) {
            this.data.streakDays = 1;
        } else if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.data.streakDays = lastDate === yesterday.toDateString() ? this.data.streakDays + 1 : 1;
        }
        this.data.lastPracticeDate = today;
    }

    completeLesson(lessonId) {
        if (!this.data.completedLessons.includes(lessonId)) this.data.completedLessons.push(lessonId);
        const lesson = LESSON_DATA.find(l => l.id === lessonId);
        if (lesson) this.addXP(lesson.xpReward);
        this.save();
    }

    addXP(amount) { this.data.xp += amount; this.updateLevel(); this.save(); }

    updateLevel() {
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.data.xp >= LEVEL_THRESHOLDS[i].minXP) { this.data.level = LEVEL_THRESHOLDS[i].level; break; }
        }
    }

    getTopWeakKeys(count = 5) {
        let keyStats = {};
        try { keyStats = JSON.parse(localStorage.getItem('typeflow-key-stats') || '{}'); } catch { keyStats = {}; }
        const rates = Object.entries(this.data.weakKeys)
            .filter(([c]) => c && c.trim() !== "" && c !== " ")
            .map(([c, errors]) => {
                const presses = keyStats[c] || 0;
                const rate = presses > 0 ? errors / presses : 0;
                return [c, rate, errors, presses];
            })
            .filter(([_c, _rate, _errors, presses]) => presses > 0);
        rates.sort((a, b) => b[1] - a[1] || b[2] - a[2]);
        return rates.slice(0, count);
    }

    getCurrentLevel() { return LEVEL_THRESHOLDS.find(l => l.level === this.data.level) || LEVEL_THRESHOLDS[0]; }
    getNextLevel()    { return LEVEL_THRESHOLDS.find(l => l.level === this.data.level + 1); }

    getXPProgress() {
        const current = this.getCurrentLevel();
        const next    = this.getNextLevel();
        if (!next) return 100;
        return Math.min(Math.round(((this.data.xp - current.minXP) / (next.minXP - current.minXP)) * 100), 100);
    }

    getXPToNextLevel() { const next = this.getNextLevel(); return next ? next.minXP - this.data.xp : 0; }

    resetAllProgress() {
        localStorage.removeItem('typeflow-progress');
        localStorage.removeItem('typeflow-wpm-history');
        localStorage.removeItem('typeflow-key-stats');
        LESSON_DATA.forEach((_, i) => { if (i > 0) LESSON_DATA[i].unlocked = false; });
        this.loadProgress();
    }
}

// ============ WORD BANKS ============

const baseWords = [
    "design","typing","focus","rhythm","steady","clarity","flow","precision","practice","balance",
    "signal","detail","craft","gentle","future","method","energy","motion","value","quality",
    "simple","quiet","progress","intent","context","pattern","tempo","memory","logic","system",
    "layout","screen","accent","measure","stable","vision","reason","result","build","learn",
    "trust","align","repeat","refine","polish","deliver","create","impact","growth","change",
    "thought","listen","write","speak","reach","drive","shape","guide","solve","connect"
];

const famousQuotes = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    "Life is what happens when you're busy making other plans. — John Lennon",
    "You miss 100% of the shots you don't take. — Wayne Gretzky",
    "The best way to predict the future is to invent it. — Alan Kay",
    "Do not wait to strike till the iron is hot; but make it hot by striking. — William Butler Yeats",
    "Whether you think you can or you think you can't, you're right. — Henry Ford",
    "The journey of a thousand miles begins with one step. — Lao Tzu",
    "It always seems impossible until it's done. — Nelson Mandela",
    "In the middle of difficulty lies opportunity. — Albert Einstein",
    "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
    "Be yourself; everyone else is already taken. — Oscar Wilde",
    "Two things are infinite: the universe and human stupidity. — Albert Einstein",
    "A room without books is like a body without a soul. — Marcus Tullius Cicero",
    "You only live once, but if you do it right, once is enough. — Mae West",
    "In three words I can sum up everything I've learned about life: it goes on. — Robert Frost",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. — Ralph Waldo Emerson",
    "It is better to be hated for what you are than to be loved for what you are not. — Andre Gide",
    "Good friends, good books, and a sleepy conscience: this is the ideal life. — Mark Twain",
    "Darkness cannot drive out darkness; only light can do that. — Martin Luther King Jr.",
    "We accept the love we think we deserve. — Stephen Chbosky",
    "Not all those who wander are lost. — J.R.R. Tolkien",
    "There is no greater agony than bearing an untold story inside you. — Maya Angelou",
    "Without music, life would be a mistake. — Friedrich Nietzsche",
    "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
];

const codeSnippets = [
    `for (let i = 0; i < 10; i++) {\n    console.log(i);\n}`,
    `def greet(name):\n    print(f"Hello, {name}!")`,
    `const add = (a, b) => a + b;`,
    `if (user.isLoggedIn) {\n    showDashboard();\n} else {\n    showLogin();\n}`,
    `function sum(arr) {\n    return arr.reduce((a, b) => a + b, 0);\n}`,
    `class Person {\n    constructor(name) {\n        this.name = name;\n    }\n}`,
    `let total = 0;\nfor (const num of numbers) {\n    total += num;\n}`,
    `try {\n    riskyOperation();\n} catch (e) {\n    handleError(e);\n}`,
    `public static void main(String[] args) {\n    System.out.println("Hello World");\n}`,
    `SELECT * FROM users WHERE active = 1;`,
    `const fetchData = async (url) => {\n    const res = await fetch(url);\n    return res.json();\n};`,
    `[1, 2, 3].map(x => x * 2).filter(x => x > 2);`,
    `const obj = { name: "Alice", age: 30 };\nconst { name, age } = obj;`,
    `setTimeout(() => {\n    console.log("delayed");\n}, 1000);`,
    `const nums = Array.from({ length: 5 }, (_, i) => i + 1);`,
    `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)`,
    `git commit -m "fix: resolve null pointer in auth module"`,
    `npm install --save-dev eslint prettier`,
    `const sorted = [...arr].sort((a, b) => a - b);`,
    `Object.keys(data).forEach(key => {\n    console.log(key, data[key]);\n});`
];

const symbols = ["!","@","#","$","%","&","*","+","-","?"];
const homeRowWords   = ["as","sad","dad","lad","fad","ask","flask","sass","lass","fall","hall","salad","alaska","alas","adds"];
const topRowWords    = ["we","were","where","quiet","quit","quote","rope","tire","wire","power","tower","your","pure","true","type"];
const bottomRowWords = ["can","van","ban","man","cab","nab","venom","cabin","cannot","banana","zinc","mix"];

// ============ FINGER TRAINING DATA ============

const FINGER_MAP = {
    'a':'left-pinky','q':'left-pinky','z':'left-pinky','1':'left-pinky','`':'left-pinky',
    's':'left-ring','w':'left-ring','x':'left-ring','2':'left-ring',
    'd':'left-middle','e':'left-middle','c':'left-middle','3':'left-middle',
    'f':'left-index','r':'left-index','v':'left-index','t':'left-index','g':'left-index','b':'left-index','4':'left-index','5':'left-index',
    'j':'right-index','u':'right-index','m':'right-index','y':'right-index','h':'right-index','n':'right-index','6':'right-index','7':'right-index',
    'k':'right-middle','i':'right-middle',',':'right-middle','8':'right-middle',
    'l':'right-ring','o':'right-ring','.':'right-ring','9':'right-ring',
    ';':'right-pinky','p':'right-pinky','/':'right-pinky','0':'right-pinky','-':'right-pinky','=':'right-pinky','[':'right-pinky',']':'right-pinky','\\':'right-pinky',"'":'right-pinky',
    ' ':'thumb'
};

const FINGER_NAMES  = { 'left-pinky':'Left Pinky','left-ring':'Left Ring','left-middle':'Left Middle','left-index':'Left Index','right-index':'Right Index','right-middle':'Right Middle','right-ring':'Right Ring','right-pinky':'Right Pinky','thumb':'Thumb' };
const FINGER_EMOJIS = { 'left-pinky':'🤙','left-ring':'💍','left-middle':'🖕','left-index':'☝️','right-index':'☝️','right-middle':'🖕','right-ring':'💍','right-pinky':'🤙','thumb':'👍' };
const PRACTICE_KEYS = Object.keys(FINGER_MAP).filter(k => k.length === 1 && k !== ' ');

// ============ TEST ENGINE ============

class TestEngine {
    constructor() {
        this.currentText     = "";
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;
        this.timerInterval   = null;
        this.timeLimit       = 15;
        this.timeLeft        = 15;
        this.mistakesByChar  = {};
        this.waitingForFirstInput = false;
        this.wordCountMode   = false;

        this.textDisplay     = document.getElementById("text-display");
        this.input           = document.getElementById("typing-input");
        this.wpmDisplay      = document.getElementById("wpm");
        this.accuracyDisplay = document.getElementById("accuracy");
        this.timerDisplay    = document.getElementById("timer");

        this.miniWPMGraphCanvas = document.getElementById("mini-wpm-graph");
        this.miniWPMChart = null;
        this.liveWPMHistory = [];
        this.liveWPMInterval = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener("input",  (e) => { this.handleTyping(e); });
        this.input.addEventListener("keydown", (e) => {
            this.handleKeydown(e);
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
            if (e.key === 'Tab') {
                e.preventDefault();
                this.reset(false);
                this.start(false);
            }
        });
        this.input.addEventListener("keyup", (e) => {
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("focus", (e) => {
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("blur", () => {
            showCapsWarning(false);
        });
        this.input.addEventListener("paste",  (e) => e.preventDefault());
        this.textDisplay.addEventListener("click", () => this.input.focus());
    }

    getLockIndex() {
        const lastSpace = this.input.value.lastIndexOf(" ");
        return lastSpace + 1;
    }

    getCurrentMode() {
        return document.querySelector('.mode-tab.active')?.dataset.mode || 'test';
    }

    isTimedMode() {
        const mode = this.getCurrentMode();
        return (mode === 'test') && !document.querySelector('.word-count-btn.active');
    }

    generateText() {
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        if (mode === 'quote') {
            const raw = famousQuotes[Math.floor(Math.random() * famousQuotes.length)];
            const match = raw.match(/^(.*?)(?:\s*[\u2014-]\s*|\s*-\s*)(.+)$/);
            if (match) {
                this.currentAuthor = match[2];
                return match[1];
            } else {
                this.currentAuthor = '';
                return raw;
            }
        }
        if (mode === 'code') {
            this.currentAuthor = '';
            return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
        let wordCount = this.getWordCountForTime(this.timeLimit);
        const wordCountMode = document.querySelector('.word-count-btn.active')?.dataset.count;
        if (wordCountMode) {
            wordCount = parseInt(wordCountMode, 10);
        }
        const includeCaps    = document.getElementById("toggle-caps").checked;
        const includeNumbers = document.getElementById("toggle-numbers").checked;
        const includeSymbols = document.getElementById("toggle-symbols").checked;
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            let word = baseWords[Math.floor(Math.random() * baseWords.length)];
            if (includeCaps    && Math.random() < 0.18) word = this.capitalize(word);
            if (includeNumbers && Math.random() < 0.14) word += this.randomBetween(0, 99);
            if (includeSymbols && Math.random() < 0.1)  word += symbols[Math.floor(Math.random() * symbols.length)];
            words.push(word);
        }
        this.currentAuthor = '';
        return `${words.join(" ")}.`;
    }

    getWordCountForTime(seconds) {
        const base = Math.max(Math.round((seconds / 60) * 45), 12);
        return this.randomBetween(base + 6, base + 14);
    }

    randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    capitalize(word) { return word.length ? word[0].toUpperCase() + word.slice(1) : word; }

    loadNewText() {
        this.currentText     = this.generateText();
        this.currentPosition = 0;
        this.displayText();
    }

    displayText() {
        const typedText = this.input.value;
        const hideUntil = this.getHideUntilIndex(typedText);
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        if (mode === 'quote') {
            const html = this.currentText.split("").map((char, i) => {
                let cls = "char";
                if (i < this.currentPosition) {
                    cls += typedText[i] === char ? " correct" : " incorrect";
                } else if (i === this.currentPosition) {
                    cls += " current";
                }
                if (i < hideUntil) cls += " gone";
                return `<span class="${cls}">${this.formatChar(char)}</span>`;
            }).join("");
            let authorHtml = '';
            if (this.currentAuthor) {
                authorHtml = `<div class="quote-author">— ${this.currentAuthor}</div>`;
            }
            this.textDisplay.innerHTML = `<div class="quote-main">${html}</div>${authorHtml}`;
        } else {
            const html = this.currentText.split("").map((char, i) => {
                let cls = "char";
                if (i < this.currentPosition) {
                    cls += typedText[i] === char ? " correct" : " incorrect";
                } else if (i === this.currentPosition) {
                    cls += " current";
                }
                if (i < hideUntil) cls += " gone";
                return `<span class="${cls}">${this.formatChar(char)}</span>`;
            }).join("");
            this.textDisplay.innerHTML = html;
        }
    }

    getHideUntilIndex(typedText) {
        const lastSpace = typedText.lastIndexOf(" ");
        return lastSpace === -1 ? 0 : Math.min(lastSpace + 1, this.currentPosition);
    }

    formatChar(char) {
        if (char === " ") return " ";
        const map = { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" };
        return map[char] || char;
    }

    start(preserveInput = false) {
        this.isActive        = true;
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.mistakesByChar  = {};
        this.startTime       = null;
        this.timeLeft        = this.timeLimit;

        if (!preserveInput) this.input.value = "";
        this.input.disabled = false;
        this.input.focus();

        if (preserveInput) { this.recalculateFromInput(); this.updateStats(); }
        else               { this.updateStats(true); }

        clearInterval(this.timerInterval);
        this.displayText();
        this.updateTimerDisplay();
        this.waitingForFirstInput = true;

        this.liveWPMHistory = [];
        this.updateMiniWPMChart();
        clearInterval(this.liveWPMInterval);
        this.liveWPMInterval = setInterval(() => {
            if (!this.isActive) return;
            const elapsed = Math.max((Date.now() - (this.startTime || Date.now())) / 60000, 1 / 60);
            const wpm = Math.round((this.correctChars / 5) / elapsed) || 0;
            this.liveWPMHistory.push(wpm);
            if (this.liveWPMHistory.length > 30) this.liveWPMHistory.shift();
            this.updateMiniWPMChart();
        }, 500);
    }

    startTimer() {
        if (!this.isTimedMode()) return;
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            this.updateTimerDisplay();
            if (!progressManager.hasAchievement('first-test')) progressManager.unlockAchievement('first-test');
            if ((progressManager.data.testsTaken || 0) >= 10 && !progressManager.hasAchievement('10tests')) progressManager.unlockAchievement('10tests');
            if ((progressManager.data.streakDays || 0) >= 7  && !progressManager.hasAchievement('7day-streak')) progressManager.unlockAchievement('7day-streak');
            if (this.timeLeft <= 0) this.end();
        }, 1000);
    }

    updateTimerDisplay() {
        const wordCountMode = document.querySelector('.word-count-btn.active')?.dataset.count;
        if (wordCountMode) {
            const wordsTyped = this.input.value.trim().split(/\s+/).filter(Boolean).length;
            const wordsLeft = Math.max(0, parseInt(wordCountMode, 10) - wordsTyped);
            this.timerDisplay.textContent = wordsLeft;
            const label = this.timerDisplay.parentElement.querySelector('.stat-label');
            if (label) label.textContent = 'Words';
            // Auto-end test if words left is 0 and test is active
            if (wordsLeft === 0 && this.isActive) {
                this.end();
            }
        } else {
            this.timerDisplay.textContent = this.isTimedMode() ? Math.max(this.timeLeft, 0) : '∞';
            const label = this.timerDisplay.parentElement.querySelector('.stat-label');
            if (label) label.textContent = 'Time';
        }
    }

    handleTyping() {
        if (!this.isActive) {
            if (this.input.value.length > 0) this.start(true);
            return;
        }

        if (this.waitingForFirstInput && this.input.value.length > 0) {
            this.startTime = Date.now();
            this.startTimer();
            this.waitingForFirstInput = false;
        }

        const typedText = this.input.value;
        const lockIndex = this.getLockIndex();

        if (this.input.selectionStart < lockIndex) this.input.setSelectionRange(lockIndex, lockIndex);
        if (typedText.length < lockIndex) {
            this.input.value = typedText.slice(0, lockIndex);
            this.input.setSelectionRange(lockIndex, lockIndex);
        }

        if (typedText.length > this.currentPosition) {
            const newChar = typedText[this.currentPosition];
            if (newChar && newChar.length === 1) {
                let keyStats = {};
                try { keyStats = JSON.parse(localStorage.getItem('typeflow-key-stats') || '{}'); } catch { keyStats = {}; }
                const k = newChar.toLowerCase();
                keyStats[k] = (keyStats[k] || 0) + 1;
                localStorage.setItem('typeflow-key-stats', JSON.stringify(keyStats));
            }
        }

        this.currentPosition = this.input.value.length;

        if (this.currentPosition >= this.currentText.length) { this.end(); return; }

        this.recalculateFromInput();
        this.updateStats();
        this.displayText();
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }

    handleKeydown(e) {
        const lockIndex = this.getLockIndex();
        const cursor    = this.input.selectionStart;
        if ((e.key === "Backspace" || e.key === "ArrowLeft") && cursor <= lockIndex) {
            e.preventDefault();
            this.input.setSelectionRange(lockIndex, lockIndex);
        }
        if (["ArrowUp","ArrowDown","Home","PageUp"].includes(e.key)) {
            setTimeout(() => { if (this.input.selectionStart < lockIndex) this.input.setSelectionRange(lockIndex, lockIndex); }, 0);
        }
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.currentPosition = typedText.length;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) this.correctChars++;
            else {
                this.incorrectChars++;
                const expected = this.currentText[i];
                this.mistakesByChar[expected] = (this.mistakesByChar[expected] || 0) + 1;
            }
        }
    }

    updateStats(reset = false) {
        if (reset) { this.wpmDisplay.textContent = "0"; this.accuracyDisplay.textContent = "100%"; return; }
        const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
        this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent = `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
    }

    end() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.timerInterval);
        clearInterval(this.liveWPMInterval);
        this.input.disabled = true;
        this.updateStats();

        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = this.isTimedMode() ? (this.timeLimit - this.timeLeft) : Math.floor((Date.now() - this.startTime) / 1000);

        const isNewBest = wpm > (progressManager.data.bestWPM || 0);

        progressManager.updateTestStats(wpm, accuracy, duration, this.mistakesByChar);
        const xpGained = this.calculateXP(wpm, accuracy);
        progressManager.addXP(xpGained);

        if (!progressManager.hasAchievement('first-test')) progressManager.unlockAchievement('first-test');
        if (wpm >= 50      && !progressManager.hasAchievement('50wpm'))         progressManager.unlockAchievement('50wpm');
        if (accuracy === 100 && !progressManager.hasAchievement('100accuracy')) progressManager.unlockAchievement('100accuracy');
        if ((progressManager.data.testsTaken || 0) >= 10 && !progressManager.hasAchievement('10tests')) progressManager.unlockAchievement('10tests');
        if ((progressManager.data.streakDays || 0) >= 7  && !progressManager.hasAchievement('7day-streak')) progressManager.unlockAchievement('7day-streak');

        let wpmHistory = [];
        try { wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]'); } catch { wpmHistory = []; }
        wpmHistory.push({ date: new Date().toDateString(), wpm });
        localStorage.setItem('typeflow-wpm-history', JSON.stringify(wpmHistory.slice(-30)));

        this.updateMiniWPMChart();
        this.showResults(wpm, accuracy, xpGained, isNewBest);
        updateGoalWidget();
    }

    updateMiniWPMChart() {
        if (!this.miniWPMGraphCanvas) return;
        const ctx = this.miniWPMGraphCanvas.getContext('2d');
        if (this.miniWPMChart) this.miniWPMChart.destroy();
        this.miniWPMChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.liveWPMHistory.map(() => ''),
                datasets: [{
                    label: 'Live WPM',
                    data: this.liveWPMHistory,
                    borderColor: '#e07a5f',
                    backgroundColor: 'rgba(224,122,95,0.10)',
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                    fill: true,
                }]
            },
            options: {
                responsive: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: false,
                scales: {
                    x: { display: false },
                    y: { display: true, beginAtZero: true, grid: { display: false }, ticks: { stepSize: 10, font: { size: 10 } } }
                }
            }
        });
    }

    calculateXP(wpm, accuracy) {
        let xp = Math.floor(wpm * 2);
        if (accuracy >= 95) xp += 50;
        else if (accuracy >= 90) xp += 30;
        else if (accuracy >= 85) xp += 15;
        return xp;
    }

    showResults(wpm, accuracy, xpGained, isNewBest = false) {
        const modal = document.getElementById("results");
        modal.classList.remove("hidden");

        const title = modal.querySelector('h2');
        title.textContent = isNewBest ? '🎉 New Personal Best!' : 'Test Complete';

        document.getElementById("result-wpm").textContent       = `${wpm} WPM`;
        document.getElementById("result-accuracy").textContent  = `${accuracy}%`;
        document.getElementById("result-correct").textContent   = this.correctChars;
        document.getElementById("result-incorrect").textContent = this.incorrectChars;
        document.getElementById("xp-amount").textContent        = xpGained;

        const badge = document.getElementById("rating-badge");
        if (accuracy >= 95 && wpm >= 40) { badge.textContent = "Excellent"; badge.className = "rating-badge excellent"; }
        else if (accuracy >= 85 && wpm >= 30) { badge.textContent = "Good"; badge.className = "rating-badge good"; }
        else { badge.textContent = "Needs Work"; badge.className = "rating-badge needs-work"; }

        if (isNewBest) {
            launchConfettiOverModal(modal);
        }
    }

    reset(newText = false) {
        this.isActive        = false;
        clearInterval(this.timerInterval);
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.mistakesByChar  = {};
        this.timeLeft        = this.timeLimit;
        this.input.value     = "";
        this.input.disabled  = false;
        this.updateStats(true);
        this.updateTimerDisplay();
        if (newText) this.loadNewText();
        else         this.displayText();
    }
}

// ============ CONFETTI ============
function launchConfettiOverModal(modal) {
    let confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas) confettiCanvas.remove();

    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    confettiCanvas.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:3000;';
    document.body.appendChild(confettiCanvas);
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const ctx = confettiCanvas.getContext('2d');
    const colors = ['#f4a261', '#2a9d8f', '#e76f51', '#e9c46a', '#264653', '#fff'];
    const particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * -confettiCanvas.height * 0.5,
            r: 6 + Math.random() * 8,
            d: 2 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleInc: (Math.random() * 0.07) + 0.05
        });
    }

    let frame = 0;
    function drawConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let p of particles) {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.r, p.r * 0.4, p.tilt, 0, 2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
            p.y += p.d * 3 + Math.sin(frame / 8) * 0.5;
            p.x += Math.sin(frame / 10 + p.tilt) * 2;
            p.tilt += p.tiltAngleInc;
            if (p.y > confettiCanvas.height + 20) {
                p.y = Math.random() * -40;
                p.x = Math.random() * confettiCanvas.width;
            }
        }
        frame++;
        if (frame < 90) requestAnimationFrame(drawConfetti);
        else confettiCanvas.remove();
    }
    drawConfetti();
}

// ============ LESSON ENGINE ============

class LessonEngine {
    constructor() {
        this.currentLesson   = null;
        this.currentText     = "";
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;
        this._boundHandler   = null;

        this.textDisplay     = document.getElementById("lesson-text-display");
        this.input           = document.getElementById("lesson-input");
        this.wpmDisplay      = document.getElementById("lesson-wpm");
        this.accuracyDisplay = document.getElementById("lesson-accuracy");
        this.progressDisplay = document.getElementById("lesson-progress");
    }

    generateLessonText(lesson) {
        let words = [];
        switch (lesson.id) {
            case 1: words = this.pick(homeRowWords,   30); break;
            case 2: words = this.pick(topRowWords,    30); break;
            case 3: words = this.pick(bottomRowWords, 30); break;
            case 4: words = this.pick(baseWords,      40); break;
            case 5: words = this.pick(baseWords, 25).map(w => Math.random() < 0.4 ? w + this.rand(0, 99) : w); break;
            case 6: words = this.pick(baseWords, 25).map(w => Math.random() < 0.3 ? w + symbols[Math.floor(Math.random() * symbols.length)] : w); break;
        }
        return words.join(" ") + ".";
    }

    pick(arr, n) { return Array.from({ length: n }, () => arr[Math.floor(Math.random() * arr.length)]); }
    rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    startLesson(lesson) {
        this.currentLesson   = lesson;
        this.currentText     = this.generateLessonText(lesson);
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;

        this.input.value    = "";
        this.input.disabled = false;
        this.input.focus();

        document.getElementById("lesson-title").textContent = lesson.title;
        document.getElementById("lesson-description").textContent = lesson.description;
        document.getElementById("focus-keys").querySelector("span").textContent = lesson.focusKeys;

        this.displayText();
        this.updateStats(true);

        if (this._boundHandler) this.input.removeEventListener("input", this._boundHandler);
        this._boundHandler = () => this.handleTyping();
        this.input.addEventListener("input", this._boundHandler);
    }

    displayText() {
        const typedText = this.input.value;
        let idx = 0, html = "";
        const regex = /<span class='weak-highlight'>(.*?)<\/span>|./g;
        let match;
        while ((match = regex.exec(this.currentText)) !== null) {
            let char, isWeak = false;
            if (match[1]) { char = match[1]; isWeak = true; } else { char = match[0]; }
            let cls = "char";
            if (isWeak) cls += " weak-highlight";
            if (idx < this.currentPosition)       cls += typedText[idx] === char ? " correct" : " incorrect";
            else if (idx === this.currentPosition) cls += " current";
            html += `<span class="${cls}">${char === " " ? " " : char}</span>`;
            idx++;
        }
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) { this.isActive = true; this.startTime = Date.now(); }
        this.currentPosition = this.input.value.length;
        if (this.currentLesson && !progressManager.data.completedLessons.includes(this.currentLesson.id)) {
            const percent = Math.round((this.currentPosition / this.currentText.length) * 100);
            localStorage.setItem(`lesson-progress-${this.currentLesson.id}`, percent);
        }
        if (this.currentPosition >= this.currentText.length) { this.completeLesson(); return; }
        this.recalculateFromInput();
        this.updateStats();
        this.displayText();
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.correctChars = 0; this.incorrectChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) this.correctChars++;
            else this.incorrectChars++;
        }
    }

    updateStats(reset = false) {
        if (reset) { this.wpmDisplay.textContent = "0"; this.accuracyDisplay.textContent = "100%"; this.progressDisplay.textContent = "0%"; return; }
        if (this.startTime) {
            const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1/60);
            this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;
        }
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent = `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
        this.progressDisplay.textContent = `${Math.round((this.currentPosition / this.currentText.length) * 100)}%`;
    }

    completeLesson() {
        this.isActive = false;
        this.input.disabled = true;
        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.currentLesson) localStorage.removeItem(`lesson-progress-${this.currentLesson.id}`);

        if (accuracy >= this.currentLesson.minAccuracy && wpm >= this.currentLesson.minWPM) {
            progressManager.completeLesson(this.currentLesson.id);
            this.showLessonComplete(wpm, accuracy, duration, this.currentLesson.xpReward);
            if (this.currentLesson.id < LESSON_DATA.length) LESSON_DATA[this.currentLesson.id].unlocked = true;
            if ((progressManager.data.completedLessons || []).length === LESSON_DATA.length) progressManager.unlockAchievement('all-lessons');
            renderLessons();
        } else {
            showToast(`Need ${this.currentLesson.minAccuracy}% accuracy & ${this.currentLesson.minWPM} WPM. Keep going!`, 'warning', 4000);
            this.reset();
        }
    }

    showLessonComplete(wpm, accuracy, duration, xp) {
        const modal = document.getElementById("lesson-complete-modal");
        modal.classList.remove("hidden");
        document.getElementById("lesson-result-wpm").textContent      = `${wpm} WPM`;
        document.getElementById("lesson-result-accuracy").textContent = `${accuracy}%`;
        document.getElementById("lesson-result-time").textContent     = `${duration}s`;
        document.getElementById("lesson-xp-amount").textContent       = xp;
    }

    reset() {
        this.currentPosition = 0; this.correctChars = 0; this.incorrectChars = 0;
        this.isActive = false; this.startTime = null;
        this.input.value = ""; this.input.disabled = false;
        this.currentText = this.generateLessonText(this.currentLesson);
        this.displayText(); this.updateStats(true);
    }
}

// ============ WEAK KEY PRACTICE ENGINE ============

class PracticeEngine {
    constructor() {
        this.currentText     = "";
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;
        this._boundHandler   = null;

        this.textDisplay     = document.getElementById("practice-text-display");
        this.input           = document.getElementById("practice-input");
        this.wpmDisplay      = document.getElementById("practice-wpm");
        this.accuracyDisplay = document.getElementById("practice-accuracy");
        this.errorsDisplay   = document.getElementById("practice-errors");
    }

    generatePracticeText() {
        const weakKeys = progressManager.getTopWeakKeys(5).filter(([c]) => c && c.trim() !== "");
        if (weakKeys.length === 0) return "Practice makes perfect. Keep typing to improve your skills.";
        const targetChars = weakKeys.map(([c]) => c);
        const words = [];
        for (let i = 0; i < 40; i++) {
            let word = Math.random() < 0.7 ? this.findWordWithChars(targetChars) : baseWords[Math.floor(Math.random() * baseWords.length)];
            let highlighted = word.split("").map(char => targetChars.includes(char) ? `<span class='weak-highlight'>${char}</span>` : char).join("");
            words.push(highlighted);
        }
        return words.join(" ") + ".";
    }

    findWordWithChars(targetChars) {
        const candidates = baseWords.filter(w => targetChars.some(c => w.includes(c)));
        return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : baseWords[Math.floor(Math.random() * baseWords.length)];
    }

    start() {
        this.currentText     = this.generatePracticeText();
        this.currentPosition = 0; this.correctChars = 0; this.incorrectChars = 0;
        this.isActive = false; this.startTime = null;
        this.input.value = ""; this.input.disabled = false;
        this.input.focus(); this.displayText(); this.updateStats(true);
        if (this._boundHandler) this.input.removeEventListener("input", this._boundHandler);
        this._boundHandler = () => this.handleTyping();
        this.input.addEventListener("input", this._boundHandler);
    }

    displayText() {
        const typedText = this.input.value;
        let idx = 0, html = "";
        const regex = /<span class='weak-highlight'>(.*?)<\/span>|./g;
        let match;
        while ((match = regex.exec(this.currentText)) !== null) {
            let char, isWeak = false;
            if (match[1]) { char = match[1]; isWeak = true; } else { char = match[0]; }
            let cls = "char";
            if (isWeak) cls += " weak-highlight";
            if (idx < this.currentPosition)       cls += typedText[idx] === char ? " correct" : " incorrect";
            else if (idx === this.currentPosition) cls += " current";
            html += `<span class="${cls}">${char === " " ? " " : char}</span>`;
            idx++;
        }
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) { this.isActive = true; this.startTime = Date.now(); }
        this.currentPosition = this.input.value.length;
        if (this.currentPosition >= this.currentText.length) { this.complete(); return; }
        this.recalculateFromInput(); this.updateStats(); this.displayText();
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.correctChars = 0; this.incorrectChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) this.correctChars++;
            else this.incorrectChars++;
        }
    }

    updateStats(reset = false) {
        if (reset) { this.wpmDisplay.textContent = "0"; this.accuracyDisplay.textContent = "100%"; this.errorsDisplay.textContent = "0"; return; }
        if (this.startTime) {
            const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1/60);
            this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;
        }
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent = `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
        this.errorsDisplay.textContent = this.incorrectChars;
    }

    complete() {
        this.isActive = false; this.input.disabled = true;
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        if (accuracy >= 90) showToast("Great job! Starting next round...", 'success', 2000);
        else showToast("Practice complete! Focus on accuracy. Starting again...", '', 2500);
        setTimeout(() => this.start(), 2600);
    }
}

// ============ FINGER TRAINING ENGINE ============

class FingerTrainingEngine {
    constructor() {
        this.currentKey   = null;
        this.drillActive  = false;
        this.correctCount = 0;
        this.wrongCount   = 0;

        this.keyboardKeys     = document.querySelectorAll('.key');
        this.targetKeyChar    = document.getElementById('target-key-char');
        this.targetFingerIcon = document.getElementById('target-finger-icon');
        this.targetFingerName = document.getElementById('target-finger-name');
        this.fingerCorrect    = document.getElementById('finger-correct');
        this.fingerWrong      = document.getElementById('finger-wrong');
        this.fingerAccuracy   = document.getElementById('finger-accuracy');
        this.fingerDrillStats = document.getElementById('finger-drill-stats');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.keyboardKeys.forEach(key => {
            key.addEventListener('click',      () => this.showKeyInfo(key.dataset.key));
            key.addEventListener('mouseenter', () => this.highlightFingerForKey(key.dataset.key));
            key.addEventListener('mouseleave', () => this.clearFingerHighlight());
        });
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('finger-training-mode').hasAttribute('hidden')) return;
            this.handleKeyPress(e);
        });
    }

    highlightFingerForKey(keyChar) {
        const finger = FINGER_MAP[keyChar.toLowerCase()];
        if (!finger) return;
        this.targetFingerIcon.classList.add('finger-highlight');
        this.targetFingerName.classList.add('finger-highlight');
        this.targetFingerIcon.textContent = FINGER_EMOJIS[finger];
        this.targetFingerName.textContent = FINGER_NAMES[finger];
    }

    clearFingerHighlight() {
        this.targetFingerIcon.classList.remove('finger-highlight');
        this.targetFingerName.classList.remove('finger-highlight');
        if (this.currentKey) {
            const finger = FINGER_MAP[this.currentKey];
            this.targetFingerIcon.textContent = FINGER_EMOJIS[finger];
            this.targetFingerName.textContent = FINGER_NAMES[finger];
        } else {
            this.targetFingerIcon.textContent = '👆';
            this.targetFingerName.textContent = 'Waiting...';
        }
    }

    showKeyInfo(keyChar) {
        const finger = FINGER_MAP[keyChar.toLowerCase()];
        if (!finger) return;
        this.currentKey = keyChar.toLowerCase();
        this.targetKeyChar.textContent    = keyChar.toUpperCase();
        this.targetFingerIcon.textContent = FINGER_EMOJIS[finger];
        this.targetFingerName.textContent = FINGER_NAMES[finger];
        this.highlightKey(keyChar.toLowerCase());
    }

    highlightKey(keyChar) {
        this.keyboardKeys.forEach(k => k.classList.remove('highlight'));
        this.keyboardKeys.forEach(key => {
            if (key.dataset.key === keyChar) key.classList.add('highlight');
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Tab' || e.key === 'Enter') e.preventDefault();
        const pressedKey = e.key.toLowerCase();
        if (FINGER_MAP[pressedKey] && !this.drillActive) this.showKeyInfo(pressedKey);
        if (this.drillActive && this.currentKey) {
            if (pressedKey === this.currentKey) {
                this.correctCount++;
                this.updateStats();
                this.keyboardKeys.forEach(k => k.classList.remove('highlight'));
                this.nextRandomKey();
            } else {
                this.wrongCount++;
                this.updateStats();
                if (FINGER_MAP[pressedKey]) this.flashWrongKey(pressedKey);
            }
        }
    }

    flashWrongKey(keyChar) {
        this.keyboardKeys.forEach(key => {
            if (key.dataset.key === keyChar) {
                key.style.background = 'rgba(220, 38, 38, 0.4)';
                setTimeout(() => { key.style.background = ''; }, 300);
            }
        });
    }

    startDrill() {
        this.drillActive  = true;
        this.correctCount = 0;
        this.wrongCount   = 0;
        this.fingerDrillStats.style.display = 'grid';
        this.updateStats();
        this.nextRandomKey();
        document.getElementById('finger-instruction').textContent = 'Press the highlighted key with the correct finger!';
    }

    nextRandomKey() { this.showKeyInfo(PRACTICE_KEYS[Math.floor(Math.random() * PRACTICE_KEYS.length)]); }

    updateStats() {
        this.fingerCorrect.textContent = this.correctCount;
        this.fingerWrong.textContent   = this.wrongCount;
        const total = this.correctCount + this.wrongCount;
        this.fingerAccuracy.textContent = `${total > 0 ? Math.round((this.correctCount / total) * 100) : 100}%`;
    }

    reset() {
        this.drillActive  = false;
        this.currentKey   = null;
        this.correctCount = 0;
        this.wrongCount   = 0;
        this.fingerDrillStats.style.display = 'none';
        this.targetKeyChar.textContent    = '-';
        this.targetFingerIcon.textContent = '👆';
        this.targetFingerName.textContent = 'Waiting...';
        document.getElementById('finger-instruction').textContent = 'Press any key to see which finger to use!';
    }
}

// ============ UI RENDERING ============

function renderLessons() {
    const grid = document.getElementById("lessons-grid");
    grid.innerHTML = "";
    LESSON_DATA.forEach((lesson, idx) => {
        const isCompleted = progressManager.data.completedLessons.includes(lesson.id);
        const isLocked    = !lesson.unlocked && !isCompleted;
        const card = document.createElement("div");
        card.className = `lesson-card ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`;

        if (isLocked) {
            let prevLesson = LESSON_DATA[idx - 1];
            let tooltip = prevLesson ? `Unlock by completing previous lesson with ≥${prevLesson.minAccuracy}% accuracy & ≥${prevLesson.minWPM} WPM` : "Complete previous lesson to unlock";
            let tooltipClass = "lesson-tooltip";
            if (lesson.id === 5) tooltipClass += " tooltip-left";
            if (lesson.id === 6) tooltipClass += " tooltip-right";
            card.innerHTML = `
                <div class="lesson-lock-icon">🔒</div>
                <div class="lesson-number">Lesson ${lesson.id}</div>
                <h3 class="lesson-card-title">${lesson.title}</h3>
                <p class="lesson-card-desc">Complete previous lesson to unlock</p>
                <div class="${tooltipClass}">${tooltip}</div>`;
            card.setAttribute("tabindex", "0");
        } else {
            let progress = 0;
            if (!isCompleted) {
                const lastProgress = localStorage.getItem(`lesson-progress-${lesson.id}`);
                progress = lastProgress ? parseInt(lastProgress) : 0;
            } else { progress = 100; }
            card.innerHTML = `
                <div class="lesson-number">Lesson ${lesson.id}</div>
                <h3 class="lesson-card-title">${lesson.title}</h3>
                <p class="lesson-card-desc">${lesson.description}</p>
                <div class="lesson-keys">Keys: ${lesson.focusKeys}</div>
                <div class="lesson-progress-bar-container">
                    <div class="lesson-progress-bar" style="width:${progress}%;"></div>
                    <span class="lesson-progress-label">${progress}%</span>
                </div>`;
            card.addEventListener("click", () => showLessonPractice(lesson));
        }
        grid.appendChild(card);
    });
}

function showLessonPractice(lesson) {
    document.getElementById("lessons-grid").parentElement.classList.add("hidden");
    document.getElementById("lesson-practice").classList.remove("hidden");
    lessonEngine.startLesson(lesson);
}

function hideLessonPractice() {
    document.getElementById("lessons-grid").parentElement.classList.remove("hidden");
    document.getElementById("lesson-practice").classList.add("hidden");
}

function renderWeakKeys() {
    const container = document.getElementById("weak-keys-list");
    const weakKeys  = progressManager.getTopWeakKeys(5);
    if (weakKeys.length === 0) { container.innerHTML = '<p class="empty-state">Complete some typing tests to identify weak keys</p>'; return; }
    container.innerHTML = "";
    weakKeys.forEach(([char, rate, errors, presses]) => {
        if (!char || char.trim() === "") return;
        const item = document.createElement("div");
        item.className = "weak-key-item";
        const percent = Math.round(rate * 100);
        item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${percent}% error rate (${errors}/${presses})</span>`;
        container.appendChild(item);
    });
}

function renderWPMLineChart() {
    const canvas = document.getElementById('wpm-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let wpmHistory = [];
    try { wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]'); } catch { wpmHistory = []; }
    if (!Array.isArray(wpmHistory)) wpmHistory = [];
    const N = 20;
    wpmHistory = wpmHistory.slice(-N);

    if (window._wpmChart) { window._wpmChart.destroy(); }
    window._wpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: wpmHistory.map((e, i) => `Test #${wpmHistory.length - N + i + 1}`),
            datasets: [{
                label: 'WPM',
                data: wpmHistory.map(e => e.wpm),
                borderColor: '#e07a5f',
                backgroundColor: 'rgba(224,122,95,0.12)',
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#e07a5f',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: {
                x: { display: true, grid: { display: false } },
                y: { display: true, beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 10 } }
            }
        }
    });
}

function renderKeyHeatmap(weakKeys) {
    const grid = document.getElementById('key-heatmap-grid');
    if (!grid) return;
    let keyStats = {};
    try { keyStats = JSON.parse(localStorage.getItem('typeflow-key-stats') || '{}'); } catch { keyStats = {}; }

    const QWERTY_ROWS = [
        ['1','2','3','4','5','6','7','8','9','0','-','='],
        ['q','w','e','r','t','y','u','i','o','p','[',']'],
        ['a','s','d','f','g','h','j','k','l',';',"'"],
        ['z','x','c','v','b','n','m',',','.','/']
    ];

    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const max = Math.max(...Object.values(keyStats), 1);
    grid.innerHTML = '';

    QWERTY_ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'heatmap-row';

        row.forEach(k => {
            const freq    = keyStats[k] || 0;
            const isWeak  = weakKeys && weakKeys.some(([wk]) => wk === k);
            const ratio   = freq / max;

            let bg, color;
            if (isWeak) {
                bg    = '#d64545';
                color = '#fff';
            } else if (freq === 0) {
                bg    = isDark ? '#1e2a3a' : '#e9edf5';
                color = isDark ? '#6b7a8d' : '#999';
            } else if (ratio < 0.33) {
                bg    = isDark ? '#3a2820' : '#f4e2d8';
                color = isDark ? '#e8a88a' : '#8b4a3a';
            } else if (ratio < 0.66) {
                bg    = isDark ? '#7a4020' : '#f4a261';
                color = '#fff';
            } else {
                bg    = isDark ? '#c05a30' : '#e07a5f';
                color = '#fff';
            }

            const cell = document.createElement('div');
            cell.className = 'heatmap-key-cell';
            cell.style.cssText = `background:${bg}; color:${color}; border-color:${isWeak ? '#ff6b6b' : 'transparent'};`;
            let weakInfo = '';
            if (isWeak && weakKeys) {
                const wk = weakKeys.find(([wk]) => wk === k);
                if (wk) {
                    const percent = Math.round(wk[1] * 100);
                    weakInfo = `\n${percent}% error rate (${wk[2]}/${wk[3]})`;
                }
            }
            cell.innerHTML = `${k}<span class="heatmap-tooltip">${freq} times${weakInfo}</span>`;
            rowEl.appendChild(cell);
        });

        grid.appendChild(rowEl);
    });
}

function renderDashboard() {
    const data = progressManager.data;
    const currentLevel = progressManager.getCurrentLevel();

    document.getElementById("level-badge").textContent     = currentLevel.name;
    document.getElementById("xp-value").textContent        = `${data.xp} XP`;
    document.getElementById("xp-progress").style.width     = `${progressManager.getXPProgress()}%`;
    const xpToNext = progressManager.getXPToNextLevel();
    document.getElementById("xp-next").textContent = xpToNext > 0 ? `${xpToNext} XP to next level` : "Max level reached!";
    document.getElementById("best-wpm-display").textContent = data.bestWPM;
    document.getElementById("streak-value").textContent     = data.streakDays;
    document.getElementById("avg-accuracy").textContent     = `${data.averageAccuracy}%`;
    document.getElementById("total-time").textContent       = `${Math.floor(data.totalPracticeTime / 60)}m`;
    document.getElementById("completed-lessons").textContent = `${data.completedLessons.length}/${LESSON_DATA.length}`;
    document.getElementById("tests-taken").textContent      = data.testsTaken || 0;

    updateGoalWidget();

    const weakKeysChart = document.getElementById("dashboard-weak-keys");
    const weakKeys      = progressManager.getTopWeakKeys(8);
    if (weakKeys.length === 0) {
        weakKeysChart.innerHTML = '<p class="empty-state">No data yet - start practicing!</p>';
    } else {
        weakKeysChart.innerHTML = "";
        weakKeys.forEach(([char, rate, errors, presses]) => {
            const item = document.createElement("div");
            item.className = "weak-key-item";
            const percent = Math.round(rate * 100);
            item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${percent}% error rate (${errors}/${presses})</span>`;
            weakKeysChart.appendChild(item);
        });
    }

    const achWrap = document.getElementById('dashboard-achievements');
    if (achWrap) {
        achWrap.innerHTML = '';
        const unlocked = (data.achievements || []);
        if (unlocked.length === 0) {
            achWrap.innerHTML = '<p class="empty-state">No achievements yet — keep typing!</p>';
        } else {
            unlocked.forEach(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (!ach) return;
                const badge = document.createElement('div');
                badge.className = 'achievement-badge';
                badge.title = ach.desc;
                badge.innerHTML = `<span class="badge-icon">${ach.icon}</span><span class="badge-name">${ach.name}</span>`;
                achWrap.appendChild(badge);
            });
        }
    }

    renderWPMLineChart();
    renderKeyHeatmap(weakKeys);
}

// ============ MODE SWITCHING ============

function switchMode(mode) {
    document.querySelectorAll(".mode-tab").forEach(tab => { tab.classList.remove("active"); tab.setAttribute("aria-selected", "false"); });
    const activeTab = document.querySelector(`[data-mode="${mode}"]`);
    if (activeTab) { activeTab.classList.add("active"); activeTab.setAttribute("aria-selected", "true"); }

    document.querySelectorAll(".mode-section").forEach(s => { s.classList.remove("active"); s.hidden = true; });
    const sectionMode = (mode === "quote" || mode === "code") ? "test" : mode;
    const activeSection = document.getElementById(`${sectionMode}-mode`);
    if (activeSection) { activeSection.classList.add("active"); activeSection.hidden = false; }

    const optionsRow     = document.querySelector('.options-row');
    const timerGroup     = document.querySelector('.timer-group');
    const wordCountGroup = document.querySelector('.word-count-group');

    if (mode === 'quote' || mode === 'code') {
        if (optionsRow)     optionsRow.style.display     = 'none';
        if (timerGroup)     timerGroup.style.display     = 'none';
        if (wordCountGroup) wordCountGroup.style.display = 'none';
    } else {
        if (optionsRow)     optionsRow.style.display     = '';
        // BUG FIX #3: Restore timer/word-count group visibility based on current segmented mode
        // instead of unconditionally showing both (which caused both to show at once)
        const currentSegment = document.querySelector('.segmented-btn.active')?.dataset.mode || 'timed';
        if (timerGroup)     timerGroup.style.display     = currentSegment === 'timed' ? '' : 'none';
        if (wordCountGroup) wordCountGroup.style.display = currentSegment === 'words' ? '' : 'none';
    }

    if      (mode === "lessons")         renderLessons();
    else if (mode === "practice")        { renderWeakKeys(); practiceEngine.start(); }
    else if (mode === "dashboard")       renderDashboard();
    else if (mode === "finger-training") fingerTrainingEngine.reset();
    else if (mode === "test" || mode === "quote" || mode === "code") testEngine.reset(true);

    localStorage.setItem('typeflow-mode', mode);
}

// ============ THEME MANAGEMENT ============

function getInitialTheme() {
    const stored = localStorage.getItem("typeflow-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) { document.body.setAttribute("data-theme", theme); localStorage.setItem("typeflow-theme", theme); updateThemeToggle(theme); }
function toggleTheme()     { applyTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark"); }

function updateThemeToggle(theme) {
    const toggle = document.getElementById("theme-toggle");
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
}

// ============ INITIALIZATION ============

// BUG FIX #2: Declare globals once here (they were declared twice in original,
// causing the first set of instantiated engines to be overwritten with fresh
// instances AFTER all event listeners were attached — completely breaking the app)
let progressManager, testEngine, lessonEngine, practiceEngine, fingerTrainingEngine;

document.addEventListener("DOMContentLoaded", () => {

    // BUG FIX #2 (continued): Only instantiate engines ONCE
    progressManager      = new ProgressManager();
    testEngine           = new TestEngine();
    lessonEngine         = new LessonEngine();
    practiceEngine       = new PracticeEngine();
    fingerTrainingEngine = new FingerTrainingEngine();

    applyTheme(getInitialTheme());
    testEngine.loadNewText();
    testEngine.start(false);

    // Segmented control (timed vs word count)
    const timerGroup     = document.getElementById('timer-group');
    const wordCountGroup = document.getElementById('word-count-group');

    function setModeSegmented(mode) {
        if (mode === 'timed') {
            timerGroup.style.display     = '';
            wordCountGroup.style.display = 'none';
            const hasActive = [...document.querySelectorAll('.timer-btn')].some(b => b.classList.contains('active'));
            if (!hasActive) document.querySelector('.timer-btn').classList.add('active');
            document.querySelectorAll('.word-count-btn').forEach(btn => btn.classList.remove('active'));
        } else {
            timerGroup.style.display     = 'none';
            wordCountGroup.style.display = '';
            const hasActive = [...document.querySelectorAll('.word-count-btn')].some(b => b.classList.contains('active'));
            if (!hasActive) document.querySelector('.word-count-btn').classList.add('active');
            document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
        }
        document.querySelectorAll('.segmented-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        testEngine.reset(true);
        testEngine.loadNewText();
    }

    document.getElementById('segmented-timed').addEventListener('click', () => setModeSegmented('timed'));
    document.getElementById('segmented-words').addEventListener('click', () => setModeSegmented('words'));
    setModeSegmented('timed');

    function isFeedbackModalOpen() {
        const modal = document.getElementById('feedback-modal');
        return modal && !modal.classList.contains('hidden');
    }

    document.addEventListener("keydown", (e) => {
        if (isFeedbackModalOpen()) return;
        const testSection = document.getElementById("test-mode");
        if (!testSection.classList.contains("active")) return;
        if (!document.getElementById("results").classList.contains("hidden")) return;
        const input = document.getElementById("typing-input");
        if (document.activeElement !== input) {
            if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") input.focus();
        }
    });

    // Mode switching
    document.querySelectorAll(".mode-tab").forEach(tab => {
        tab.addEventListener("click", e => switchMode(e.currentTarget.dataset.mode));
    });

    // Timer buttons
    document.querySelectorAll(".timer-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const time = parseInt(e.target.dataset.time, 10);
            testEngine.timeLimit = time;
            testEngine.timeLeft  = time;
            document.querySelectorAll(".timer-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".word-count-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            testEngine.reset(false);
            testEngine.loadNewText();
            testEngine.updateTimerDisplay();
        });
    });

    // Word count buttons
    document.querySelectorAll('.word-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.word-count-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            testEngine.reset(true);
            testEngine.loadNewText();
        });
    });

    document.getElementById("start-btn").addEventListener("click", () => { testEngine.reset(false); testEngine.start(false); });
    document.getElementById("new-text-btn").addEventListener("click", () => testEngine.reset(true));
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    document.getElementById("results-restart").addEventListener("click", () => {
        document.getElementById("results").classList.add("hidden");
        testEngine.reset(false); testEngine.start(false);
    });
    document.getElementById("results-new-text").addEventListener("click", () => {
        document.getElementById("results").classList.add("hidden");
        testEngine.reset(true);
    });

    document.getElementById("back-to-lessons").addEventListener("click", hideLessonPractice);
    document.getElementById("lesson-restart").addEventListener("click", () => lessonEngine.reset());

    document.getElementById("next-lesson-btn").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });
    document.getElementById("back-to-lessons-modal").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });

    document.getElementById("practice-restart").addEventListener("click", () => practiceEngine.start());
    document.getElementById("start-finger-drill").addEventListener("click", () => fingerTrainingEngine.startDrill());
    document.getElementById("random-key-practice").addEventListener("click", () => fingerTrainingEngine.nextRandomKey());

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.getElementById("results").classList.add("hidden");
            document.getElementById("lesson-complete-modal").classList.add("hidden");
            testEngine.reset(false);
        }
    });

    ["toggle-caps","toggle-numbers","toggle-symbols"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => { if (!testEngine.isActive) testEngine.loadNewText(); });
    });

    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                progressManager.resetAllProgress();
                renderDashboard();
                showToast('Progress reset successfully.', '', 3000);
            }
        });
    }

    // Feedback system
    const feedbackBtn     = document.getElementById('feedback-btn');
    const feedbackModal   = document.getElementById('feedback-modal');
    const closeFeedback   = document.getElementById('close-feedback');
    const feedbackForm    = document.getElementById('feedback-form');
    const feedbackSuccess = document.getElementById('feedback-success');

    if (feedbackBtn)   feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
    if (closeFeedback) closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
    feedbackModal?.addEventListener('click', (e) => { if (e.target === feedbackModal) feedbackModal.classList.add('hidden'); });

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(feedbackForm);
            const feedback = {
                timestamp: new Date().toISOString(),
                liked: formData.get('liked'), improve: formData.get('improve'),
                bugs: formData.get('bugs'), email: formData.get('email'),
                userAgent: navigator.userAgent
            };
            const allFeedback = JSON.parse(localStorage.getItem('typeflow-feedback') || '[]');
            allFeedback.push(feedback);
            localStorage.setItem('typeflow-feedback', JSON.stringify(allFeedback));
            feedbackForm.reset();
            feedbackSuccess.classList.remove('hidden');
            setTimeout(() => feedbackSuccess.classList.add('hidden'), 3000);
        });
    }

}); // end DOMContentLoaded
// BUG FIX #4: Removed the extra stray `}` that was in the original,
// which caused a syntax error closing the DOMContentLoaded one brace too early.