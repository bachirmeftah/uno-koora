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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let myPlayerName = "";
let currentRoomId = "";
let myHandCards = [];
let turnTimer = null;
let timeLeft = 20;

// قاعدة بيانات البطاقات الشاملة
const cardDeckMaster = [
    { name: "برشلونة", icon: "🔴🔵", type: "club", label: "نادي" },
    { name: "ريال مدريد", icon: "⚪", type: "club", label: "نادي" },
    { name: "بايرن ميونخ", icon: "🔴", type: "club", label: "نادي" },
    { name: "مانشستر سيتي", icon: "🩵", type: "club", label: "نادي" },
    { name: "ليفربول", icon: "🔴🟢", type: "club", label: "نادي" },
    { name: "يوفنتوس", icon: "⚪⚫", type: "club", label: "نادي" },
    { name: "البرازيل", icon: "🇧🇷", type: "country", label: "منتخب" },
    { name: "الأرجنتين", icon: "🇦🇷", type: "country", label: "منتخب" },
    { name: "فرنسا", icon: "🇫🇷", type: "country", label: "منتخب" },
    { name: "إسبانيا", icon: "🇪🇸", type: "country", label: "منتخب" },
    { name: "ألمانيا", icon: "🇩🇪", type: "country", label: "منتخب" },
    { name: "بيب جوارديولا", icon: "👔", type: "coach", label: "مدرب" },
    { name: "كارلو أنشيلوتي", icon: "🤨", type: "coach", label: "مدرب" },
    { name: "جوزيه مورينيو", icon: "🤫", type: "coach", label: "مدرب" },
    { name: "سحب +2", icon: "➕2️⃣", type: "action", label: "أكشن" },
    { name: "تخطي (Skip)", icon: "🚫", type: "action", label: "أكشن" },
    { name: "عكس الاتجاه", icon: "🔄", type: "action", label: "عكس" }
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
    showLobbyUI(true); // أنت المضيف
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
            showLobbyUI(false, data.host);
        } else {
            alert("الغرفة غير موجودة أو انتهت!");
        }
    });
}

function showLobbyUI(isHost, hostName = "") {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');

    const startBtn = document.getElementById('start-game-btn');
    const notice = document.getElementById('host-notice');

    if (isHost || myPlayerName === hostName) {
        startBtn.style.display = "block";
        notice.innerText = "أنت مُنشئ الغرفة، يمكنك بدء اللعب متى شئت.";
    } else {
        startBtn.style.display = "none";
        notice.innerText = "في انتظار أن يقوم مُنشئ الغرفة ببدء اللعب...";
    }
}

function listenToRoomUpdates(roomId) {
    database.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // تحديث قائمة اللاعبين
        if (data.players) {
            const playersUl = document.getElementById('players-ul');
            playersUl.innerHTML = data.players.map((p, i) => `<li>${i + 1}. ${p} ${i === 0 ? '👑' : ''}</li>`).join('');
            
            // تحقق إذا كنت المضيف بعد انضمام لاعبين جدد
            if (data.players[0] === myPlayerName) {
                document.getElementById('start-game-btn').style.display = "block";
                document.getElementById('host-notice').innerText = "أنت مُنشئ الغرفة.";
            }
        }

        // تحديث الكرت النشط
        if (data.activeCard) {
            document.getElementById('active-card-name').innerText = data.activeCard.name;
            document.getElementById('active-card-img').innerText = data.activeCard.icon;
            document.getElementById('active-card-type').innerText = data.activeCard.label;
            document.getElementById('active-card').className = `card ${data.activeCard.type}`;
        }

        // إدارة الدور الحالي
        if (data.status === "playing") {
            if (document.getElementById('game-screen').classList.contains('hidden')) {
                showGameScreen();
            }

            const players = data.players;
            const currentTurnPlayer = players[data.currentTurnIndex];
            document.getElementById('current-turn-display').innerText = `دور اللاعب: ${currentTurnPlayer}`;

            // تفعيل أو تعطيل اللعب بناءً على الدور
            if (currentTurnPlayer === myPlayerName) {
                document.getElementById('my-hand-container').style.opacity = "1";
                document.getElementById('my-hand-containerstyle.pointerEvents = "auto"';
                startTurnTimer();
            } else {
                document.getElementById('my-hand-container').style.opacity = "0.5";
                clearInterval(turnTimer);
            }
        }

        // حالة تقنية الفار (VAR)
        const varBox = document.getElementById('var-modal');
        if (data.varActive) {
            varBox.style.display = "block";
            document.getElementById('var-status-text').innerText = 
                `🚨 طالب الفار (${data.varCaller}) للتحقيق في لعب اللاعب (${data.varPlayer})!`;
            
            // إظهار أزرار التحقيق فقط للمكلفين (صاحب الكرت والمبلغ أو المضيف)
            if (myPlayerName === data.varCaller || myPlayerName === data.varPlayer || myPlayerName === data.host) {
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
            playerDrawsCard(true); // سحب تلقائي وتمرير الدور
        }
    }, 1000);
}

function renderMyHand() {
    const container = document.getElementById('my-hand-container');
    container.innerHTML = '';
    myHandCards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card ${card.type}`;
        div.onclick = () => playCard(index);
        div.innerHTML = `
            <div class="card-top">${card.label}</div>
            <div>
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.name}</div>
            </div>
            <div class="card-bottom">${card.label}</div>
        `;
        container.appendChild(div);
    });
}

function playCard(index) {
    database.ref('rooms/' + currentRoomId).once('value', (snapshot) => {
        const data = snapshot.val();
        const players = data.players;
        const currentTurnPlayer = players[data.currentTurnIndex];

        // التحقق هل هو دورك حقاً؟
        if (currentTurnPlayer !== myPlayerName) {
            return alert("ليس دورك الآن!");
        }

        clearInterval(turnTimer);
        const played = myHandCards.splice(index, 1)[0];
        renderMyHand();

        // حساب الدور التالي
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

        // سحب الكرت ينهي الدور وينقل الدور للاعب الذي يليه
        let nextIndex = (data.currentTurnIndex + 1) % players.length;
        database.ref('rooms/' + currentRoomId).update({
            currentTurnIndex: nextIndex
        });
    });
}

// زر الفار VAR
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

// قرار الفار: صحيح
function varDecisionCorrect() {
    // الشخص الذي طلب الفار (كاذب/مشكك خطأ) يعاقب بكرتين
    for(let i=0; i<2; i++) {
        myHandCards.push(cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)]);
    }
    renderMyHand();
    alert("قرر الفار: الكرت صحيح! تم إعطاؤك كرتين عقوبة لأنك شككت في محله.");
    
    database.ref('rooms/' + currentRoomId).update({ varActive: false });
}

// قرار الفار: خطأ
function varDecisionWrong() {
    alert("قرر الفار: الكرت خاطئ! سيتم معاقبة اللاعب الذي وضع الكرت بكرتين.");
    // إغلاق الفار
    database.ref('rooms/' + currentRoomId).update({ varActive: false });
}

function copyRoomLink() {
    const field = document.getElementById('share-link-field');
    field.select();
    navigator.clipboard.writeText(field.value);
    alert("تم نسخ رقم الغرفة (" + field.value + ")!");
}