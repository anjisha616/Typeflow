const textSamples = [
    "Design is not just what it looks like and feels like. Design is how it works when people use it every day.",
    "Focused practice builds lasting skill. Small improvements, repeated consistently, compound into remarkable results.",
    "A clear mind types with rhythm. Read ahead, stay relaxed, and let accuracy guide your speed.",
    "Product teams ship faster when they communicate well, test assumptions, and iterate with purpose.",
    "Typing is a craft of precision and flow. Keep your eyes on the text and trust your hands to follow.",
    "Great software feels effortless because someone cared about every detail, from performance to typography.",
    "Momentum is built by simple habits: warm up, stay steady, and finish with intention.",
    "Quality work comes from patience, clarity, and the courage to refine until the experience feels right.",
    "Speed is a byproduct of accuracy. Reduce errors first, then your pace will rise naturally.",
    "Consistency turns short sessions into mastery. Show up, measure progress, and celebrate each gain."
];

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
const restartBtn = document.getElementById("restart-btn");
const newTextBtn = document.getElementById("new-text-btn");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const timerBtns = document.querySelectorAll(".timer-btn");
const themeToggle = document.getElementById("theme-toggle");

const resultsOverlay = document.getElementById("results");
const resultWpm = document.getElementById("result-wpm");
const resultAccuracy = document.getElementById("result-accuracy");
const resultCorrect = document.getElementById("result-correct");
const resultIncorrect = document.getElementById("result-incorrect");
const resultsRestart = document.getElementById("results-restart");
const resultsNewText = document.getElementById("results-new-text");

loadRandomText();
updateTimerDisplay();
applyTheme(getInitialTheme());

timerBtns.forEach(btn => btn.addEventListener("click", handleTimerChange));
startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", () => resetTest({ newText: false }));
newTextBtn.addEventListener("click", () => resetTest({ newText: true }));
resultsRestart.addEventListener("click", () => restartFromResults(false));
resultsNewText.addEventListener("click", () => restartFromResults(true));
typingInput.addEventListener("input", handleTyping);
typingInput.addEventListener("paste", e => e.preventDefault());
textDisplay.addEventListener("click", () => typingInput.focus());
themeToggle.addEventListener("click", toggleTheme);

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
    const next = textSamples[Math.floor(Math.random() * textSamples.length)];
    currentText = next;
    currentPosition = 0;
    displayText();
}

function displayText() {
    const typedText = typingInput.value;
    const html = currentText
        .split("")
        .map((char, index) => {
            let className = "char";
            if (index < currentPosition) {
                className += typedText[index] === char ? " correct" : " incorrect";
            } else if (index === currentPosition) {
                className += " current";
            }

            return `<span class="${className}">${formatChar(char)}</span>`;
        })
        .join("");

    textDisplay.innerHTML = html;
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
    closeResults();
    isTestActive = true;
    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;
    startTime = Date.now();
    timeLeft = timeLimit;

    typingInput.value = "";
    typingInput.disabled = false;
    typingInput.focus();
    typingInput.placeholder = "Start typing...";

    startBtn.disabled = true;
    timerBtns.forEach(btn => (btn.disabled = true));

    updateStats(true);
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
    if (!isTestActive) return;

    const typedText = typingInput.value;
    currentPosition = typedText.length;

    if (currentPosition >= currentText.length) {
        endTest();
        return;
    }

    correctChars = 0;
    incorrectChars = 0;

    for (let i = 0; i < typedText.length; i += 1) {
        if (typedText[i] === currentText[i]) {
            correctChars += 1;
        } else {
            incorrectChars += 1;
        }
    }

    updateStats();
    displayText();
    typingInput.setSelectionRange(typedText.length, typedText.length);
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
    typingInput.disabled = true;
    typingInput.placeholder = "Press Start to begin...";

    startBtn.disabled = false;
    timerBtns.forEach(btn => (btn.disabled = false));

    updateStats(true);
    updateTimerDisplay();

    if (newText) {
        loadRandomText();
    } else {
        displayText();
    }
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