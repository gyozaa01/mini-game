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

  const iframeHTML = iframes[songId] || "";

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
            <div class="lane" data-key="A"></div>
            <div class="lane" data-key="S"></div>
            <div class="lane" data-key="D"></div>
            <div class="lane" data-key="F"></div>
          </div>
          <div class="lane-labels">
            <span>A</span><span>S</span><span>D</span><span>F</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return container;
}
