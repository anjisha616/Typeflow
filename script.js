/* =========================================
   TYPEFLOW - TYPING LEARNING PLATFORM
   Modular JavaScript Architecture
   ========================================= */

// --- Caps Lock warning UI ---
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
    }
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

    setupEventListeners() {
        this.input.addEventListener("input",  (e) => { this.handleTyping(e); });
        this.input.addEventListener("keydown", (e) => {
            this.handleKeydown(e);
            // Always check current Caps Lock state
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
            // Tab to restart
            if (e.key === 'Tab') {
                e.preventDefault();
                this.reset(false);
                this.start(false);
            }
        });
        this.input.addEventListener("keyup", (e) => {
            // Always check current Caps Lock state
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("focus", (e) => {
            // Check Caps Lock state on focus
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("blur", () => {
            // Always hide warning on blur
            showCapsWarning(false);
        });
        this.input.addEventListener("paste",  (e) => e.preventDefault());
        this.textDisplay.addEventListener("click", () => this.input.focus());
    }

    getLockIndex() {
        const lastSpace = this.input.value.lastIndexOf(" ");
class TestEngine {
    constructor() {
        this.startTime       = null;
        this.timerInterval   = null;
        this.timeLimit       = 15;
        this.timeLeft        = 15;
        this.mistakesByChar  = {};
        this.waitingForFirstInput = false;
        // FIX: track whether we're in timed or word-count mode
        this.wordCountMode   = false;

        this.textDisplay     = document.getElementById("text-display");
        this.input           = document.getElementById("typing-input");
        this.wpmDisplay      = document.getElementById("wpm");
        this.accuracyDisplay = document.getElementById("accuracy");
        this.timerDisplay    = document.getElementById("timer");

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener("input",  (e) => { this.handleTyping(e); });
        this.input.addEventListener("keydown", (e) => {
            this.handleKeydown(e);
            // Always check current Caps Lock state
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
            // Tab to restart
            if (e.key === 'Tab') {
                e.preventDefault();
                this.reset(false);
                this.start(false);
            }
        });
        this.input.addEventListener("keyup", (e) => {
            // Always check current Caps Lock state
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("focus", (e) => {
            // Check Caps Lock state on focus
            showCapsWarning(e.getModifierState && e.getModifierState('CapsLock'));
        });
        this.input.addEventListener("blur", () => {
            // Always hide warning on blur
            showCapsWarning(false);
        });
        this.input.addEventListener("paste",  (e) => e.preventDefault());
        this.textDisplay.addEventListener("click", () => this.input.focus());
    }

    getLockIndex() {
        const lastSpace = this.input.value.lastIndexOf(" ");
        return lastSpace + 1;
    }

    // FIX: quote/code modes don't use timer — they end when text is complete
    getCurrentMode() {
        return document.querySelector('.mode-tab.active')?.dataset.mode || 'test';
    }

    isTimedMode() {
        const mode = this.getCurrentMode();
        // Timed only if timer button active AND no word count button active
        return (mode === 'test') && !document.querySelector('.word-count-btn.active');
    }

    generateText() {
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        if (mode === 'quote') {
            // Pick a quote and split author
            const raw = famousQuotes[Math.floor(Math.random() * famousQuotes.length)];
            const match = raw.match(/^(.*?)(?:\s*[\u2014-]\s*|\s*-\s*)(.+)$/);
            if (match) {
        if (mode === 'quote') {
            // Show quote and author separately
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
    }

    startTimer() {
        // FIX: Only start countdown timer in timed mode
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
        const mode = document.querySelector('.mode-tab.active')?.dataset.mode;
        const wordCountMode = document.querySelector('.word-count-btn.active')?.dataset.count;
        if (wordCountMode) {
            // Word count mode: show words left
            const wordsTyped = this.input.value.trim().split(/\s+/).filter(Boolean).length;
            const wordsLeft = Math.max(0, parseInt(wordCountMode, 10) - wordsTyped);
            this.timerDisplay.textContent = wordsLeft;
            // Change label to Words
            const label = this.timerDisplay.parentElement.querySelector('.stat-label');
            if (label) label.textContent = 'Words';
        } else {
            this.timerDisplay.textContent = this.isTimedMode() ? Math.max(this.timeLeft, 0) : '∞';
            // Change label to Time
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

        // Track key stats
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
        this.input.disabled = true;
        this.updateStats();

        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = this.isTimedMode() ? (this.timeLimit - this.timeLeft) : Math.floor((Date.now() - this.startTime) / 1000);

        // FIX: Check for new personal best
        const isNewBest = wpm > (progressManager.data.bestWPM || 0);

        progressManager.updateTestStats(wpm, accuracy, duration, this.mistakesByChar);
        const xpGained = this.calculateXP(wpm, accuracy);
        progressManager.addXP(xpGained);

        // Achievements
        if (!progressManager.hasAchievement('first-test')) progressManager.unlockAchievement('first-test');
        if (wpm >= 50      && !progressManager.hasAchievement('50wpm'))         progressManager.unlockAchievement('50wpm');
        if (accuracy === 100 && !progressManager.hasAchievement('100accuracy')) progressManager.unlockAchievement('100accuracy');
        if ((progressManager.data.testsTaken || 0) >= 10 && !progressManager.hasAchievement('10tests')) progressManager.unlockAchievement('10tests');
        if ((progressManager.data.streakDays || 0) >= 7  && !progressManager.hasAchievement('7day-streak')) progressManager.unlockAchievement('7day-streak');

        // Save WPM history
        let wpmHistory = [];
        try { wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]'); } catch { wpmHistory = []; }
        wpmHistory.push({ date: new Date().toLocaleDateString(), wpm });
        localStorage.setItem('typeflow-wpm-history', JSON.stringify(wpmHistory.slice(-30)));

        this.showResults(wpm, accuracy, xpGained, isNewBest);
    }

    calculateXP(wpm, accuracy) {
        let xp = Math.floor(wpm * 2);
        if (accuracy >= 95) xp += 50;
        else if (accuracy >= 90) xp += 30;
        else if (accuracy >= 85) xp += 15;
        return xp;
    }

    // FIX: Added isNewBest parameter
    showResults(wpm, accuracy, xpGained, isNewBest = false) {
        const modal = document.getElementById("results");
        modal.classList.remove("hidden");

        // FIX: Show "New Best!" indicator
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
            if (key.dataset.key === keyChar) {
                key.classList.add('highlight');
                // REMOVE: setTimeout(() => key.classList.remove('highlight'), 500);
                // Now highlight stays until correct key is pressed
            }
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
                // Remove highlight from previous key
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
        this.fingerDrillStats.style.display = 'none'; // FIX: was setting to none then immediately grid
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
    weakKeys.forEach(([char, count]) => {
        if (!char || char.trim() === "") return;
        const item = document.createElement("div");
        item.className = "weak-key-item";
        item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${count} errors</span>`;
        container.appendChild(item);
    });
}

// FIX: renderWPMLineChart and renderKeyHeatmap are now top-level functions (not nested)
function renderWPMLineChart() {
    const canvas = document.getElementById('wpm-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let wpmHistory = [];
    try { wpmHistory = JSON.parse(localStorage.getItem('typeflow-wpm-history') || '[]'); } catch { wpmHistory = []; }
    if (!Array.isArray(wpmHistory)) wpmHistory = [];
    // Show last 20 tests, not grouped by date
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

// FIX: QWERTY layout rows + dark mode inline color support
function renderKeyHeatmap(weakKeys) {
    const grid = document.getElementById('key-heatmap-grid');
    if (!grid) return;
    let keyStats = {};
    try { keyStats = JSON.parse(localStorage.getItem('typeflow-key-stats') || '{}'); } catch { keyStats = {}; }

    // QWERTY layout — each sub-array is a row
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

            // Inline color so dark mode override in CSS doesn't flatten it
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
            cell.innerHTML = `${k}<span class="heatmap-tooltip">${freq} times</span>`;
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

    // Weak keys section
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

    // Achievements
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

    // FIX: Call top-level functions with correct scope
    renderWPMLineChart();
    renderKeyHeatmap(weakKeys); // FIX: pass weakKeys so heatmap can highlight them
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

    // Hide options row and timer/word-count groups in quote/code mode
    const optionsRow    = document.querySelector('.options-row');
    const timerGroup    = document.querySelector('.timer-group');
    const wordCountGroup = document.querySelector('.word-count-group');

    if (mode === 'quote' || mode === 'code') {
        if (optionsRow)     optionsRow.style.display     = 'none';
        if (timerGroup)     timerGroup.style.display     = 'none';
        if (wordCountGroup) wordCountGroup.style.display = 'none';
    } else {
        if (optionsRow)     optionsRow.style.display     = '';
        if (timerGroup)     timerGroup.style.display     = '';
        if (wordCountGroup) wordCountGroup.style.display = '';
    }

    if      (mode === "lessons")        renderLessons();
    else if (mode === "practice")       { renderWeakKeys(); practiceEngine.start(); }
    else if (mode === "dashboard")      renderDashboard();
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

    // Timer buttons — FIX: deactivate word count buttons when timer selected
    document.querySelectorAll(".timer-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const time = parseInt(e.target.dataset.time, 10);
            testEngine.timeLimit = time;
            testEngine.timeLeft  = time;
            document.querySelectorAll(".timer-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".word-count-btn").forEach(b => b.classList.remove("active")); // FIX
            e.target.classList.add("active");
            testEngine.reset(false);
            testEngine.loadNewText();
            testEngine.updateTimerDisplay();
        });
    });

    // Word count buttons — FIX: deactivate timer buttons when word count selected
    document.querySelectorAll('.word-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.word-count-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active')); // FIX
            btn.classList.add('active');
            testEngine.reset(true);
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

    // Escape key
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

    // FIX: Reset progress button
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
    const feedbackBtn   = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    const feedbackForm  = document.getElementById('feedback-form');
    const feedbackSuccess = document.getElementById('feedback-success');

    if (feedbackBtn)    feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
    if (closeFeedback)  closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
    feedbackModal?.addEventListener('click', (e) => { if (e.target === feedbackModal) feedbackModal.classList.add('hidden'); });

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
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
            try {
                await fetch('https://script.google.com/macros/s/AKfycbxKKwSQQsqe6o8ktYl6GvCZALpsHGB0AqWmEeYdM079o2VUha-Gpp9z0PmmeIh5oLIC/exec', {
                    method: 'POST', mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedback)
                });
            } catch (error) { console.error('Error sending feedback:', error); }
            feedbackForm.classList.add('hidden');
            feedbackSuccess.classList.remove('hidden');
            setTimeout(() => {
                feedbackModal.classList.add('hidden');
                feedbackForm.classList.remove('hidden');
                feedbackSuccess.classList.add('hidden');
                feedbackForm.reset();
            }, 2000);
        });
    }
});
// --- Today's Goal Logic ---
const DAILY_GOAL = 3;
function getTodayKey() {
    const d = new Date();
    return `goal-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function getTodayProgress() {
    return parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
}
function incrementTodayProgress() {
    const key = getTodayKey();
    let val = getTodayProgress();
    val++;
    localStorage.setItem(key, val);
    updateGoalWidget();
}
function updateGoalWidget() {
    const count = getTodayProgress();
    const bar = document.getElementById('goal-progress-bar');
    const label = document.getElementById('goal-progress-count');
    const total1 = document.getElementById('goal-total');
    const total2 = document.getElementById('goal-total-2');
    if (bar) bar.style.width = Math.min(100, (count/DAILY_GOAL)*100) + '%';
    if (label) label.textContent = count;
    if (total1) total1.textContent = DAILY_GOAL;
    if (total2) total2.textContent = DAILY_GOAL;
}
// Call updateGoalWidget on dashboard load
const dashboardSection = document.getElementById('dashboard-mode');
if (dashboardSection) {
    const observer = new MutationObserver(() => {
        if (!dashboardSection.hidden) updateGoalWidget();
    });
    observer.observe(dashboardSection, { attributes: true, attributeFilter: ['hidden'] });
}
// Increment progress when a test is completed today
const origUpdateTestStats = ProgressManager.prototype.updateTestStats;
ProgressManager.prototype.updateTestStats = function(wpm, accuracy, duration, mistakes) {
    origUpdateTestStats.call(this, wpm, accuracy, duration, mistakes);
    // Only increment if today
    incrementTodayProgress();
};