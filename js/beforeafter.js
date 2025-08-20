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

    // Tamaño inicial al 50%
    setPct(50);

    function onMove(evt){
      const rect = wrap.getBoundingClientRect();
      const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
      const pct = (x / rect.width) * 100;
      setPct(pct);
    }

    function startDrag(evt){
      evt.preventDefault();
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', endDrag, { once: true });
    }
    function endDrag(){
      document.removeEventListener('pointermove', onMove);
    }

    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', startDrag);

    // Click/tap directo sobre el wrapper también mueve el handle
    wrap.addEventListener('pointerdown', function(e){
      if(e.target === handle) return;
      onMove(e);
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
