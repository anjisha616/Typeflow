/* =========================================
   TYPEFLOW - TYPING LEARNING PLATFORM
   Modular JavaScript Architecture
   ========================================= */

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

// ============ DATA STRUCTURES ============

const LESSON_DATA = [
    {
        id: 1,
        title: "Home Row Fundamentals",
        description: "Master the foundation - ASDF JKL;",
        focusKeys: "asdf jkl;",
        unlocked: true,
        minAccuracy: 90,
        minWPM: 15,
        xpReward: 100
    },
    {
        id: 2,
        title: "Top Row Basics",
        description: "Expand upward - QWERT YUIOP",
        focusKeys: "qwert yuiop",
        unlocked: false,
        minAccuracy: 90,
        minWPM: 18,
        xpReward: 150
    },
    {
        id: 3,
        title: "Bottom Row Training",
        description: "Complete the alphabet - ZXCVBNM",
        focusKeys: "zxcvbnm",
        unlocked: false,
        minAccuracy: 90,
        minWPM: 20,
        xpReward: 150
    },
    {
        id: 4,
        title: "Full Alphabet",
        description: "Combine all letters with confidence",
        focusKeys: "all letters",
        unlocked: false,
        minAccuracy: 92,
        minWPM: 25,
        xpReward: 200
    },
    {
        id: 5,
        title: "Numbers Integration",
        description: "Add numeric proficiency",
        focusKeys: "0-9",
        unlocked: false,
        minAccuracy: 90,
        minWPM: 25,
        xpReward: 200
    },
    {
        id: 6,
        title: "Symbols Mastery",
        description: "Complete typing - symbols & punctuation",
        focusKeys: "! @ # $ % & * + - ?",
        unlocked: false,
        minAccuracy: 88,
        minWPM: 30,
        xpReward: 250
    }
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
                bestWPM: 0,
                averageAccuracy: 0,
                totalPracticeTime: 0,
                completedLessons: [],
                weakKeys: {},
                streakDays: 0,
                lastPracticeDate: null,
                testsTaken: 0,
                totalTests: 0,
                xp: 0,
                level: 1
            };
        }
    }

    save() {
        localStorage.setItem('typeflow-progress', JSON.stringify(this.data));
    }

    updateTestStats(wpm, accuracy, duration, mistakes) {
        if (wpm > this.data.bestWPM) this.data.bestWPM = wpm;

        const totalTests = this.data.totalTests || 0;
        const currentAvg = this.data.averageAccuracy || 0;
        this.data.averageAccuracy = Math.round(
            (currentAvg * totalTests + accuracy) / (totalTests + 1)
        );

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
            this.data.streakDays = lastDate === yesterday.toDateString()
                ? this.data.streakDays + 1
                : 1;
        }

        this.data.lastPracticeDate = today;
    }

    completeLesson(lessonId) {
        if (!this.data.completedLessons.includes(lessonId)) {
            this.data.completedLessons.push(lessonId);
        }
        const lesson = LESSON_DATA.find(l => l.id === lessonId);
        if (lesson) this.addXP(lesson.xpReward);
        this.save();
    }

    addXP(amount) {
        this.data.xp += amount;
        this.updateLevel();
        this.save();
    }

    updateLevel() {
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.data.xp >= LEVEL_THRESHOLDS[i].minXP) {
                this.data.level = LEVEL_THRESHOLDS[i].level;
                break;
            }
        }
    }

    getTopWeakKeys(count = 5) {
        return Object.entries(this.data.weakKeys)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
    }

    getCurrentLevel() {
        return LEVEL_THRESHOLDS.find(l => l.level === this.data.level) || LEVEL_THRESHOLDS[0];
    }

    getNextLevel() {
        return LEVEL_THRESHOLDS.find(l => l.level === this.data.level + 1);
    }

    getXPProgress() {
        const current = this.getCurrentLevel();
        const next    = this.getNextLevel();
        if (!next) return 100;
        return Math.min(Math.round(
            ((this.data.xp - current.minXP) / (next.minXP - current.minXP)) * 100
        ), 100);
    }

    getXPToNextLevel() {
        const next = this.getNextLevel();
        return next ? next.minXP - this.data.xp : 0;
    }
}

