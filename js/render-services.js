
// Render del servicios desde data/services.json
(function(){
  function crc(n){ return '₡ ' + Number(n||0).toLocaleString('es-CR'); }

  function renderPaquete(p){
    const min = Math.min.apply(null, Object.values(p.precios||{}));
    const precios = Object.entries(p.precios||{})
      .map(([k,v])=>`<tr><td>${k}</td><td class="text-end">${crc(v)}</td></tr>`).join('');
    const incluye = (p.incluye||[]).map(i=>`<li>${i}</li>`).join('');
    return `
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h5 class="card-title mb-0">${p.nombre}</h5>
              <span class="price-badge">Desde ${crc(min)}</span>
            </div>
            <p class="small-muted mb-2">¿Qué incluye?</p>
            <ul class="mb-3">${incluye}</ul>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-3">
                <thead><tr><th class="text-muted">Tipo</th><th class="text-end text-muted">Precio</th></tr></thead>
                <tbody>${precios}</tbody>
              </table>
            </div>
            <a class="btn btn-outline-primary" href="contacto.html?paquete=${encodeURIComponent(p.nombre)}">Reservar</a>
          </div>
        </div>
      </div>`;
  }

  function renderExtras(extras){
    return `<ul>${
      extras.map(e => `<li>${e.nombre} — ${e.precio==null ? 'según evaluación' : crc(e.precio)}</li>`).join('')
    }</ul>
    <div class="small-muted mt-2">Los precios “según evaluación” varían según cantidad de superficies y/o profundidad.</div>`;
  }

  document.addEventListener('DOMContentLoaded', function(){
    const root = document.getElementById('svc-root');
    const ex   = document.getElementById('svc-extras');
    if(!root) return;
    fetch('data/services.json?_=' + Date.now())
      .then(r=>r.json())
      .then(data=>{
        root.innerHTML = (data.paquetes||[]).map(renderPaquete).join('');
        if(ex) ex.innerHTML = renderExtras(data.extras||[]);
      })
      .catch(_=>{
        root.innerHTML = '<div class="alert alert-warning">No se pudo cargar la lista de servicios.</div>';
      });
  });
})();
