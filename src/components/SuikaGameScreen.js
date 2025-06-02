export function createSuikaGameScreen() {
  const container = document.createElement("div");
  container.id = "suika-game";

  container.innerHTML = `
  <div id = "game-frame">
    <div class="suika-left">
      <div class="suika-header title">수박게임</div>

      <div class="suika-top">
        <div class="info-box" id="score-board">점수</div>
        <div class="info-box" id="next-fruit">다음</div>
      </div>

      <div class="info-box" id="rule-box">규칙 설명</div>
    </div>

    <div class="suika-right">
      <div id="game-area">
        <canvas id="game-canvas" width="360" height="480"></canvas>
      </div>
    </div>
  </div>
  `;

  return container;
}
