/* =========================================
   TYPEFLOW - TYPING LEARNING PLATFORM
   Modular JavaScript Architecture
   ========================================= */

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
    { level: 1, name: "Beginner", minXP: 0, maxXP: 500 },
    { level: 2, name: "Improving", minXP: 500, maxXP: 1200 },
    { level: 3, name: "Fluent", minXP: 1200, maxXP: 2500 },
    { level: 4, name: "Fast", minXP: 2500, maxXP: 5000 },
    { level: 5, name: "Elite", minXP: 5000, maxXP: Infinity }
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
        // Update best WPM
        if (wpm > this.data.bestWPM) {
            this.data.bestWPM = wpm;
        }

        // Update average accuracy
        const totalTests = this.data.totalTests || 0;
        const currentAvg = this.data.averageAccuracy || 0;
        this.data.averageAccuracy = Math.round(
            (currentAvg * totalTests + accuracy) / (totalTests + 1)
        );

        // Update practice time (duration in seconds)
        this.data.totalPracticeTime += duration;

        // Update tests taken
        this.data.testsTaken = (this.data.testsTaken || 0) + 1;
        this.data.totalTests = (this.data.totalTests || 0) + 1;

        // Update weak keys from mistakes
        if (mistakes && typeof mistakes === 'object') {
            Object.keys(mistakes).forEach(key => {
                this.data.weakKeys[key] = (this.data.weakKeys[key] || 0) + mistakes[key];
            });
        }

        // Update streak
        this.updateStreak();

        this.save();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.data.lastPracticeDate;

        if (!lastDate) {
            this.data.streakDays = 1;
        } else if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.data.streakDays += 1;
            } else {
                this.data.streakDays = 1;
            }
        }

        this.data.lastPracticeDate = today;
    }

    completeLesson(lessonId, wpm, accuracy) {
        if (!this.data.completedLessons.includes(lessonId)) {
            this.data.completedLessons.push(lessonId);
        }
        
        const lesson = LESSON_DATA.find(l => l.id === lessonId);
        if (lesson) {
            this.addXP(lesson.xpReward);
        }

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
        const sorted = Object.entries(this.data.weakKeys)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
        
        return sorted;
    }

    getCurrentLevel() {
        return LEVEL_THRESHOLDS.find(l => l.level === this.data.level) || LEVEL_THRESHOLDS[0];
    }

    getNextLevel() {
        const nextLevelNum = this.data.level + 1;
        return LEVEL_THRESHOLDS.find(l => l.level === nextLevelNum);
    }

    getXPProgress() {
        const current = this.getCurrentLevel();
        const next = this.getNextLevel();
        
        if (!next) return 100; // Max level
        
        const progress = this.data.xp - current.minXP;
        const needed = next.minXP - current.minXP;
        
        return Math.min(Math.round((progress / needed) * 100), 100);
    }

    getXPToNextLevel() {
        const next = this.getNextLevel();
        if (!next) return 0;
        
        return next.minXP - this.data.xp;
    }
}

// ============ WORD BANKS ============

const baseWords = [
    "design", "typing", "focus", "rhythm", "steady", "clarity", "flow", "precision", "practice", "balance",
    "signal", "detail", "craft", "gentle", "future", "method", "energy", "motion", "signal", "value",
    "quality", "simple", "quiet", "progress", "intent", "context", "pattern", "tempo", "memory", "logic",
    "system", "layout", "screen", "signal", "accent", "measure", "stable", "vision", "reason", "result",
    "focus", "steady", "build", "learn", "trust", "align", "repeat", "refine", "polish", "deliver"
];

const symbols = ["!", "@", "#", "$", "%", "&", "*", "+", "-", "?"];

// Lesson-specific word banks
const homeRowWords = ["as", "sad", "dad", "lad", "fad", "ask", "flask", "sass", "lass", "fall", "hall", "salad", "alaska", "Dallas"];
const topRowWords = ["we", "were", "where", "quiet", "quit", "quote", "rope", "tire", "wire", "power", "tower", "your", "pure"];
const bottomRowWords = ["can", "van", "ban", "man", "cab", "nab", "venom", "cabin", "cannot", "banana"];

// ============ FINGER TRAINING DATA ============

