// Text samples for different difficulty levels
const textSamples = {
    easy: [
        "The quick brown fox jumps over the lazy dog near the river bank.",
        "A journey of a thousand miles begins with a single step forward.",
        "Practice makes perfect when you work hard every single day.",
        "The sun shines bright in the clear blue summer sky today.",
        "Every cloud has a silver lining if you look close enough."
    ],
    medium: [
        "Success is not final, failure is not fatal; it is the courage to continue that counts in life.",
        "The only way to do great work is to love what you do and pursue it passionately.",
        "In the middle of difficulty lies opportunity waiting to be discovered by those who persist.",
        "Technology is best when it brings people together and makes life easier for everyone.",
        "Programming is not about what you know but about what you can figure out through practice."
    ],
    hard: [
        "Perseverance and determination alone are omnipotent; the slogan 'press on' has solved and always will solve the problems of the human race throughout history.",
        "The paradox of our time in history is that we have taller buildings but shorter tempers, wider freeways but narrower viewpoints, and we spend more but have less.",
        "Sophisticated algorithms and computational frameworks have revolutionized data processing, enabling unprecedented insights through machine learning and artificial intelligence.",
        "Quantum entanglement demonstrates that particles can instantaneously affect each other regardless of the distance separating them, challenging our understanding of physics.",
        "The juxtaposition of traditional methodologies with contemporary innovations creates fascinating opportunities for interdisciplinary collaboration and breakthrough discoveries."
    ]
};

// Global variables
let currentDifficulty = 'easy';
let currentText = '';
let currentPosition = 0;
let correctChars = 0;
let incorrectChars = 0;
let isTestActive = false;
let startTime = null;
let timerInterval = null;
let timeLimit = 60;

// DOM elements
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const scoreList = document.getElementById('score-list');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Initialize
loadHighScores();
loadRandomText();

// Event Listeners
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', handleDifficultyChange);
});

startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);
typingInput.addEventListener('input', handleTyping);
typingInput.addEventListener('paste', (e) => e.preventDefault());

// Functions
function handleDifficultyChange(e) {
    if (isTestActive) return;
    
    difficultyBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentDifficulty = e.target.dataset.difficulty;
    loadRandomText();
}

function loadRandomText() {
    const texts = textSamples[currentDifficulty];
    currentText = texts[Math.floor(Math.random() * texts.length)];
    displayText();
}

function displayText() {
    textDisplay.innerHTML = currentText
        .split('')
        .map((char, index) => {
            let className = '';
            if (index < currentPosition) {
                className = typingInput.value[index] === char ? 'correct' : 'incorrect';
            } else if (index === currentPosition) {
                className = 'current';
            }
            return `<span class="${className}">${char}</span>`;
        })
        .join('');
}

function startTest() {
    isTestActive = true;
    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;
    startTime = Date.now();
    
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    typingInput.placeholder = 'Start typing...';
    
    startBtn.disabled = true;
    difficultyBtns.forEach(btn => btn.disabled = true);
    
    displayText();
    startTimer();
}

function startTimer() {
    let timeLeft = timeLimit;
    timerDisplay.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function handleTyping(e) {
    if (!isTestActive) return;

    const typedText = typingInput.value;
    currentPosition = typedText.length;

    // Check if test is complete
    if (currentPosition >= currentText.length) {
        endTest();
        return;
    }

    // Count correct and incorrect characters
    correctChars = 0;
    incorrectChars = 0;
    
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === currentText[i]) {
            correctChars++;
        } else {
            incorrectChars++;
        }
    }

    updateStats();
    displayText();
}

function updateStats() {
    // Calculate WPM
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = correctChars / 5; // standard: 5 chars = 1 word
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;
    wpmDisplay.textContent = wpm;

    // Calculate accuracy
    const totalChars = correctChars + incorrectChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    accuracyDisplay.textContent = accuracy + '%';
}

function endTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    
    typingInput.disabled = true;
    startBtn.disabled = false;
    difficultyBtns.forEach(btn => btn.disabled = false);

    const finalWPM = parseInt(wpmDisplay.textContent);
    const finalAccuracy = parseInt(accuracyDisplay.textContent);
    
    saveScore(finalWPM, finalAccuracy);
    
    // Show completion message
    showMessage(`Test Complete! WPM: ${finalWPM} | Accuracy: ${finalAccuracy}%`);
}

function resetTest() {
    isTestActive = false;
    clearInterval(timerInterval);
    
    currentPosition = 0;
    correctChars = 0;
    incorrectChars = 0;
    
    typingInput.value = '';
    typingInput.disabled = true;
    typingInput.placeholder = "Click 'Start Test' to begin typing...";
    
    startBtn.disabled = false;
    difficultyBtns.forEach(btn => btn.disabled = false);
    
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    timerDisplay.textContent = timeLimit;
    
    loadRandomText();
}

function saveScore(wpm, accuracy) {
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]');
    const newScore = {
        wpm,
        accuracy,
        difficulty: currentDifficulty,
        date: new Date().toLocaleDateString()
    };
    
    scores.push(newScore);
    scores.sort((a, b) => b.wpm - a.wpm);
    scores.splice(5); // Keep top 5
    
    localStorage.setItem('typingScores', JSON.stringify(scores));
    loadHighScores();
}

function loadHighScores() {
    const scores = JSON.parse(localStorage.getItem('typingScores') || '[]');
    
    if (scores.length === 0) {
        scoreList.innerHTML = '<li class="score-item">No scores yet. Be the first!</li>';
        return;
    }
    
    scoreList.innerHTML = scores.map((score, index) => `
        <li class="score-item">
            <span class="score-rank">#${index + 1}</span>
            <span>${score.wpm} WPM - ${score.accuracy}% - ${score.difficulty}</span>
            <span>${score.date}</span>
        </li>
    `).join('');
}

function showMessage(text) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    
    const container = document.querySelector('.container');
    container.insertBefore(message, container.firstChild);
    
    setTimeout(() => message.remove(), 3000);
}