// ============ WORD BANKS ============

const baseWords = [
    "design","typing","focus","rhythm","steady","clarity","flow","precision","practice","balance",
    "signal","detail","craft","gentle","future","method","energy","motion","value",
    "quality","simple","quiet","progress","intent","context","pattern","tempo","memory","logic",
    "system","layout","screen","accent","measure","stable","vision","reason","result",
    "build","learn","trust","align","repeat","refine","polish","deliver"
];

const symbols = ["!","@","#","$","%","&","*","+","-","?"];

const homeRowWords   = ["as","sad","dad","lad","fad","ask","flask","sass","lass","fall","hall","salad","alaska","alas","adds","fall"];
const topRowWords    = ["we","were","where","quiet","quit","quote","rope","tire","wire","power","tower","your","pure","true","type"];
const bottomRowWords = ["can","van","ban","man","cab","nab","venom","cabin","cannot","banana","zinc","mix"];

// ============ FINGER TRAINING DATA ============

const FINGER_MAP = {
    'a':'left-pinky','q':'left-pinky','z':'left-pinky','1':'left-pinky','`':'left-pinky','~':'left-pinky','!':'left-pinky',
    's':'left-ring','w':'left-ring','x':'left-ring','2':'left-ring','@':'left-ring',
    'd':'left-middle','e':'left-middle','c':'left-middle','3':'left-middle','#':'left-middle',
    'f':'left-index','r':'left-index','v':'left-index','t':'left-index','g':'left-index','b':'left-index','4':'left-index','5':'left-index','$':'left-index','%':'left-index',
    'j':'right-index','u':'right-index','m':'right-index','y':'right-index','h':'right-index','n':'right-index','6':'right-index','7':'right-index','^':'right-index','&':'right-index',
    'k':'right-middle','i':'right-middle',',':'right-middle','8':'right-middle','*':'right-middle','<':'right-middle',
    'l':'right-ring','o':'right-ring','.':'right-ring','9':'right-ring','(':'right-ring','>':'right-ring',
    ';':'right-pinky','p':'right-pinky','/':'right-pinky','0':'right-pinky','-':'right-pinky','=':'right-pinky','[':'right-pinky',']':'right-pinky','\\':'right-pinky',"'":'right-pinky',':':'right-pinky','?':'right-pinky',')':'right-pinky','_':'right-pinky','+':'right-pinky','{':'right-pinky','}':'right-pinky','|':'right-pinky','"':'right-pinky',
    ' ':'thumb'
};

const FINGER_NAMES = {
    'left-pinky':'Left Pinky','left-ring':'Left Ring','left-middle':'Left Middle','left-index':'Left Index',
    'right-index':'Right Index','right-middle':'Right Middle','right-ring':'Right Ring','right-pinky':'Right Pinky','thumb':'Thumb'
};

const FINGER_EMOJIS = {
    'left-pinky':'🤙','left-ring':'💍','left-middle':'🖕','left-index':'☝️',
    'right-index':'☝️','right-middle':'🖕','right-ring':'💍','right-pinky':'🤙','thumb':'👍'
};

const PRACTICE_KEYS = Object.keys(FINGER_MAP).filter(k => k.length === 1 && k !== ' ');

// ============ TEST ENGINE ============

