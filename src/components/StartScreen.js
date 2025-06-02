export function createStartScreen(onStart) {
  const container = document.createElement("div");
  container.id = "start-screen";
  container.innerHTML = `
    <div class="title">MINI GAME</div>
    <button class="start-button">START</button>
  `;

  container.querySelector("button").addEventListener("click", onStart);
  return container;
}
