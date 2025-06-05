export function createRhythmGameScreen() {
  const container = document.createElement("div");
  container.id = "rhythm-game";
  container.innerHTML = `
    <div>
      <h2>리듬게임 준비 중...</h2>
      <p>추후 업데이트 예정</p>
    </div>
  `;
  return container;
}
