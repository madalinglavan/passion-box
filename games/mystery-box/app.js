/*************************
 * DOM
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

/*************************
 * LOAD AVATARS
 *************************/
function loadAvatars() {
  const savedHe = localStorage.getItem("avatarHe");
  const savedShe = localStorage.getItem("avatarShe");

  if (savedHe && avatarHe) avatarHe.src = savedHe;
  if (savedShe && avatarShe) avatarShe.src = savedShe;
}

/*************************
 * UPDATE GLOBAL UI
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
 * BIG BOX
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

closeOverlay.onclick = () => {
  overlay.classList.add("hidden");

  resetGlobalScore();
  updateGlobalUI();
};

/*************************
 * PROFILE SETTINGS
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

  const avatarHeSaved = localStorage.getItem("avatarHe");
  const avatarSheSaved = localStorage.getItem("avatarShe");

  if (!avatarHeSaved || !avatarSheSaved) {
    alert("Adăugați ambele poze 🔥");
    return;
  }

  saveCoupleNames(heName, sheName);

  namesOverlay.classList.add("hidden");
  updateGlobalUI();
};

/*************************
 * IMAGE PROCESS (CROP CIRCLE)
 *************************/
function processImage(file, callback) {
  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();

    img.onload = function() {
      const canvas = document.createElement("canvas");
      const size = 200;

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;

      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

      const finalImage = canvas.toDataURL("image/jpeg", 0.8);
      callback(finalImage);
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

/*************************
 * UPLOAD EVENTS
 *************************/
uploadHe.addEventListener("change", function () {
  processImage(this.files[0], function(imageData) {
    localStorage.setItem("avatarHe", imageData);
    loadAvatars();
  });
});

uploadShe.addEventListener("change", function () {
  processImage(this.files[0], function(imageData) {
    localStorage.setItem("avatarShe", imageData);
    loadAvatars();
  });
});

/*************************
 * PROFILE COMPLETE CHECK
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
 * RANDOM THROW GAME SELECT
 *************************/
throwBtn.onclick = () => {
  const randomIndex = Math.floor(Math.random() * gameCards.length);
  const selectedCard = gameCards[randomIndex];
  const rect = selectedCard.getBoundingClientRect();

  stone.classList.remove("hidden");

  stone.style.top = "-120px";
  stone.style.left = rect.left + rect.width / 2 + "px";
  stone.style.transform = "translateX(-50%)";

  stone.offsetHeight;

  setTimeout(() => {
    stone.style.top = rect.top + rect.height / 2 + "px";
  }, 50);

  setTimeout(() => {
    selectedCard.style.boxShadow = "0 0 40px #ff3c78";
    selectedCard.style.transform = "scale(1.05)";
  }, 900);

  setTimeout(() => {
    window.location.href = selectedCard.getAttribute("href");
  }, 1700);
};

/*************************
 * INIT
 *************************/
document.addEventListener("DOMContentLoaded", function () {

  updateGlobalUI();

  if (!isProfileComplete()) {
    namesOverlay.classList.remove("hidden");
  }

});