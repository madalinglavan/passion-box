const funPopup = document.getElementById("funPopup");

/***********************
 * AVATAR LOAD
 ***********************/
const avatarHe = document.getElementById("avatarHe");
const avatarShe = document.getElementById("avatarShe");

const savedHe = localStorage.getItem("avatarHe");
const savedShe = localStorage.getItem("avatarShe");

if (savedHe) avatarHe.src = savedHe;
if (savedShe) avatarShe.src = savedShe;

/***********************
 * RESULT OVERLAY
 ***********************/
const resultOverlay = document.getElementById("resultOverlay");
const resultImg = document.getElementById("resultImg");
const resultTextEl = document.getElementById("resultText");

const acceptBtn = document.getElementById("acceptResult");
const rejectBtn = document.getElementById("rejectResult");

/***********************
 * WHEEL DATA
 ***********************/
const wheelItems = [
  { label: "Oral", img: "img/filming.jpg" },
  { label: "Masaj", img: "img/massage.jpg" },
  { label: "Poziție", img: "img/position.jpg" },
  { label: "Oral", img: "img/oral.jpg" },
  { label: "Mângâieri", img: "img/touch.jpg" },
  { label: "Surpriză", img: "img/surprise.jpg" }
];

/***********************
 * DOM
 ***********************/
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const switchBtn = document.getElementById("switchPlayer");
const resetScoreBtn = document.getElementById("resetScore");
const resetConfirm = document.getElementById("resetConfirm");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");
const switchMessage = document.getElementById("switchMessage");
const powerFill = document.getElementById("powerFill");

/***********************
 * SOUND SYSTEM
 ***********************/
const soundPointUp = new Audio("sounds/point_up.mp3");
const soundPointDown = new Audio("sounds/point_down.mp3");
const soundSpin = new Audio("sounds/spin.mp3");
const soundTick = new Audio("sounds/tick.mp3");
const soundCharge = new Audio("sounds/charge.mp3");
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

soundPointUp.volume = 0.7;
soundPointDown.volume = 0.7;
soundSpin.volume = 0.6;
soundTick.volume = 0.4;
soundCharge.volume = 0.3;
soundReject.volume = 0.7;

let tickInterval;
soundSpin.load();
soundTick.load();
soundCharge.load();
soundReject.load();


