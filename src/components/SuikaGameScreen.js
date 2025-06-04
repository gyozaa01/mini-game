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

  // 다음에 생성할 과일의 인덱스를 미리 뽑아둠 (0~4 중 하나)
  let nextIndex = Math.floor(Math.random() * 5);

  // “다음” 박스에 <img> 요소 추가
  const nextFruitBox = container.querySelector("#next-fruit");
  const nextImg = document.createElement("img");
  nextImg.style.display = "block";
  nextImg.style.width = "40px";
  nextImg.style.height = "40px";
  nextImg.style.margin = "4px auto 0";
  nextImg.src = `/suika/${FRUITS[nextIndex].name}.png`;
  nextImg.alt = FRUITS[nextIndex].name;
  nextFruitBox.appendChild(nextImg);

  // 규칙 설명 영역(과일 링) 구성
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

  // 캔버스 설정
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

  // 바닥(ground)은 label: "ground" 를 달아서 충돌 탐지에 사용
  const ground = Bodies.rectangle(210, 535, 400, wallThickness, {
    isStatic: true,
    label: "ground",
    render: { fillStyle: "#046db3" },
  });

  // 위치 표시용 센서선
  const positionLine = Bodies.rectangle(210, 270, 0.5, 540, {
    name: "positionLine",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#046db3" },
  });

  World.add(world, [leftWall, rightWall, ground, positionLine]);

  Render.run(render);
  Runner.run(Runner.create(), engine);

  let currentBody = null; // 지금 화면에 떠 있는 과일(body)
  let currentFruit = null; // 지금 화면에 떠 있는 과일의 정보({name, radius})
  let interval = null; // 좌/우 이동용 setInterval ID
  let disableAction = false; // ↓키를 눌러 과일을 떨어뜨린 직후엔 좌/우 금지
  let suikaCount = 0; // 만든 수박 개수 카운터 (과일 합친 뒤 수박이 되면 +1)
  let fallingBody = null; // ↓누른 후 “떨어지는 중인” 과일 body
  let fruitQueued = false; // “떨어지는 과일이 있으면” true
  let spawnedThisDrop = false; // “한 번 떨어뜨린 과일당 한 번만 next 과일 스폰” 플래그

  function updateNextFruitDisplay() {
    nextImg.src = `/suika/${FRUITS[nextIndex].name}.png`;
    nextImg.alt = FRUITS[nextIndex].name;
  }

  function addFruit() {
    // (1) 화면에 새 과일을 하나 spawn
    const fruit = FRUITS[nextIndex];
    const spawnY = 60;

    // (2) 천장(위 벽) 체크: 과일 탑 위치 계산
    // : b.position.y - b.circleRadius 가 과일 최상단 y 좌표
    const highest = world.bodies
      .filter((b) => !b.isStatic && !b.isSensor && b.circleRadius)
      .reduce((min, b) => {
        const top = b.position.y - b.circleRadius;
        return top < min ? top : min;
      }, Infinity);

    // “최상단 과일(top) < 0” 이면 과일이 벽을 침범한 상태 -> Game Over
    if (highest < 0) {
      alert("💥 Game Over");
      location.reload();
      return;
    }

    // (3) 과일 생성
    const body = Bodies.circle(210, spawnY, fruit.radius, {
      isSleeping: true,
      index: nextIndex,
      render: { sprite: { texture: `/suika/${fruit.name}.png` } },
      restitution: 0.3,
    });

    currentBody = body;
    currentFruit = fruit;
    World.add(world, body);

    // (4) 새 과일이 추가된 뒤엔 좌/우 조작 허용
    disableAction = false;

    // (5) 다음 과일 미리 뽑기
    nextIndex = Math.floor(Math.random() * 5);
    updateNextFruitDisplay();
  }

  //————————————————————————————
  // 키 입력 처리: 좌/우 + ↓
  //————————————————————————————
  window.onkeydown = (event) => {
    // ↓키(ArrowDown) 누르면 ‘무조건’ 현재 과일을 떨군다
    if (event.code === "ArrowDown") {
      if (currentBody) {
        // 이 과일이 바닥 혹은 다른 과일에 닿을 때까지
        // 한번만 next 스폰되도록 flag 초기화
        spawnedThisDrop = false;

        // 과일을 깨어서(falling) 떨어뜨리기
        currentBody.isSleeping = false;
        fallingBody = currentBody;
        currentBody = null;
        disableAction = true; // 떨어지는 동안 좌/우 금지
        fruitQueued = true; // 떨어지는 과일이 있음 표시
      }

      // 이동용 interval 있으면 해제
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      return;
    }

    // ↓키가 아닐 때: 과일 낙하 중이라면(= disableAction=true) 무시
    if (disableAction) {
      return;
    }

    // 좌/우 키 눌렀을 때: 실시간으로 과일 위치만 옮겨 준다
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

      default:
        break;
    }
  };

  window.onkeyup = (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.code)) {
      clearInterval(interval);
      interval = null;
    }
  };

  //————————————————————————————
  // collisionStart: “떨어지는 과일(fallingBody)” 이
  //   • 바닥(ground)과 닿거나
  //   • 다른 과일과 닿을 때
  // -> 한 번만 다음 과일(addFruit) 호출
  //————————————————————————————
  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const a = collision.bodyA;
      const b = collision.bodyB;

      // (1) 과일끼리 merge 로직
      if (a.index === b.index && a.index !== undefined) {
        // 동일 인덱스 과일끼리만 합치기
        const merged = new Set();
        if (!merged.has(a) && !merged.has(b)) {
          if (a.index !== FRUITS.length - 1) {
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
                restitution: 0.3,
              }
            );
            World.add(world, newBody);

            // 합쳐진 과일을 다시 “떨어지는 과일”로 지정
            fallingBody = newBody;
            fruitQueued = true;
            disableAction = false; // 합친 뒤엔 좌/우 조작 허용
            // spawnedThisDrop는 false 상태 그대로 둠

            // ‘수박이 되어’ 승리 카운트 증가
            if (a.index + 1 === FRUITS.length - 1) {
              suikaCount++;
              if (suikaCount >= 2) {
                setTimeout(() => alert("WIN! 수박 2개 완성!"), 300);
              }
            }
          }
        }
        // merge 처리 후에는 더 이상 다른 로직을 실행하지 않도록 return
        return;
      }

      // (2) “떨어지는 과일”이 ground 또는 다른 과일과 닿았을 때
      //      -> 한 번만 addFruit() 호출
      if (fruitQueued && !spawnedThisDrop) {
        const bodyIsGround = (obj) => obj.label === "ground";
        const bodyIsFalling = (obj) => obj === fallingBody;
        const bodyIsFruit = (obj) => obj.index !== undefined;

        // — 만약 “떨어지는 과일” vs “ground” 충돌이면 —
        if (
          (bodyIsFalling(a) && bodyIsGround(b)) ||
          (bodyIsFalling(b) && bodyIsGround(a))
        ) {
          spawnedThisDrop = true; // 이 낙하 드롭당 한 번만 처리
          disableAction = false; // 바닥 닿았으니 좌/우 허용

          addFruit();
          fallingBody = null;
          fruitQueued = false;
          return;
        }

        // — 만약 “떨어지는 과일” vs “다른 과일” 충돌이면 —
        if (
          (bodyIsFalling(a) && bodyIsFruit(b)) ||
          (bodyIsFalling(b) && bodyIsFruit(a))
        ) {
          spawnedThisDrop = true;
          disableAction = false; // 다른 과일과 붙었으니 좌/우 허용

          addFruit();
          fallingBody = null;
          fruitQueued = false;
          return;
        }
      }
    });
  });

  //————————————————————————————
  // afterUpdate: “충돌 없이 과일이 멈춰 버린” 경우 대응
  //   -> collisionStart가 트리거되지 않아서 spawnedThisDrop가 뚫려 있을 때
  //   -> 속도가 충분히 낮으면(= 과일이 완전히 멈춰 있으면) next 과일 호출
  //————————————————————————————
  Events.on(engine, "afterUpdate", () => {
    if (fallingBody && fruitQueued && !spawnedThisDrop) {
      // 속도가 낮으면(= 멈춘 상태로 간주)
      if (fallingBody.speed < 0.5) {
        spawnedThisDrop = true;
        disableAction = false;

        addFruit();
        fallingBody = null;
        fruitQueued = false;
      }
    }
  });

  // 최초 과일 1개 스폰
  addFruit();
  return container;
}
