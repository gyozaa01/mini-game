import { Engine, Render, Runner, World, Bodies, Events } from "matter-js";

export function createRhythmGameScreen(songId) {
  const container = document.createElement("div");
  container.id = "rhythm-game";

  const iframes = {
    1: `<iframe
          width="250"
          height="200"
          src="https://www.youtube.com/embed/2o1zdX72400?si=mGgef8wshRodKR1d&autoplay=1&mute=0&controls=1"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`,
    2: `<iframe
          width="250"
          height="200"
          src="https://www.youtube.com/embed/Ry1RrIVyl1M?si=iDN5ajaYht6yujzQ&autoplay=1&mute=0&controls=1"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`,
    3: `<iframe
          width="250"
          height="200"
          src="https://www.youtube.com/embed/8Ebqe2Dbzls?si=Scuf-6vYFuTbOUzf&autoplay=1&mute=0&controls=1"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>`,
  };

  const iframeHTML =
    iframes[songId] || `<div class="no-song">재생할 곡이 없습니다.</div>`;

  container.innerHTML = `
    <div id="game-frame">
      <div class="rhythm-left">
        <div class="rhythm-header title">리듬게임</div>

        <div class="rhythm-top">
          <div class="info-box" id="score-box">
            <div>점수</div>
            <div class="score-value">0</div>
          </div>
          <div class="info-box" id="i-frame-box">
            <div>노래</div>
            <div class="iframe-container">
              ${iframeHTML}
            </div>
          </div>
        </div>

        <div class="info-box" id="rule-box">
          <div class="rule-title">규칙 설명</div>
          <div class="rule-desc">
            <ul>
              <li>위(아래)에서 4개의 레인을 따라 흘러내립니다.</li>
              <li>각 레인 끝에 도달할 때 대응 키(A, S, D, F)를 눌러주세요.</li>
              <li>타이밍이 정확할수록 더 높은 점수를 얻습니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="rhythm-right">
        <div id="rhythm-area">
          <div id="lane-container">
            <canvas id="rhythm-canvas"></canvas>

            <div class="lane lane-A" data-key="A"></div>
            <div class="lane lane-S" data-key="S"></div>
            <div class="lane lane-D" data-key="D"></div>
            <div class="lane lane-F" data-key="F"></div>
          </div>
          
          <div class="lane-labels">
            <span>A</span><span>S</span><span>D</span><span>F</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const chartUrl = `/src/notes/song${songId}.json`;
  let noteChart = null;
  fetch(chartUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`차트 파일을 불러올 수 없습니다: ${chartUrl}`);
      }
      return res.json();
    })
    .then((json) => {
      noteChart = json;
      startGameLoop();
    })
    .catch((err) => {
      console.error(err);
    });

  const canvas = container.querySelector("#rhythm-canvas");
  canvas.width = 400;
  canvas.height = 480;

  canvas.style.position = "absolute";
  canvas.style.top = "10px";
  canvas.style.left = "10px";

  const engine = Engine.create();
  engine.positionIterations = 10;
  engine.velocityIterations = 10;

  const render = Render.create({
    engine,
    canvas: canvas,
    options: {
      wireframes: false,
      width: 400, // 내부 너비
      height: 480, // 내부 높이
      background: "transparent",
    },
  });

  const world = engine.world;
  Render.run(render);
  Runner.run(Runner.create(), engine);

  let audioStartTime = null;
  function startGameLoop() {
    audioStartTime = performance.now() / 1000;
    function loop() {
      const elapsed = performance.now() / 1000 - audioStartTime;
      if (noteChart && Array.isArray(noteChart.notes)) {
        noteChart.notes.forEach((note) => {
          if (!note.spawned && elapsed >= note.time) {
            spawnNoteInLane(note.lane);
            note.spawned = true;
          }
        });
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  function spawnNoteInLane(lane) {
    const laneWidth = 100;
    const laneCenters = {
      A: laneWidth * 0.4,
      S: laneWidth * 1.4,
      D: laneWidth * 2.4,
      F: laneWidth * 3.4,
    };
    const x = laneCenters[lane] || laneCenters.A;
    const y = -20;

    const noteBody = Bodies.rectangle(x, y, 80, 20, {
      isSensor: true,
      label: "note",
      render: {
        fillStyle: "#3498db",
        strokeStyle: "#2980b9",
        lineWidth: 3,
      },
    });
    World.add(world, noteBody);
  }

  Events.on(engine, "afterUpdate", () => {
    world.bodies.forEach((body) => {
      if (body.label === "note" && body.position.y > 500) {
        World.remove(world, body);
      }
    });
  });

  return container;
}
