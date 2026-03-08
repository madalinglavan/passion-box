/***********************
 * UTILS
 ***********************/
function getStats() {
  const raw = JSON.parse(localStorage.getItem("stats")) || {};
  return {
    he: raw.he || 0,
    she: raw.she || 0,
    cardsOpened: raw.cardsOpened || 0,
    openedCards: Array.isArray(raw.openedCards) ? raw.openedCards : [],
    refuses: raw.refuses || { he: 0, she: 0 }
  };
}

function saveStats(stats) {
  localStorage.setItem("stats", JSON.stringify(stats));
}

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/***********************
 * DOM ELEMENTS
 ***********************/
const decisionBox = document.getElementById("decisionBox");
const refuseBtn = document.getElementById("refuseCard");
const acceptBtn = document.getElementById("acceptCard");
const board = document.getElementById("board");
const loader = document.getElementById("loader");
const menu = document.getElementById("playerMenu");

const overlay = document.getElementById("overlay");
const overlayImg = document.getElementById("overlay-img");
const overlayText = document.getElementById("overlay-text");
const closeOverlay = document.getElementById("closeOverlay");

const scoreHeEl = document.getElementById("scoreHe");
const scoreSheEl = document.getElementById("scoreShe");

const heItem = document.querySelector(".score-item.he");
const sheItem = document.querySelector(".score-item.she");

const resetBtn = document.getElementById("reset");
const randomBtn = document.getElementById("randomCard");
const resetScoreBtn = document.getElementById("resetScore");

const resetConfirm = document.getElementById("resetConfirm");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");
const resetText = document.getElementById("resetText");

const switchBtn = document.getElementById("switchPlayer");
const switchMessage = document.getElementById("switchMessage");

const endPanel = document.getElementById("endPanel");
const restartGameBtn = document.getElementById("restartGame");

const thankPopup = document.getElementById("thankPopup");

let currentPlayer = null;
let isProcessing = false;
const avatarHe = document.getElementById("avatarHe");
const avatarShe = document.getElementById("avatarShe");


function loadAvatars() {

  let savedHe = localStorage.getItem("avatarHe");
  let savedShe = localStorage.getItem("avatarShe");

  if(savedHe && !savedHe.startsWith("data:") && !savedHe.startsWith("http")){
    savedHe = "../../" + savedHe;
  }

  if(savedShe && !savedShe.startsWith("data:") && !savedShe.startsWith("http")){
    savedShe = "../../" + savedShe;
  }

  if(savedHe && avatarHe) avatarHe.src = savedHe;
  if(savedShe && avatarShe) avatarShe.src = savedShe;

}




const avatarStartHe = document.getElementById("avatarStartHe");
const avatarStartShe = document.getElementById("avatarStartShe");

function loadStartAvatars(){

  let savedHe = localStorage.getItem("avatarHe");
  let savedShe = localStorage.getItem("avatarShe");

  if(savedHe && !savedHe.startsWith("data:") && !savedHe.startsWith("http")){
    savedHe = "../../" + savedHe;
  }

  if(savedShe && !savedShe.startsWith("data:") && !savedShe.startsWith("http")){
    savedShe = "../../" + savedShe;
  }

  if(avatarStartHe) avatarStartHe.src = savedHe;
  if(avatarStartShe) avatarStartShe.src = savedShe;

}

/***********************
 * SOUND SYSTEM
 ***********************/
const soundFlip = new Audio("sounds/card_flip.mp3");
const soundReveal = new Audio("sounds/reveal.mp3");
const acceptSounds = [
  new Audio("sounds/accept1.mp3"),
  new Audio("sounds/accept2.mp3"),
  new Audio("sounds/accept3.mp3"),
  new Audio("sounds/accept4.mp3")
];

