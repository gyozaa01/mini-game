import { createStartScreen } from "./components/StartScreen.js";
import { createModeScreen } from "./components/ModeScreen.js";
import { createSuikaGameScreen } from "./components/SuikaGameScreen.js";

const app = document.body;

const suikaScreen = createSuikaGameScreen();
const modeScreen = createModeScreen();
const startScreen = createStartScreen(() => {
  app.removeChild(startScreen);
  app.appendChild(modeScreen);

  const suikaOption = modeScreen.querySelectorAll("li")[0];
  suikaOption.addEventListener("click", () => {
    app.removeChild(modeScreen);
    app.appendChild(suikaScreen);
  });
});

app.appendChild(startScreen);