const FINGER_MAP = {
    // Left hand - Pinky
    'a': 'left-pinky', 'q': 'left-pinky', 'z': 'left-pinky', '1': 'left-pinky',
    '`': 'left-pinky', '~': 'left-pinky', '!': 'left-pinky',
    
    // Left hand - Ring
    's': 'left-ring', 'w': 'left-ring', 'x': 'left-ring', '2': 'left-ring',
    '@': 'left-ring',
    
    // Left hand - Middle
    'd': 'left-middle', 'e': 'left-middle', 'c': 'left-middle', '3': 'left-middle',
    '#': 'left-middle',
    
    // Left hand - Index
    'f': 'left-index', 'r': 'left-index', 'v': 'left-index', 't': 'left-index',
    'g': 'left-index', 'b': 'left-index', '4': 'left-index', '5': 'left-index',
    '$': 'left-index', '%': 'left-index',
    
    // Right hand - Index
    'j': 'right-index', 'u': 'right-index', 'm': 'right-index', 'y': 'right-index',
    'h': 'right-index', 'n': 'right-index', '6': 'right-index', '7': 'right-index',
    '^': 'right-index', '&': 'right-index',
    
    // Right hand - Middle
    'k': 'right-middle', 'i': 'right-middle', ',': 'right-middle', '8': 'right-middle',
    '*': 'right-middle', '<': 'right-middle',
    
    // Right hand - Ring
    'l': 'right-ring', 'o': 'right-ring', '.': 'right-ring', '9': 'right-ring',
    '(': 'right-ring', '>': 'right-ring',
    
    // Right hand - Pinky
    ';': 'right-pinky', 'p': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
    '-': 'right-pinky', '=': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky',
    '\\': 'right-pinky', '\'': 'right-pinky', ':': 'right-pinky', '?': 'right-pinky',
    ')': 'right-pinky', '_': 'right-pinky', '+': 'right-pinky', '{': 'right-pinky',
    '}': 'right-pinky', '|': 'right-pinky', '"': 'right-pinky',
    
    // Spacebar
    ' ': 'thumb'
};

const FINGER_NAMES = {
    'left-pinky': 'Left Pinky',
    'left-ring': 'Left Ring',
    'left-middle': 'Left Middle',
    'left-index': 'Left Index',
    'right-index': 'Right Index',
    'right-middle': 'Right Middle',
    'right-ring': 'Right Ring',
    'right-pinky': 'Right Pinky',
    'thumb': 'Thumb'
};

const FINGER_EMOJIS = {
    'left-pinky': '🤙',
    'left-ring': '💍',
    'left-middle': '🖕',
    'left-index': '☝️',
    'right-index': '☝️',
    'right-middle': '🖕',
    'right-ring': '💍',
    'right-pinky': '🤙',
    'thumb': '👍'
};

const PRACTICE_KEYS = Object.keys(FINGER_MAP).filter(k => k.length === 1 && k !== ' ');

// ============ TEST ENGINE (Original Functionality) ============

class TestEngine {
    constructor() {
        this.currentText = "";
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;
        this.timerInterval = null;
        this.timeLimit = 15;
        this.timeLeft = 15;
        this.mistakesByChar = {};
        
        this.textDisplay = document.getElementById("text-display");
        this.input = document.getElementById("typing-input");
        this.wpmDisplay = document.getElementById("wpm");
        this.accuracyDisplay = document.getElementById("accuracy");
        this.timerDisplay = document.getElementById("timer");
        
        this.setupEventListeners();
    }

    setupEventListeners() {
            this.input.addEventListener("input", (e) => this.handleTyping(e));
            this.input.addEventListener("keydown", (e) => this.handleKeydown(e));
            this.input.addEventListener("paste", e => e.preventDefault());
            this.textDisplay.addEventListener("click", () => this.input.focus());
        }

        getLockIndex() {
            // Lock all characters before the last completed word (space)
            const typedText = this.input.value;
            const lastSpace = typedText.lastIndexOf(" ");
            return lastSpace + 1;
    }

    generateText() {
        const includeCaps = document.getElementById("toggle-caps").checked;
        const includeNumbers = document.getElementById("toggle-numbers").checked;
        const includeSymbols = document.getElementById("toggle-symbols").checked;
        const wordCount = this.getWordCountForTime(this.timeLimit);
        const words = [];

        for (let i = 0; i < wordCount; i++) {
            let word = baseWords[Math.floor(Math.random() * baseWords.length)];

            if (includeCaps && Math.random() < 0.18) {
                word = this.capitalize(word);
            }

            if (includeNumbers && Math.random() < 0.14) {
                word += this.randomBetween(0, 99).toString();
            }

            if (includeSymbols && Math.random() < 0.1) {
                word += symbols[Math.floor(Math.random() * symbols.length)];
            }

            words.push(word);
        }

        return `${words.join(" ")}.`;
    }

