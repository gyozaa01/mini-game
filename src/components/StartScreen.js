export function createStartScreen() {
  const container = document.createElement("div");
  container.id = "start-screen";
  container.innerHTML = `
    <div class="title">MINI GAME</div>
    <button class="start-button">START</button>
  `;

  // START 버튼 클릭 시 해시를 "/mode"로 변경
  container.querySelector("button").addEventListener("click", () => {
    location.hash = "/mode";
  });

  return container;
}
