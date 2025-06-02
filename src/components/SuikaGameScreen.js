export function createSuikaGameScreen() {
  const container = document.createElement("div");
  container.id = "suika-game";

  container.innerHTML = `
    <div id="game-frame">
      <div class="suika-left">
        <div class="suika-header title">수박게임</div>

        <div class="suika-top">
          <div class="info-box" id="score-board">점수</div>
          <div class="info-box" id="next-fruit">다음</div>
        </div>

        <div class="info-box" id="rule-box">
          <div class="rule-title">규칙 설명</div>
        </div>
      </div>

      <div class="suika-right">
        <div id="game-area">
          <canvas id="game-canvas" width="360" height="480"></canvas>
        </div>
      </div>
    </div>
  `;

  const ruleBox = container.querySelector("#rule-box");

  const fruits = [
    "00_cherry",
    "01_strawberry",
    "02_grape",
    "03_gyool",
    "04_orange",
    "05_apple",
    "06_pear",
    "07_peach",
    "08_pineapple",
    "09_melon",
    "10_watermelon",
  ];

  const ruleContent = document.createElement("div");
  ruleContent.className = "rule-content";

  const ring = document.createElement("div");
  ring.className = "fruit-ring";

  const centerX = 100,
    centerY = 100,
    radius = 80;

  fruits.forEach((name, idx) => {
    const angle = ((2 * Math.PI) / fruits.length) * idx - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const img = document.createElement("img");
    img.src = `/suika/${name}.png`;
    img.alt = name;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    ring.appendChild(img);
  });

  const desc = document.createElement("div");
  desc.className = "rule-desc";
  desc.innerHTML = `
    <ul>
      <li>같은 과일 2개가 충돌하면 다음 단계 과일로 진화합니다.</li>
      <li>과일은 체리부터 수박까지 총 11단계이며, 수박이 최종 단계입니다!</li>
    </ul>
  `;

  ruleContent.appendChild(ring);
  ruleContent.appendChild(desc);
  ruleBox.appendChild(ruleContent);

  return container;
}