    getWordCountForTime(seconds) {
        const baseWpm = 45;
        const baseWords = Math.max(Math.round((seconds / 60) * baseWpm), 12);
        return this.randomBetween(baseWords + 6, baseWords + 14);
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    capitalize(word) {
        if (!word.length) return word;
        return `${word[0].toUpperCase()}${word.slice(1)}`;
    }

    loadNewText() {
        this.currentText = this.generateText();
        this.currentPosition = 0;
        this.displayText();
    }

    displayText() {
        const typedText = this.input.value;
        const hideUntil = this.getHideUntilIndex(typedText, this.currentPosition);
        const html = this.currentText
            .split("")
            .map((char, index) => {
                let className = "char";
                if (index < this.currentPosition) {
                    className += typedText[index] === char ? " correct" : " incorrect";
                } else if (index === this.currentPosition) {
                    className += " current";
                }

                if (index < hideUntil) {
                    className += " gone";
                }

                return `<span class="${className}">${this.formatChar(char)}</span>`;
            })
            .join("");

        this.textDisplay.innerHTML = html;
    }

    getHideUntilIndex(typedText, position) {
        const lastSpace = typedText.lastIndexOf(" ");
        if (lastSpace === -1) return 0;
        return Math.min(lastSpace + 1, position);
    }

    formatChar(char) {
        if (char === " ") return " ";
        return this.escapeHtml(char);
    }

    escapeHtml(char) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return map[char] || char;
    }

    start(preserveInput = false) {
        this.isActive = true;
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.mistakesByChar = {};
        this.startTime = null; // Will be set on first input
        this.timeLeft = this.timeLimit;

        if (!preserveInput) {
            this.input.value = "";
        }

        this.input.disabled = false;
        this.input.focus();

        if (preserveInput) {
            this.recalculateFromInput();
            this.updateStats();
        } else {
            this.updateStats(true);
        }

        this.displayText();
        clearInterval(this.timerInterval); // Don't start timer yet
        this.updateTimerDisplay();
        this.waitingForFirstInput = true;
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.end();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = Math.max(this.timeLeft, 0);
    }

    handleTyping(e) {
        if (!this.isActive) {
            if (this.input.value.length > 0) {
                this.start(true);
            }
            return;
        }

        // Start timer and set startTime on first input after (re)start
        if (this.waitingForFirstInput && this.input.value.length > 0) {
            this.startTime = Date.now();
            this.startTimer();
            this.waitingForFirstInput = false;
        }

        // Prevent editing before the lock index
        const typedText = this.input.value;
        const lockIndex = this.getLockIndex();
        if (this.input.selectionStart < lockIndex) {
            // Move cursor to lockIndex
            this.input.setSelectionRange(lockIndex, lockIndex);
        }

        // If user deleted or changed before lockIndex, revert
        if (typedText.length < lockIndex) {
            this.input.value = typedText.slice(0, lockIndex);
            this.input.setSelectionRange(lockIndex, lockIndex);
        }

        this.currentPosition = typedText.length;

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
        // Prevent backspace and left arrow before lock index
        const lockIndex = this.getLockIndex();
        const cursor = this.input.selectionStart;
        if ((e.key === "Backspace" && cursor <= lockIndex) ||
            (e.key === "ArrowLeft" && cursor <= lockIndex)) {
            e.preventDefault();
            this.input.setSelectionRange(lockIndex, lockIndex);
        }
        // Prevent selecting text before lockIndex
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "PageUp") {
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
        this.correctChars = 0;
        this.incorrectChars = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) {
                this.correctChars += 1;
            } else {
                this.incorrectChars += 1;
                // Track mistake
                const expectedChar = this.currentText[i];
                this.mistakesByChar[expectedChar] = (this.mistakesByChar[expectedChar] || 0) + 1;
            }
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent = "0";
            this.accuracyDisplay.textContent = "100%";
            return;
        }

        const elapsedMinutes = Math.max((Date.now() - this.startTime) / 1000 / 60, 1 / 60);
        const wordsTyped = this.correctChars / 5;
        const wpm = Math.round(wordsTyped / elapsedMinutes) || 0;
        this.wpmDisplay.textContent = wpm;

        const totalChars = this.correctChars + this.incorrectChars;
        const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 100;
        this.accuracyDisplay.textContent = `${accuracy}%`;
    }

    end() {
        if (!this.isActive) return;

        this.isActive = false;
        clearInterval(this.timerInterval);
        this.input.disabled = true;
        this.updateStats();

        // Calculate final stats
        const wpm = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = this.timeLimit - this.timeLeft;

        // Update progress
        progressManager.updateTestStats(wpm, accuracy, duration, this.mistakesByChar);

        // Calculate XP
        const xpGained = this.calculateXP(wpm, accuracy);
        progressManager.addXP(xpGained);

        // Show results
        this.showResults(wpm, accuracy, xpGained);
    }

    calculateXP(wpm, accuracy) {
        // Base XP from WPM
        let xp = Math.floor(wpm * 2);
        
        // Bonus for high accuracy
        if (accuracy >= 95) xp += 50;
        else if (accuracy >= 90) xp += 30;
        else if (accuracy >= 85) xp += 15;
        
        return xp;
    }

    showResults(wpm, accuracy, xpGained) {
        const modal = document.getElementById("results");
        modal.classList.remove("hidden");

        document.getElementById("result-wpm").textContent = `${wpm} WPM`;
        document.getElementById("result-accuracy").textContent = `${accuracy}%`;
        document.getElementById("result-correct").textContent = this.correctChars;
        document.getElementById("result-incorrect").textContent = this.incorrectChars;
        document.getElementById("xp-amount").textContent = xpGained;

        // Performance rating
        const ratingBadge = document.getElementById("rating-badge");
        if (accuracy >= 95 && wpm >= 40) {
            ratingBadge.textContent = "Excellent";
            ratingBadge.className = "rating-badge excellent";
        } else if (accuracy >= 85 && wpm >= 30) {
            ratingBadge.textContent = "Good";
            ratingBadge.className = "rating-badge good";
        } else {
            ratingBadge.textContent = "Needs Work";
            ratingBadge.className = "rating-badge needs-work";
        }
    }

    reset(newText = false) {
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.mistakesByChar = {};
        this.timeLeft = this.timeLimit;

        this.input.value = "";
        this.input.disabled = false;

        this.updateStats(true);
        this.updateTimerDisplay();

        if (newText) {
            this.loadNewText();
        } else {
            this.displayText();
        }
    }
}