acceptSounds.forEach(s => s.volume = 0.7);
function playRandomAccept(){

  const sound =
    acceptSounds[Math.floor(Math.random() * acceptSounds.length)];

  sound.currentTime = 0;
  sound.play().catch(()=>{});

}
const soundReject = new Audio("sounds/reject.mp3");
const soundShuffle = new Audio("sounds/shuffle.mp3");
const soundHover = new Audio("sounds/hover.mp3");

const soundPointUp = new Audio("sounds/point_up.mp3");
const soundPointDown = new Audio("sounds/point_down.mp3");
const soundSwitch = new Audio("sounds/switch.mp3");

soundFlip.volume = 0.6;
soundReveal.volume = 0.6;
soundReject.volume = 0.5;
soundShuffle.volume = 0.6;
soundHover.volume = 0.3;

soundPointUp.volume = 0.7;
soundPointDown.volume = 0.7;
soundSwitch.volume = 0.6;


/* unlock audio pentru mobile */
function unlockAudio() {

  const sounds = [
    soundFlip,
    soundReveal,
    soundAccept,
    soundReject,
    soundShuffle,
    soundHover,
    soundPointUp,
    soundPointDown,
    soundSwitch,
      ...acceptSounds
  ];

  sounds.forEach(s => {
    s.volume = s.volume;

    s.play().then(() => {
      s.pause();
      s.currentTime = 0;
    }).catch(()=>{});
  });

}

document.addEventListener("pointerdown", unlockAudio, { once:true });
/***********************
 * INIT STORAGE
 ***********************/
if (!localStorage.getItem("stats")) {
  saveStats({
  he: 0,
  she: 0,
  cardsOpened: 0,
  openedCards: [],
  refuses: { he: 0, she: 0 }
});
}
/***********************
 * UI STATE
 ***********************/
function isUIBlocked() {
  return (
    !overlay.classList.contains("hidden") ||
    !resetConfirm.classList.contains("hidden") ||
    !endPanel.classList.contains("hidden") ||
    isProcessing
  );
}

/***********************
 * SCORE + LEADER
 ***********************/
function updateScore() {
  const stats = getStats();
  scoreHeEl.textContent = stats.he;
  scoreSheEl.textContent = stats.she;
}

function updateLeader() {
  const stats = getStats();

  heItem.classList.remove("leader");
  sheItem.classList.remove("leader");

  if (stats.he > stats.she) {
    heItem.classList.add("leader");
  } else if (stats.she > stats.he) {
    sheItem.classList.add("leader");
  }
}

function updateActivePlayerUI() {
  heItem.classList.remove("active", "inactive");
  sheItem.classList.remove("active", "inactive");

  if (currentPlayer === "he") {
    heItem.classList.add("active");
    sheItem.classList.add("inactive");
  } else if (currentPlayer === "she") {
    sheItem.classList.add("active");
    heItem.classList.add("inactive");
  }
}
function ensureNamesExist() {
  if (!localStorage.getItem("playerHeName")) {
    localStorage.setItem("playerHeName", "EL");
  }
  if (!localStorage.getItem("playerSheName")) {
    localStorage.setItem("playerSheName", "EA");
  }
}
function animateActivePlayer() {
  const activeItem = document.querySelector(".score-item.active");
  if (!activeItem) return;

  activeItem.animate(
    [
      { transform: "scale(1.1)" },
      { transform: "scale(1.25)" },
      { transform: "scale(1.1)" }
    ],
    { duration: 300 }
  );
}

/***********************
 * CARD DATA
 ***********************/