function unlockAudio() {

const sounds = [
  soundSpin,
  soundTick,
  soundCharge,
  soundReject,
  soundPointUp,
  soundPointDown,
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
 * STORAGE
 ***********************/
function getStats() {
  const raw = JSON.parse(localStorage.getItem("wheelStats")) || {};
  return {
    he: raw.he || 0,
    she: raw.she || 0
  };
}

function saveStats(stats) {
  localStorage.setItem("wheelStats", JSON.stringify(stats));
}

/***********************
 * STATE
 ***********************/
let currentPlayer = "he";
let currentRotation = 0;
let spinning = false;
let charging = false;
let power = 0;
let chargeInterval;

/***********************
 * ACTIVE PLAYER UI
 ***********************/
function updateActivePlayerUI() {
  const heItem = document.querySelector(".score-item.he");
  const sheItem = document.querySelector(".score-item.she");

  heItem.classList.remove("active");
  sheItem.classList.remove("active");

  if (currentPlayer === "he") {
    heItem.classList.add("active");
  } else {
    sheItem.classList.add("active");
  }
}

/***********************
 * UPDATE SCORE UI
 ***********************/
function updateScore() {
  const stats = getStats();
  document.getElementById("scoreHe").textContent = stats.he;
  document.getElementById("scoreShe").textContent = stats.she;
}

/***********************
 * BUILD WHEEL ICONS
 ***********************/
function buildWheel() {
  wheel.innerHTML = "";

  const radius = 110;
  const center = 150;
  const sliceAngle = 360 / wheelItems.length;

  wheelItems.forEach((item, index) => {
    const icon = document.createElement("img");
    icon.src = item.img;
    icon.className = "wheel-icon";

    const angle = index * sliceAngle + sliceAngle / 2 - 90;
    const rad = angle * Math.PI / 180;

    const x = center + radius * Math.cos(rad) - 32;
    const y = center + radius * Math.sin(rad) - 32;

    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.style.transform = `rotate(${angle + 90}deg)`;

    wheel.appendChild(icon);
  });
}

/***********************
 * POWER SYSTEM
 ***********************/
function startCharging() {

  if (spinning || charging) return;

  charging = true;
  power = 0;

  spinBtn.classList.add("charging");

  chargeInterval = setInterval(() => {

    if (power < 100) {

      power += 2;
      powerFill.style.width = power + "%";

      if (power % 10 === 0) {
        soundCharge.currentTime = 0;
        soundCharge.play().catch(()=>{});
      }

      if (navigator.vibrate) navigator.vibrate(10);

    }

  }, 40);

}
function releaseSpin() {

  if (!charging || spinning) return;

  charging = false;
  clearInterval(chargeInterval);

  if (!wheelItems.length) return;

  spinBtn.classList.remove("charging");

  spinning = true;
  spinBtn.disabled = true;

  soundSpin.currentTime = 0;
  soundSpin.play().catch(()=>{});

  const sliceAngle = 360 / wheelItems.length;
  const randomOffset = Math.random() * 360;
  const extraSpins = 360 * (3 + Math.floor(power / 25));

  currentRotation += extraSpins + randomOffset;

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  startWheelTicks();

  powerFill.style.width = "0%";

 setTimeout(() => {

  stopWheelTicks();

  soundSpin.pause();          // 🔊 OPREȘTE sunetul roții
  soundSpin.currentTime = 0;  // resetează pentru următoarea rotire

  const normalizedRotation = currentRotation % 360;
  const correctedAngle = (360 - normalizedRotation) % 360;
  const index = Math.floor(correctedAngle / sliceAngle);

  const selectedItem = wheelItems[index];

  resultImg.src = selectedItem.img;
  resultTextEl.textContent = selectedItem.label;

  resultOverlay.classList.remove("hidden");

  spinBtn.disabled = false;

}, 4000);
soundSpin.volume = 0.2;
setTimeout(()=>{
  soundSpin.pause();
  soundSpin.currentTime = 0;
},3000);
}
function startWheelTicks() {

  clearTimeout(tickInterval);

  let tickSpeed = 80;
  const maxSpeed = 320;

  function tick() {

    if (!spinning) {
      clearTimeout(tickInterval);
      return;
    }

    soundTick.currentTime = 0;
    soundTick.play().catch(()=>{});

    tickSpeed += 12;

    if (tickSpeed < maxSpeed && spinning) {
      tickInterval = setTimeout(tick, tickSpeed);
    }

  }

  tickInterval = setTimeout(tick, tickSpeed);

}

function stopWheelTicks() {

  clearTimeout(tickInterval);
  spinning = false;

}

/***********************
 * POINTER EVENTS
 ***********************/
spinBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  startCharging();
});

spinBtn.addEventListener("pointerup", (e) => {
  e.preventDefault();
  releaseSpin();
});

spinBtn.addEventListener("pointerleave", releaseSpin);
spinBtn.addEventListener("pointercancel", releaseSpin);


/***********************
 * ACCEPT RESULT
 ***********************/
acceptBtn.onclick = () => {

  playRandomAccept();

  avatarReact(currentPlayer,"🔥");

  setTimeout(() => {
    soundPointUp.currentTime = 0;
    soundPointUp.play().catch(()=>{});
  }, 2000);

  const stats = getStats();

  if (currentPlayer === "he") {
    stats.he++;
  } else {
    stats.she++;
  }

  const funnyAccept = [
    "🔥 Curaj maxim!",
    "😏 Se anunță distracție...",
    "👑 Așa se face!",
    "💥 Decizie îndrăzneață!",
    "⚡ Energia crește!"
  ];

  showFunPopup(
    funnyAccept[Math.floor(Math.random() * funnyAccept.length)]
  );

  saveStats(stats);
  updateScore();

  if (typeof addGlobalPoint === "function") {
    addGlobalPoint(currentPlayer, "wheel");
  }

  resultOverlay.classList.add("hidden");

};
/***********************
 * REJECT RESULT
 ***********************/