// ============ LESSON ENGINE ============

class LessonEngine {
    constructor() {
        this.currentLesson = null;
        this.currentText = "";
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;
        
        this.textDisplay = document.getElementById("lesson-text-display");
        this.input = document.getElementById("lesson-input");
        this.wpmDisplay = document.getElementById("lesson-wpm");
        this.accuracyDisplay = document.getElementById("lesson-accuracy");
        this.progressDisplay = document.getElementById("lesson-progress");
    }

    generateLessonText(lesson) {
        let words = [];
        
        switch(lesson.id) {
            case 1: // Home row
                words = this.selectRandomWords(homeRowWords, 30);
                break;
            case 2: // Top row
                words = this.selectRandomWords(topRowWords, 30);
                break;
            case 3: // Bottom row
                words = this.selectRandomWords(bottomRowWords, 30);
                break;
            case 4: // Full alphabet
                words = this.selectRandomWords(baseWords, 40);
                break;
            case 5: // Numbers
                words = this.selectRandomWords(baseWords, 25);
                words = words.map(w => Math.random() < 0.4 ? w + this.randomBetween(0, 99) : w);
                break;
            case 6: // Symbols
                words = this.selectRandomWords(baseWords, 25);
                words = words.map(w => Math.random() < 0.3 ? w + symbols[Math.floor(Math.random() * symbols.length)] : w);
                break;
        }
        
        return words.join(" ") + ".";
    }

    selectRandomWords(wordArray, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(wordArray[Math.floor(Math.random() * wordArray.length)]);
        }
        return result;
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    startLesson(lesson) {
        this.currentLesson = lesson;
        this.currentText = this.generateLessonText(lesson);
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;

        this.input.value = "";
        this.input.disabled = false;
        this.input.focus();

        // Update UI
        document.getElementById("lesson-title").textContent = lesson.title;
        document.getElementById("lesson-description").textContent = lesson.description;
        document.getElementById("focus-keys").querySelector("span").textContent = lesson.focusKeys;

        this.displayText();
        this.updateStats(true);
        
        // Setup input listener
        this.input.addEventListener("input", () => this.handleTyping());
    }

    displayText() {
        const typedText = this.input.value;
        const html = this.currentText
            .split("")
            .map((char, index) => {
                let className = "char";
                if (index < this.currentPosition) {
                    className += typedText[index] === char ? " correct" : " incorrect";
                } else if (index === this.currentPosition) {
                    className += " current";
                }
                return `<span class="${className}">${char === " " ? " " : char}</span>`;
            })
            .join("");

        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) {
            this.isActive = true;
            this.startTime = Date.now();
        }

