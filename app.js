// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyAE3LYcGe_Dzdec4kxaM68erElOGWmCD9o",
    authDomain: "uno-koora.firebaseapp.com",
    databaseURL: "https://uno-koora-default-rtdb.firebaseio.com",
    projectId: "uno-koora",
    storageBucket: "uno-koora.firebasestorage.app",
    messagingSenderId: "761220350643",
    appId: "1:761220350643:web:30ecda5bfcc609d43aa6c6",
    measurementId: "G-B1L1XD8XKF"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let myPlayerName = "";
let currentRoomId = "";
let myHandCards = [];
let turnTimer = null;
let pauseTimer = null; // مؤقت الـ 5 ثوانٍ للاستراحة بعد اللعب
let timeLeft = 20;

// قاعدة بيانات البطاقات الـ 61 (رزمة اللعبة الكاملة)
const cardDeckMaster = [
    // --- الأندية الكبرى ---
    { name: "برشلونة", image: "images/barcelona.png" },
    { name: "ريال مدريد", image: "images/realmadrid.png" },
    { name: "أتلتيكو مدريد", image: "images/atletico.png" },
    { name: "مانشستر يونايتد", image: "images/manutd.png" },
    { name: "مانشستر سيتي", image: "images/mancity.png" },
    { name: "ليفربول", image: "images/liverpool.png" },
    { name: "توتنهام", image: "images/tottenham.png" },
    { name: "تشيلسي", image: "images/chelsea.png" },
    { name: "أرسنال", image: "images/arsenal.png" },
    { name: "يوفنتوس", image: "images/juventus.png" },
    { name: "إي سي ميلان", image: "images/milan.png" },
    { name: "إنتر ميلان", image: "images/inter.png" },
    { name: "بايرن ميونخ", image: "images/bayern.png" },
    { name: "بوروسيا دورتموند", image: "images/dortmund.png" },
    { name: "باريس سان جيرمان", image: "images/psg.png" },

    // --- المنتخبات الوطنية ---
    { name: "منتخب إنجلترا", image: "images/england.png" },
    { name: "منتخب إسبانيا", image: "images/spain.png" },
    { name: "البرازيل", image: "images/brazil.png" },
    { name: "الأرجنتين", image: "images/argentina.png" },
    { name: "فرنسا", image: "images/france.png" },
    { name: "ألمانيا", image: "images/germany.png" },
    { name: "إيطاليا", image: "images/italy.png" },
    { name: "البرتغال", image: "images/portugal.png" },
    { name: "هولندا", image: "images/netherlands.png" },

    // --- الدوريات والبطولات ---
    { name: "الدوري الإنجليزي", image: "images/premierleague.png" },
    { name: "الدوري الإسباني", image: "images/laliga.png" },
    { name: "الدوري الإيطالي", image: "images/seriea.png" },
    { name: "الدوري الألماني", image: "images/bundesliga.png" },
    { name: "الدوري الفرنسي", image: "images/ligue1.png" },
    { name: "دوري روشن السعودي", image: "images/roshen.png" },
    { name: "الدوري الأمريكي", image: "images/mls.png" },
    { name: "كأس الأبطال", image: "images/ucl.png" },
    { name: "الدوري الأوروبي", image: "images/europa.png" },
    { name: "كأس العالم", image: "images/worldcup.png" },
    { name: "بطولة إفريقيا", image: "images/afcon.png" },

    // --- أبطال الدوريات ---
    { name: "بطل إنجلترا", image: "images/champengland.png" },
    { name: "بطل إسبانيا", image: "images/champlaliga.png" },
    { name: "بطل إيطاليا", image: "images/champseriea.png" },
    { name: "بطل ألمانيا", image: "images/champbundesliga.png" },
    { name: "بطل فرنسا", image: "images/champligue1.png" },

    // --- بطاقات الأكشن المكررة 3 مرات ---
    { name: "تخطي رقم 1", image: "images/skip1.png" },
    { name: "+2 رقم 1", image: "images/plus2x1.png" },
    { name: "تغيير اتجاه اللعب رقم 1", image: "images/reverse1.png" },

    { name: "تخطي رقم 2", image: "images/skip2.png" },
    { name: "+2 رقم 2", image: "images/plus2x2.png" },
    { name: "تغيير اتجاه اللعب رقم 2", image: "images/reverse2.png" },

    { name: "تخطي رقم 3", image: "images/skip3.png" },
    { name: "+2 رقم 3", image: "images/plus2x3.png" },
    { name: "تغيير اتجاه اللعب رقم 3", image: "images/reverse3.png" },

    // --- الجوائز، القارات والنجوم ---
    { name: "هداف بطولة موسم", image: "images/topscorer.png" },
    { name: "فاز ببطولة قارية", image: "images/continentalchamp.png" },
    { name: "قارة آسيا", image: "images/asia.png" },
    { name: "قارة أوروبا", image: "images/europe.png" },
    { name: "قارة أمريكا", image: "images/americas.png" },
    { name: "الكرة الذهبية", image: "images/ballondor.png" },
    { name: "الحذاء الذهبي", image: "images/goldenboot.png" },
    { name: "رونالدو", image: "images/ronaldo.png" },
    { name: "ليونيل ميسي", image: "images/messi.png" },
    { name: "بيب جوارديولا", image: "images/guardiola.png" },
    { name: "كارلو أنشيلوتي", image: "images/ancelotti.png" },
    { name: "جوزيه مورينيو", image: "images/mourinho.png" }
];

