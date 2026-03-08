/*************************
 * GLOBAL STATS MANAGER
 *************************/
console.log("🌍 Global Stats LOADED");

const GLOBAL_STORAGE_KEY = "globalStats";
const WIN_SCORE = 10;

/* STRUCTURA DEFAULT */
function getDefaultGlobalStats() {
  return {
    he: {
      score: 0,
      wins: {
        card: 0,
        wheel: 0,
        xo: 0
      }
    },
    she: {
      score: 0,
      wins: {
        card: 0,
        wheel: 0,
        xo: 0
      }
    },
    bigBoxUnlocked: false,
    bigBoxWinner: null
  };
}

/* GET */
function getGlobalStats() {
  const raw = localStorage.getItem(GLOBAL_STORAGE_KEY);
  if (!raw) {
    const fresh = getDefaultGlobalStats();
    saveGlobalStats(fresh);
    return fresh;
  }
  return JSON.parse(raw);
}

/* SAVE */
function saveGlobalStats(stats) {
  localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(stats));
}

/* ADD POINT */
function addGlobalPoint(player, game, value = 1) {
  const stats = getGlobalStats();

  if (!stats[player]) return;

  stats[player].score += value;

  // 🔥 prevenim scor negativ
  if (stats[player].score < 0) {
    stats[player].score = 0;
  }

  // modificăm și wins doar dacă valoarea este pozitivă
  if (value > 0) {
    stats[player].wins[game]++;
  } else if (value < 0 && stats[player].wins[game] > 0) {
    stats[player].wins[game]--;
  }

  // verificare Big Box doar la + punct
  if (value > 0 && stats[player].score >= WIN_SCORE) {
    stats.bigBoxUnlocked = true;
    stats.bigBoxWinner = player;
  }

  saveGlobalStats(stats);
}

/* RESET GLOBAL SCORE (după Big Box) */
function resetGlobalScore() {
  const stats = getGlobalStats();

  stats.he.score = 0;
  stats.she.score = 0;
  stats.bigBoxUnlocked = false;
  stats.bigBoxWinner = null;

  saveGlobalStats(stats);
}

/* BIG BOX GIFTS */
const BIG_GIFTS = [
  "🔥 Noapte fără reguli",
  "💆 Masaj erotic complet",
  "💃 Dans privat + strip tease",
  "😈 Control total timp de 24h",
  "💋 Provocare secretă aleasă de câștigător"
];

/* RANDOM BIG GIFT */
function getRandomBigGift() {
  return BIG_GIFTS[Math.floor(Math.random() * BIG_GIFTS.length)];
}

/*************************
 * end GLOBAL STATS MANAGER
 *************************/


/*************************
 * COUPLE NAMES
 *************************/

const NAMES_KEY = "coupleNames";

function getCoupleNames() {
  const raw = localStorage.getItem(NAMES_KEY);
  if (!raw) {
    return { he: "EL", she: "EA" };
  }
  return JSON.parse(raw);
}

function saveCoupleNames(heName, sheName) {
  localStorage.setItem(NAMES_KEY, JSON.stringify({
    he: heName || "EL",
    she: sheName || "EA"
  }));
}

function updateGlobalNames() {
  const names = getCoupleNames();
  const stats = getGlobalStats();

  const heBox = document.querySelector(".score.he");
  const sheBox = document.querySelector(".score.she");

  if (!heBox || !sheBox) return;

  heBox.innerHTML = `${names.he} <span id="globalHe">${stats.he.score}</span>`;
  sheBox.innerHTML = `${names.she} <span id="globalShe">${stats.she.score}</span>`;
}

/*************************
 * GLOBAL AVATAR LOADER
 *************************/
function loadPlayerAvatars() {

  let savedHe = localStorage.getItem("avatarHe");
  let savedShe = localStorage.getItem("avatarShe");

  // corectează path pentru jocuri din subfoldere
  if (savedHe && !savedHe.startsWith("data:") && !savedHe.startsWith("http")) {
    savedHe = "../../" + savedHe;
  }

  if (savedShe && !savedShe.startsWith("data:") && !savedShe.startsWith("http")) {
    savedShe = "../../" + savedShe;
  }

  const avatarHe = document.getElementById("avatarHe");
  const avatarShe = document.getElementById("avatarShe");

  if (savedHe && avatarHe) avatarHe.src = savedHe;
  if (savedShe && avatarShe) avatarShe.src = savedShe;

}