class TestEngine {
    constructor() {
        this.currentText   = "";
        this.currentPosition = 0;
        this.correctChars  = 0;
        this.incorrectChars = 0;
        this.isActive      = false;
        this.startTime     = null;
        this.timerInterval = null;
        this.timeLimit     = 15;
        this.timeLeft      = 15;
        this.mistakesByChar = {};
        this.waitingForFirstInput = false;

        this.textDisplay   = document.getElementById("text-display");
        this.input         = document.getElementById("typing-input");
        this.wpmDisplay    = document.getElementById("wpm");
        this.accuracyDisplay = document.getElementById("accuracy");
        this.timerDisplay  = document.getElementById("timer");

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener("input",  (e) => this.handleTyping(e));
        this.input.addEventListener("keydown",(e) => this.handleKeydown(e));
        this.input.addEventListener("paste",  (e) => e.preventDefault());
        this.textDisplay.addEventListener("click", () => this.input.focus());
    }

    getLockIndex() {
        const lastSpace = this.input.value.lastIndexOf(" ");
        return lastSpace + 1;
    }

    generateText() {
        const includeCaps    = document.getElementById("toggle-caps").checked;
        const includeNumbers = document.getElementById("toggle-numbers").checked;
        const includeSymbols = document.getElementById("toggle-symbols").checked;
        const wordCount = this.getWordCountForTime(this.timeLimit);
        const words = [];

        for (let i = 0; i < wordCount; i++) {
            let word = baseWords[Math.floor(Math.random() * baseWords.length)];
            if (includeCaps    && Math.random() < 0.18) word = this.capitalize(word);
            if (includeNumbers && Math.random() < 0.14) word += this.randomBetween(0, 99);
            if (includeSymbols && Math.random() < 0.1)  word += symbols[Math.floor(Math.random() * symbols.length)];
            words.push(word);
        }
        return `${words.join(" ")}.`;
    }

