const baseWords = [
    "design", "typing", "focus", "rhythm", "steady", "clarity", "flow", "precision", "practice", "balance",
    "signal", "detail", "craft", "gentle", "future", "method", "energy", "motion", "signal", "value",
    "quality", "simple", "quiet", "progress", "intent", "context", "pattern", "tempo", "memory", "logic",
    "system", "layout", "screen", "signal", "accent", "measure", "stable", "vision", "reason", "result",
    "focus", "steady", "build", "learn", "trust", "align", "repeat", "refine", "polish", "deliver"
];

const symbols = ["!", "@", "#", "$", "%", "&", "*", "+", "-", "?"];

let currentText = "";
let currentPosition = 0;
let correctChars = 0;
let incorrectChars = 0;
let isTestActive = false;
let startTime = null;
let timerInterval = null;
let timeLimit = 15;
let timeLeft = 15;

const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");
const startBtn = document.getElementById("start-btn");
const newTextBtn = document.getElementById("new-text-btn");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const timerBtns = document.querySelectorAll(".timer-btn");
const themeToggle = document.getElementById("theme-toggle");
const capsToggle = document.getElementById("toggle-caps");
const numbersToggle = document.getElementById("toggle-numbers");
const symbolsToggle = document.getElementById("toggle-symbols");

const resultsOverlay = document.getElementById("results");
const resultWpm = document.getElementById("result-wpm");
const resultAccuracy = document.getElementById("result-accuracy");
const resultCorrect = document.getElementById("result-correct");
const resultIncorrect = document.getElementById("result-incorrect");
const resultsRestart = document.getElementById("results-restart");
const resultsNewText = document.getElementById("results-new-text");

resetTest({ newText: true });
applyTheme(getInitialTheme());
typingInput.disabled = false;
typingInput.placeholder = "Start typing...";
typingInput.focus();

timerBtns.forEach(btn => btn.addEventListener("click", handleTimerChange));
startBtn.addEventListener("click", () => {
    resetTest({ newText: false });
    startTest({ preserveInput: false });
});
newTextBtn.addEventListener("click", () => resetTest({ newText: true }));
resultsRestart.addEventListener("click", () => restartFromResults(false));
resultsNewText.addEventListener("click", () => restartFromResults(true));
typingInput.addEventListener("input", handleTyping);
typingInput.addEventListener("paste", e => e.preventDefault());
textDisplay.addEventListener("click", () => typingInput.focus());
themeToggle.addEventListener("click", toggleTheme);
capsToggle.addEventListener("change", handleOptionChange);
numbersToggle.addEventListener("change", handleOptionChange);
symbolsToggle.addEventListener("change", handleOptionChange);

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeResults();
        resetTest({ newText: false });
    }
});

function handleTimerChange(e) {
    if (isTestActive) return;

    const nextLimit = parseInt(e.target.dataset.time, 10);
    if (Number.isNaN(nextLimit)) return;

    timeLimit = nextLimit;
    timeLeft = nextLimit;
    setActiveTimerButton(nextLimit);
    updateTimerDisplay();
    loadRandomText();
}

function handleOptionChange() {
    if (isTestActive) {
        capsToggle.checked = capsToggle.dataset.locked === "true";
        numbersToggle.checked = numbersToggle.dataset.locked === "true";
        symbolsToggle.checked = symbolsToggle.dataset.locked === "true";
        return;
    }

    loadRandomText();
}

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
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
}

function setActiveTimerButton(limit) {
    timerBtns.forEach(btn => {
        const value = parseInt(btn.dataset.time, 10);
        btn.classList.toggle("active", value === limit);
    });
}

function loadRandomText() {
    currentText = generateText();
    currentPosition = 0;
    displayText();
}

function generateText() {
    const includeCaps = capsToggle.checked;
    const includeNumbers = numbersToggle.checked;
    const includeSymbols = symbolsToggle.checked;
    const wordCount = getWordCountForTime(timeLimit);
    const words = [];

    for (let i = 0; i < wordCount; i += 1) {
        let word = baseWords[Math.floor(Math.random() * baseWords.length)];

        if (includeCaps && Math.random() < 0.18) {
            word = capitalize(word);
        }

        if (includeNumbers && Math.random() < 0.14) {
            word += randomBetween(0, 99).toString();
        }

        if (includeSymbols && Math.random() < 0.1) {
            word += symbols[Math.floor(Math.random() * symbols.length)];
        }

        words.push(word);
    }

    const sentence = words.join(" ");
    return `${sentence}.`;
}