const cardsData = [ { img: "img/1.png", text: "😘❤️" }, { img: "img/2.png", text: "🍑🔥" }, { img: "img/3.png", text: "💋" }, { img: "img/4.png", text: "💞" }, { img: "img/5.png", text: "🔥" }, { img: "img/6.png", text: "👄🍑" }, { img: "img/7.png", text: "👅🔥" }, { img: "img/8.png", text: "👄💖" }, { img: "img/9.png", text: "👅❤️" }, { img: "img/10.png", text: "💞" }, { img: "img/11.png", text: "🔥" }, { img: "img/12.png", text: "💋" }, { img: "img/13.png", text: "😘💏" }, { img: "img/14.png", text: "🔥" }, { img: "img/15.png", text: "💞" }, { img: "img/16.png", text: "😘❤️" }, { img: "img/17.png", text: "🍑🔥" }, { img: "img/18.png", text: "💋" }, { img: "img/19.png", text: "💞" }, { img: "img/20.png", text: "🔥" }, { img: "img/21.png", text: "👄🍑" }, { img: "img/22.png", text: "👅🔥" }, { img: "img/23.png", text: "👄💖" }, { img: "img/24.png", text: "👅❤️" }, { img: "img/25.png", text: "💞" }, { img: "img/26.png", text: "🔥" }, { img: "img/27.png", text: "💋" }, { img: "img/28.png", text: "😘💏" }, { img: "img/29.png", text: "🔥" }, { img: "img/30.png", text: "💞" }, { img: "img/31.png", text: "😘❤️" }, { img: "img/32.png", text: "🍑🔥" }, { img: "img/33.png", text: "💋" }, { img: "img/34.png", text: "💞" }, { img: "img/35.png", text: "🔥" }, { img: "img/36.png", text: "👄🍑" }, { img: "img/37.png", text: "👅🔥" }, { img: "img/38.png", text: "👄💖" }, { img: "img/39.png", text: "👅❤️" }, { img: "img/40.png", text: "💞" }, { img: "img/41.png", text: "🔥" }, { img: "img/42.png", text: "💋" }, { img: "img/43.png", text: "😘💏" }, { img: "img/44.png", text: "🔥" }, { img: "img/45.png", text: "💞" }, ];

/***********************
 * BOARD RENDER
 ***********************/
function renderBoard(data = cardsData) {
  board.innerHTML = "";
  const stats = getStats();

  data.forEach((cardData, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = String(index);
    card.onmouseenter = () => {
    soundHover.currentTime = 0;
    soundHover.play().catch(()=>{});
};

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-front";
    front.textContent = "❓";

    const back = document.createElement("div");
    back.className = "card-back";

    const img = document.createElement("img");
    img.src = cardData.img;

    back.appendChild(img);
    inner.append(front, back);
    card.appendChild(inner);

    const saved = stats.openedCards.find(c => c.id === card.dataset.id);
    if (saved) {
      card.dataset.opened = "true";
      card.classList.add("used", saved.player);
    }

    card.onclick = () => handleCardClick(card, cardData);

    board.appendChild(card);
  });
}

/***********************
 * CARD LOGIC
 ***********************/
function handleCardClick(card, cardData) {
  if (!currentPlayer || isUIBlocked()) return;
  if (card.dataset.opened) return;

  isProcessing = true;
  soundFlip.currentTime = 0;
  soundFlip.play().catch(()=>{});

if (navigator.vibrate) navigator.vibrate(15);
  card.dataset.opened = "true";
  card.classList.add("flipped", currentPlayer);
  soundFlip.currentTime = 0;
  soundFlip.play().catch(()=>{});

  setTimeout(() => {
  processCardOpen(card, cardData);
}, 600);
}

function processCardOpen(card, cardData) {
  overlayImg.src = cardData.img;
  overlayText.textContent = cardData.text;

 overlay.classList.remove("hidden");
decisionBox.classList.remove("hidden");

soundReveal.currentTime = 0;
soundReveal.play().catch(()=>{});

  const stats = getStats();

  // ACCEPT
  acceptBtn.onclick = () => {
    finalizeCard(card);
  };

  // REFUSE
  refuseBtn.onclick = () => {
    handleRefuse(card);
  };
}