rejectBtn.onclick = () => {

  soundReject.currentTime = 0;
  soundReject.play().catch(()=>{});

  avatarReact(currentPlayer,"😬");

  setTimeout(() => {
    soundPointDown.currentTime = 0;
    soundPointDown.play().catch(()=>{});
  }, 1000);

  const stats = getStats();

  const funnyReject = [
    "😅 Lașitate detectată!",
    "🙈 Poate data viitoare...",
    "👀 Evitare strategică!",
    "😇 Inocență suspectă...",
    "💤 A scăpat ușor..."
  ];

  showFunPopup(
    funnyReject[Math.floor(Math.random() * funnyReject.length)]
  );

  if (currentPlayer === "he") {
    stats.he = Math.max(0, stats.he - 1);
  } else {
    stats.she = Math.max(0, stats.she - 1);
  }

  saveStats(stats);
  updateScore();

  if (typeof addGlobalPoint === "function") {
    addGlobalPoint(currentPlayer, "wheel", -1);
  }

  resultOverlay.classList.add("hidden");

};
/***********************
 * SWITCH PLAYER
 ***********************/
switchBtn.onclick = () => {

  currentPlayer = currentPlayer === "he" ? "she" : "he";

  switchBtn.innerHTML =
    currentPlayer === "he"
      ? '<i class="fa-solid fa-mars"></i>'
      : '<i class="fa-solid fa-venus"></i>';

  updateActivePlayerUI();

  const activeItem = document.querySelector(".score-item.active");

  activeItem.classList.add("switch-flash");

  setTimeout(() => {
    activeItem.classList.remove("switch-flash");
  }, 600);

  const messages = getSwitchMessages();

  const randomMsg =
    messages[currentPlayer][
      Math.floor(Math.random() * messages[currentPlayer].length)
    ];

  showFunPopup(randomMsg);

  if (navigator.vibrate) navigator.vibrate(30);

};

/***********************
 * RESET SCORE
 ***********************/
resetScoreBtn.onclick = () => {
  resetConfirm.classList.remove("hidden");
};

confirmReset.onclick = () => {
  saveStats({ he: 0, she: 0 });
  updateScore();
  showFunPopup("💣 BOOM! Scor resetat!");
  resetConfirm.classList.add("hidden");
};

cancelReset.onclick = () => {
  resetConfirm.classList.add("hidden");
};

/***********************
 * INIT
 ***********************/
window.addEventListener("load", () => {

  buildWheel();
  updateScore();
  updateActivePlayerUI();

  const intro = document.querySelector(".intro");

  setTimeout(() => {
    intro.classList.add("fade-out");
  }, 1800);

});

/***********************
 * FUN SWITCH MESSAGES
 ***********************/
function getSwitchMessages() {
  return {
    he: [
      "😎 El își suflecă mânecile...",
      "🔥 Bărbatul intră în arenă!",
      "🎯 Să vedem ce curaj are...",
      "👑 Regele roții preia controlul!",
      "⚡ Energie masculină activată!"
    ],
    she: [
      "💃 Ea vine cu stil!",
      "🔥 Regina roții e pregătită!",
      "✨ Queen mode ON!",
      "🎯 Să vedem cât e de îndrăzneață...",
      "👑 Atmosfera devine periculoasă!"
    ]
  };
}

/***********************
 * FUN POPUP
 ***********************/
function showFunPopup(text) {

  funPopup.textContent = text;

  funPopup.classList.remove("he", "she");

  funPopup.classList.add(currentPlayer);
  funPopup.classList.add("show");

  if (navigator.vibrate) navigator.vibrate(40);

  setTimeout(() => {
    funPopup.classList.remove("show");
  }, 2200);

}

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