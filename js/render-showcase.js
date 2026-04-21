(function () {
  function renderCompare(item) {
    return `
      <div class="col-lg-4">
        <article class="compare-card">
          <div class="compare-shell">
            <img src="${item.antes}" alt="Antes - ${item.titulo}">
            <div class="compare-after" style="width:50%">
              <img src="${item.despues}" alt="Después - ${item.titulo}">
            </div>
            <div class="compare-divider" style="left:50%"></div>
            <span class="compare-label before">Antes</span>
            <span class="compare-label after">Después</span>
            <input type="range" class="compare-range" min="0" max="100" value="50" aria-label="Comparar ${item.titulo}">
          </div>
          <div class="card-body p-3">
            <h3 class="h5 fw-bold mb-1">${item.titulo}</h3>
            <p class="mb-0 text-secondary">${item.descripcion}</p>
          </div>
        </article>
      </div>
    `;
  }

  function renderVideo(video) {
    return `
      <div class="col-lg-6">
        <article class="video-card">
          <div class="video-frame">
            <video controls preload="metadata" playsinline>
              <source src="${video.webm}" type="video/webm">
              <source src="${video.mp4}" type="video/mp4">
            </video>
          </div>
          <div class="card-body">
            <h3>${video.titulo}</h3>
            <p>${video.descripcion}</p>
          </div>
        </article>
      </div>
    `;
  }

  function initComparators() {
    document.querySelectorAll(".compare-shell").forEach(shell => {
      const range = shell.querySelector(".compare-range");
      const after = shell.querySelector(".compare-after");
      const divider = shell.querySelector(".compare-divider");

      function update() {
        const value = `${range.value}%`;
        after.style.width = value;
        divider.style.left = value;
      }

      range.addEventListener("input", update);
      update();
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const compareRoot = document.getElementById("compare-root");
    const videoRoot = document.getElementById("video-root");
    if (!compareRoot || !videoRoot) return;

    try {
      const res = await fetch("data/showcase.json");
      const data = await res.json();

      compareRoot.innerHTML = data.comparativas.map(renderCompare).join("");
      videoRoot.innerHTML = data.videos.map(renderVideo).join("");
      initComparators();
    } catch (error) {
      compareRoot.innerHTML = `<div class="alert alert-warning">No se pudo cargar la galería.</div>`;
      console.error(error);
    }
  });
})();