// دالة خلط البطاقات عشوائياً
function shuffleDeck(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// دالة سحب بطاقة من الرزمة مع إعادة الخلط التلقائي
function pullCardsFromDeck(drawPile, discardPile, count) {
    let deck = drawPile ? [...drawPile] : [];
    let discard = discardPile ? [...discardPile] : [];
    let pulled = [];

    for (let i = 0; i < count; i++) {
        if (deck.length <= 3 && discard.length > 0) {
            let recycled = shuffleDeck(discard);
            deck = [...deck, ...recycled];
            discard = [];
        }
        if (deck.length > 0) {
            pulled.push(deck.shift());
        }
    }
    return { pulled, updatedDrawPile: deck, updatedDiscardPile: discard };
}

function createNewGame() {
    myPlayerName = document.getElementById('player-name').value.trim();
    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");

    currentRoomId = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('share-link-field').value = currentRoomId;

    database.ref('rooms/' + currentRoomId).set({
        host: myPlayerName,
        players: [myPlayerName],
        status: "waiting",
        currentTurnIndex: 0,
        varActive: false,
        varCaller: "",
        varPlayer: ""
    });

    listenToRoomUpdates(currentRoomId);
    showLobbyUI();
}

function joinGameByCode() {
    myPlayerName = document.getElementById('player-name').value.trim();
    currentRoomId = document.getElementById('room-code-input').value.trim();

    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");
    if (!currentRoomId) return alert("الرجاء إدخال رقم الغرفة!");

    const roomRef = database.ref('rooms/' + currentRoomId);
    roomRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            let players = data.players || [];
            
            if (!players.includes(myPlayerName)) {
                players.push(myPlayerName);
                roomRef.update({ players: players });
            }
            
            listenToRoomUpdates(currentRoomId);
            showLobbyUI();
        } else {
            alert("الغرفة غير موجودة أو انتهت!");
        }
    });
}

function showLobbyUI() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
}

