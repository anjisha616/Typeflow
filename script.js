/* =========================================
   TYPEFLOW - TYPING LEARNING PLATFORM
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
    { id: '30wpm',         name: 'Getting Faster',   desc: 'Achieve 30 WPM or higher in a test.',  icon: '🏃' },
    { id: '50wpm',         name: 'Speedster',        desc: 'Achieve 50 WPM or higher in a test.',  icon: '🚀' },
    { id: '75wpm',         name: 'Blazing Fast',     desc: 'Achieve 75 WPM or higher in a test.',  icon: '⚡' },
    { id: '100wpm',        name: 'Centurion',        desc: 'Achieve 100 WPM or higher in a test.', icon: '💯' },
    { id: '100accuracy',   name: 'Perfect Accuracy', desc: 'Score 100% accuracy in a test.',       icon: '🎯' },
    { id: '10tests',       name: 'Test Veteran',     desc: 'Complete 10 typing tests.',            icon: '🏅' },
    { id: '50tests',       name: 'Test Pro',         desc: 'Complete 50 typing tests.',            icon: '🥈' },
    { id: '100tests',      name: 'Test Master',      desc: 'Complete 100 typing tests.',           icon: '🥇' },
    { id: '5day-streak',   name: 'Consistent',       desc: 'Practice for 5 days in a row.',        icon: '📅' },
    { id: '7day-streak',   name: 'Streak Master',    desc: 'Practice for 7 days in a row.',        icon: '🔥' },
    { id: '30day-streak',  name: 'Unstoppable',      desc: 'Practice for 30 days in a row.',       icon: '🏆' },
    { id: 'speed-demon',   name: 'Speed Demon',      desc: 'Finish a 15s test with 0 errors.',     icon: '😈' },
    { id: 'all-lessons',   name: 'Lesson Legend',    desc: 'Complete all lessons.',                icon: '🌟' }
];

const LESSON_DATA = [
    { id: 1, title: "Home Row Fundamentals", description: "Master the foundation - ASDF JKL;",        focusKeys: "asdf jkl;",           minAccuracy: 90, minWPM: 15, xpReward: 100 },
    { id: 2, title: "Top Row Basics",        description: "Expand upward - QWERT YUIOP",              focusKeys: "qwert yuiop",         minAccuracy: 90, minWPM: 18, xpReward: 150 },
    { id: 3, title: "Bottom Row Training",   description: "Complete the alphabet - ZXCVBNM",          focusKeys: "zxcvbnm",             minAccuracy: 90, minWPM: 20, xpReward: 150 },
    { id: 4, title: "Full Alphabet",         description: "Combine all letters with confidence",      focusKeys: "all letters",         minAccuracy: 92, minWPM: 25, xpReward: 200 },
    { id: 5, title: "Numbers Integration",   description: "Add numeric proficiency",                  focusKeys: "0-9",                 minAccuracy: 90, minWPM: 25, xpReward: 200 },
    { id: 6, title: "Symbols Mastery",       description: "Complete typing - symbols & punctuation",  focusKeys: "! @ # $ % & * + - ?", minAccuracy: 88, minWPM: 30, xpReward: 250 }
];

const LEVEL_THRESHOLDS = [
    { level: 1, name: "Beginner",  minXP: 0,    maxXP: 500 },
    { level: 2, name: "Improving", minXP: 500,  maxXP: 1200 },
    { level: 3, name: "Fluent",    minXP: 1200, maxXP: 2500 },
    { level: 4, name: "Fast",      minXP: 2500, maxXP: 5000 },
    { level: 5, name: "Elite",     minXP: 5000, maxXP: Infinity }
];

// ============ SAFE LOCAL STORAGE ============
const safeLocalStorage = {
    getItem:   (key)      => { try { return localStorage.getItem(key); }       catch { return null; } },
    setItem:   (key, val) => { try { localStorage.setItem(key, val); }         catch {} },
    removeItem:(key)      => { try { localStorage.removeItem(key); }           catch {} },
    parse:     (str, fallback) => { try { return JSON.parse(str) ?? fallback; } catch { return fallback; } },
    stringify: (val)      => { try { return JSON.stringify(val); }             catch { return '{}'; } }
};

// ============ STATE MANAGEMENT ============
// ============ DASHBOARD HISTORY TABLE ============
function renderDashboardHistoryTable() {
    const tbody = document.getElementById('dashboard-history-body');
    if (!tbody) return;
    let history = {};
    try { history = JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}'); } catch { history = {}; }
    const rows = Object.values(history)
        .map(e => ({ date: e.date || '', wpm: e.wpm || 0, accuracy: e.accuracy || 0 }))
        .slice(-10)
        .reverse();
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:10px;">No test history yet.</td></tr>';
        return;
    }
    tbody.innerHTML = rows.map(r =>
        `<tr>
            <td style="padding:6px 8px;">${r.date}</td>
            <td style="text-align:right;padding:6px 8px;">${r.wpm}</td>
            <td style="text-align:right;padding:6px 8px;">${r.accuracy}%</td>
        </tr>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboardHistoryTable();
});

class ProgressManager {
    constructor() {
        this.loadProgress();
    }

    loadProgress() {
        const saved = safeLocalStorage.getItem('typeflow-progress');
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

    save() { safeLocalStorage.setItem('typeflow-progress', JSON.stringify(this.data)); }

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
        const totalTests  = this.data.totalTests || 0;
        const currentAvg  = this.data.averageAccuracy || 0;
        this.data.averageAccuracy = Math.round((currentAvg * totalTests + accuracy) / (totalTests + 1));
        this.data.totalPracticeTime += duration;
        this.data.testsTaken  = (this.data.testsTaken  || 0) + 1;
        this.data.totalTests  = (this.data.totalTests  || 0) + 1;
        if (mistakes && typeof mistakes === 'object') {
            Object.keys(mistakes).forEach(key => {
                this.data.weakKeys[key] = (this.data.weakKeys[key] || 0) + mistakes[key];
            });
        }
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
        try { keyStats = JSON.parse(safeLocalStorage.getItem('typeflow-key-stats') || '{}'); } catch { keyStats = {}; }
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
        safeLocalStorage.removeItem('typeflow-progress');
        safeLocalStorage.removeItem('typeflow-wpm-history');
        safeLocalStorage.removeItem('typeflow-key-stats');
        this.loadProgress();
    }
}

// ============ WORD BANKS ============

const baseWords = [
    "the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at",
    "this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what",
    "so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take",
    "people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also",
    "back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us",
    "is","are","was","were","has","had","did","been","am","being","does","having","may","might","must","shall","should","can","could",
    "would","will","need","do","does","did","doing","done","go","goes","went","gone","going","get","gets","got","gotten","getting",
    "make","makes","made","making","see","sees","saw","seen","seeing","think","thinks","thought","thinking","know","knows","knew","known","knowing","take",
    "takes","took","taken","taking","come","comes","came","coming","look","looks","looked","looking","use","uses","used","using","find","finds","found","finding",
    "give","gives","gave","given","giving","tell","tells","told","telling","work","works","worked","working","call","calls","called","calling","try","tries",
    "tried","trying","ask","asks","asked","asking","need","needs","needed","needing","feel","feels","felt","feeling","become","becomes","became","becoming","leave",
    "leaves","left","leaving","put","puts","putting","keep","keeps","kept","keeping","let","lets","letting","begin","begins","began","begun","beginning","seem",
    "seems","seemed","seeming","help","helps","helped","helping","talk","talks","talked","talking","turn","turns","turned","turning","start","starts","started",
    "starting","show","shows","showed","shown","showing","hear","hears","heard","hearing","play","plays","played","playing","run","runs","ran","running","move",
    "moves","moved","moving","live","lives","lived","living","believe","believes","believed","believing","hold","holds","held","holding","bring","brings","brought",
    "bringing","write","writes","wrote","written","writing","sit","sits","sat","sitting","stand","stands","stood","standing","lose","loses","lost","losing","pay",
    "pays","paid","paying","meet","meets","met","meeting","include","includes","included","including","continue","continues","continued","continuing","set","sets",
    "setting","learn","learns","learned","learning","change","changes","changed","changing","lead","leads","led","leading","understand","understands","understood",
    "understanding","watch","watches","watched","watching","follow","follows","followed","following","stop","stops","stopped","stopping","create","creates","created",
    "creating","speak","speaks","spoke","spoken","speaking","read","reads","reading","allow","allows","allowed","allowing","add","adds","added","adding",
    "spend","spends","spent","spending","grow","grows","grew","grown","growing","open","opens","opened","opening","walk","walks","walked","walking","win","wins",
    "won","winning","offer","offers","offered","offering","remember","remembers","remembered","remembering","love","loves","loved","loving","consider","considers",
    "considered","considering","appear","appears","appeared","appearing","buy","buys","bought","buying","wait","waits","waited","waiting","serve","serves","served",
    "serving","die","dies","died","dying","send","sends","sent","sending","expect","expects","expected","expecting","build","builds","built","building","stay",
    "stays","stayed","staying","fall","falls","fell","fallen","falling","cut","cuts","cutting","reach","reaches","reached","reaching","kill","kills","killed",
    "killing","remain","remains","remained","remaining","suggest","suggests","suggested","suggesting","raise","raises","raised","raising","pass","passes","passed",
    "passing","sell","sells","sold","selling","require","requires","required","requiring","report","reports","reported","reporting","decide","decides","decided",
    "deciding","pull","pulls","pulled","pulling","return","returns","returned","returning","explain","explains","explained","explaining","hope","hopes","hoped",
    "hoping","develop","develops","developed","developing","carry","carries","carried","carrying","break","breaks","broke","broken","breaking","receive","receives",
    "received","receiving","agree","agrees","agreed","agreeing","support","supports","supported","supporting","hit","hits","hitting","produce","produces",
    "produced","producing","eat","eats","ate","eaten","eating","cover","covers","covered","covering","catch","catches","caught","catching","draw","draws","drew",
    "drawn","drawing","choose","chooses","chose","chosen","choosing","cause","causes","caused","causing","point","points","pointed","pointing","listen","listens",
    "listened","listening","realize","realizes","realized","realizing","place","places","placed","placing","close","closes","closed","closing","involve","involves",
    "involved","involving","increase","increases","increased","increasing","prefer","prefers","preferred","preferring",
    "reduce","reduces","reduced","reducing","describe","describes","described","describing","prepare","prepares","prepared",
    "preparing","improve","improves","improved","improving","manage","manages","managed","managing","miss","misses","missed","missing","protect","protects",
    "protected","protecting","act","acts","acted","acting","express","expresses","expressed","expressing","finish","finishes",
    "finished","finishing","imagine","imagines","imagined","imagining","notice","notices","noticed","noticing","prevent",
    "prevents","prevented","preventing","promise","promises","promised","promising","recognize","recognizes","recognized",
    "recognizing","relate","relates","related","relating","replace","replaces","replaced","replacing","save","saves","saved","saving","share","shares","shared",
    "sharing","suppose","supposes","supposed","supposing","survive","survives","survived","surviving","teach","teaches","taught","teaching","tend","tends","tended",
    "tending","test","tests","tested","testing","treat","treats","treated","treating","vote","votes","voted","voting","warn","warns","warned","warning","wonder",
    "wonders","wondered","wondering","worry","worries","worried","worrying","accept","accepts","accepted","accepting",
    "affect","affects","affected","affecting","announce","announces","announced","announcing","arrive","arrives","arrived",
    "arriving","attach","attaches","attached","attaching","attempt","attempts","attempted","attempting","attend","attends","attended","attending","attract","attracts",
    "attracted","attracting","avoid","avoids","avoided","avoiding","base","bases","based","basing","beat","beats","beating","belong","belongs","belonged",
    "belonging","borrow","borrows","borrowed","borrowing","bother","bothers","bothered","bothering","care","cares","cared","caring","celebrate","celebrates","celebrated",
    "celebrating","claim","claims","claimed","claiming","clean","cleans","cleaned","cleaning","collect","collects","collected","collecting","combine","combines","combined",
    "combining","complain","complains","complained","complaining","complete","completes","completed","completing","concentrate","concentrates","concentrated","concentrating",
    "confirm","confirms","confirmed","confirming","connect","connects","connected","connecting","contain","contains","contained","containing","contribute","contributes",
    "contributed","contributing","control","controls","controlled","controlling","cook","cooks","cooked","cooking","correct","corrects","corrected","correcting","cost",
    "costs","costing","count","counts","counted","counting","cross","crosses","crossed","crossing","damage","damages",
    "damaged","damaging","dance","dances","danced","dancing","deal","deals","dealt","dealing","deliver","delivers","delivered","delivering","depend","depends","depended",
    "depending","design","designs","designed","designing","destroy","destroys","destroyed","destroying","discuss","discusses","discussed","discussing","divide","divides","divided","dividing",
    "dress","dresses","dressed","dressing","drink","drinks","drank","drunk","drinking","drive","drives","drove","driven","driving","drop","drops","dropped","dropping",
    "earn","earns","earned","earning","educate","educates","educated","educating","employ","employs","employed","employing","encourage","encourages","encouraged","encouraging",
    "enjoy","enjoys","enjoyed","enjoying","examine","examines","examined","examining","exist","exists","existed","existing","expand","expands","expanded","expanding",
    "experience","experiences","experienced","experiencing","explore","explores","explored","exploring","extend","extends","extended","extending","face","faces","faced","facing",
    "fail","fails","failed","failing","feed","feeds","fed","feeding","fight","fights","fought","fighting","fill","fills","filled","filling","film","films","filmed",
    "filming","fit","fits","fitted","fitting","fix","fixes","fixed","fixing","fold","folds","folded","folding","force","forces","forced","forcing","form","forms","formed","forming",
    "frame","frames","framed","framing","gather","gathers","gathered","gathering","gaze","gazes","gazed","gazing","generate","generates","generated","generating",
    "glance","glances","glanced","glancing","grab","grabs","grabbed","grabbing","guess","guesses","guessed","guessing","handle","handles","handled","handling",
    "hang","hangs","hung","hanging","happen","happens","happened","happening","hate","hates","hated","hating","hide","hides","hid","hidden","hiding",
    "hug","hugs","hugged","hugging","hunt","hunts","hunted","hunting","hurry","hurries","hurried","hurrying","identify","identifies","identified","identifying",
    "ignore","ignores","ignored","ignoring","inform","informs","informed","informing","insist","insists","insisted","insisting","intend","intends","intended","intending",
    "introduce","introduces","introduced","introducing","invite","invites","invited","inviting","join","joins","joined","joining","jump","jumps","jumped","jumping",
    "kick","kicks","kicked","kicking","kiss","kisses","kissed","kissing","knock","knocks","knocked","knocking","laugh","laughs","laughed","laughing",
    "lay","lays","laid","laying","lend","lends","lent","lending","lie","lies","lying","lift","lifts","lifted","lifting","mark","marks","marked","marking",
    "marry","marries","married","marrying","match","matches","matched","matching","matter","matters","mattered","mattering","mean","means","meant","meaning",
    "mention","mentions","mentioned","mentioning","mind","minds","minded","minding","order","orders","ordered","ordering","own","owns","owned","owning",
    "paint","paints","painted","painting","pick","picks","picked","picking","plan","plans","planned","planning","press","presses","pressed","pressing",
    "prove","proves","proved","proving","push","pushes","pushed","pushing","qualify","qualifies","qualified","qualifying","question","questions","questioned","questioning",
    "record","records","recorded","recording","refer","refers","referred","referring","reflect","reflects","reflected","reflecting","refuse","refuses","refused","refusing",
    "regard","regards","regarded","regarding","relax","relaxes","relaxed","relaxing","release","releases","released","releasing","remove","removes","removed","removing",
    "repair","repairs","repaired","repairing","repeat","repeats","repeated","repeating","reply","replies","replied","replying","represent","represents","represented","representing",
    "rest","rests","rested","resting","result","results","resulted","resulting","reveal","reveals","revealed","revealing","ride","rides","rode","ridden","riding",
    "ring","rings","rang","rung","ringing","rise","rises","rose","risen","rising","risk","risks","risked","risking","roll","rolls","rolled","rolling",
    "settle","settles","settled","settling","shake","shakes","shook","shaken","shaking","shoot","shoots","shot","shooting","shut","shuts","shutting",
    "sing","sings","sang","sung","singing","sleep","sleeps","slept","sleeping","slide","slides","slid","sliding","smile","smiles","smiled","smiling",
    "solve","solves","solved","solving","sound","sounds","sounded","sounding","study","studies","studied","studying","succeed","succeeds","succeeded","succeeding",
    "suffer","suffers","suffered","suffering","supply","supplies","supplied","supplying","swim","swims","swam","swum","swimming","thank","thanks","thanked","thanking",
    "throw","throws","threw","thrown","throwing","touch","touches","touched","touching","train","trains","trained","training","travel","travels","traveled","traveling",
    "visit","visits","visited","visiting","wish","wishes","wished","wishing"
];

const famousQuotes = {
    motivational: [
        "The only way to do great work is to love what you do. — Steve Jobs",
        "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
        "You miss 100% of the shots you don't take. — Wayne Gretzky",
        "The best way to predict the future is to invent it. — Alan Kay",
        "Do not wait to strike till the iron is hot; but make it hot by striking. — William Butler Yeats",
        "Whether you think you can or you think you can't, you're right. — Henry Ford",
        "The journey of a thousand miles begins with one step. — Lao Tzu",
        "It always seems impossible until it's done. — Nelson Mandela",
        "In the middle of difficulty lies opportunity. — Albert Einstein",
        "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
        "Believe you can and you're halfway there. — Theodore Roosevelt",
        "Act as if what you do makes a difference. It does. — William James",
        "What you get by achieving your goals is not as important as what you become by achieving your goals. — Zig Ziglar",
        "Dream big and dare to fail. — Norman Vaughan",
        "Keep your face always toward the sunshine—and shadows will fall behind you. — Walt Whitman",
        "The harder you work for something, the greater you'll feel when you achieve it. — Unknown",
        "Push yourself, because no one else is going to do it for you. — Unknown",
        "Great things never come from comfort zones. — Unknown",
        "Success doesn't just find you. You have to go out and get it. — Unknown",
        "The key to success is to focus our conscious mind on things we desire not things we fear. — Brian Tracy",
        "Don’t watch the clock; do what it does. Keep going. — Sam Levenson",
        "Opportunities don't happen. You create them. — Chris Grosser",
        "Don’t be afraid to give up the good to go for the great. — John D. Rockefeller",
        "I find that the harder I work, the more luck I seem to have. — Thomas Jefferson",
        "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
        "If you are not willing to risk the usual, you will have to settle for the ordinary. — Jim Rohn",
    ],
    literary: [
        "Be yourself; everyone else is already taken. — Oscar Wilde",
        "A room without books is like a body without a soul. — Marcus Tullius Cicero",
        "You only live once, but if you do it right, once is enough. — Mae West",
        "In three words I can sum up everything I've learned about life: it goes on. — Robert Frost",
        "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. — Ralph Waldo Emerson",
        "It is better to be hated for what you are than to be loved for what you are not. — Andre Gide",
        "Good friends, good books, and a sleepy conscience: this is the ideal life. — Mark Twain",
        "We accept the love we think we deserve. — Stephen Chbosky",
        "Not all those who wander are lost. — J.R.R. Tolkien",
        "There is no greater agony than bearing an untold story inside you. — Maya Angelou",
        "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
        "All the world's a stage, and all the men and women merely players. — William Shakespeare",
        "It does not do to dwell on dreams and forget to live. — J.K. Rowling",
        "So we beat on, boats against the current, borne back ceaselessly into the past. — F. Scott Fitzgerald",
        "Whatever our souls are made of, his and mine are the same. — Emily Brontë",
        "There is some good in this world, and it’s worth fighting for. — J.R.R. Tolkien",
        "It matters not what someone is born, but what they grow to be. — J.K. Rowling",
        "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
        "The purpose of literature is to turn blood into ink. — T.S. Eliot",
        "The books that the world calls immoral are books that show the world its own shame. — Oscar Wilde",
        "We are all in the gutter, but some of us are looking at the stars. — Oscar Wilde",
        "There is no friend as loyal as a book. — Ernest Hemingway",
        "Not all those who wander are lost. — J.R.R. Tolkien",
        "It is our choices that show what we truly are, far more than our abilities. — J.K. Rowling",
    ],
    philosophical: [
        "Two things are infinite: the universe and human stupidity. — Albert Einstein",
        "Life is what happens when you're busy making other plans. — John Lennon",
        "Darkness cannot drive out darkness; only light can do that. — Martin Luther King Jr.",
        "Without music, life would be a mistake. — Friedrich Nietzsche",
        "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
        "The unexamined life is not worth living. — Socrates",
        "He who thinks great thoughts, often makes great errors. — Martin Heidegger",
        "The mind is everything. What you think you become. — Buddha",
        "Happiness depends upon ourselves. — Aristotle",
        "The only true wisdom is in knowing you know nothing. — Socrates",
        "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
        "The greatest wealth is to live content with little. — Plato",
        "Man is condemned to be free. — Jean-Paul Sartre",
        "The only thing I know is that I know nothing. — Socrates",
        "The measure of a man is what he does with power. — Plato",
        "The more I read, the more I acquire, the more certain I am that I know nothing. — Voltaire",
        "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
        "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. — Albert Camus",
        "The greatest happiness you can have is knowing that you do not necessarily require happiness. — William Saroyan",
        "The only thing necessary for the triumph of evil is for good men to do nothing. — Edmund Burke",
        "The more you know, the more you realize you know nothing. — Aristotle",
        "The mind is everything. What you think you become. — Buddha",
        "The only thing I know is that I know nothing. — Socrates",
        "The greatest wealth is to live content with little. — Plato",
    ]
};

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
    ,
    // --- Longer JavaScript Example ---
    `function processData(data) {\n    let result = [];\n    for (let i = 0; i < data.length; i++) {\n        if (data[i].active) {\n            let transformed = {\n                id: data[i].id,\n                name: data[i].name.toUpperCase(),\n                score: data[i].score * 1.5\n            };\n            result.push(transformed);\n        }\n    }\n    return result;\n}\n\nconst users = [\n    {id: 1, name: 'Alice', score: 80, active: true},\n    {id: 2, name: 'Bob', score: 65, active: false},\n    {id: 3, name: 'Carol', score: 92, active: true}\n];\nconsole.log(processData(users));`,

    // --- Longer Python Example ---
    `def analyze_scores(students):\n    results = []\n    for student in students:\n        if student['active']:\n            score = student['score'] * 1.2\n            results.append({\n                'id': student['id'],\n                'name': student['name'].upper(),\n                'score': score\n            })\n    return results\n\nstudents = [\n    {'id': 1, 'name': 'Alice', 'score': 80, 'active': True},\n    {'id': 2, 'name': 'Bob', 'score': 65, 'active': False},\n    {'id': 3, 'name': 'Carol', 'score': 92, 'active': True}\n]\nprint(analyze_scores(students))`,

    // --- Longer SQL Example ---
    `SELECT u.id, u.name, SUM(o.amount) AS total_spent\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE u.active = 1\nGROUP BY u.id, u.name\nHAVING total_spent > 100\nORDER BY total_spent DESC;\n\n-- Example data:\n-- users: id, name, active\n-- orders: id, user_id, amount`
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

// ============ SOUND FEEDBACK ============
function playKeyClick() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(); osc.stop(ctx.currentTime + 0.04);
        osc.onended = () => ctx.close();
    } catch {}
}

// ============ TODAY'S GOAL WIDGET ============
function getDailyGoal() {
    return parseInt(safeLocalStorage.getItem('typeflow-daily-goal') || '3', 10);
}

function setDailyGoal(val) {
    safeLocalStorage.setItem('typeflow-daily-goal', val);
    updateGoalWidget();
}

function updateGoalWidget() {
    const DAILY_GOAL = getDailyGoal();
    const today = new Date().toDateString();
    let wpmHistory = safeLocalStorage.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}', {});
    // MIGRATION: Convert old array format to object format if needed
    if (Array.isArray(wpmHistory)) {
        const arr = wpmHistory;
        wpmHistory = {};
        arr.forEach((e, i) => { wpmHistory[i + 1] = e; });
        safeLocalStorage.setItem('typeflow-wpm-history', safeLocalStorage.stringify(wpmHistory));
    }
    // MIGRATION: Convert any old date fields from toLocaleDateString() to toDateString() format
    let migrated = false;
    Object.values(wpmHistory).forEach(e => {
        if (e.date && !isNaN(Date.parse(e.date)) && !/^\w{3} \w{3} \d{1,2} \d{4}$/.test(e.date)) {
            const d = new Date(e.date);
            const newDate = d.toDateString();
            if (e.date !== newDate) {
                e.date = newDate;
                migrated = true;
            }
        }
    });
    if (migrated) {
        safeLocalStorage.setItem('typeflow-wpm-history', safeLocalStorage.stringify(wpmHistory));
    }
    let testsToday = Object.values(wpmHistory).filter(e => e.date === today).length;
    const goalTotal        = document.getElementById('goal-total');
    const goalTotal2       = document.getElementById('goal-total-2');
    const goalProgressCount = document.getElementById('goal-progress-count');
    const goalBar          = document.getElementById('goal-progress-bar');
    if (goalTotal)         goalTotal.textContent        = DAILY_GOAL;
    if (goalTotal2)        goalTotal2.textContent       = DAILY_GOAL;
    if (goalProgressCount) goalProgressCount.textContent = testsToday;
    if (goalBar)           goalBar.style.width          = Math.min(100, (testsToday / DAILY_GOAL) * 100) + '%';
    const goalSelect = document.getElementById('goal-select');
    if (goalSelect && parseInt(goalSelect.value, 10) !== DAILY_GOAL) goalSelect.value = DAILY_GOAL;
}

// ============ TEST ENGINE ============

class TestEngine {
    constructor() {
        this.currentText          = "";
        this.currentPosition      = 0;
        this.correctChars         = 0;
        this.incorrectChars       = 0;
        this.isActive             = false;
        this.startTime            = null;
        this.timerInterval        = null;
        this.timeLimit            = 15;
        this.timeLeft             = 15;
        this.mistakesByChar       = {};
        this.waitingForFirstInput = false;
        this.wordCountMode        = false;
        this.ghostCursorInterval  = null;  // FIX: moved from dangling global declarations into class
        this.ghostCursorPos       = null;

        this.textDisplay     = document.getElementById("text-display");
        this.input           = document.getElementById("typing-input");
        this.wpmDisplay      = document.getElementById("wpm");
        this.accuracyDisplay = document.getElementById("accuracy");
        this.timerDisplay    = document.getElementById("timer");

        this.miniWPMGraphCanvas = document.getElementById("mini-wpm-graph");
        this.miniWPMChart       = null;
        this.liveWPMHistory     = [];
        this.liveWPMInterval    = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener("input",  (e) => { this.handleTyping(e); });
        this.input.addEventListener("keydown", (e) => {
            playKeyClick();
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
            // Flatten all categories into one array
            const allQuotes = Object.values(famousQuotes).flat();
            let candidates = allQuotes.filter(q => {
                const match = q.match(/^(.*?)(?:\s*[\u2014-]\s*|\s*-\s*)(.+)$/);
                const text = match ? match[1] : q;
                return text && text.length >= 120;
            });
            if (candidates.length === 0) candidates = allQuotes;
            const raw = candidates[Math.floor(Math.random() * candidates.length)];
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

    // FIX: Extracted ghost cursor methods from the mangled displayText code into proper class methods
    startGhostCursor() {
        this.stopGhostCursor();
        const bestWPM = progressManager?.data?.bestWPM || 0;
        if (!bestWPM || !this.currentText) return;
        this.ghostCursorPos = 0;
        const msPerChar = 12000 / bestWPM;
        this.ghostCursorInterval = setInterval(() => {
            if (this.ghostCursorPos < this.currentText.length) {
                this.ghostCursorPos++;
                this.displayText();
            } else {
                this.stopGhostCursor();
            }
        }, msPerChar);
    }

    stopGhostCursor() {
        if (this.ghostCursorInterval) {
            clearInterval(this.ghostCursorInterval);
            this.ghostCursorInterval = null;
        }
        this.ghostCursorPos = null;
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
                if (this.ghostCursorPos !== null && i === this.ghostCursorPos && this.ghostCursorPos !== this.currentPosition) {
                    return `<span class="ghost-cursor" style="opacity:0.35;">|</span><span class="${cls}">${this.formatChar(char)}</span>`;
                }
                return `<span class="${cls}">${this.formatChar(char)}</span>`;
            }).join("");

            // FIX: Build author HTML once, not twice (was double-rendering the quote block)
            let authorHtml = '';
            if (this.currentAuthor) {
                authorHtml = `<div class="quote-author">— ${this.currentAuthor}</div>`;
            }
            this.textDisplay.innerHTML = `<div class="quote-main">${html}</div>${authorHtml}`;

            const currentChar = this.textDisplay.querySelector('.current');
            if (currentChar) currentChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

        } else if (mode === 'code') {
            const html = this.currentText.split("").map((char, i) => {
                let cls = "char";
                if (i < this.currentPosition) {
                    cls += typedText[i] === char ? " correct" : " incorrect";
                } else if (i === this.currentPosition) {
                    cls += " current";
                }
                if (i < hideUntil) cls += " gone";
                return `<span class="${cls}">${char === ' ' ? '&nbsp;' : this.formatChar(char)}</span>`;
            }).join("");
            this.textDisplay.innerHTML = `<pre class="code-block">${html}</pre>`;
            const currentChar = this.textDisplay.querySelector('.current');
            if (currentChar) currentChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

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
            const currentChar = this.textDisplay.querySelector('.current');
            if (currentChar) currentChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
        this.isActive        = false;
        this.currentPosition = 0;
        this.correctChars    = 0;
        this.incorrectChars  = 0;
        this.mistakesByChar  = {};
        this.startTime       = null;
        this.timeLeft        = this.timeLimit;

        // FIX: Ghost cursor only starts after a delay, not immediately on start
        // (was calling startGhostCursor then stopGhostCursor right after, immediately cancelling it)
        this.stopGhostCursor();

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
            if (this.timeLeft <= 0) this.end();
        }, 1000);
        if (!progressManager.hasAchievement('first-test')) progressManager.unlockAchievement('first-test');
        if ((progressManager.data.testsTaken || 0) >= 10 && !progressManager.hasAchievement('10tests')) progressManager.unlockAchievement('10tests');
        if ((progressManager.data.streakDays || 0) >= 7  && !progressManager.hasAchievement('7day-streak')) progressManager.unlockAchievement('7day-streak');
    }

    updateTimerDisplay() {
        const wordCountMode = document.querySelector('.word-count-btn.active')?.dataset.count;
        if (wordCountMode) {
            const wordsTyped = this.input.value.trim().split(/\s+/).filter(Boolean).length;
            const wordsLeft  = Math.max(0, parseInt(wordCountMode, 10) - wordsTyped);
            this.timerDisplay.textContent = wordsLeft;
            const label = this.timerDisplay.parentElement.querySelector('.stat-label');
            if (label) label.textContent = 'Words';
            if (wordsLeft === 0 && this.isActive) { this.end(); }
        } else {
            this.timerDisplay.textContent = this.isTimedMode() ? Math.max(this.timeLeft, 0) : '∞';
            const label = this.timerDisplay.parentElement.querySelector('.stat-label');
            if (label) label.textContent = 'Time';
        }
    }

    handleTyping() {
        if (!this.isActive) {
            if (this.input.value.length > 0) {
                this.isActive  = true;
                this.startTime = Date.now();
                this.startTimer();
                this.waitingForFirstInput = false;
            } else {
                return;
            }
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
                let keyStats = safeLocalStorage.parse(safeLocalStorage.getItem('typeflow-key-stats') || '{}', {});
                const k = newChar.toLowerCase();
                keyStats[k] = (keyStats[k] || 0) + 1;
                safeLocalStorage.setItem('typeflow-key-stats', safeLocalStorage.stringify(keyStats));
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
        const typedText      = this.input.value;
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
        if (reset) {
            this.wpmDisplay.textContent      = "0";
            this.accuracyDisplay.textContent = "100%";
            const pbBadge = document.getElementById('pb-badge');
            if (pbBadge) pbBadge.style.display = 'none';
            return;
        }
        const elapsed    = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
        const currentWPM = Math.round((this.correctChars / 5) / elapsed) || 0;
        this.wpmDisplay.textContent = currentWPM;
        const total = this.correctChars + this.incorrectChars;
        this.accuracyDisplay.textContent = `${total > 0 ? Math.round((this.correctChars / total) * 100) : 100}%`;
        const pbBadge = document.getElementById('pb-badge');
        const bestWPM = progressManager?.data?.bestWPM || 0;
        if (pbBadge) {
            pbBadge.style.display = (bestWPM > 0 && currentWPM >= bestWPM) ? '' : 'none';
        }
    }

    end() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.timerInterval);
        clearInterval(this.liveWPMInterval);
        this.stopGhostCursor();
        this.input.disabled = true;
        this.updateStats();

        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = this.isTimedMode()
            ? (this.timeLimit - this.timeLeft)
            : Math.floor((Date.now() - this.startTime) / 1000);

        const isNewBest = wpm > (progressManager.data.bestWPM || 0);

        progressManager.updateTestStats(wpm, accuracy, duration, this.mistakesByChar);
        progressManager.updateStreak();
        const xpGained = this.calculateXP(wpm, accuracy);
        progressManager.addXP(xpGained);

        if (!progressManager.hasAchievement('first-test'))                                         progressManager.unlockAchievement('first-test');
        if (wpm >= 30  && !progressManager.hasAchievement('30wpm'))                               progressManager.unlockAchievement('30wpm');
        if (wpm >= 50  && !progressManager.hasAchievement('50wpm'))                               progressManager.unlockAchievement('50wpm');
        if (wpm >= 75  && !progressManager.hasAchievement('75wpm'))                               progressManager.unlockAchievement('75wpm');
        if (wpm >= 100 && !progressManager.hasAchievement('100wpm'))                              progressManager.unlockAchievement('100wpm');
        if (accuracy === 100 && !progressManager.hasAchievement('100accuracy'))                   progressManager.unlockAchievement('100accuracy');
        if ((progressManager.data.testsTaken||0) >= 10  && !progressManager.hasAchievement('10tests'))  progressManager.unlockAchievement('10tests');
        if ((progressManager.data.testsTaken||0) >= 50  && !progressManager.hasAchievement('50tests'))  progressManager.unlockAchievement('50tests');
        if ((progressManager.data.testsTaken||0) >= 100 && !progressManager.hasAchievement('100tests')) progressManager.unlockAchievement('100tests');
        if ((progressManager.data.streakDays||0) >= 5   && !progressManager.hasAchievement('5day-streak'))  progressManager.unlockAchievement('5day-streak');
        if ((progressManager.data.streakDays||0) >= 7   && !progressManager.hasAchievement('7day-streak'))  progressManager.unlockAchievement('7day-streak');
        if ((progressManager.data.streakDays||0) >= 30  && !progressManager.hasAchievement('30day-streak')) progressManager.unlockAchievement('30day-streak');
        if (this.timeLimit === 15 && this.incorrectChars === 0 && wpm > 0 && !progressManager.hasAchievement('speed-demon')) progressManager.unlockAchievement('speed-demon');

        let wpmHistory = {};
        try { wpmHistory = JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}'); } catch { wpmHistory = {}; }
        if (Array.isArray(wpmHistory)) {
            const arr = wpmHistory;
            wpmHistory = {};
            arr.forEach((e, i) => { wpmHistory[i + 1] = e; });
        }
        let nextIndex = 1;
        const indices = Object.keys(wpmHistory).map(Number).filter(n => !isNaN(n));
        if (indices.length > 0) nextIndex = Math.max(...indices) + 1;
        wpmHistory[nextIndex] = { date: new Date().toDateString(), wpm };
        safeLocalStorage.setItem('typeflow-wpm-history', JSON.stringify(wpmHistory));

        // FIX: Render accuracy breakdown chart using stored results modal canvas
        const breakdownCanvas = document.getElementById('accuracy-breakdown-chart');
        if (breakdownCanvas && this.currentText && typeof this.currentText === 'string') {
            const totalLen = this.currentText.length;
            const typed    = this.input.value;
            const thirds   = [
                { start: 0,                          end: Math.floor(totalLen / 3) },
                { start: Math.floor(totalLen / 3),   end: Math.floor(2 * totalLen / 3) },
                { start: Math.floor(2 * totalLen / 3), end: totalLen }
            ];
            const accs = thirds.map(({ start, end }) => {
                let correct = 0, total = 0;
                for (let i = start; i < end && i < typed.length; i++) {
                    total++;
                    if (typed[i] === this.currentText[i]) correct++;
                }
                return total ? Math.round((correct / total) * 100) : 0;
            });
            if (window.accuracyBreakdownChart) window.accuracyBreakdownChart.destroy();
            window.accuracyBreakdownChart = new Chart(breakdownCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Start', 'Middle', 'End'],
                    datasets: [{
                        label: 'Accuracy',
                        data: accs,
                        backgroundColor: ['#2a9d8f','#e9c46a','#e76f51'],
                        borderRadius: 6,
                        barPercentage: 0.7,
                        categoryPercentage: 0.6,
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 12 } } },
                        y: { beginAtZero: true, max: 100, grid: { display: false }, ticks: { stepSize: 20, font: { size: 11 } } }
                    },
                    animation: false,
                    responsive: false,
                }
            });
        }

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
        if (accuracy >= 95)      xp += 50;
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
        if (accuracy >= 95 && wpm >= 40)        { badge.textContent = "Excellent";   badge.className = "rating-badge excellent"; }
        else if (accuracy >= 85 && wpm >= 30)   { badge.textContent = "Good";        badge.className = "rating-badge good"; }
        else                                    { badge.textContent = "Needs Work";  badge.className = "rating-badge needs-work"; }

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableEls = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => !el.disabled && el.offsetParent !== null);
        if (focusableEls.length) focusableEls[0].focus();

        function trapFocus(e) {
            if (!modal.classList.contains('hidden')) {
                if (e.key === 'Tab') {
                    const first = focusableEls[0];
                    const last  = focusableEls[focusableEls.length - 1];
                    if (e.shiftKey) {
                        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
                    } else {
                        if (document.activeElement === last)  { first.focus(); e.preventDefault(); }
                    }
                } else if (e.key === 'Escape') {
                    modal.classList.add('hidden');
                    testEngine.reset(false);
                }
            }
        }
        window.addEventListener('keydown', trapFocus);
        function cleanupTrap() { window.removeEventListener('keydown', trapFocus); }
        modal.addEventListener('transitionend', () => { if (modal.classList.contains('hidden')) cleanupTrap(); });
        focusableEls.forEach(btn => btn.addEventListener('click', cleanupTrap));

        if (isNewBest) { launchConfettiOverModal(modal); }
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
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const ctx    = confettiCanvas.getContext('2d');
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
            ctx.fillStyle    = p.color;
            ctx.globalAlpha  = 0.85;
            ctx.fill();
            ctx.globalAlpha  = 1;
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

        document.getElementById("lesson-title").textContent       = lesson.title;
        document.getElementById("lesson-description").textContent = lesson.description;
        document.getElementById("focus-keys").querySelector("span").textContent = lesson.focusKeys;

        this.displayText();
        this.updateStats(true);

        if (this._boundHandler) this.input.removeEventListener("input", this._boundHandler);
        this._boundHandler = () => this.handleTyping();
        this.input.addEventListener("input", this._boundHandler);
        this.input.addEventListener("keydown", () => playKeyClick());
    }

    displayText() {
        const typedText = this.input.value;
        let idx = 0, html = "";
        const parts = this.currentText.split(/(<span class='weak-highlight'>.*?<\/span>)/g).filter(Boolean);
        for (const part of parts) {
            if (part.startsWith("<span class='weak-highlight'>")) {
                const inner = part.replace(/^<span class='weak-highlight'>|<\/span>$/g, "");
                for (const char of [...inner]) {
                    let cls = "char weak-highlight";
                    if (idx < this.currentPosition)        cls += typedText[idx] === char ? " correct" : " incorrect";
                    else if (idx === this.currentPosition)  cls += " current";
                    html += `<span class="${cls}">${char === " " ? " " : char}</span>`;
                    idx++;
                }
            } else {
                for (const char of [...part]) {
                    let cls = "char";
                    if (idx < this.currentPosition)        cls += typedText[idx] === char ? " correct" : " incorrect";
                    else if (idx === this.currentPosition)  cls += " current";
                    html += `<span class="${cls}">${char === " " ? " " : char}</span>`;
                    idx++;
                }
            }
        }
        this.textDisplay.innerHTML = html;
    }

    handleTyping() {
        if (!this.isActive && this.input.value.length > 0) { this.isActive = true; this.startTime = Date.now(); }
        this.currentPosition = this.input.value.length;
        if (this.currentLesson && !progressManager.data.completedLessons.includes(this.currentLesson.id)) {
            const percent = Math.round((this.currentPosition / this.currentText.length) * 100);
            safeLocalStorage.setItem(`lesson-progress-${this.currentLesson.id}`, percent);
        }
        if (this.currentPosition >= this.currentText.length) { this.completeLesson(); return; }
        this.recalculateFromInput();
        this.updateStats();
        this.displayText();
    }

    recalculateFromInput() {
        const typedText  = this.input.value;
        this.correctChars   = 0;
        this.incorrectChars = 0;
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
        this.isActive       = false;
        this.input.disabled = true;
        const wpm      = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.currentLesson) safeLocalStorage.removeItem(`lesson-progress-${this.currentLesson.id}`);

        if (accuracy >= this.currentLesson.minAccuracy && wpm >= this.currentLesson.minWPM) {
            progressManager.completeLesson(this.currentLesson.id);
            this.showLessonComplete(wpm, accuracy, duration, this.currentLesson.xpReward);
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
        if (this.currentLesson) safeLocalStorage.setItem(`lesson-progress-${this.currentLesson.id}`, 0);
        this.currentText = this.generateLessonText(this.currentLesson);
        this.displayText(); this.updateStats(true);
    }
}

// ============ WEAK KEY PRACTICE ENGINE ============

class PracticeEngine {
    constructor() {
        this.stopRequested   = false;  // FIX: moved class field into constructor for broad compatibility
        this.currentText     = "";
        this.highlightIndices = new Set();
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
        if (weakKeys.length === 0) {
            this.highlightIndices = new Set();
            return "Practice makes perfect. Keep typing to improve your skills.";
        }
        const targetChars = weakKeys.map(([c]) => c.toLowerCase());
        const { text, highlightIndices } = this.buildPracticeTextData(targetChars, 40);
        this.highlightIndices = highlightIndices;
        return text;
    }

    buildPracticeTextData(targetChars, wordCount = 40) {
        const words = [];
        const highlightIndices = new Set();
        let charIdx = 0;
        for (let i = 0; i < wordCount; i++) {
            const word = Math.random() < 0.7 ? this.findWordWithChars(targetChars) : baseWords[Math.floor(Math.random() * baseWords.length)];
            for (let j = 0; j < word.length; j++) {
                if (targetChars.includes(word[j].toLowerCase())) highlightIndices.add(charIdx + j);
            }
            words.push(word);
            charIdx += word.length + 1;
        }
        return { text: words.join(" ") + ".", highlightIndices };
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
        this.input.addEventListener("keydown", () => playKeyClick());
        this.isActive  = true;
        this.startTime = Date.now();
        this.updateStats();
        document.getElementById('practice-countdown').style.display = 'none';
        this.stopRequested = false;
    }

    displayText() {
        const typedText = this.input.value;
        let html = "";
        for (let idx = 0; idx < this.currentText.length; idx++) {
            const char = this.currentText[idx];
            let cls = "char";
            if (this.highlightIndices.has(idx)) cls += " weak-highlight";
            if (idx < this.currentPosition)        cls += typedText[idx] === char ? " correct" : " incorrect";
            else if (idx === this.currentPosition)  cls += " current";
            html += `<span class="${cls}">${char === " " ? " " : char}</span>`;
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
        const typedText  = this.input.value;
        this.correctChars   = 0;
        this.incorrectChars = 0;
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
        this.errorsDisplay.textContent   = this.incorrectChars;
    }

    complete() {
        this.isActive = false; this.input.disabled = true;
        const countdownEl = document.getElementById('practice-countdown');
        let countdown = 3;
        if (countdownEl) {
            countdownEl.style.display = '';
            countdownEl.textContent   = `Well done! Starting next round in ${countdown}…`;
        }
        const tick = () => {
            countdown--;
            if (this.stopRequested) {
                if (countdownEl) countdownEl.style.display = 'none';
                return;
            }
            if (countdownEl && countdown > 0) {
                countdownEl.textContent = `Well done! Starting next round in ${countdown}…`;
                setTimeout(tick, 1000);
            } else {
                if (countdownEl) countdownEl.style.display = 'none';
                this.start();
            }
        };
        setTimeout(tick, 1000);
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
        this.currentKey               = keyChar.toLowerCase();
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
        this.fingerCorrect.textContent  = this.correctCount;
        this.fingerWrong.textContent    = this.wrongCount;
        const total = this.correctCount + this.wrongCount;
        this.fingerAccuracy.textContent = `${total > 0 ? Math.round((this.correctCount / total) * 100) : 100}%`;
    }

    reset() {
        this.drillActive  = false;
        this.currentKey   = null;
        this.correctCount = 0;
        this.wrongCount   = 0;
        this.fingerDrillStats.style.display  = 'none';
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
        const isUnlocked  = (idx === 0) || progressManager.data.completedLessons.includes(LESSON_DATA[idx - 1]?.id);
        const isLocked    = !isUnlocked || isCompleted;
        const card        = document.createElement("div");
        card.className    = `lesson-card ${isLocked && !isCompleted ? "locked" : ""} ${isCompleted ? "completed" : ""}`;

        if (isLocked && !isCompleted) {
            let prevLesson   = LESSON_DATA[idx - 1];
            let tooltip      = prevLesson ? `Unlock by completing previous lesson with ≥${prevLesson.minAccuracy}% accuracy & ≥${prevLesson.minWPM} WPM` : "Complete previous lesson to unlock";
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
                const lastProgress = safeLocalStorage.getItem(`lesson-progress-${lesson.id}`);
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

function renderWPMLineChart() {
    const canvas = document.getElementById('wpm-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let wpmHistory = {};
    try { wpmHistory = JSON.parse(safeLocalStorage.getItem('typeflow-wpm-history') || '{}'); } catch { wpmHistory = {}; }
    if (Array.isArray(wpmHistory)) {
        const arr = wpmHistory;
        wpmHistory = {};
        arr.forEach((e, i) => { wpmHistory[i + 1] = e; });
        safeLocalStorage.setItem('typeflow-wpm-history', safeLocalStorage.stringify(wpmHistory));
    }
    const allEntries = Object.entries(wpmHistory)
        .map(([idx, e]) => ({ ...e, idx: parseInt(idx, 10) }))
        .sort((a, b) => a.idx - b.idx);
    const N       = 20;
    const visible = allEntries.slice(-N);

    if (window._wpmChart) { window._wpmChart.destroy(); }
    const wpmData = visible.map(e => e.wpm);
    const pb      = wpmData.length ? Math.max(...wpmData) : null;
    const pbLine  = pb !== null ? Array(wpmData.length).fill(pb) : [];

    window._wpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: visible.map((e) => `Test #${e.idx}`),
            datasets: [
                {
                    label: 'WPM',
                    data: wpmData,
                    borderColor: '#e07a5f',
                    backgroundColor: 'rgba(224,122,95,0.12)',
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#e07a5f',
                    fill: true,
                },
                {
                    label: 'Personal Best',
                    data: pbLine,
                    borderColor: '#2a9d8f',
                    borderDash: [6, 6],
                    pointRadius: 0,
                    pointHitRadius: 0,
                    fill: false,
                    tension: 0,
                    borderWidth: 2,
                    order: 0,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true }, tooltip: { enabled: true } },
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
    let keyStats = safeLocalStorage.parse(safeLocalStorage.getItem('typeflow-key-stats') || '{}', {});

    const QWERTY_ROWS = [
        ['1','2','3','4','5','6','7','8','9','0','-','='],
        ['q','w','e','r','t','y','u','i','o','p','[',']'],
        ['a','s','d','f','g','h','j','k','l',';',"'"],
        ['z','x','c','v','b','n','m',',','.','/']
    ];

    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const max    = Math.max(...Object.values(keyStats), 1);
    grid.innerHTML = '';

    QWERTY_ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'heatmap-row';

        row.forEach(k => {
            const freq   = keyStats[k] || 0;
            const isWeak = weakKeys && weakKeys.some(([wk]) => wk === k);
            const ratio  = freq / max;

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

            const cell     = document.createElement('div');
            cell.className = 'heatmap-key-cell';
            if (freq === 0) cell.classList.add('empty');
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
    const data         = progressManager.data;
    const currentLevel = progressManager.getCurrentLevel();

    document.getElementById("level-badge").textContent       = currentLevel.name;
    document.getElementById("xp-value").textContent          = `${data.xp} XP`;
    document.getElementById("xp-progress").style.width       = `${progressManager.getXPProgress()}%`;
    const xpToNext = progressManager.getXPToNextLevel();
    document.getElementById("xp-next").textContent = xpToNext > 0 ? `${xpToNext} XP to next level` : "Max level reached!";
    document.getElementById("best-wpm-display").textContent  = data.bestWPM;
    document.getElementById("streak-value").textContent      = data.streakDays;
    document.getElementById("avg-accuracy").textContent      = `${data.averageAccuracy}%`;
    document.getElementById("total-time").textContent        = `${Math.floor(data.totalPracticeTime / 60)}m`;
    document.getElementById("completed-lessons").textContent = `${data.completedLessons.length}/${LESSON_DATA.length}`;
    document.getElementById("tests-taken").textContent       = data.testsTaken || 0;

    updateGoalWidget();

    const weakKeysChart = document.getElementById("dashboard-weak-keys");
    const weakKeys      = progressManager.getTopWeakKeys(8);
    if (weakKeys.length === 0) {
        weakKeysChart.innerHTML = '<p class="empty-state">No data yet - start practicing!</p>';
    } else {
        weakKeysChart.innerHTML = "";
        weakKeys.forEach(([char, rate, errors, presses]) => {
            const item     = document.createElement("div");
            item.className = "weak-key-item";
            const percent  = Math.round(rate * 100);
            item.innerHTML = `<span class="weak-key-char">${char}</span><span class="weak-key-count">${percent}% error rate (${errors}/${presses})</span>`;
            weakKeysChart.appendChild(item);
        });
    }

    const achWrap = document.getElementById('dashboard-achievements');
    if (achWrap) {
        achWrap.innerHTML = '';
        const unlocked = (data.achievements || []);
        ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            const badge      = document.createElement('div');
            badge.className  = 'achievement-badge' + (isUnlocked ? '' : ' locked');
            badge.title      = ach.desc;
            badge.innerHTML  = `<span class="badge-icon">${isUnlocked ? ach.icon : '🔒'}</span><span class="badge-name">${ach.name}</span>`;
            if (!isUnlocked) {
                const desc     = document.createElement('span');
                desc.className = 'badge-desc';
                desc.textContent = ach.desc;
                badge.appendChild(desc);
            }
            achWrap.appendChild(badge);
        });
    }

    renderWPMLineChart();
    renderKeyHeatmap(weakKeys);
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
    const sectionMode   = (mode === "quote" || mode === "code") ? "test" : mode;
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
        if (optionsRow) optionsRow.style.display = '';
        const currentSegment = document.querySelector('.segmented-btn.active')?.dataset.mode || 'timed';
        if (timerGroup)     timerGroup.style.display     = currentSegment === 'timed' ? '' : 'none';
        if (wordCountGroup) wordCountGroup.style.display = currentSegment === 'words' ? '' : 'none';
    }

    if      (mode === "lessons")         renderLessons();
    else if (mode === "practice")        { renderWeakKeys(); practiceEngine.start(); }
    else if (mode === "dashboard")       renderDashboard();
    else if (mode === "finger-training") fingerTrainingEngine.reset();
    else if (mode === "test" || mode === "quote" || mode === "code") {
        testEngine.reset(true);
        setTimeout(() => {
            const input = document.getElementById("typing-input");
            if (input && input.offsetParent !== null) input.focus();
        }, 0);
    }

    safeLocalStorage.setItem('typeflow-mode', mode);
}

// ============ THEME MANAGEMENT ============

function getInitialTheme() {
    const stored = safeLocalStorage.getItem("typeflow-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme)  { document.body.setAttribute("data-theme", theme); safeLocalStorage.setItem("typeflow-theme", theme); updateThemeToggle(theme); }
function toggleTheme()      { applyTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark"); }

function updateThemeToggle(theme) {
    const toggle = document.getElementById("theme-toggle");
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
}

// ============ INITIALIZATION ============

// Declare engine globals once
let progressManager, testEngine, lessonEngine, practiceEngine, fingerTrainingEngine;

document.addEventListener("DOMContentLoaded", () => {

    // Instantiate engines ONCE here
    progressManager      = new ProgressManager();
    testEngine           = new TestEngine();
    lessonEngine         = new LessonEngine();
    practiceEngine       = new PracticeEngine();
    fingerTrainingEngine = new FingerTrainingEngine();

    applyTheme(getInitialTheme());
    testEngine.loadNewText();
    testEngine.start(false);

    // Daily goal select
    const goalSelect = document.getElementById('goal-select');
    if (goalSelect) {
        goalSelect.value = getDailyGoal();
        goalSelect.addEventListener('change', e => setDailyGoal(e.target.value));
    }

    // Stop practicing button
    const stopBtn = document.getElementById('practice-stop');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            practiceEngine.stopRequested  = true;
            practiceEngine.input.disabled = true;
            document.getElementById('practice-countdown').style.display = 'none';
        });
    }

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
    }

    document.getElementById('segmented-timed').addEventListener('click', () => setModeSegmented('timed'));
    document.getElementById('segmented-words').addEventListener('click', () => setModeSegmented('words'));
    setModeSegmented('timed');

    function isFeedbackModalOpen() {
        const modal = document.getElementById('feedback-modal');
        return modal && !modal.classList.contains('hidden');
    }

    // Auto-focus typing input on keypress when test section is active
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

    // Mode switching tabs
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
        });
    });

    document.getElementById("start-btn").addEventListener("click",    () => { testEngine.reset(false); testEngine.start(false); });
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

    document.getElementById("back-to-lessons").addEventListener("click",  hideLessonPractice);
    document.getElementById("lesson-restart").addEventListener("click",   () => lessonEngine.reset());

    document.getElementById("next-lesson-btn").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });
    document.getElementById("back-to-lessons-modal").addEventListener("click", () => {
        document.getElementById("lesson-complete-modal").classList.add("hidden");
        hideLessonPractice();
    });

    document.getElementById("practice-restart").addEventListener("click",   () => practiceEngine.start());
    document.getElementById("start-finger-drill").addEventListener("click", () => fingerTrainingEngine.startDrill());
    document.getElementById("random-key-practice").addEventListener("click",() => fingerTrainingEngine.nextRandomKey());

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

    // View saved feedback developer panel
    const viewFeedbackBtn  = document.getElementById('view-feedback-btn');
    const feedbackViewPanel = document.getElementById('feedback-view-panel');
    if (viewFeedbackBtn && feedbackViewPanel) {
        viewFeedbackBtn.addEventListener('click', () => {
            const feedbacks = safeLocalStorage.parse(safeLocalStorage.getItem('typeflow-feedback') || '[]', []);
            if (feedbackViewPanel.classList.contains('hidden')) {
                if (feedbacks.length === 0) {
                    feedbackViewPanel.innerHTML = '<em>No feedback saved.</em>';
                } else {
                    feedbackViewPanel.innerHTML = feedbacks.map((fb, i) =>
                        `<div style="margin-bottom:10px;"><b>#${i+1}</b>: <pre style="white-space:pre-wrap;font-size:0.95em;">${JSON.stringify(fb, null, 2)}</pre></div>`
                    ).join('');
                }
                feedbackViewPanel.classList.remove('hidden');
                viewFeedbackBtn.textContent = 'Hide Saved Feedback';
            } else {
                feedbackViewPanel.classList.add('hidden');
                viewFeedbackBtn.textContent = 'View Saved Feedback';
            }
        });
    }

    // Help button / modal
    const helpBtn   = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.getElementById('help-close');
    if (helpBtn && helpModal && helpClose) {
        helpBtn.addEventListener('click', () => { helpModal.style.display = 'block'; });
        helpClose.addEventListener('click', () => { helpModal.style.display = 'none'; });
        window.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });
        window.addEventListener('keydown', (e) => {
            if (helpModal.style.display === 'block' && (e.key === 'Escape' || e.key === '?')) {
                helpModal.style.display = 'none';
            }
        });
    }

    // Mobile/tablet touch support
    function enableTouchFocus(cardSelector, inputSelector) {
        const card  = document.querySelector(cardSelector);
        const input = document.querySelector(inputSelector);
        if (card && input) {
            card.addEventListener('touchstart', () => { input.focus(); }, { passive: true });
            card.addEventListener('click',      () => { input.focus(); });
        }
    }
    enableTouchFocus('.text-card', '#typing-input');
    enableTouchFocus('.text-card', '#practice-input');
    enableTouchFocus('.text-card', '#lesson-input');

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
                liked:     formData.get('liked'),
                improve:   formData.get('improve'),
                bugs:      formData.get('bugs'),
                email:     formData.get('email'),
                userAgent: navigator.userAgent
            };
            const allFeedback = safeLocalStorage.parse(safeLocalStorage.getItem('typeflow-feedback') || '[]', []);
            allFeedback.push(feedback);
            safeLocalStorage.setItem('typeflow-feedback', safeLocalStorage.stringify(allFeedback));
            feedbackForm.reset();
            feedbackSuccess.classList.remove('hidden');
            setTimeout(() => feedbackSuccess.classList.add('hidden'), 3000);
        });
    }

}); // end DOMContentLoaded