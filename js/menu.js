/*************************
 * DOM REFERENCES
 *************************/
const avatarHe = document.getElementById("avatarHe");
const avatarShe = document.getElementById("avatarShe");
const uploadHe = document.getElementById("uploadHe");
const uploadShe = document.getElementById("uploadShe");

const globalHeEl = document.getElementById("globalHe");
const globalSheEl = document.getElementById("globalShe");

const bigBox = document.getElementById("bigBox");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const closeOverlay = document.getElementById("closeOverlay");

const editBtn = document.getElementById("editNamesBtn");
const namesOverlay = document.getElementById("namesOverlay");
const saveBtn = document.getElementById("saveNames");
const nameHeInput = document.getElementById("nameHe");
const nameSheInput = document.getElementById("nameShe");

const throwBtn = document.getElementById("throwBtn");
const stone = document.getElementById("stone");
const gameCards = document.querySelectorAll(".game-card");

const fullscreenBtn = document.getElementById("fullscreenBtn");

const hitSound = new Audio("sounds/hit.mp3");
hitSound.volume = 0.6;
const gameIntroSound = new Audio("sounds/game_intro.mp3");
gameIntroSound.volume = 0.7;

/*************************
 * GLOBAL UI UPDATE
 *************************/
function updateGlobalUI() {
  const stats = getGlobalStats();
  const names = getCoupleNames();

  globalHeEl.textContent = stats.he.score;
  globalSheEl.textContent = stats.she.score;

  document.getElementById("labelHe").textContent = names.he;
  document.getElementById("labelShe").textContent = names.she;

  if (stats.bigBoxUnlocked) {
    bigBox.classList.remove("hidden");
  } else {
    bigBox.classList.add("hidden");
  }

  loadAvatars();
}

/*************************
 * LOAD AVATARS
 *************************/
function loadAvatars() {

  const names = getCoupleNames();

  let savedHe = localStorage.getItem("avatarHe");
  let savedShe = localStorage.getItem("avatarShe");

  if (!savedHe) {
    savedHe = generateAvatar(names.he);
    localStorage.setItem("avatarHe", savedHe);
  }

  if (!savedShe) {
    savedShe = generateAvatar(names.she, "micah");
    localStorage.setItem("avatarShe", savedShe);
  }

  if (avatarHe) avatarHe.src = savedHe;
  if (avatarShe) avatarShe.src = savedShe;
if (!savedHe) {
  savedHe = "/images/avatars/male/m1.png";
  localStorage.setItem("avatarHe", savedHe);
}

if (!savedShe) {
  savedShe = "/images/avatars/female/f1.png";
  localStorage.setItem("avatarShe", savedShe);
}
}
/*************************
 * PROFILE CHECK
 *************************/
function isProfileComplete() {
  const names = getCoupleNames();
  const avatarHe = localStorage.getItem("avatarHe");
  const avatarShe = localStorage.getItem("avatarShe");

  if (!names.he || names.he === "EL") return false;
  if (!names.she || names.she === "EA") return false;
  if (!avatarHe || !avatarShe) return false;

  return true;
}

/*************************
 * BIG BOX CLICK
 *************************/
bigBox.onclick = () => {
  const stats = getGlobalStats();
  const names = getCoupleNames();
  const gift = getRandomBigGift();

  if (!stats.bigBoxUnlocked || !stats.bigBoxWinner) return;

  const winnerName =
    stats.bigBoxWinner === "he"
      ? names.he
      : names.she;

  overlayText.innerHTML = `
    👑 ${winnerName} este campionul absolut al pasiunii!<br>
    🏆 Victorie supremă!<br><br>
    🎁 <strong>${gift}</strong>
  `;

  overlay.classList.remove("hidden");
};

/*************************
 * CLOSE BIG BOX
 *************************/
closeOverlay.onclick = () => {
  overlay.classList.add("hidden");
  resetGlobalScore();
  updateGlobalUI();
};

/*************************
 * COUPLE SETTINGS
 *************************/
editBtn.onclick = () => {
  const names = getCoupleNames();

  nameHeInput.value = names.he === "EL" ? "" : names.he;
  nameSheInput.value = names.she === "EA" ? "" : names.she;

  namesOverlay.classList.remove("hidden");
};

saveBtn.onclick = () => {

  const heName = nameHeInput.value.trim();
  const sheName = nameSheInput.value.trim();

  if (!heName || !sheName) {
    alert("Introduceți ambele nume 😉");
    return;
  }

  saveCoupleNames(heName, sheName);

if (!localStorage.getItem("avatarHe")) {
  localStorage.setItem("avatarHe", generateAvatar(heName));
}

if (!localStorage.getItem("avatarShe")) {
  localStorage.setItem("avatarShe", generateAvatar(sheName,"micah"));
}

  namesOverlay.classList.add("hidden");
  updateGlobalUI();

};


/*************************
 * AVATAR UPLOAD PROTECTION
 *************************/

uploadHe.addEventListener("change", function () {

  const file = this.files[0];

  if (!file) return;

  // limită 1MB
  if (file.size > 1000000) {
    alert("Imagine prea mare (max 1MB)");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    localStorage.setItem("avatarHe", reader.result);
    loadAvatars();
  };

  reader.readAsDataURL(file);

});