// بدء اللعبة والتأكد أن الكرت الأول ليس بطاقة أكشن
function startGameSession() {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        let fullShuffledDeck = shuffleDeck(cardDeckMaster);

        // التأكد أن الكرت الأول ليس بطاقة أكشن (تخطي، +2، أو تغيير اتجاه)
        let firstCardIndex = fullShuffledDeck.findIndex(card => 
            !card.name.includes("تخطي") && !card.name.includes("+2") && !card.name.includes("تغيير اتجاه")
        );
        if (firstCardIndex === -1) firstCardIndex = 0;
        const firstCardOnTable = fullShuffledDeck.splice(firstCardIndex, 1)[0];

        let initialHands = {};
        data.players.forEach(player => {
            initialHands[player] = fullShuffledDeck.splice(0, 5);
        });

        database.ref('rooms/' + currentRoomId).update({ 
            status: "playing",
            currentTurnIndex: 0,
            activeCard: firstCardOnTable,
            previousCard: null, // لا يوجد كرت تحته في البداية
            drawPile: fullShuffledDeck,
            discardPile: [firstCardOnTable],
            hands: initialHands,
            winner: null
        });
    });
}

function listenToRoomUpdates(roomId) {
    database.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // التحقق من حالة الفوز وإعلان البطل
        if (data.status === "finished" && data.winner) {
            document.getElementById('current-turn-display').innerText = `🏆 الفائز باللعبة هو: ${data.winner}!`;
            return;
        }

        if (data.players) {
            const playersUl = document.getElementById('players-ul');
            playersUl.innerHTML = data.players.map((p, i) => `<li>${i + 1}. ${p} ${i === 0 ? '👑' : ''}</li>`).join('');
            
            const startBtn = document.getElementById('start-game-btn');
            const notice = document.getElementById('host-notice');

            if (data.host === myPlayerName || data.players[0] === myPlayerName) {
                if (startBtn) startBtn.style.display = "block";
                if (notice) notice.innerText = "أنت مُنشئ الغرفة، يمكنك بدء اللعب متى شئت.";
            } else {
                if (startBtn) startBtn.style.display = "none";
                if (notice) notice.innerText = "في انتظار أن يقوم مُنشئ الغرفة ببدء اللعب...";
            }
        }

        // عرض الكرت النشط على الطاولة مع دعم فكرة الكرتين المتداخلين إذا كان أكشن
        const tableCenter = document.querySelector('.table-center');
        if (data.activeCard) {
            document.getElementById('active-card-name').innerText = data.activeCard.name;
            const cardImgElement = document.getElementById('active-card-img');
            
            if (data.activeCard.image) {
                cardImgElement.src = data.activeCard.image;
                cardImgElement.alt = data.activeCard.name;
                cardImgElement.style.display = "block";
                cardImgElement.style.width = "100%";
                cardImgElement.style.height = "100%";
                cardImgElement.style.objectFit = "cover";
                cardImgElement.style.borderRadius = "12px";
                const placeholder = document.getElementById('active-card-icon-placeholder');
                if (placeholder) placeholder.style.display = "none";
            }

            // إذا كان الكرت أوبشن/أكشن، نظهر الكرت الذي تحته متداخلاً بجانبه
            let existingPrevImg = document.getElementById('previous-card-img');
            if (data.previousCard && (data.activeCard.name.includes("تخطي") || data.activeCard.name.includes("+2") || data.activeCard.name.includes("تغيير اتجاه"))) {
                if (!existingPrevImg) {
                    existingPrevImg = document.createElement('img');
                    existingPrevImg.id = 'previous-card-img';
                    existingPrevImg.style.cssText = "width: 100px; height: 145px; object-fit: cover; border-radius: 12px; position: absolute; transform: translateX(35px) translateY(-10px); z-index: 1; box-shadow: 0 4px 10px rgba(0,0,0,0.5);";
                    cardImgElement.parentElement.style.position = "relative";
                    cardImgElement.parentElement.appendChild(existingPrevImg);
                }
                existingPrevImg.src = data.previousCard.image;
                existingPrevImg.style.display = "block";
                cardImgElement.style.zIndex = "2"; // الكرت العلوي فوقه
            } else {
                if (existingPrevImg) existingPrevImg.style.display = "none";
            }
        }

        if (data.hands && data.hands[myPlayerName]) {
            myHandCards = data.hands[myPlayerName];
            renderMyHand();
        }

        if (data.status === "playing") {
            if (document.getElementById('game-screen').classList.contains('hidden')) {
                document.getElementById('lobby-screen').classList.add('hidden');
                document.getElementById('game-screen').classList.remove('hidden');
            }

            const players = data.players;
            const currentTurnPlayer = players[data.currentTurnIndex || 0];
            document.getElementById('current-turn-display').innerText = `دور اللاعب: ${currentTurnPlayer}`;

            const handContainer = document.getElementById('my-hand-container');
            
            // القاعدة 1: السماح بالتمرير يمين ويسار دائماً في الأوراق بغض النظر عن الدور
            handContainer.style.overflowX = "auto";
            handContainer.style.pointerEvents = "auto";

            if (currentTurnPlayer === myPlayerName) {
                handContainer.style.opacity = "1";
                if (!data.isPaused) {
                    startTurnTimer();
                }
            } else {
                handContainer.style.opacity = "0.5";
                clearInterval(turnTimer);
            }
        }
    });
}

