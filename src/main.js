import { createStartScreen } from "./components/StartScreen.js";
import { createModeScreen } from "./components/ModeScreen.js";
import { createSuikaGameScreen } from "./components/SuikaGameScreen.js";
import { createSongSelectScreen } from "./components/SongSelectScreen.js";
import { createRhythmGameScreen } from "./components/RhythmGameScreen.js";
import { createTetrisGameScreen } from "./components/TetrisGameScreen.js";

const app = document.body;

const startScreen = createStartScreen();
const modeScreen = createModeScreen();
const suikaScreen = createSuikaGameScreen();
const tetrisScreen = createTetrisGameScreen();

const songSelectScreen = createSongSelectScreen(
  () => {
    location.hash = "/mode";
  },
  (songId) => {
    location.hash = `/rhythm/${songId}`;
  }
);

const rhythmScreen = createRhythmGameScreen();

function router() {
  const rawHash = location.hash.replace(/^#/, "");
  app.innerHTML = "";

  // 1) / (혹은 빈 문자열) -> 시작 화면
  if (rawHash === "" || rawHash === "/") {
    app.appendChild(startScreen);
    return;
  }

  // 2) /mode -> 모드 선택
  if (rawHash === "/mode") {
    app.appendChild(modeScreen);
    return;
  }

  // 3) /suika -> 수박게임
  if (rawHash === "/suika") {
    app.appendChild(suikaScreen);
    return;
  }

  // 4) /song -> 노래 선택
  if (rawHash === "/song") {
    app.appendChild(songSelectScreen);
    return;
  }

  // 5) /rhythm/:songId -> 리듬게임 (선택한 곡 ID)
  if (rawHash.startsWith("/rhythm/")) {
    const parts = rawHash.split("/");
    const songId = parts[2];

    app.appendChild(rhythmScreen);
    return;
  }

  // 6) /tetris -> 테트리스
  if (rawHash === "/tetris") {
    app.appendChild(tetrisScreen);
    return;
  }

  // 그 외 해시값은 모두 시작 화면으로
  app.appendChild(startScreen);
}

window.addEventListener("hashchange", router);
router();
