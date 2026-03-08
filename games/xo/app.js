/***********************
 * DOM
 ***********************/
const avatarHe = document.getElementById("avatarHe");
const avatarShe = document.getElementById("avatarShe");

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const giftBox = document.getElementById("giftBox");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const closeOverlay = document.getElementById("closeOverlay");

const switchBtn = document.getElementById("switchPlayer");
const resetScoreBtn = document.getElementById("resetScore");

const scoreHeEl = document.getElementById("scoreHe");
const scoreSheEl = document.getElementById("scoreShe");
const giftOverlay = document.getElementById("giftOverlay");
const giftTitle = document.getElementById("giftTitle");
const giftTextEl = document.getElementById("giftText");
const closeGiftOverlay = document.getElementById("closeGiftOverlay");
const soundMove = new Audio("sounds/click.mp3");
const soundWin = new Audio("sounds/win.mp3");
const soundSwitch = new Audio("sounds/switch.mp3");
const soundGift = new Audio("sounds/gift.mp3");

soundMove.volume = 0.6;
soundWin.volume = 0.7;
soundSwitch.volume = 0.6;
soundGift.volume = 0.7;

function unlockAudio(){

  const sounds = [
    soundMove,
    soundWin,
    soundSwitch,
    soundGift
  ];

  sounds.forEach(s => {
    s.play().then(() => {
      s.pause();
      s.currentTime = 0;
    }).catch(()=>{});
  });

}

document.addEventListener("pointerdown", unlockAudio, { once:true });

loadPlayerAvatars();


/***********************
 * STATE
 ***********************/
let currentPlayer = "he";
let gameActive = true;
let board = Array(9).fill(null);

/***********************
 * STORAGE
 ***********************/
function getStats() {
  return JSON.parse(localStorage.getItem("xoStats")) || { he: 0, she: 0 };
}

function saveStats(stats) {
  localStorage.setItem("xoStats", JSON.stringify(stats));
}

function updateScore() {
  const stats = getStats();
  scoreHeEl.textContent = stats.he;
  scoreSheEl.textContent = stats.she;
}

/***********************
 * ICONS
 ***********************/
const icons = {
  he: '<i class="fa-solid fa-xmark"></i>',
  she: '<i class="fa-solid fa-o"></i>'
};

/***********************
 * GIFTS
 ***********************/
const gifts = [
  "💆 Masaj senzual timp de 5 minute",
  "💃 Un dans lent, doar pentru tine",
  "💋 Sărutări fără grabă",
  "😏 Răsfăț ales de partener",
  "🔥 Provocare romantică surpriză"
];

/***********************
 * INIT
 ***********************/
function init() {
  boardEl.innerHTML = "";
  board.fill(null);
  gameActive = true;

  // 🔒 ASCUNDE FORȚAT CADOUL
  giftBox.classList.add("hidden");
  giftBox.style.display = "none";

  restartBtn.classList.add("hidden");

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.onclick = handleMove;
    boardEl.appendChild(cell);
  }

  updateStatus();
  updateScore();
  updateActivePlayerUI();
}
function updateStatus() {
  const names = getCoupleNames();

  statusEl.textContent =
    currentPlayer === "he"
      ? "Rândul lui " + names.he
      : "Rândul lui " + names.she;
}

/***********************
 * MOVE
 ***********************/
function handleMove(e) {

  if (!gameActive) return;

  const index = e.currentTarget.dataset.index;
  if (board[index]) return;

  soundMove.currentTime = 0;
  soundMove.play().catch(()=>{});

  board[index] = currentPlayer;

  avatarReact(currentPlayer,"🎯");

  e.currentTarget.innerHTML = icons[currentPlayer];
  e.currentTarget.classList.add("used", currentPlayer);

  if (checkWin()) {

    handleWin();

    if (typeof addGlobalPoint === "function") {
      addGlobalPoint(currentPlayer, "xo");
    }

    return;
  }

  if (board.every(Boolean)) {
    gameActive = false;
    statusEl.textContent = "🤝 Egalitate!";
    restartBtn.classList.remove("hidden");
    return;
  }

  currentPlayer = currentPlayer === "he" ? "she" : "he";

  updateStatus();
  updateActivePlayerUI();

}
function handleWin() {

  soundWin.currentTime = 0;
  soundWin.play().catch(()=>{});

  gameActive = false;

  // 👑 winner reaction
  avatarReact(currentPlayer,"👑");

  // 😅 loser reaction
  const loser = currentPlayer === "he" ? "she" : "he";

  setTimeout(()=>{
    avatarReact(loser,"😅");
  },300);

  const { he, she } = getCoupleNames();
  const winnerName = currentPlayer === "he" ? he : she;

  statusEl.textContent = `🎉 Felicitări ${winnerName}!`;

  const stats = getStats();
  currentPlayer === "he" ? stats.he++ : stats.she++;

  saveStats(stats);
  updateScore();

  launchConfetti();

  setTimeout(() => {
    giftBox.style.display = "flex";
    giftBox.classList.remove("hidden");
  }, 900);

  restartBtn.classList.remove("hidden");

}