uploadShe.addEventListener("change", function () {

  const file = this.files[0];

  if (!file) return;

  // limită 1MB
  if (file.size > 1000000) {
    alert("Imagine prea mare (max 1MB)");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    localStorage.setItem("avatarShe", reader.result);
    loadAvatars();
  };

  reader.readAsDataURL(file);

});

/*************************
 * THROW RANDOM GAME
 *************************/
throwBtn.onclick = () => {

  // 🛡 protecție dacă nu există carduri
  if (!gameCards.length) return;

  const randomIndex = Math.floor(Math.random() * gameCards.length);
  const selectedCard = gameCards[randomIndex];

  const rect = selectedCard.getBoundingClientRect();

  // poziție piatră
  stone.classList.remove("hidden");
  stone.style.top = "-120px";
  stone.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
  stone.style.transform = "translateX(-50%)";

  stone.offsetHeight;

  // 🪨 piatra cade
  setTimeout(() => {
    stone.style.top = rect.top + rect.height / 2 + "px";
  }, 50);

  // 💥 impact cinematic
  setTimeout(() => {

    // sunet impact
    hitSound.currentTime = 0;
    hitSound.play().catch(()=>{});

    // glow card
    selectedCard.style.boxShadow = "0 0 40px #ff3c78";
    selectedCard.style.transform = "scale(1.05)";

    // mică vibrație mobil
    if (navigator.vibrate) navigator.vibrate(40);

  }, 900);

  // 🎮 sunet intro joc
  setTimeout(() => {

    gameIntroSound.currentTime = 0;
    gameIntroSound.play().catch(()=>{});

  }, 1100);

  // 🚀 intrare în joc
  setTimeout(() => {

    window.location.href = selectedCard.getAttribute("href");

  }, 1700);

};
/*************************
 * FULLSCREEN SYSTEM
 *************************/
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

/*************************
 * INTERCEPT GAME CLICK (fullscreen persist)
 *************************/
gameCards.forEach(card => {

  card.addEventListener("click", function (e) {

    e.preventDefault();

    const target = this.getAttribute("href");

    // 🔊 sunet intro joc
    gameIntroSound.currentTime = 0;
    gameIntroSound.play().catch(()=>{});

    setTimeout(() => {

      if (localStorage.getItem("pb_fullscreen") === "true") {

        document.documentElement.requestFullscreen()
          .then(() => window.location.href = target)
          .catch(() => window.location.href = target);

      } else {

        window.location.href = target;

      }

    }, 350); // delay pentru sunet

  });

});

/*************************
 * INIT APP
 *************************/
function initApp() {
buildAvatarSelectors();
  updateGlobalUI();

  if (!isProfileComplete()) {
    namesOverlay.classList.remove("hidden");
  }

  if (localStorage.getItem("pb_fullscreen") === "true") {
    enterFullscreen();
  }
}

document.addEventListener("DOMContentLoaded", initApp);

/*************************
 * INTRO ANIMATION
 *************************/
window.addEventListener("load", () => {
  const intro = document.querySelector(".intro");

  setTimeout(() => {
  intro.classList.add("fade-out");

  setTimeout(() => {
    intro.remove();
  }, 800);

}, 2000);
  }
);
const avatarMaleList = [
  "images/avatars/male/m1.png",
  "images/avatars/male/m2.png",
  "images/avatars/male/m3.png",
  "images/avatars/male/m4.png"
];

const avatarFemaleList = [
  "images/avatars/female/f1.png",
  "images/avatars/female/f2.png",
  "images/avatars/female/f3.png",
  "images/avatars/female/f4.png"
];

const avatarSelectHe = document.getElementById("avatarSelectHe");
const avatarSelectShe = document.getElementById("avatarSelectShe");

function buildAvatarSelectors(){

  const savedHe = localStorage.getItem("avatarHe");
  const savedShe = localStorage.getItem("avatarShe");

  // curăță dacă există deja
  avatarSelectHe.innerHTML = "";
  avatarSelectShe.innerHTML = "";

  /***********************
   AVATARS EL
  ***********************/
  avatarMaleList.forEach(src => {

    const img = document.createElement("img");
    img.src = src;
    img.className = "avatar-option";

    if(src === savedHe){
      img.classList.add("selected");
    }

    img.onclick = () => {

      localStorage.setItem("avatarHe", src);

      document
        .querySelectorAll("#avatarSelectHe .avatar-option")
        .forEach(a => a.classList.remove("selected"));

      img.classList.add("selected");

      loadAvatars();
    };

    avatarSelectHe.appendChild(img);

  });


  /***********************
   AVATARS EA
  ***********************/
  avatarFemaleList.forEach(src => {

    const img = document.createElement("img");
    img.src = src;
    img.className = "avatar-option";

    if(src === savedShe){
      img.classList.add("selected");
    }

    img.onclick = () => {

      localStorage.setItem("avatarShe", src);

      document
        .querySelectorAll("#avatarSelectShe .avatar-option")
        .forEach(a => a.classList.remove("selected"));

      img.classList.add("selected");

      loadAvatars();
    };

    avatarSelectShe.appendChild(img);

  });

}


/***********************
 GENERATE AVATAR API
***********************/
function generateAvatar(name, style="adventurer") {

  const seed = encodeURIComponent(name);

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

}