import { createStartScreen } from "./components/StartScreen.js";
import { createModeScreen } from "./components/ModeScreen.js";
import { createSuikaGameScreen } from "./components/SuikaGameScreen.js";
import { createRhythmGameScreen } from "./components/RhythmGameScreen.js";
import { createTetrisGameScreen } from "./components/TetrisGameScreen.js";

const app = document.body;

const startScreen = createStartScreen();
const modeScreen = createModeScreen();
const suikaScreen = createSuikaGameScreen();
const rhythmScreen = createRhythmGameScreen();
const tetrisScreen = createTetrisGameScreen();

function router() {
  const hash = location.hash.replace(/^#/, "");
  app.innerHTML = "";

  switch (hash) {
    case "/mode":
      app.appendChild(modeScreen);
      break;
    case "/suika":
      app.appendChild(suikaScreen);
      break;
    case "/rhythm":
      app.appendChild(rhythmScreen);
      break;
    case "/tetris":
      app.appendChild(tetrisScreen);
      break;
    default:
      app.appendChild(startScreen);
      break;
  }
}

router();

window.addEventListener("hashchange", router);
