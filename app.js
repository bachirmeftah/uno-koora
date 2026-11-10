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

// تهيئة Firebase و Realtime Database
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let myPlayerName = "";
let currentRoomId = "";
let myHandCards = [];

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
    { name: "عكس الاتجاه", icon: "🔄", type: "action", label: "أكشن" }
];

function createNewGame() {
    myPlayerName = document.getElementById('player-name').value.trim();
    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");

    currentRoomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // عرض رقم الغرفة بوضوح
    document.getElementById('share-link-field').value = currentRoomId;

    const initialCard = cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)];
    database.ref('rooms/' + currentRoomId).set({
        host: myPlayerName,
        activeCard: initialCard,
        players: [myPlayerName],
        status: "waiting"
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

function listenToRoomUpdates(roomId) {
    database.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // تحديث قائمة اللاعبين في الغرفة بشكل لحظي
        if (data.players) {
            const playersUl = document.getElementById('players-ul');
            playersUl.innerHTML = data.players.map((p, i) => `<li>${i + 1}. ${p}</li>`).join('');
        }

        // تحديث الكرت الحالي على الطاولة
        if (data.activeCard) {
            document.getElementById('active-card-name').innerText = data.activeCard.name;
            document.getElementById('active-card-img').innerText = data.activeCard.icon;
            document.getElementById('active-card-type').innerText = data.activeCard.label;
            document.getElementById('active-card').className = `card ${data.activeCard.type}`;
        }

        // الانتقال التلقائي للعب عندما يضغط المضيف على بدء اللعب
        if (data.status === "playing" && document.getElementById('game-screen').classList.contains('hidden')) {
            showGameScreen();
        }
    });
}

function showLobbyUI() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
}

function showGameScreen() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('current-turn-display').innerText = `اللاعب: ${myPlayerName}`;

    if (myHandCards.length === 0) {
        for (let i = 0; i < 5; i++) {
            myHandCards.push(cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)]);
        }
        renderMyHand();
    }
}

function startGameSession() {
    database.ref('rooms/' + currentRoomId).update({ status: "playing" });
    showGameScreen();
}

function copyRoomLink() {
    const field = document.getElementById('share-link-field');
    field.select();
    navigator.clipboard.writeText(field.value);
    alert("تم نسخ رقم الغرفة (" + field.value + ") بنجاح!");
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
    const played = myHandCards.splice(index, 1)[0];
    database.ref('rooms/' + currentRoomId).update({
        activeCard: played
    });
    renderMyHand();
}

function playerDrawsCard() {
    const drawn = cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)];
    myHandCards.push(drawn);
    renderMyHand();
}