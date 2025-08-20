
// Before/After Slider (robusto, sin dependencias) - con init global para contenido dinámico
(function(){
  function initBA(wrap){
    if(!wrap || wrap.__ba_inited) return;
    const afterImg = wrap.querySelector('.ba-after img');
    const handle   = wrap.querySelector('.ba-handle');
    if(!afterImg || !handle) return;

    wrap.__ba_inited = true;

    function setPct(pct){
      pct = Math.max(0, Math.min(100, pct));
      afterImg.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
      handle.style.left = pct + '%';
    }
    function setByClientX(clientX){
      const rect = wrap.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      setPct(pct);
    }

    // Estado inicial
    setPct(50);

    // Drag/Move
    let dragging = false;
    function start(e){ dragging = true; move(e); }
    function move(e){
      if(!dragging && e.type!=='mousemove' && e.type!=='touchmove' && e.type!=='click') return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setByClientX(clientX);
    }
    function end(){ dragging = false; }

    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start, {passive:true});
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, {passive:true});
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    wrap.addEventListener('click', move);

    // Recalcular al redimensionar manteniendo el % actual
    window.addEventListener('resize', ()=>{
      const pct = parseFloat((handle.style.left||'50').replace('%','')) || 50;
      setPct(pct);
    });
  }

  function scan(root){
    (root||document).querySelectorAll('.ba-wrap').forEach(initBA);
  }

  // Exponer para contenido inyectado dinámicamente
  window.initBeforeAfter = scan;

  document.addEventListener('DOMContentLoaded', function(){
    scan(document);
  });
})();