function handleRefuse(card) {
  const stats = getStats();
  avatarReact(currentPlayer,"🙈");
  // Scade 1 punct dacă are
  if (stats[currentPlayer] > 0) {
    stats[currentPlayer]--;
  }
soundReject.currentTime = 0;
soundReject.play().catch(()=>{});

// delay pentru -1 punct
setTimeout(() => {

  soundPointDown.currentTime = 0;
  soundPointDown.play().catch(()=>{});

}, 750);
  // 🔥 SCĂDEM ȘI DIN GLOBAL STATS
  if (typeof addGlobalPoint === "function") {
    addGlobalPoint(currentPlayer, "card", -1);
  }

  saveStats(stats);

  updateScore();
  updateLeader();

  // închidem overlay
  decisionBox.classList.add("hidden");
  overlay.classList.add("hidden");

  // reset carte
  card.dataset.opened = "";
  card.classList.remove("flipped", currentPlayer);

  showThankPopup("❌ Refuzată! -1 punct");

  isProcessing = false;
}
function finalizeCard(card) {
  const stats = getStats();
avatarReact(currentPlayer,"😏");
  stats.openedCards.push({
    id: card.dataset.id,
    player: currentPlayer
  });

playRandomAccept();

// delay pentru +1 punct
setTimeout(() => {

  soundPointUp.currentTime = 0;
  soundPointUp.play().catch(()=>{});

}, 550);

  stats.cardsOpened++;
  stats[currentPlayer]++;

  saveStats(stats);

  // 🔥 TRANSMITERE GLOBAL SCORE
  if (typeof addGlobalPoint === "function") {
    addGlobalPoint(currentPlayer, "card");
  }

  updateScore();
  updateLeader();
  animateActivePlayer();
const names = getCoupleNames();
const activeName = currentPlayer === "he" ? names.he : names.she;

showThankPopup(`🔥 ${activeName} a acceptat provocarea!`);
  decisionBox.classList.add("hidden");
  overlay.classList.add("hidden");

  checkEndGame();
  isProcessing = false;
}
/***********************
 * END GAME
 ***********************/
function checkEndGame() {
  const cards = document.querySelectorAll(".card");
  const opened = [...cards].filter(c => c.dataset.opened === "true");

  if (opened.length === cards.length) {
    setTimeout(() => {
      endPanel.classList.remove("hidden");
      launchConfetti();
    }, 800);
  }
}

