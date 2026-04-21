(function () {
  const cfg = window.__LUX_CONFIG__ || {};
  const current = document.body.dataset.page || "";

  const navItems = [
    { id: "index", href: "index.html", label: "Inicio" },
    { id: "nosotros", href: "nosotros.html", label: "Nosotros" },
    { id: "servicios", href: "servicios.html", label: "Servicios" },
    { id: "resultados", href: "resultados.html", label: "Resultados" },
    { id: "ubicacion", href: "ubicacion.html", label: "Ubicación" },
    { id: "contacto", href: "contacto.html", label: "Contacto" },
    { id: "autor", href: "autor.html", label: "Autor" }
  ];

  function buildNav() {
    return navItems.map(item => `
      <li class="nav-item">
        <a class="nav-link ${item.id === current ? "active" : ""}" href="${item.href}">${item.label}</a>
      </li>
    `).join("");
  }

  function buildHeader() {
    const html = `
      <header class="topbar">
        <div class="container topbar-inner d-flex align-items-center justify-content-between py-3">
          <a href="index.html" class="brand-link">
            <img src="${cfg.LOGO_URL}" alt="Logo ${cfg.BRAND}" class="brand-logo">
            <div>
              <div class="brand-name">${cfg.BRAND}</div>
              <small class="brand-tag">${cfg.TAGLINE}</small>
            </div>
          </a>

          <div class="topbar-tools">
            <span class="top-pill">
              <i class="bi bi-clock-history"></i>
              ${cfg.HOURS_LABEL}
            </span>
            <a class="top-link" href="${cfg.INSTAGRAM_URL}" target="_blank" rel="noopener">
              <i class="bi bi-instagram"></i>
              Instagram
            </a>
            <a class="top-link" href="https://wa.me/${cfg.WHATSAPP_NUMBER}" target="_blank" rel="noopener">
              <i class="bi bi-whatsapp"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <nav class="navbar navbar-expand-lg app-nav sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold d-lg-none" href="index.html">${cfg.BRAND}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Abrir menú">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${buildNav()}
            </ul>

            <div class="nav-socials">
              <a class="btn btn-outline-brand btn-social-pill" href="${cfg.INSTAGRAM_URL}" target="_blank" rel="noopener">
                <i class="bi bi-instagram"></i>
                <span>Instagram</span>
              </a>

              <a class="btn btn-wa btn-social-pill" href="https://wa.me/${cfg.WHATSAPP_NUMBER}" target="_blank" rel="noopener">
                <i class="bi bi-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    document.body.insertAdjacentHTML("afterbegin", html);
  }

  function buildFooter() {
    const html = `
      <footer class="app-footer">
        <div class="container">
          <div class="footer-wrap">
            <div class="footer-socials">
              <span class="label">Síguenos:</span>
              <a class="footer-link" href="${cfg.INSTAGRAM_URL}" target="_blank" rel="noopener">
                <span class="footer-icon"><i class="bi bi-instagram"></i></span>
                <span>Instagram</span>
              </a>
              <span class="footer-dot">·</span>
              <span class="label">Contáctanos:</span>
              <a class="footer-link" href="https://wa.me/${cfg.WHATSAPP_NUMBER}" target="_blank" rel="noopener">
                <span class="footer-icon"><i class="bi bi-whatsapp"></i></span>
                <span>WhatsApp</span>
              </a>
            </div>

            <div class="footer-meta">
              © <span id="year"></span> ${cfg.BRAND}
              <span class="footer-divider">—</span>
              <a href="nosotros.html">Nosotros</a>
              <span class="footer-divider">·</span>
              <a href="contacto.html">Contacto</a>
              <span class="footer-divider">·</span>
              <a href="index.html">Inicio</a>
            </div>
          </div>
        </div>
      </footer>

      <a class="floating-wa" href="https://wa.me/${cfg.WHATSAPP_NUMBER}" target="_blank" rel="noopener" aria-label="WhatsApp">
        <i class="bi bi-whatsapp"></i>
      </a>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildHeader();
    buildFooter();
  });
})();