import { createStartScreen } from "./components/StartScreen.js";
import { createModeScreen } from "./components/ModeScreen.js";

const app = document.body;

const modeScreen = createModeScreen();
const startScreen = createStartScreen(() => {
  app.removeChild(startScreen);
  app.appendChild(modeScreen);
});

app.appendChild(startScreen);