/***********************
 * WIN CHECK
 ***********************/
function checkWin() {

  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const combo of wins) {

    if (combo.every(i => board[i] === currentPlayer)) {

      combo.forEach(i => {
        boardEl.children[i].classList.add("win");
      });

      return true;
    }

  }

  return false;
}
/***********************
 * GIFT
 ***********************/
giftBox.onclick = () => {
  const gift = gifts[Math.floor(Math.random() * gifts.length)];

  const names = typeof getCoupleNames === "function"
    ? getCoupleNames()
    : { he: "EL", she: "EA" };

  const winnerName =
    currentPlayer === "he"
      ? names.he
      : names.she;

  giftTitle.textContent = "🎉 " + winnerName + " a câștigat!";
  giftTextEl.textContent = gift;

  giftOverlay.classList.remove("hidden");

  giftBox.classList.add("hidden");
  giftBox.style.display = "none";
};

closeGiftOverlay.onclick = () => {
  giftOverlay.classList.add("hidden");
};


/***********************
 * SWITCH PLAYER
 ***********************/
switchBtn.onclick = () => {
    soundSwitch.currentTime = 0;
soundSwitch.play().catch(()=>{});
  currentPlayer = currentPlayer === "he" ? "she" : "he";

  switchBtn.innerHTML =
    currentPlayer === "he"
      ? '<i class="fa-solid fa-mars"></i>'
      : '<i class="fa-solid fa-venus"></i>';

  updateStatus();
  updateActivePlayerUI();

  const activeItem = document.querySelector(".score-item.active");

  activeItem.classList.add("switch-flash");

  setTimeout(()=>{
    activeItem.classList.remove("switch-flash");
  },500);

};

/***********************
 * RESET SCORE
 ***********************/
resetScoreBtn.onclick = () => {
  if (!confirm("Sigur vrei să resetezi scorul? 😏")) return;
  saveStats({ he: 0, she: 0 });
  updateScore();
};

/***********************
 * CONFETTI
 ***********************/
function launchConfetti() {
  for (let i = 0; i < 120; i++) {
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
 * RESTART
 ***********************/
restartBtn.onclick = init;

/***********************
 * START
 ***********************/
init();



window.addEventListener("load", () => {
  const intro = document.querySelector(".intro");

  setTimeout(() => {
    intro.classList.add("fade-out");
  }, 2000); // durata totală intro
});






/*************************
 * AUTO FULLSCREEN
 *************************/

function autoFullscreen() {
  if (
    localStorage.getItem("pb_fullscreen") === "true" &&
    !document.fullscreenElement
  ) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", autoFullscreen);


function updateActivePlayerUI(){

  const heItem = document.querySelector(".score-item.he");
  const sheItem = document.querySelector(".score-item.she");

  const reactionHe = document.getElementById("reactionHe");
  const reactionShe = document.getElementById("reactionShe");

  heItem.classList.remove("active");
  sheItem.classList.remove("active");

  if(currentPlayer === "he"){

    heItem.classList.add("active");

    if(reactionHe) reactionHe.textContent = "❌";
    if(reactionShe) reactionShe.textContent = "⭕";

  }else{

    sheItem.classList.add("active");

    if(reactionHe) reactionHe.textContent = "❌";
    if(reactionShe) reactionShe.textContent = "⭕";

  }

}

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