        const typedText = this.input.value;
        this.currentPosition = typedText.length;

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
        this.correctChars = 0;
        this.incorrectChars = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) {
                this.correctChars += 1;
            } else {
                this.incorrectChars += 1;
            }
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent = "0";
            this.accuracyDisplay.textContent = "100%";
            this.progressDisplay.textContent = "0%";
            return;
        }

        // WPM
        if (this.startTime) {
            const elapsedMinutes = Math.max((Date.now() - this.startTime) / 1000 / 60, 1 / 60);
            const wordsTyped = this.correctChars / 5;
            const wpm = Math.round(wordsTyped / elapsedMinutes) || 0;
            this.wpmDisplay.textContent = wpm;
        }

        // Accuracy
        const totalChars = this.correctChars + this.incorrectChars;
        const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 100;
        this.accuracyDisplay.textContent = `${accuracy}%`;

        // Progress
        const progress = Math.round((this.currentPosition / this.currentText.length) * 100);
        this.progressDisplay.textContent = `${progress}%`;
    }

    completeLesson() {
        this.isActive = false;
        this.input.disabled = true;

        const wpm = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        // Check if passed
        if (accuracy >= this.currentLesson.minAccuracy && wpm >= this.currentLesson.minWPM) {
            progressManager.completeLesson(this.currentLesson.id, wpm, accuracy);
            this.showLessonComplete(wpm, accuracy, duration, this.currentLesson.xpReward);
            
            // Unlock next lesson
            if (this.currentLesson.id < LESSON_DATA.length) {
                LESSON_DATA[this.currentLesson.id].unlocked = true;
            }
            
            renderLessons();
        } else {
            alert(`Not quite there yet! You need ${this.currentLesson.minAccuracy}% accuracy and ${this.currentLesson.minWPM} WPM. Try again!`);
            this.reset();
        }
    }

    showLessonComplete(wpm, accuracy, duration, xp) {
        const modal = document.getElementById("lesson-complete-modal");
        modal.classList.remove("hidden");

        document.getElementById("lesson-result-wpm").textContent = `${wpm} WPM`;
        document.getElementById("lesson-result-accuracy").textContent = `${accuracy}%`;
        document.getElementById("lesson-result-time").textContent = `${duration}s`;
        document.getElementById("lesson-xp-amount").textContent = xp;
    }

    reset() {
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;
        this.input.value = "";
        this.input.disabled = false;
        this.currentText = this.generateLessonText(this.currentLesson);
        this.displayText();
        this.updateStats(true);
    }
}

// ============ WEAK KEY PRACTICE ENGINE ============

class PracticeEngine {
    constructor() {
        this.currentText = "";
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;
        
        this.textDisplay = document.getElementById("practice-text-display");
        this.input = document.getElementById("practice-input");
        this.wpmDisplay = document.getElementById("practice-wpm");
        this.accuracyDisplay = document.getElementById("practice-accuracy");
        this.errorsDisplay = document.getElementById("practice-errors");
    }

    generatePracticeText() {
        const weakKeys = progressManager.getTopWeakKeys(5);
        
        if (weakKeys.length === 0) {
            return "Practice makes perfect. Keep typing to improve your skills.";
        }

        // Generate text focused on weak keys
        const targetChars = weakKeys.map(([char]) => char);
        const words = [];
        
        for (let i = 0; i < 40; i++) {
            // 70% chance to use a word containing weak keys
            if (Math.random() < 0.7) {
                const word = this.findWordWithChars(targetChars);
                words.push(word);
            } else {
                words.push(baseWords[Math.floor(Math.random() * baseWords.length)]);
            }
        }
        
        return words.join(" ") + ".";
    }

    findWordWithChars(targetChars) {
        // Try to find a word containing one of the target characters
        const candidates = baseWords.filter(word => 
            targetChars.some(char => word.includes(char))
        );
        
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }
        
