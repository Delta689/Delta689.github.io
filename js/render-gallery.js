
// Render de Galería (Antes/Después) desde data/gallery.json
(function(){
  function renderPair(p){
    return `
      <h5 class="mb-2">${p.titulo||''}</h5>
      <div class="ba-wrap mb-4">
        <div class="ba-before"><img src="${p.antes}" alt="Antes — ${p.titulo||''}"></div>
        <div class="ba-after"><img src="${p.despues}" alt="Después — ${p.titulo||''}"></div>
        <div class="ba-label">Antes</div><div class="ba-label after">Después</div>
        <div class="ba-handle"></div>
      </div>`;
  }
  document.addEventListener('DOMContentLoaded', function(){
    const root = document.getElementById('gal-root');
    if(!root) return;
    fetch('data/gallery.json?_=' + Date.now())
      .then(r=>r.json())
      .then(data=>{
        root.innerHTML = (data.pairs||[]).map(renderPair).join('');
        if(window.initBeforeAfter){ window.initBeforeAfter(root); }
        // Se asume que beforeafter.js inicializa automáticamente o por CSS.
      })
      .catch(_=>{
        root.innerHTML = '<div class="alert alert-warning">No se pudo cargar la galería.</div>';
      });
  });
})();
