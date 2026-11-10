let myPlayerName = "";
let currentRoomId = "";
let myHandCards = [];

// قاعدة بيانات البطاقات الملونة والشاملة مع الرموز
const cardDeckMaster = [
    // أندية
    { name: "برشلونة", icon: "🔴🔵", type: "club", label: "نادي" },
    { name: "ريال مدريد", icon: "⚪", type: "club", label: "نادي" },
    { name: "بايرن ميونخ", icon: "🔴", type: "club", label: "نادي" },
    { name: "مانشستر سيتي", icon: "🩵", type: "club", label: "نادي" },
    { name: "ليفربول", icon: "🔴🟢", type: "club", label: "نادي" },
    { name: "يوفنتوس", icon: "⚪⚫", type: "club", label: "نادي" },
    
    // منتخبات
    { name: "البرازيل", icon: "🇧🇷", type: "country", label: "منتخب" },
    { name: "الأرجنتين", icon: "🇦🇷", type: "country", label: "منتخب" },
    { name: "فرنسا", icon: "🇫🇷", type: "country", label: "منتخب" },
    { name: "إسبانيا", icon: "🇪🇸", type: "country", label: "منتخب" },
    { name: "ألمانيا", icon: "🇩🇪", type: "country", label: "منتخب" },
    
    // مدربين
    { name: "بيب جوارديولا", icon: "👔", type: "coach", label: "مدرب" },
    { name: "كارلو أنشيلوتي", icon: "🤨", type: "coach", label: "مدرب" },
    { name: "جوزيه مورينيو", icon: "🤫", type: "coach", label: "مدرب" },
    
    // أكشن
    { name: "سحب +2", icon: "➕2️⃣", type: "action", label: "أكشن" },
    { name: "تخطي (Skip)", icon: "🚫", type: "action", label: "أكشن" },
    { name: "عكس الاتجاه", icon: "🔄", type: "action", label: "أكشن" }
];

function createNewGame() {
    myPlayerName = document.getElementById('player-name').value.trim();
    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");

    currentRoomId = Math.floor(1000 + Math.random() * 9000).toString();
    const roomUrl = window.location.origin + window.location.pathname + "#room=" + currentRoomId;

    document.getElementById('share-link-field').value = roomUrl;
    showLobbyUI();
}

function joinGameViaInput() {
    myPlayerName = document.getElementById('player-name').value.trim();
    const inputLink = document.getElementById('join-link-input').value.trim();

    if (!myPlayerName) return alert("الرجاء كتابة اسمك أولاً!");
    if (!inputLink) return alert("الرجاء وضع رابط الغرفة!");

    document.getElementById('share-link-field').value = inputLink;
    showLobbyUI();
}

function showLobbyUI() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');

    const playersUl = document.getElementById('players-ul');
    playersUl.innerHTML = `<li>1. ${myPlayerName} (أنت)</li><li>2. لاعب انضم عبر الرابط...</li>`;
}

function copyRoomLink() {
    const linkField = document.getElementById('share-link-field');
    linkField.select();
    navigator.clipboard.writeText(linkField.value);
    alert("تم نسخ رابط الغرفة! أرسله لأصدقائك.");
}

function startGameSession() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('current-turn-display').innerText = `دور: ${myPlayerName}`;

    // توزيع 5 كروت عشوائية لكل لاعب
    myHandCards = [];
    for(let i=0; i<5; i++){
        myHandCards.push(cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)]);
    }
    renderMyHand();
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
    document.getElementById('active-card-name').innerText = played.name;
    document.getElementById('active-card-img').innerText = played.icon;
    document.getElementById('active-card-type').innerText = played.label;
    document.getElementById('active-card').className = `card ${played.type}`;
    renderMyHand();
}

function playerDrawsCard() {
    const drawn = cardDeckMaster[Math.floor(Math.random() * cardDeckMaster.length)];
    myHandCards.push(drawn);
    renderMyHand();
}