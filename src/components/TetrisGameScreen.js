export function createTetrisGameScreen() {
  const container = document.createElement("div");
  container.id = "tetris-game";
  container.innerHTML = `
    <div>
      <h2>테트리스 준비 중...</h2>
      <p>추후 업데이트 예정</p>
    </div>
  `;
  return container;
}