        return baseWords[Math.floor(Math.random() * baseWords.length)];
    }

    start() {
        this.currentText = this.generatePracticeText();
        this.currentPosition = 0;
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.isActive = false;
        this.startTime = null;

        this.input.value = "";
        this.input.disabled = false;
        this.input.focus();

        this.displayText();
        this.updateStats(true);
        
        this.input.addEventListener("input", () => this.handleTyping());
    }

    displayText() {
        const typedText = this.input.value;
        const html = this.currentText
            .split("")
            .map((char, index) => {
                let className = "char";
                if (index < this.currentPosition) {
                    className += typedText[index] === char ? " correct" : " incorrect";
                } else if (index === this.currentPosition) {
                    className += " current";
                }
                return `<span class="${className}">${char === " " ? " " : char}</span>`;
            })
            .join("");

        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) {
            this.isActive = true;
            this.startTime = Date.now();
        }

        const typedText = this.input.value;
        this.currentPosition = typedText.length;

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
        this.correctChars = 0;
        this.incorrectChars = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] === this.currentText[i]) {
                this.correctChars += 1;
            } else {
                this.incorrectChars += 1;
            }
        }
    }

    updateStats(reset = false) {
        if (reset) {
            this.wpmDisplay.textContent = "0";
            this.accuracyDisplay.textContent = "100%";
            this.errorsDisplay.textContent = "0";
            return;
        }

        if (this.startTime) {
            const elapsedMinutes = Math.max((Date.now() - this.startTime) / 1000 / 60, 1 / 60);
            const wordsTyped = this.correctChars / 5;
            const wpm = Math.round(wordsTyped / elapsedMinutes) || 0;
            this.wpmDisplay.textContent = wpm;
        }

        const totalChars = this.correctChars + this.incorrectChars;
        const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 100;
        this.accuracyDisplay.textContent = `${accuracy}%`;
        this.errorsDisplay.textContent = this.incorrectChars;
    }

    complete() {
        this.isActive = false;
        this.input.disabled = true;
        alert("Practice complete! Keep it up!");
        this.start(); // Auto restart
    }
}
// ============ FINGER TRAINING ENGINE ============