function getWordCountForTime(seconds) {
    const baseWpm = 45;
    const baseWords = Math.max(Math.round((seconds / 60) * baseWpm), 12);
    return randomBetween(baseWords + 6, baseWords + 14);
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(word) {
    if (!word.length) return word;
    return `${word[0].toUpperCase()}${word.slice(1)}`;
}

function displayText() {
    const typedText = typingInput.value;
    const hideUntil = getHideUntilIndex(typedText, currentPosition);
    const html = currentText
        .split("")
        .map((char, index) => {
            let className = "char";
            if (index < currentPosition) {
                className += typedText[index] === char ? " correct" : " incorrect";
            } else if (index === currentPosition) {
                className += " current";
            }

            if (index < hideUntil) {
                className += " gone";
            }

            return `<span class="${className}">${formatChar(char)}</span>`;
        })
        .join("");

    textDisplay.innerHTML = html;
}

function getHideUntilIndex(typedText, position) {
    const lastSpace = typedText.lastIndexOf(" ");
    if (lastSpace === -1) return 0;
    return Math.min(lastSpace + 1, position);
}

function formatChar(char) {
    if (char === " ") return " ";
    return escapeHtml(char);
}

function escapeHtml(char) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return map[char] || char;
}

function startTest() {
    startTest({ preserveInput: false });
}

function startTest({ preserveInput }) {
    closeResults();
    isTestActive = true;
    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;
    startTime = Date.now();
    timeLeft = timeLimit;

    if (!preserveInput) {
        typingInput.value = "";
    }
    typingInput.disabled = false;
    typingInput.focus();
    typingInput.placeholder = "Start typing...";

    startBtn.disabled = true;
    timerBtns.forEach(btn => (btn.disabled = true));
    setOptionLock(true);

    if (preserveInput) {
        recalculateFromInput();
        updateStats();
    } else {
        updateStats(true);
    }

    displayText();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = Math.max(timeLeft, 0);
}

function handleTyping() {
    if (!isTestActive) {
        if (typingInput.value.length > 0) {
            startTest({ preserveInput: true });
        }
        return;
    }

    const typedText = typingInput.value;
    currentPosition = typedText.length;

    if (currentPosition >= currentText.length) {
        endTest();
        return;
    }

    recalculateFromInput();

    updateStats();
    displayText();
    typingInput.setSelectionRange(typedText.length, typedText.length);
}

function recalculateFromInput() {
    const typedText = typingInput.value;
    currentPosition = typedText.length;
    correctChars = 0;
    incorrectChars = 0;

    for (let i = 0; i < typedText.length; i += 1) {
        if (typedText[i] === currentText[i]) {
            correctChars += 1;
        } else {
            incorrectChars += 1;
        }
    }
}

function updateStats(reset = false) {
    if (reset) {
        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "100%";
        return;
    }

    const elapsedMinutes = Math.max((Date.now() - startTime) / 1000 / 60, 1 / 60);
    const wordsTyped = correctChars / 5;
    const wpm = Math.round(wordsTyped / elapsedMinutes) || 0;
    wpmDisplay.textContent = wpm;

    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    accuracyDisplay.textContent = `${accuracy}%`;
}

function endTest() {
    if (!isTestActive) return;

    isTestActive = false;
    clearInterval(timerInterval);

    typingInput.disabled = true;
    startBtn.disabled = false;
    timerBtns.forEach(btn => (btn.disabled = false));
    setOptionLock(false);

    updateStats();
    showResults();
}

function resetTest({ newText }) {
    isTestActive = false;
    clearInterval(timerInterval);

    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;
    timeLeft = timeLimit;

    typingInput.value = "";
    typingInput.disabled = false;
    typingInput.placeholder = "Start typing...";

    startBtn.disabled = false;
    timerBtns.forEach(btn => (btn.disabled = false));
    setOptionLock(false);

    updateStats(true);
    updateTimerDisplay();

    if (newText) {
        loadRandomText();
    } else {
        displayText();
    }
}

function setOptionLock(isLocked) {
    [capsToggle, numbersToggle, symbolsToggle].forEach(toggle => {
        toggle.disabled = isLocked;
        toggle.dataset.locked = String(toggle.checked);
    });
}

function showResults() {
    const finalWpm = wpmDisplay.textContent;
    const finalAccuracy = accuracyDisplay.textContent;

    resultWpm.textContent = finalWpm;
    resultAccuracy.textContent = finalAccuracy;
    resultCorrect.textContent = `${correctChars}`;
    resultIncorrect.textContent = `${incorrectChars}`;
    resultsOverlay.classList.remove("hidden");
}

function closeResults() {
    resultsOverlay.classList.add("hidden");
}

function restartFromResults(useNewText) {
    closeResults();
    resetTest({ newText: useNewText });
    startTest();
}