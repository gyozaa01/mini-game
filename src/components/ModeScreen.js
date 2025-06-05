export function createModeScreen() {
  const container = document.createElement("div");
  container.id = "mode-screen";
  container.innerHTML = `
    <div class="title">GAME MODE</div>
    <ul class="mode-list">
      <li data-hash="/suika" class="selected">수박게임</li>
      <li data-hash="/rhythm">리듬게임</li>
      <li data-hash="/tetris">테트리스</li>
    </ul>
  `;

  const items = container.querySelectorAll("li");
  items.forEach((li) => {
    li.addEventListener("click", () => {
      // 선택된 항목 스타일 업데이트
      items.forEach((el) => el.classList.remove("selected"));
      li.classList.add("selected");

      // 해시 변경
      const targetHash = li.getAttribute("data-hash");
      location.hash = targetHash;
    });
  });

  return container;
}
