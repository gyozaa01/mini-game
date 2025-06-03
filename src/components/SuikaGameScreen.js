import { Engine, Render, Runner, World, Bodies, Body, Events } from "matter-js";

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
          <canvas id="game-canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  const FRUITS = [
    { name: "00_cherry", radius: 16 },
    { name: "01_strawberry", radius: 24 },
    { name: "02_grape", radius: 30 },
    { name: "03_gyool", radius: 34 },
    { name: "04_orange", radius: 44 },
    { name: "05_apple", radius: 57 },
    { name: "06_pear", radius: 64 },
    { name: "07_peach", radius: 78 },
    { name: "08_pineapple", radius: 88 },
    { name: "09_melon", radius: 110 },
    { name: "10_watermelon", radius: 130 },
  ];

  // 다음에 생성할 과일의 인덱스를 미리 뽑아둠
  let nextIndex = Math.floor(Math.random() * 5); // 0~4 중 하나

  // “다음” 박스에 <img> 요소 추가해서 현재 nextIndex에 해당하는 과일 이미지를 띄움
  const nextFruitBox = container.querySelector("#next-fruit");

  // 텍스트 '다음' 아래에 들어갈 img 태그 생성
  const nextImg = document.createElement("img");
  nextImg.style.display = "block";
  nextImg.style.width = "40px"; // 크기는 필요에 따라 조정
  nextImg.style.height = "40px";
  nextImg.style.margin = "4px auto 0"; // 상단 여백, 가운데 정렬
  nextImg.src = `/suika/${FRUITS[nextIndex].name}.png`;
  nextImg.alt = FRUITS[nextIndex].name;
  nextFruitBox.appendChild(nextImg);

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

  const canvas = container.querySelector("#game-canvas");
  canvas.width = 420;
  canvas.height = 540;

  const engine = Engine.create();
  const render = Render.create({
    engine,
    canvas,
    options: {
      wireframes: false,
      background: "#0a111b",
      width: 420,
      height: 540,
    },
  });

  const wallThickness = 10;
  const world = engine.world;

  const leftWall = Bodies.rectangle(5, 270, wallThickness, 540, {
    isStatic: true,
    render: { fillStyle: "#046db3" },
  });

  const rightWall = Bodies.rectangle(415, 270, wallThickness, 540, {
    isStatic: true,
    render: { fillStyle: "#046db3" },
  });

  const ground = Bodies.rectangle(210, 535, 400, wallThickness, {
    isStatic: true,
    render: { fillStyle: "#046db3" },
  });

  const positionLine = Bodies.rectangle(210, 270, 0.5, 540, {
    name: "positionLine",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#046db3" },
  });

  World.add(world, [leftWall, rightWall, ground, positionLine]);

  Render.run(render);
  Runner.run(Runner.create(), engine);

  let currentBody = null;
  let currentFruit = null;
  let interval = null;
  let disableAction = false;
  let suikaCount = 0;
  let fallingBody = null;
  let fruitQueued = false;
  let spawnTimer = null;

  function updateNextFruitDisplay() {
    // nextIndex가 바뀔 때마다 이미지를 갱신
    nextImg.src = `/suika/${FRUITS[nextIndex].name}.png`;
    nextImg.alt = FRUITS[nextIndex].name;
  }

  function addFruit() {
    // 현재 생성할 과일은 nextIndex를 사용
    const fruit = FRUITS[nextIndex];
    const spawnY = 60;

    // 현재 필드에서 가장 위에 있는 과일의 꼭대기 위치 계산
    const highest = world.bodies
      .filter((b) => !b.isStatic && !b.isSensor && b.circleRadius)
      .reduce((min, b) => {
        const top = b.position.y - b.circleRadius;
        return top < min ? top : min;
      }, Infinity);

    // 가장 위 과일이 천장을 넘었으면 Game Over
    if (highest <= 0) {
      alert("💥 Game Over");
      location.reload();
      return;
    }

    // 과일 생성
    const body = Bodies.circle(210, spawnY, fruit.radius, {
      isSleeping: true,
      index: nextIndex,
      render: { sprite: { texture: `/suika/${fruit.name}.png` } },
      restitution: 0.3,
    });

    currentBody = body;
    currentFruit = fruit;
    World.add(world, body);
    disableAction = false;

    // “다음” 과일을 미리 뽑고, 화면도 갱신
    nextIndex = Math.floor(Math.random() * 5);
    updateNextFruitDisplay();
  }

  window.onkeydown = (event) => {
    if (disableAction) return;
    switch (event.code) {
      case "ArrowLeft":
        if (interval) return;
        interval = setInterval(() => {
          if (!currentBody || !currentFruit) return;
          if (currentBody.position.x - currentFruit.radius > 20) {
            Body.setPosition(currentBody, {
              x: currentBody.position.x - 1,
              y: currentBody.position.y,
            });
            Body.setPosition(positionLine, {
              x: currentBody.position.x - 1,
              y: positionLine.position.y,
            });
          }
        }, 5);
        break;

      case "ArrowRight":
        if (interval) return;

        interval = setInterval(() => {
          if (!currentBody || !currentFruit) return;
          if (currentBody.position.x + currentFruit.radius < 400) {
            Body.setPosition(currentBody, {
              x: currentBody.position.x + 1,
              y: currentBody.position.y,
            });
            Body.setPosition(positionLine, {
              x: currentBody.position.x + 1,
              y: positionLine.position.y,
            });
          }
        }, 5);
        break;

      case "ArrowDown":
        currentBody.isSleeping = false;
        fallingBody = currentBody;
        currentBody = null;
        disableAction = true;
        fruitQueued = true;

        if (interval) clearInterval(interval);
        if (spawnTimer) clearTimeout(spawnTimer);

        spawnTimer = setTimeout(() => {
          if (fruitQueued && fallingBody) {
            addFruit();
            fallingBody = null;
            fruitQueued = false;
          }
        }, 1500);
        break;
    }
  };

  window.onkeyup = (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.code)) {
      clearInterval(interval);
      interval = null;
    }
  };

  Events.on(engine, "collisionStart", (event) => {
    const merged = new Set();
    event.pairs.forEach((collision) => {
      const a = collision.bodyA;
      const b = collision.bodyB;

      if (a.index === b.index && a.index !== undefined) {
        if (merged.has(a) || merged.has(b)) return;
        if (a.index === FRUITS.length - 1) return;

        merged.add(a);
        merged.add(b);
        World.remove(world, [a, b]);

        const newFruit = FRUITS[a.index + 1];
        const newBody = Bodies.circle(
          collision.collision.supports[0].x,
          collision.collision.supports[0].y,
          newFruit.radius,
          {
            render: { sprite: { texture: `/suika/${newFruit.name}.png` } },
            index: a.index + 1,
          }
        );
        World.add(world, newBody);

        if (a.index + 1 === FRUITS.length - 1) {
          suikaCount++;
          if (suikaCount >= 2) {
            setTimeout(() => alert("WIN! 수박 2개 완성!"), 300);
          }
        }
      }
    });
  });

  Events.on(engine, "afterUpdate", () => {
    if (
      fallingBody &&
      fallingBody.speed < 0.5 &&
      Math.abs(fallingBody.velocity.y) < 0.3 &&
      !fallingBody.isStatic &&
      fruitQueued
    ) {
      addFruit();
      fallingBody = null;
      fruitQueued = false;

      if (spawnTimer) {
        clearTimeout(spawnTimer);
        spawnTimer = null;
      }
    }
  });

  addFruit();
  return container;
}