class FingerTrainingEngine {
    constructor() {
        this.currentKey = null;
        this.drillActive = false;
        this.correctCount = 0;
        this.wrongCount = 0;
        
        this.keyboardKeys = document.querySelectorAll('.key');
        this.targetKeyChar = document.getElementById('target-key-char');
        this.targetFingerIcon = document.getElementById('target-finger-icon');
        this.targetFingerName = document.getElementById('target-finger-name');
        this.fingerCorrect = document.getElementById('finger-correct');
        this.fingerWrong = document.getElementById('finger-wrong');
        this.fingerAccuracy = document.getElementById('finger-accuracy');
        this.fingerDrillStats = document.getElementById('finger-drill-stats');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard visualization - click to show finger
        this.keyboardKeys.forEach(key => {
            key.addEventListener('click', () => {
                const keyChar = key.dataset.key;
                this.showKeyInfo(keyChar);
            });
        });

        // Listen for keypresses when in finger training mode
        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('finger-training-mode');
            if (!section || !section.classList.contains('active')) return;
            
            this.handleKeyPress(e);
        });
    }

    showKeyInfo(keyChar) {
        const finger = FINGER_MAP[keyChar.toLowerCase()];
        if (!finger) return;

        this.currentKey = keyChar.toLowerCase();
        
        // Update display
        this.targetKeyChar.textContent = keyChar.toUpperCase();
        this.targetFingerIcon.textContent = FINGER_EMOJIS[finger];
        this.targetFingerName.textContent = FINGER_NAMES[finger];

        // Highlight keyboard key
        this.highlightKey(keyChar.toLowerCase());
    }

    highlightKey(keyChar) {
        // Remove previous highlights
        this.keyboardKeys.forEach(k => k.classList.remove('highlight'));
        
        // Add highlight to current key
        this.keyboardKeys.forEach(key => {
            if (key.dataset.key === keyChar) {
                key.classList.add('highlight');
                setTimeout(() => key.classList.remove('highlight'), 500);
            }
        });
    }

    handleKeyPress(e) {
        // Prevent default for special keys
        if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
        }

        // Get the pressed key
        let pressedKey = e.key.toLowerCase();
        
        // Show info for any key press
        if (FINGER_MAP[pressedKey]) {
            this.showKeyInfo(pressedKey);
        }

        // If drill is active, check if correct
        if (this.drillActive && this.currentKey) {
            if (pressedKey === this.currentKey) {
                this.correctCount++;
                this.updateStats();
                this.nextRandomKey();
            } else if (FINGER_MAP[pressedKey]) {
                // Only count as wrong if it's a valid typing key
                this.wrongCount++;
                this.updateStats();
                // Flash the keyboard to show wrong key
                this.flashWrongKey(pressedKey);
            }
        }
    }

    flashWrongKey(keyChar) {
        this.keyboardKeys.forEach(key => {
            if (key.dataset.key === keyChar) {
                key.style.background = 'rgba(220, 38, 38, 0.3)';
                setTimeout(() => {
                    key.style.background = '';
                }, 300);
            }
        });
    }

    startDrill() {
        this.drillActive = true;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.fingerDrillStats.style.display = 'grid';
        this.updateStats();
        this.nextRandomKey();
        
        document.getElementById('finger-instruction').textContent = 
            'Press the highlighted key with the correct finger!';
    }

    nextRandomKey() {
        const randomKey = PRACTICE_KEYS[Math.floor(Math.random() * PRACTICE_KEYS.length)];
        this.showKeyInfo(randomKey);
    }

    updateStats() {
        this.fingerCorrect.textContent = this.correctCount;
        this.fingerWrong.textContent = this.wrongCount;
        
        const total = this.correctCount + this.wrongCount;
        const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 100;
        this.fingerAccuracy.textContent = `${accuracy}%`;
    }

    reset() {
        this.drillActive = false;
        this.currentKey = null;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.fingerDrillStats.style.display = 'none';
        
        this.targetKeyChar.textContent = '-';
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

    LESSON_DATA.forEach(lesson => {
        const isCompleted = progressManager.data.completedLessons.includes(lesson.id);
        const isLocked = !lesson.unlocked && !isCompleted;

        const card = document.createElement("div");
        card.className = `lesson-card ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`;
        
        if (isLocked) {
            card.innerHTML = `
                <div class="lesson-lock-icon">🔒</div>
                <div class="lesson-number">Lesson ${lesson.id}</div>
                <h3 class="lesson-card-title">${lesson.title}</h3>
                <p class="lesson-card-desc">Complete previous lesson to unlock</p>
            `;
        } else {
            card.innerHTML = `
                <div class="lesson-number">Lesson ${lesson.id}</div>
                <h3 class="lesson-card-title">${lesson.title}</h3>
                <p class="lesson-card-desc">${lesson.description}</p>
                <div class="lesson-keys">Keys: ${lesson.focusKeys}</div>
            `;
            
            card.addEventListener("click", () => {
                showLessonPractice(lesson);
            });
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
    const weakKeys = progressManager.getTopWeakKeys(5);

    if (weakKeys.length === 0) {
        container.innerHTML = '<p class="empty-state">Complete some typing tests to identify weak keys</p>';
        return;
    }

    container.innerHTML = "";
    weakKeys.forEach(([char, count]) => {
        const item = document.createElement("div");
        item.className = "weak-key-item";
        item.innerHTML = `
            <span class="weak-key-char">${char}</span>
            <span class="weak-key-count">${count} errors</span>
        `;
        container.appendChild(item);
    });
}

function renderDashboard() {
    const data = progressManager.data;

    // XP and Level
    const currentLevel = progressManager.getCurrentLevel();
    document.getElementById("level-badge").textContent = currentLevel.name;
    document.getElementById("xp-value").textContent = `${data.xp} XP`;
    document.getElementById("xp-progress").style.width = `${progressManager.getXPProgress()}%`;
    
    const xpToNext = progressManager.getXPToNextLevel();
    document.getElementById("xp-next").textContent = xpToNext > 0 
        ? `${xpToNext} XP to next level` 
        : "Max level reached!";

    // Hero metric
    document.getElementById("best-wpm-display").textContent = data.bestWPM;
    document.getElementById("streak-value").textContent = data.streakDays;

    // Stats
    document.getElementById("avg-accuracy").textContent = `${data.averageAccuracy}%`;
    
    const minutes = Math.floor(data.totalPracticeTime / 60);
    document.getElementById("total-time").textContent = `${minutes}m`;
    
    document.getElementById("completed-lessons").textContent = 
        `${data.completedLessons.length}/${LESSON_DATA.length}`;
    
    document.getElementById("tests-taken").textContent = data.testsTaken || 0;

    // Weak keys chart
    const weakKeysChart = document.getElementById("dashboard-weak-keys");
    const weakKeys = progressManager.getTopWeakKeys(8);
    
    if (weakKeys.length === 0) {
        weakKeysChart.innerHTML = '<p class="empty-state">No data yet - start practicing!</p>';
    } else {
        weakKeysChart.innerHTML = "";
        weakKeys.forEach(([char, count]) => {
            const item = document.createElement("div");
            item.className = "weak-key-item";
            item.innerHTML = `
                <span class="weak-key-char">${char}</span>
                <span class="weak-key-count">${count} errors</span>
            `;
            weakKeysChart.appendChild(item);
        });
    }
}

// ============ MODE SWITCHING ============

function switchMode(mode) {
    // Update tabs
    document.querySelectorAll(".mode-tab").forEach(tab => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
    });
    
    const activeTab = document.querySelector(`[data-mode="${mode}"]`);
    if (activeTab) {
        activeTab.classList.add("active");
        activeTab.setAttribute("aria-selected", "true");
    }

    // Update sections
    document.querySelectorAll(".mode-section").forEach(section => {
        section.classList.remove("active");
        section.hidden = true;
    });

    const activeSection = document.getElementById(`${mode}-mode`);
    if (activeSection) {
        activeSection.classList.add("active");
        activeSection.hidden = false;
    }

    // Render content based on mode
    if (mode === "lessons") {
        renderLessons();
    } else if (mode === "practice") {
        renderWeakKeys();
        practiceEngine.start();
    } else if (mode === "dashboard") {
        renderDashboard();
    } else if (mode === "finger-training") {
        fingerTrainingEngine.reset();
    }
}

// ============ THEME MANAGEMENT ============

function getInitialTheme() {
    const stored = localStorage.getItem("typeflow-theme");
    if (stored === "light" || stored === "dark") return stored;

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("typeflow-theme", theme);
    updateThemeToggle(theme);
}

function toggleTheme() {
    const current = document.body.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById("theme-toggle");
    const isDark = theme === "dark";
    toggle.textContent = isDark ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-pressed", String(isDark));
}

// ============ INITIALIZATION ============

let progressManager;
let testEngine;
let lessonEngine;
let practiceEngine;
let fingerTrainingEngine;

document.addEventListener("DOMContentLoaded", () => {

        // Start test on any keypress in test mode
        document.addEventListener("keydown", (e) => {
            const testSection = document.getElementById("test-mode");
            if (!testSection.classList.contains("active")) return;
            // Ignore if results modal is open
            if (!document.getElementById("results").classList.contains("hidden")) return;
            // Only trigger for visible test input
            const input = document.getElementById("typing-input");
            if (document.activeElement !== input) {
                // Don't trigger for modifier keys
                if (e.key.length === 1 || e.key === "Backspace" || e.key === "Spacebar" || e.key === " ") {
                    input.focus();
                }
            }
            // If test not active and input is empty, start test
            if (!testEngine.isActive && input.value.length === 0) {
                testEngine.start(false);
            }
        });
    // Initialize managers
    progressManager = new ProgressManager();
    testEngine = new TestEngine();
    lessonEngine = new LessonEngine();
    practiceEngine = new PracticeEngine();
    fingerTrainingEngine = new FingerTrainingEngine();

    // Apply theme
    applyTheme(getInitialTheme());

    // Setup test mode
    testEngine.loadNewText();

    // Setup mode switching
    document.querySelectorAll(".mode-tab").forEach(tab => {
        tab.addEventListener("click", (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
        });
    });

    // Test mode controls
    document.querySelectorAll(".timer-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if (testEngine.isActive) return;
            
            const time = parseInt(e.target.dataset.time, 10);
            testEngine.timeLimit = time;
            testEngine.timeLeft = time;
            testEngine.updateTimerDisplay();
            testEngine.loadNewText();
            
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

    // Theme toggle
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    // Results modal buttons
    document.getElementById("results-restart").addEventListener("click", () => {
        document.getElementById("results").classList.add("hidden");
        testEngine.reset(false);
        testEngine.start(false);
    });

    document.getElementById("results-new-text").addEventListener("click", () => {
        document.getElementById("results").classList.add("hidden");
        testEngine.reset(true);
    });

    // Lesson modal buttons
    document.getElementById("back-to-lessons").addEventListener("click", hideLessonPractice);
    document.getElementById("lesson-restart").addEventListener("click", () => {
        lessonEngine.reset();
    });

    document.getElementById("next-lesson-btn").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });

    document.getElementById("back-to-lessons-modal").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });

    // Practice mode
    document.getElementById("practice-restart").addEventListener("click", () => {
        practiceEngine.start();
    });
    // Finger training mode
    document.getElementById("start-finger-drill").addEventListener("click", () => {
        fingerTrainingEngine.startDrill();
    });

    document.getElementById("random-key-practice").addEventListener("click", () => {
        fingerTrainingEngine.nextRandomKey();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.getElementById("results").classList.add("hidden");
            document.getElementById("lesson-complete-modal").classList.add("hidden");
            testEngine.reset(false);
        }
    });

    // Option toggles
    ["toggle-caps", "toggle-numbers", "toggle-symbols"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            if (!testEngine.isActive) {
                testEngine.loadNewText();
            }
        });
    });
});