    getWordCountForTime(seconds) {
        const base = Math.max(Math.round((seconds / 60) * 45), 12);
        return this.randomBetween(base + 6, base + 14);
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    capitalize(word) {
        return word.length ? word[0].toUpperCase() + word.slice(1) : word;
    }

    loadNewText() {
        this.currentText     = this.generateText();
        this.currentPosition = 0;
        this.displayText();
    }

    displayText() {
        const typedText  = this.input.value;
        const hideUntil  = this.getHideUntilIndex(typedText);
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
        this.isActive      = true;
        this.currentPosition = 0;
        this.correctChars  = 0;
        this.incorrectChars = 0;
        this.mistakesByChar = {};
        this.startTime     = null;
        this.timeLeft      = this.timeLimit;

        if (!preserveInput) this.input.value = "";
        this.input.disabled = false;
        this.input.focus();

        if (preserveInput) {
            this.recalculateFromInput();
            this.updateStats();
        } else {
            this.updateStats(true);
        }

        clearInterval(this.timerInterval);
        this.displayText();
        this.updateTimerDisplay();
        this.waitingForFirstInput = true;
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) this.end();
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = Math.max(this.timeLeft, 0);
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

        const typedText  = this.input.value;
        const lockIndex  = this.getLockIndex();

        if (this.input.selectionStart < lockIndex) {
            this.input.setSelectionRange(lockIndex, lockIndex);
        }
        if (typedText.length < lockIndex) {
            this.input.value = typedText.slice(0, lockIndex);
            this.input.setSelectionRange(lockIndex, lockIndex);
        }

        this.currentPosition = this.input.value.length;

        if (this.currentPosition >= this.currentText.length) {
            this.end();
            return;
        }

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
            setTimeout(() => {
                if (this.input.selectionStart < lockIndex) {
                    this.input.setSelectionRange(lockIndex, lockIndex);
                }
            }, 0);
        }
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.currentPosition = typedText.length;
        this.correctChars    = 0;
        this.incorrectChars  = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) {
                this.correctChars++;
            } else {
                this.incorrectChars++;
                const expected = this.currentText[i];
                this.mistakesByChar[expected] = (this.mistakesByChar[expected] || 0) + 1;
            }
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent      = "0";
            this.accuracyDisplay.textContent = "100%";
            return;
        }
        const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
        this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;

        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent =
            `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
    }

    end() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.input.disabled = true;
        this.updateStats();

        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = this.timeLimit - this.timeLeft;

        progressManager.updateTestStats(wpm, accuracy, duration, this.mistakesByChar);
        const xpGained = this.calculateXP(wpm, accuracy);
        progressManager.addXP(xpGained);

        this.showResults(wpm, accuracy, xpGained);
    }

    calculateXP(wpm, accuracy) {
        let xp = Math.floor(wpm * 2);
        if (accuracy >= 95) xp += 50;
        else if (accuracy >= 90) xp += 30;
        else if (accuracy >= 85) xp += 15;
        return xp;
    }

    showResults(wpm, accuracy, xpGained) {
        const modal = document.getElementById("results");
        modal.classList.remove("hidden");

        document.getElementById("result-wpm").textContent       = `${wpm} WPM`;
        document.getElementById("result-accuracy").textContent  = `${accuracy}%`;
        document.getElementById("result-correct").textContent   = this.correctChars;
        document.getElementById("result-incorrect").textContent = this.incorrectChars;
        document.getElementById("xp-amount").textContent        = xpGained;

        const badge = document.getElementById("rating-badge");
        if (accuracy >= 95 && wpm >= 40) {
            badge.textContent = "Excellent"; badge.className = "rating-badge excellent";
        } else if (accuracy >= 85 && wpm >= 30) {
            badge.textContent = "Good";      badge.className = "rating-badge good";
        } else {
            badge.textContent = "Needs Work"; badge.className = "rating-badge needs-work";
        }
    }

    reset(newText = false) {
        this.isActive = false;
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
        // FIX: store bound handler so we can remove it between lessons
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
            case 5:
                words = this.pick(baseWords, 25).map(w =>
                    Math.random() < 0.4 ? w + this.rand(0, 99) : w);
                break;
            case 6:
                words = this.pick(baseWords, 25).map(w =>
                    Math.random() < 0.3 ? w + symbols[Math.floor(Math.random() * symbols.length)] : w);
                break;
        }
        return words.join(" ") + ".";
    }

    pick(arr, n) {
        return Array.from({ length: n }, () => arr[Math.floor(Math.random() * arr.length)]);
    }

    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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

        // FIX: Remove old listener before adding new one to prevent stacking
        if (this._boundHandler) {
            this.input.removeEventListener("input", this._boundHandler);
        }
        this._boundHandler = () => this.handleTyping();
        this.input.addEventListener("input", this._boundHandler);
    }

    displayText() {
        const typedText = this.input.value;
        const html = this.currentText.split("").map((char, i) => {
            let cls = "char";
            if (i < this.currentPosition)      cls += typedText[i] === char ? " correct" : " incorrect";
            else if (i === this.currentPosition) cls += " current";
            return `<span class="${cls}">${char === " " ? " " : char}</span>`;
        }).join("");
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) {
            this.isActive  = true;
            this.startTime = Date.now();
        }

        this.currentPosition = this.input.value.length;

        // Save progress for progress bar
        if (this.currentLesson && !progressManager.data.completedLessons.includes(this.currentLesson.id)) {
            const percent = Math.round((this.currentPosition / this.currentText.length) * 100);
            localStorage.setItem(`lesson-progress-${this.currentLesson.id}`, percent);
        }

        if (this.currentPosition >= this.currentText.length) {
            this.completeLesson();
            return;
        }

        this.recalculateFromInput();
        this.updateStats();
        this.displayText();
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.correctChars   = 0;
        this.incorrectChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) this.correctChars++;
            else this.incorrectChars++;
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent      = "0";
            this.accuracyDisplay.textContent = "100%";
            this.progressDisplay.textContent = "0%";
            return;
        }
        if (this.startTime) {
            const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1/60);
            this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;
        }
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent =
            `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
        this.progressDisplay.textContent =
            `${Math.round((this.currentPosition / this.currentText.length) * 100)}%`;
    }

    completeLesson() {
        this.isActive       = false;
        this.input.disabled = true;

        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        // Clear progress bar on completion
        if (this.currentLesson) {
            localStorage.removeItem(`lesson-progress-${this.currentLesson.id}`);
        }

        if (accuracy >= this.currentLesson.minAccuracy && wpm >= this.currentLesson.minWPM) {
            progressManager.completeLesson(this.currentLesson.id);
            this.showLessonComplete(wpm, accuracy, duration, this.currentLesson.xpReward);

            // Unlock next lesson
            if (this.currentLesson.id < LESSON_DATA.length) {
                LESSON_DATA[this.currentLesson.id].unlocked = true;
            }
            renderLessons();
        } else {
            // FIX: toast instead of alert
            showToast(
                `Need ${this.currentLesson.minAccuracy}% accuracy & ${this.currentLesson.minWPM} WPM. Keep going!`,
                'warning',
                4000
            );
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
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;
        this.input.value     = "";
        this.input.disabled  = false;
        this.currentText     = this.generateLessonText(this.currentLesson);
        this.displayText();
        this.updateStats(true);
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
        const weakKeys = progressManager.getTopWeakKeys(5);
        if (weakKeys.length === 0) {
            return "Practice makes perfect. Keep typing to improve your skills.";
        }
        const targetChars = weakKeys.map(([c]) => c);
        const words = [];
        for (let i = 0; i < 40; i++) {
            words.push(Math.random() < 0.7
                ? this.findWordWithChars(targetChars)
                : baseWords[Math.floor(Math.random() * baseWords.length)]
            );
        }
        return words.join(" ") + ".";
    }

    findWordWithChars(targetChars) {
        const candidates = baseWords.filter(w => targetChars.some(c => w.includes(c)));
        return candidates.length > 0
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : baseWords[Math.floor(Math.random() * baseWords.length)];
    }

    start() {
        this.currentText     = this.generatePracticeText();
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.isActive        = false;
        this.startTime       = null;

        this.input.value    = "";
        this.input.disabled = false;
        this.input.focus();
        this.displayText();
        this.updateStats(true);

        // FIX: remove old listener before adding new
        if (this._boundHandler) {
            this.input.removeEventListener("input", this._boundHandler);
        }
        this._boundHandler = () => this.handleTyping();
        this.input.addEventListener("input", this._boundHandler);
    }

    displayText() {
        const typedText = this.input.value;
        const html = this.currentText.split("").map((char, i) => {
            let cls = "char";
            if (i < this.currentPosition)       cls += typedText[i] === char ? " correct" : " incorrect";
            else if (i === this.currentPosition) cls += " current";
            return `<span class="${cls}">${char === " " ? " " : char}</span>`;
        }).join("");
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) {
            this.isActive  = true;
            this.startTime = Date.now();
        }
        this.currentPosition = this.input.value.length;
        if (this.currentPosition >= this.currentText.length) {
            this.complete();
            return;
        }
        this.recalculateFromInput();
        this.updateStats();
        this.displayText();
    }

    recalculateFromInput() {
        const typedText = this.input.value;
        this.correctChars   = 0;
        this.incorrectChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) this.correctChars++;
            else this.incorrectChars++;
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent      = "0";
            this.accuracyDisplay.textContent = "100%";
            this.errorsDisplay.textContent   = "0";
            return;
        }
        if (this.startTime) {
            const elapsed = Math.max((Date.now() - this.startTime) / 60000, 1/60);
            this.wpmDisplay.textContent = Math.round((this.correctChars / 5) / elapsed) || 0;
        }
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent =
            `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
        this.errorsDisplay.textContent = this.incorrectChars;
    }

    complete() {
        this.isActive       = false;
        this.input.disabled = true;
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        // FIX: toast instead of alert, with contextual message
        if (accuracy >= 90) {
            showToast("Great job! Starting next round...", 'success', 2000);
        } else {
            showToast("Practice complete! Focus on accuracy. Starting again...", '', 2500);
        }
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
            key.addEventListener('click', () => this.showKeyInfo(key.dataset.key));
        });

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('finger-training-mode').hasAttribute('hidden')) return;
            this.handleKeyPress(e);
        });
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
            if (key.dataset.key === keyChar) {
                key.classList.add('highlight');
                setTimeout(() => key.classList.remove('highlight'), 500);
            }
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Tab' || e.key === 'Enter') e.preventDefault();
        const pressedKey = e.key.toLowerCase();

        if (FINGER_MAP[pressedKey] && !this.drillActive) {
            this.showKeyInfo(pressedKey);
        }

        if (this.drillActive && this.currentKey) {
            if (pressedKey === this.currentKey) {
                this.correctCount++;
                this.updateStats();
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
        document.getElementById('finger-instruction').textContent =
            'Press the highlighted key with the correct finger!';
    }

    nextRandomKey() {
        this.showKeyInfo(PRACTICE_KEYS[Math.floor(Math.random() * PRACTICE_KEYS.length)]);
    }

    updateStats() {
        this.fingerCorrect.textContent = this.correctCount;
        this.fingerWrong.textContent   = this.wrongCount;
        const total = this.correctCount + this.wrongCount;
        this.fingerAccuracy.textContent =
            `${total > 0 ? Math.round((this.correctCount / total) * 100) : 100}%`;
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
        document.getElementById('finger-instruction').textContent =
            'Press any key to see which finger to use!';
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
            // Tooltip with required score for next lesson
            let prevLesson = LESSON_DATA[idx - 1];
            let tooltip = prevLesson
                ? `Unlock by completing previous lesson with ≥${prevLesson.minAccuracy}% accuracy & ≥${prevLesson.minWPM} WPM`
                : "Complete previous lesson to unlock";
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
            // Progress indicator for unlocked lessons
            let progress = 0;
            if (!isCompleted) {
                // Estimate progress by last attempt (if available)
                const progressKey = `lesson-progress-${lesson.id}`;
                const lastProgress = localStorage.getItem(progressKey);
                progress = lastProgress ? parseInt(lastProgress) : 0;
            } else {
                progress = 100;
            }
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

    if (weakKeys.length === 0) {
        container.innerHTML = '<p class="empty-state">Complete some typing tests to identify weak keys</p>';
        return;
    }
    container.innerHTML = "";
    weakKeys.forEach(([char, count]) => {
        const item = document.createElement("div");
        item.className = "weak-key-item";
        item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${count} errors</span>`;
        container.appendChild(item);
    });
}