function launchConfetti() {
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = `hsl(${Math.random() * 360},80%,60%)`;
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

/***********************
 * BUTTONS
 ***********************/
closeOverlay.onclick = () => {
  overlay.classList.add("hidden");
  showThankPopup();
};

randomBtn.onclick = () => {
  if (!currentPlayer || isUIBlocked()) return;
  const cards = [...document.querySelectorAll(".card")]
    .filter(c => !c.dataset.opened);
  if (!cards.length) return;
  cards[Math.floor(Math.random() * cards.length)].click();
};

resetBtn.onclick = () => {

  if (isUIBlocked()) return;

  soundShuffle.currentTime = 0;
  soundShuffle.play().catch(()=>{});

  renderBoard(shuffleArray(cardsData));

  showThankPopup("🃏 Cărțile au fost amestecate...", 2000);
};
resetScoreBtn.onclick = () => {
  resetConfirm.classList.remove("hidden");
};

confirmReset.onclick = () => {
  saveStats({
  he: 0,
  she: 0,
  cardsOpened: 0,
  openedCards: [],
  refuses: { he: 0, she: 0 }
});
  updateScore();
  updateLeader();
  renderBoard();
  resetConfirm.classList.add("hidden");
  saveStats({
  he: 0,
  she: 0,
  cardsOpened: 0,
  openedCards: [],
  refuses: { he: 0, she: 0 }
});
};

cancelReset.onclick = () => {
  resetConfirm.classList.add("hidden");
};

switchBtn.onclick = () => {
  if (!currentPlayer || isUIBlocked()) return;
avatarReact(currentPlayer,"⚡");
  currentPlayer = currentPlayer === "he" ? "she" : "he";
  updateActivePlayerUI();

  const names = getCoupleNames();
  const activeName = currentPlayer === "he" ? names.he : names.she;

  const funnyMessages = [
    `🔥 Rândul lui ${activeName}! Să vedem ce alegi 😏`,
    `😈 Atenție! ${activeName} intră în forță!`,
    `💣 Boom! ${activeName} preia controlul!`,
    `👑 ${activeName} conduce acum jocul!`,
    `🎯 Concentrează-te ${activeName}...`
  ];
soundSwitch.currentTime = 0;
soundSwitch.play().catch(()=>{});
  const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  switchMessage.textContent = randomMsg;
  switchMessage.classList.add("show");

  setTimeout(() => switchMessage.classList.remove("show"), 2200);
};

/***********************
 * PLAYER SELECT
 ***********************/
document.getElementById("chooseHe").onclick = () => {
  currentPlayer = "he";
  menu.style.display = "none";
  updateActivePlayerUI();
};

document.getElementById("chooseShe").onclick = () => {
  currentPlayer = "she";
  menu.style.display = "none";
  updateActivePlayerUI();
};

/***********************
 * THANK POPUP
 ***********************/
function showThankPopup(text = "😏 bună alegere!", duration = 1500) {
  if (!thankPopup) return;

  thankPopup.textContent = text;
  thankPopup.classList.add("show");

  if (navigator.vibrate) navigator.vibrate(20);

  setTimeout(() => {
    thankPopup.classList.remove("show");
  }, duration);
}

/***********************
 * INIT
 ***********************/
window.addEventListener("load", () => {

  ensureNamesExist();
loadAvatars();
loadStartAvatars();
  setTimeout(() => {
    loader.style.display = "none";
    menu.style.display = "flex";

    loadStartAvatars();   // 🔥 ASTA LIPSEA

    loadAvatars();
    updateScore();
    updateLeader();
    renderBoard();
  }, 1500);

  const intro = document.querySelector(".intro");
  setTimeout(() => {
    intro.classList.add("fade-out");
  }, 2000);
});
document.addEventListener("gesturestart", e => e.preventDefault());



/*************************
 * AUTO FULLSCREEN SYSTEM
 *************************/

function enterFullscreen() {

  const el = document.documentElement;

  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }

}

function autoFullscreen() {

  if (localStorage.getItem("pb_fullscreen") === "true") {

    if (!document.fullscreenElement) {
      enterFullscreen();
    }

  }

}

/* fullscreen pornește la primul click/touch */
document.addEventListener("pointerdown", autoFullscreen, { once: true });

loadPlayerAvatars();

function avatarReact(player, emoji){

  const el =
    player === "he"
      ? document.getElementById("reactionHe")
      : document.getElementById("reactionShe");

  if(!el) return;

  el.textContent = emoji;

  el.classList.add("show");

  setTimeout(()=>{
    el.classList.remove("show");
  },1500);

}

const fullscreenBtn = document.getElementById("fullscreenBtn");

function enterFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

function updateFullscreenUI() {

  if (!fullscreenBtn) return;

  if (document.fullscreenElement) {

    fullscreenBtn.classList.add("active");
    fullscreenBtn.textContent = "✕";
    localStorage.setItem("pb_fullscreen", "true");

  } else {

    fullscreenBtn.classList.remove("active");
    fullscreenBtn.textContent = "⛶";
    localStorage.setItem("pb_fullscreen", "false");

  }
}

if (fullscreenBtn) {

  fullscreenBtn.onclick = () => {

    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }

  };

}

document.addEventListener("fullscreenchange", updateFullscreenUI);

/**********************
 AUTO FULLSCREEN
**********************/
document.addEventListener("DOMContentLoaded", () => {

  if (localStorage.getItem("pb_fullscreen") === "true") {
    enterFullscreen();
  }

});
