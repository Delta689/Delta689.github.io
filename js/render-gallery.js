// Render de Galería (Antes/Después) desde data/gallery.json – con prefijo CDN si aplica
(function(){
  function withBase(src){
    if(!src) return '';
    if(/^https?:\/\//i.test(src) || /^data:/i.test(src)) return src;
    const cfg  = window.__LUX_CONFIG__ || {};
    const base = cfg.IMAGES_BASE || window.IMAGES_BASE || '';
    if(!base) return src;
    const cleaned = src.replace(/^(?:\.?\/)?images\//i, '');
    return base + cleaned;
  }

  function renderPair(p){
    const titulo  = p.titulo || '';
    const antes   = withBase(p.antes);
    const despues = withBase(p.despues);
    return `
      <h5 class="mb-2">${titulo}</h5>
      <div class="ba-wrap mb-4">
        <div class="ba-before"><img src="${antes}" alt="Antes — ${titulo}" loading="lazy"></div>
        <div class="ba-after"><img src="${despues}" alt="Después — ${titulo}" loading="lazy"></div>
        <div class="ba-label">Antes</div><div class="ba-label after">Después</div>
        <div class="ba-handle"></div>
      </div>`;
  }
  
  document.addEventListener('DOMContentLoaded', function(){
    const root = document.getElementById('gal-root');
    if(!root) return;
    fetch('data/gallery.json?__v=' + Date.now())
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const html = (data.pairs || []).map(renderPair).join('');
        root.innerHTML = html || '<div class="alert alert-info">No hay elementos en la galería.</div>';
        if(window.initBeforeAfter){ window.initBeforeAfter(root); }
      })
      .catch(err => {
        console.error('Galería: no se pudo cargar JSON', err);
        root.innerHTML = '<div class="alert alert-warning">No se pudo cargar la galería.</div>';
      });
  });
})();
