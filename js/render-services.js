(function () {
  const money = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0
  });

  function renderPackage(pkg) {
    const min = Math.min(...Object.values(pkg.precios));
    const prices = Object.entries(pkg.precios).map(([tipo, precio]) => `
      <div class="row-item">
        <span>${tipo}</span>
        <strong>${money.format(precio)}</strong>
      </div>
    `).join("");

    const includes = pkg.incluye.map(item => `<li>${item}</li>`).join("");

    return `
      <div class="col-lg-6">
        <article class="service-card">
          <div class="card-body">
            <div class="service-top">
              <div>
                <h3>${pkg.nombre}</h3>
                <div class="service-meta">${pkg.descripcion}</div>
                <div class="service-meta mt-1">Duración estimada: <strong>${pkg.duracion}</strong></div>
              </div>
              <span class="price-chip">Desde ${money.format(min)}</span>
            </div>

            <ul class="service-list">${includes}</ul>

            <div class="service-table">
              ${prices}
            </div>

            <div class="mt-3">
              <a class="btn btn-brand" href="contacto.html?paquete=${encodeURIComponent(pkg.nombre)}">Agendar este paquete</a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderExtra(extra) {
    const price = extra.precio == null ? "Según evaluación" : money.format(extra.precio);

    return `
      <div class="col-md-6 col-xl-3">
        <article class="mini-extra">
          <h4>${extra.nombre}</h4>
          <p>${extra.descripcion}</p>
          <strong>${price}</strong>
        </article>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const root = document.getElementById("svc-root");
    const extrasRoot = document.getElementById("svc-extras");
    if (!root) return;

    try {
      const res = await fetch("data/services.json");
      const data = await res.json();

      root.innerHTML = data.paquetes.map(renderPackage).join("");
      if (extrasRoot) {
        extrasRoot.innerHTML = `<div class="row g-3 extras-grid">${data.extras.map(renderExtra).join("")}</div>`;
      }
    } catch (error) {
      root.innerHTML = `<div class="alert alert-warning">No se pudieron cargar los servicios.</div>`;
      console.error(error);
    }
  });
})();