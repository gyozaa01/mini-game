export function createSongSelectScreen(onBack, onSelectSong) {
  const container = document.createElement("div");
  container.id = "song-select-screen";
  container.innerHTML = `
    <div class="title">SELECT SONG</div>
    <ul class="song-list">
      <li data-song="1">HAPPY- DAY6</li>
      <li data-song="2">너에게 닿기를 - 10CM</li>
      <li data-song="3">APT- ROSE</li>
    </ul>
  `;

  container.querySelectorAll(".song-list li").forEach((li) => {
    li.addEventListener("click", () => {
      const songId = li.getAttribute("data-song");
      onSelectSong(songId);
    });
  });

  return container;
}
