export function createModeScreen() {
  const container = document.createElement("div");
  container.id = "mode-screen";
  container.innerHTML = `
    <div class="title">GAME MODE</div>
    <ul class="mode-list">
      <li class="selected">수박게임</li>
      <li>리듬게임</li>
      <li>테트리스</li>
    </ul>
  `;
  return container;
}