function startTurnTimer() {
    clearInterval(turnTimer);
    timeLeft = 20;
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.innerText = timeLeft;

    turnTimer = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(turnTimer);
            alert("انتهى وقتك! تم سحب كرت تلقائي وتمرير الدور.");
            playerDrawsCard(true);
        }
    }, 1000);
}

// رسم أوراق اليد مع السماح بالتحريك الدائم
function renderMyHand() {
    const container = document.getElementById('my-hand-container');
    container.innerHTML = '';
    myHandCards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => playCard(index);
        
        div.innerHTML = `
            <img src="${card.image}" alt="${card.name}" class="pure-card-image">
        `;
        container.appendChild(div);
    });
}

// لعب كرت مع تفعيل استراحة الـ 5 ثوانٍ، وفحص الفوز، والتعامل مع الأكشن
function playCard(index) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;
        const currentTurnPlayer = players[data.currentTurnIndex];

        if (currentTurnPlayer !== myPlayerName) {
            return alert("ليس دورك الآن!");
        }

        // إذا كانت فترة الاستراحة قيد التشغيل، نمنع اللعب السريع
        if (data.isPaused) return;

        clearInterval(turnTimer);
        
        let currentHand = [...(data.hands[myPlayerName] || [])];
        const played = currentHand.splice(index, 1)[0];

        let discard = data.discardPile ? [...data.discardPile] : [];
        let previousCard = data.activeCard; // حفظ الكرت الحالي ككرت تحته
        if (data.activeCard) {
            discard.push(data.activeCard);
        }

        let nextIndex = (data.currentTurnIndex + 1) % players.length;
        let handsUpdate = data.hands;
        handsUpdate[myPlayerName] = currentHand;

        // القاعدة 4: معالجة بطاقات الأكشن (Skip / +2 / Reverse)
        if (played.name.includes("تخطي")) {
            nextIndex = (data.currentTurnIndex + 2) % players.length;
        } else if (played.name.includes("+2")) {
            let nextPlayerName = players[(data.currentTurnIndex + 1) % players.length];
            let drawResult = pullCardsFromDeck(data.drawPile, discard, 2);
            
            let nextPlayerHand = [...(handsUpdate[nextPlayerName] || [])];
            nextPlayerHand.push(...drawResult.pulled);
            handsUpdate[nextPlayerName] = nextPlayerHand;

            nextIndex = (data.currentTurnIndex + 2) % players.length;
            discard = drawResult.updatedDiscardPile;
        } else if (played.name.includes("تغيير اتجاه")) {
            // يمكن عكس اتجاه الدوران إذا رغبت، أو اعتباره دور عادي مؤقتاً
            nextIndex = (data.currentTurnIndex + 1) % players.length;
        }

        let updates = {};
        updates['activeCard'] = played;
        updates['previousCard'] = previousCard;
        updates['discardPile'] = discard;
        updates['hands'] = handsUpdate;
        updates['isPaused'] = true; // تفعيل فترة الاستراحة (5 ثوانٍ)

        // القاعدة 2: إعلان الفوز التلقائي إذا انتهت أوراق اللاعب
        if (currentHand.length === 0) {
            updates['status'] = "finished";
            updates['winner'] = myPlayerName;
            database.ref('rooms/' + currentRoomId).update(updates).then(() => {
                alert(`🎉 مبروك! اللاعب ${myPlayerName} أنزل كل أوراقه وفاز باللعبة! 🏆`);
            });
            return;
        }

        // تحديث قاعدة البيانات للدخول في فترة الاستراحة
        database.ref('rooms/' + currentRoomId).update(updates);

        // القاعدة 3: مؤقت الـ 5 ثوانٍ للاستراحة والحديث بين اللاعبين بعد وضع الورقة
        let pauseLeft = 5;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) timerDisplay.innerText = "استراحة: " + pauseLeft;

        pauseTimer = setInterval(() => {
            pauseLeft--;
            if (timerDisplay) timerDisplay.innerText = "استراحة: " + pauseLeft;
            if (pauseLeft <= 0) {
                clearInterval(pauseTimer);
                // بعد انتهاء الـ 5 ثوانٍ، ننقل الدور للاعب التالي ونلغي الاستراحة
                database.ref('rooms/' + currentRoomId).update({
                    currentTurnIndex: nextIndex,
                    isPaused: false
                });
            }
        }, 1000);
    });
}

