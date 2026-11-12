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
let pauseTimer = null; 
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
        direction: 1,
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

function startGameSession() {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        let fullShuffledDeck = shuffleDeck(cardDeckMaster);

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
            direction: 1,
            activeCard: firstCardOnTable,
            actionCard: null,
            drawPile: fullShuffledDeck,
            discardPile: [firstCardOnTable],
            hands: initialHands,
            winner: null,
            pendingPlus2: 0
        });
    });
}

function listenToRoomUpdates(roomId) {
    database.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.status === "finished" && data.winner) {
            document.getElementById('current-turn-display').innerText = `🏆 انتهت اللعبة! الفائز هو: ${data.winner}!`;
            const handContainer = document.getElementById('my-hand-container');
            if (handContainer) handContainer.style.pointerEvents = "none";
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

            let actionImgElement = document.getElementById('table-action-card-img');
            if (data.actionCard) {
                if (!actionImgElement) {
                    actionImgElement = document.createElement('img');
                    actionImgElement.id = 'table-action-card-img';
                    actionImgElement.style.cssText = "width: 105px; height: 150px; object-fit: cover; border-radius: 12px; position: absolute; transform: translateX(50px); box-shadow: 0 4px 12px rgba(0,0,0,0.6); z-index: 5;";
                    cardImgElement.parentElement.style.position = "relative";
                    cardImgElement.parentElement.appendChild(actionImgElement);
                }
                actionImgElement.src = data.actionCard.image;
                actionImgElement.style.display = "block";
            } else {
                if (actionImgElement) actionImgElement.style.display = "none";
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
            let turnText = `دور اللاعب: ${currentTurnPlayer}`;
            if (data.pendingPlus2 && data.pendingPlus2 > 0) {
                turnText += ` ⚠️ (تراكم عقوبة +${data.pendingPlus2})`;
            }
            document.getElementById('current-turn-display').innerText = turnText;

            const handContainer = document.getElementById('my-hand-container');
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

function getNextTurnIndex(currentIndex, playersCount, direction = 1, steps = 1) {
    let newIndex = currentIndex + (direction * steps);
    while (newIndex < 0) newIndex += playersCount;
    return newIndex % playersCount;
}

function playCard(index) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;
        const currentTurnIndex = data.currentTurnIndex;
        const currentTurnPlayer = players[currentTurnIndex];

        if (currentTurnPlayer !== myPlayerName) {
            return alert("ليس دورك الآن!");
        }

        if (data.isPaused) return;

        clearInterval(turnTimer);
        
        let currentHand = [...(data.hands[myPlayerName] || [])];
        const played = currentHand.splice(index, 1)[0];

        let discard = data.discardPile ? [...data.discardPile] : [];
        if (data.activeCard) {
            discard.push(data.activeCard);
        }

        let direction = data.direction !== undefined ? data.direction : 1;
        let nextIndex = getNextTurnIndex(currentTurnIndex, players.length, direction, 1);
        let handsUpdate = data.hands;
        handsUpdate[myPlayerName] = currentHand;

        let newActiveCard = data.activeCard;
        let newActionCard = null;
        let pendingPlus2 = data.pendingPlus2 || 0;
        let triggerPause = true;

        if (played.name.includes("+2")) {
            pendingPlus2 += 2;
            newActionCard = played;
            triggerPause = false;
            let nextPlayerName = players[nextIndex];
            let drawResult = pullCardsFromDeck(data.drawPile, discard, pendingPlus2);
            
            let nextPlayerHand = [...(handsUpdate[nextPlayerName] || [])];
            nextPlayerHand.push(...drawResult.pulled);
            handsUpdate[nextPlayerName] = nextPlayerHand;

            discard = drawResult.updatedDiscardPile;
            nextIndex = getNextTurnIndex(nextIndex, players.length, direction, 1);
            pendingPlus2 = 0;
        } else if (played.name.includes("تخطي")) {
            newActionCard = played;
            triggerPause = false;
            nextIndex = getNextTurnIndex(currentTurnIndex, players.length, direction, 2);
        } else if (played.name.includes("تغيير اتجاه")) {
            newActionCard = played;
            direction *= -1;
            triggerPause = false;
            nextIndex = getNextTurnIndex(currentTurnIndex, players.length, direction, 1);
        } else {
            newActiveCard = played;
            newActionCard = null;
        }

        let updates = {};
        updates['activeCard'] = newActiveCard;
        updates['actionCard'] = newActionCard;
        updates['direction'] = direction;
        updates['discardPile'] = discard;
        updates['hands'] = handsUpdate;
        updates['pendingPlus2'] = pendingPlus2;

        if (currentHand.length === 0) {
            updates['status'] = "finished";
            updates['winner'] = myPlayerName;
            database.ref('rooms/' + currentRoomId).update(updates).then(() => {
                alert(`🎉 مبروك! اللاعب ${myPlayerName} أنزل كل أوراقه وفاز باللعبة! 🏆`);
            });
            return;
        }

        if (triggerPause) {
            updates['isPaused'] = true;
            database.ref('rooms/' + currentRoomId).update(updates);

            let pauseLeft = 5;
            const timerDisplay = document.getElementById('timer-display');
            if (timerDisplay) timerDisplay.innerText = "استراحة: " + pauseLeft;

            pauseTimer = setInterval(() => {
                pauseLeft--;
                if (timerDisplay) timerDisplay.innerText = "استراحة: " + pauseLeft;
                if (pauseLeft <= 0) {
                    clearInterval(pauseTimer);
                    database.ref('rooms/' + currentRoomId).update({
                        currentTurnIndex: nextIndex,
                        isPaused: false
                    });
                }
            }, 1000);
        } else {
            updates['isPaused'] = false;
            updates['currentTurnIndex'] = nextIndex;
            database.ref('rooms/' + currentRoomId).update(updates);
        }
    });
}

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

        let direction = data.direction !== undefined ? data.direction : 1;
        let nextIndex = getNextTurnIndex(data.currentTurnIndex, players.length, direction, 1);

        let updates = {};
        updates['currentTurnIndex'] = nextIndex;
        updates['drawPile'] = result.updatedDrawPile;
        updates['discardPile'] = result.updatedDiscardPile;
        updates['hands/' + myPlayerName] = currentHand;
        updates['pendingPlus2'] = 0;

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