function renderDashboard() {
    const data = progressManager.data;

    const currentLevel = progressManager.getCurrentLevel();
    document.getElementById("level-badge").textContent     = currentLevel.name;
    document.getElementById("xp-value").textContent        = `${data.xp} XP`;
    document.getElementById("xp-progress").style.width     = `${progressManager.getXPProgress()}%`;
    const xpToNext = progressManager.getXPToNextLevel();
    document.getElementById("xp-next").textContent =
        xpToNext > 0 ? `${xpToNext} XP to next level` : "Max level reached!";

    document.getElementById("best-wpm-display").textContent = data.bestWPM;
    document.getElementById("streak-value").textContent     = data.streakDays;
    document.getElementById("avg-accuracy").textContent     = `${data.averageAccuracy}%`;
    document.getElementById("total-time").textContent       = `${Math.floor(data.totalPracticeTime / 60)}m`;
    document.getElementById("completed-lessons").textContent =
        `${data.completedLessons.length}/${LESSON_DATA.length}`;
    document.getElementById("tests-taken").textContent = data.testsTaken || 0;

    const weakKeysChart = document.getElementById("dashboard-weak-keys");
    const weakKeys      = progressManager.getTopWeakKeys(8);
    if (weakKeys.length === 0) {
        weakKeysChart.innerHTML = '<p class="empty-state">No data yet - start practicing!</p>';
    } else {
        weakKeysChart.innerHTML = "";
        weakKeys.forEach(([char, count]) => {
            const item = document.createElement("div");
            item.className = "weak-key-item";
            item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${count} errors</span>`;
            weakKeysChart.appendChild(item);
        });
    }

    // --- WPM Over Time Chart ---
    renderWPMLineChart();

    // --- Key Heatmap ---
    renderKeyHeatmap();
// --- WPM Over Time Chart ---
function renderWPMLineChart() {
    const ctx = document.getElementById('wpm-line-chart').getContext('2d');
    // Get WPM history from localStorage or dummy data
    let wpmHistory = [];
    try {
        wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]');
    } catch { wpmHistory = []; }
    if (!Array.isArray(wpmHistory) || wpmHistory.length === 0) {
        // Dummy data if none exists
        wpmHistory = Array.from({length: 14}, (_,i) => ({ date: `Day ${i+1}`, wpm: 20 + Math.round(Math.random()*30) }));
    }
    // Only keep last 14 entries
    wpmHistory = wpmHistory.slice(-14);
    // Save back dummy if needed
    localStorage.setItem('typeflow-wpm-history', JSON.stringify(wpmHistory));

    // Remove previous chart instance if exists
    if (window._wpmChart) { window._wpmChart.destroy(); }
    window._wpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: wpmHistory.map(e => e.date),
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
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                x: { display: true, grid: { display: false } },
                y: { display: true, beginAtZero: true, grid: { color: '#eee' }, ticks: { stepSize: 10 } }
            }
        }
    });
}

// --- Key Heatmap ---
function renderKeyHeatmap() {
    const grid = document.getElementById('key-heatmap-grid');
    if (!grid) return;
    // Get key stats from localStorage or dummy
    let keyStats = {};
    try {
        keyStats = JSON.parse(localStorage.getItem('typeflow-key-stats') || '{}');
    } catch { keyStats = {}; }
    // Dummy: fill with random frequencies for A-Z, 0-9, and some symbols
    const allKeys = '1234567890qwertyuiopasdfghjklzxcvbnm'.split('').concat([';',',','.','/','[',']','-','=','!','@','#','$','%','&','*','?']);
    allKeys.forEach(k => { if (!keyStats[k]) keyStats[k] = Math.floor(Math.random()*40); });
    // Save dummy if needed
    localStorage.setItem('typeflow-key-stats', JSON.stringify(keyStats));

    // Find max for color scaling
    const max = Math.max(...Object.values(keyStats));
    grid.innerHTML = '';
    // Layout: 14 columns, fill row by row
    let row = [];
    allKeys.forEach((k, i) => {
        let freq = keyStats[k] || 0;
        let cls = 'heatmap-key-cell';
        if (freq === 0) cls += '';
        else if (freq < max*0.33) cls += ' low';
        else if (freq < max*0.66) cls += ' mid';
        else cls += ' high';
        // Optionally, highlight weak keys
        if (weakKeys && weakKeys.some(([wk]) => wk === k)) cls += ' weak';
        grid.innerHTML += `<div class="${cls}">${k}<span class="heatmap-tooltip">${freq} times</span></div>`;
    });
}
}

// ============ MODE SWITCHING ============

function switchMode(mode) {
    document.querySelectorAll(".mode-tab").forEach(tab => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
    });
    const activeTab = document.querySelector(`[data-mode="${mode}"]`);
    if (activeTab) { activeTab.classList.add("active"); activeTab.setAttribute("aria-selected", "true"); }

    document.querySelectorAll(".mode-section").forEach(s => { s.classList.remove("active"); s.hidden = true; });
    const activeSection = document.getElementById(`${mode}-mode`);
    if (activeSection) { activeSection.classList.add("active"); activeSection.hidden = false; }

    if (mode === "lessons")         renderLessons();
    else if (mode === "practice")   { renderWeakKeys(); practiceEngine.start(); }
    else if (mode === "dashboard")  renderDashboard();
    else if (mode === "finger-training") fingerTrainingEngine.reset();
}

// ============ THEME MANAGEMENT ============

function getInitialTheme() {
    const stored = localStorage.getItem("typeflow-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("typeflow-theme", theme);
    updateThemeToggle(theme);
}

function toggleTheme() {
    const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById("theme-toggle");
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
}

// ============ INITIALIZATION ============

let progressManager, testEngine, lessonEngine, practiceEngine, fingerTrainingEngine;

document.addEventListener("DOMContentLoaded", () => {
    progressManager      = new ProgressManager();
    testEngine           = new TestEngine();
    lessonEngine         = new LessonEngine();
    practiceEngine       = new PracticeEngine();
    fingerTrainingEngine = new FingerTrainingEngine();

    applyTheme(getInitialTheme());
    testEngine.loadNewText();
    testEngine.start(false);

    // Prevent test input focus/typing when feedback modal is open
    function isFeedbackModalOpen() {
        const modal = document.getElementById('feedback-modal');
        return modal && !modal.classList.contains('hidden');
    }

    // Auto-focus input when typing in test mode
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
            testEngine.timeLeft = time;
            testEngine.reset(false);
            testEngine.loadNewText();
            testEngine.updateTimerDisplay();
            document.querySelectorAll(".timer-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
        });
    });

    document.getElementById("start-btn").addEventListener("click", () => {
        testEngine.reset(false);
        testEngine.start(false);
    });

    document.getElementById("new-text-btn").addEventListener("click", () => {
        testEngine.reset(true);
    });

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    document.getElementById("results-restart").addEventListener("click", () => {
        document.getElementById("results").classList.add("hidden");
        testEngine.reset(false);
        testEngine.start(false);
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

    // Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.getElementById("results").classList.add("hidden");
            document.getElementById("lesson-complete-modal").classList.add("hidden");
            testEngine.reset(false);
        }
    });

    // Option toggles
    ["toggle-caps","toggle-numbers","toggle-symbols"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            if (!testEngine.isActive) testEngine.loadNewText();
        });
    });
    // Feedback system
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackSuccess = document.getElementById('feedback-success');

    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('hidden');
        });
    }

    if (closeFeedback) {
        closeFeedback.addEventListener('click', () => {
            feedbackModal.classList.add('hidden');
        });
    }

    feedbackModal?.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.classList.add('hidden');
        }
    });

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(feedbackForm);
            const feedback = {
                timestamp: new Date().toISOString(),
                liked: formData.get('liked'),
                improve: formData.get('improve'),
                bugs: formData.get('bugs'),
                email: formData.get('email'),
                userAgent: navigator.userAgent
            };

            // Store locally as backup
            const allFeedback = JSON.parse(localStorage.getItem('typeflow-feedback') || '[]');
            allFeedback.push(feedback);
            localStorage.setItem('typeflow-feedback', JSON.stringify(allFeedback));

            // Send to Google Sheets
            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbxKKwSQQsqe6o8ktYl6GvCZALpsHGB0AqWmEeYdM079o2VUha-Gpp9z0PmmeIh5oLIC/exec', {
                    method: 'POST',
                    mode: 'no-cors', // Important for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feedback)
                });
                
                console.log('Feedback sent successfully!');
            } catch (error) {
                console.error('Error sending feedback:', error);
                // Still show success to user since we have local backup
            }

            // Show success message
            feedbackForm.classList.add('hidden');
            feedbackSuccess.classList.remove('hidden');

            // Reset after 2 seconds
            setTimeout(() => {
                feedbackModal.classList.add('hidden');
                feedbackForm.classList.remove('hidden');
                feedbackSuccess.classList.add('hidden');
                feedbackForm.reset();
            }, 2000);
        });
    }
});