// سحب بطاقة عند انتهاء الـ 20 ثانية أو الضغط على زر السحب
function playerDrawsCard(autoPass = false) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;

        if (data.isPaused) return;

        if (!autoPass && players[data.currentTurnIndex] !== myPlayerName) {
            return alert("ليس دورك لسحب الكرت!");
        }

        clearInterval(turnTimer);

        const result = pullCardsFromDeck(data.drawPile, data.discardPile, 1);
        let currentHand = [...(data.hands[myPlayerName] || [])];
        if (result.pulled.length > 0) {
            currentHand.push(...result.pulled);
        }

        let nextIndex = (data.currentTurnIndex + 1) % players.length;

        let updates = {};
        updates['currentTurnIndex'] = nextIndex;
        updates['drawPile'] = result.updatedDrawPile;
        updates['discardPile'] = result.updatedDiscardPile;
        updates['hands/' + myPlayerName] = currentHand;

        database.ref('rooms/' + currentRoomId).update(updates);
    });
}

function callVar() {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        database.ref('rooms/' + currentRoomId).update({
            varActive: true,
            varCaller: myPlayerName,
            varPlayer: data.lastPlayer || "لاعب سابق"
        });
    });
}

function varDecisionCorrect() {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const result = pullCardsFromDeck(data.drawPile, data.discardPile, 2);

        let currentHand = [...(data.hands[myPlayerName] || [])];
        currentHand.push(...result.pulled);

        let updates = {};
        updates['varActive'] = false;
        updates['drawPile'] = result.updatedDrawPile;
        updates['discardPile'] = result.updatedDiscardPile;
        updates['hands/' + myPlayerName] = currentHand;

        database.ref('rooms/' + currentRoomId).update(updates);
        alert("قرر الفار: الكرت صحيح! تم إعطاؤك كرتين عقوبة من الرزمة.");
    });
}

function varDecisionWrong() {
    alert("قرر الفار: الكرت خاطئ! سيتم معاقبة اللاعب الذي وضع الكرت بكرتين.");
    database.ref('rooms/' + currentRoomId).update({ varActive: false });
}

function copyRoomLink() {
    const field = document.getElementById('share-link-field');
    field.select();
    navigator.clipboard.writeText(field.value);
    alert("تم نسخ رقم الغرفة (" + field.value + ")!");
}