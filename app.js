// إعدادات Firebase الخاصة بمشروعك (تأكد من مطابقتها لإعداداتك الفعلية)
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
let timeLeft = 20;

// قاعدة بيانات البطاقات الشاملة - باستخدام أسماء ملفات الصور
// تأكد من وجود هذه الملفات داخل مجلد يسمى "images" في نفس مستوى ملف html
const cardDeckMaster = [
    { name: "برشلونة", image: "images/barcelona_card.png" },
    { name: "ريال مدريد", image: "images/real_madrid_card.png" },
    { name: "بايرن ميونخ", image: "images/bayern_munich_card.png" },
    { name: "مانشستر سيتي", image: "images/man_city_card.png" },
    { name: "ليفربول", image: "images/liverpool_card.png" },
    { name: "مانشستر يونايتد", image: "images/man_united_card.png" },
    { name: "يوفنتوس", image: "images/juventus_new_card.png" },
    { name: "البرازيل", image: "images/brazil_card.png" },
    { name: "الأرجنتين", image: "images/argentina_card.png" },
    { name: "فرنسا", image: "images/france_card.png" },
    { name: "ألمانيا", image: "images/germany_card.png" },
    { name: "بيب جوارديولا", image: "images/guardiola_card.png" },
    { name: "كارلو أنشيلوتي", image: "images/ancelotti_card.png" },
    { name: "جوزيه مورينيو", image: "images/mourinho_card.png" },
    { name: "الكرة الذهبية", image: "images/ballon_dor_card.png" },
    { name: "كأس الأبطال", image: "images/champions_league_card.png" },
    { name: "الدوري الألماني", image: "images/bundesliga_card.png" },
    { name: "الدوري الأمريكي", image: "images/mls_card.png" },
    // يمكنك إضافة المزيد من البطاقات هنا
    { name: "سحب +2", image: "images/draw_two_card.png" }, // مثال لبطاقة أكشن
    { name: "تخطي", image: "images/skip_card.png" }, // مثال لبطاقة أكشن
    { name: "عكس الاتجاه", image: "images/reverse_card.png" } // مثال لبطاقة أكشن
];

function createNewGame() {
    myPlayerName = document.getElementById('player-name').value.trim();
    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");

    currentRoomId = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('share-link-field').value = currentRoomId;

    const initialCard = cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)];
    
    database.ref('rooms/' + currentRoomId).set({
        host: myPlayerName,
        activeCard: initialCard,
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

function listenToRoomUpdates(roomId) {
    database.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // تحديث قائمة اللاعبين
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

        // تحديث الكرت النشط على الطاولة - استخدام الصورة
        if (data.activeCard) {
            document.getElementById('active-card-name').innerText = data.activeCard.name;
            const cardImgElement = document.getElementById('active-card-img');
            if (data.activeCard.image) {
                cardImgElement.src = data.activeCard.image;
                cardImgElement.alt = data.activeCard.name;
                cardImgElement.style.display = "block";
                document.getElementById('active-card-icon-placeholder').style.display = "none";
            } else {
                cardImgElement.style.display = "none";
                document.getElementById('active-card-icon-placeholder').style.display = "block";
            }
        }

        // إدارة الأدوار وحالة اللعبة
        if (data.status === "playing") {
            if (document.getElementById('game-screen').classList.contains('hidden')) {
                showGameScreen();
            }

            const players = data.players;
            const currentTurnPlayer = players[data.currentTurnIndex || 0];
            document.getElementById('current-turn-display').innerText = `دور اللاعب: ${currentTurnPlayer}`;

            const handContainer = document.getElementById('my-hand-container');
            if (currentTurnPlayer === myPlayerName) {
                handContainer.style.opacity = "1";
                handContainer.style.pointerEvents = "auto";
                startTurnTimer();
            } else {
                handContainer.style.opacity = "0.5";
                handContainer.style.pointerEvents = "none";
                clearInterval(turnTimer);
            }
        }

        // نظام الفار (VAR)
        const varBox = document.getElementById('var-modal');
        if (data.varActive) {
            varBox.style.display = "block";
            document.getElementById('var-status-text').innerText = 
                `🚨 طالب الفار (${data.varCaller}) للتحقيق في لعب اللاعب (${data.varPlayer})!`;
            
            if (myPlayerName === data.varCaller || myPlayerName === data.varPlayer || data.host === myPlayerName) {
                document.getElementById('var-buttons-area').style.display = "block";
            } else {
                document.getElementById('var-buttons-area').style.display = "none";
            }
        } else {
            varBox.style.display = "none";
        }
    });
}

function showGameScreen() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    if (myHandCards.length === 0) {
        for (let i = 0; i < 5; i++) {
            myHandCards.push(cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)]);
        }
        renderMyHand();
    }
}

function startGameSession() {
    database.ref('rooms/' + currentRoomId).update({ 
        status: "playing",
        currentTurnIndex: 0 
    });
}

function startTurnTimer() {
    clearInterval(turnTimer);
    timeLeft = 20;
    document.getElementById('timer-display').innerText = timeLeft;

    turnTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(turnTimer);
            alert("انتهى وقتك! تم سحب كرت تلقائي وتمرير الدور.");
            playerDrawsCard(true);
        }
    }, 1000);
}

// دالة رسم بطاقات اليد - استخدام الصور
function renderMyHand() {
    const container = document.getElementById('my-hand-container');
    container.innerHTML = '';
    myHandCards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card'; // إزالة الفئات الخاصة
        div.onclick = () => playCard(index);
        
        // بناء محتوى البطاقة باستخدام الصورة
        div.innerHTML = `
            <div class="card-top">UNO</div>
            <div class="card-center-content">
                <img src="${card.image}" alt="${card.name}" class="card-image">
                <div class="card-title">${card.name}</div>
            </div>
            <div class="card-bottom">⚽</div>
        `;
        container.appendChild(div);
    });
}

function playCard(index) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;
        const currentTurnPlayer = players[data.currentTurnIndex];

        if (currentTurnPlayer !== myPlayerName) {
            return alert("ليس دورك الآن!");
        }

        clearInterval(turnTimer);
        const played = myHandCards.splice(index, 1)[0];
        renderMyHand();

        let nextIndex = (data.currentTurnIndex + 1) % players.length;

        database.ref('rooms/' + currentRoomId).update({
            activeCard: played,
            currentTurnIndex: nextIndex,
            lastPlayer: myPlayerName,
            lastPlayedCard: played
        });
    });
}

function playerDrawsCard(autoPass = false) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;

        if (!autoPass && players[data.currentTurnIndex] !== myPlayerName) {
            return alert("ليس دورك لسحب الكرت!");
        }

        clearInterval(turnTimer);
        const drawn = cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)];
        myHandCards.push(drawn);
        renderMyHand();

        let nextIndex = (data.currentTurnIndex + 1) % players.length;
        database.ref('rooms/' + currentRoomId).update({
            currentTurnIndex: nextIndex
        });
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
    for(let i=0; i<2; i++) {
        myHandCards.push(cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)]);
    }
    renderMyHand();
    alert("قرر الفار: الكرت صحيح! تم إعطاؤك كرتين عقوبة لأنك شككت في محله.");
    database.ref('rooms/' + currentRoomId).update({ varActive: false });
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