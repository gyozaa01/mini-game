export function createSongSelectScreen(onBack, onSelectSong) {
  const container = document.createElement("div");
  container.id = "song-select-screen";
  container.innerHTML = `
    <div class="title">SELECT SONG</div>
    <ul class="song-list">
      <li data-song="1">노래제목1</li>
      <li data-song="2">노래제목2</li>
      <li data-song="3">노래제목3</li>
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
