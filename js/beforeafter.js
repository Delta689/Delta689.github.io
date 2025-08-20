// Before/After Slider (hover en desktop + drag en touch/lápiz)
(function(){
  function initBA(wrap){
    if(!wrap || wrap.__ba_inited) return;
    const afterImg = wrap.querySelector('.ba-after img');
    const handle   = wrap.querySelector('.ba-handle');
    if(!afterImg || !handle) return;

    wrap.__ba_inited = true;

    function setPct(pct){
      pct = Math.max(0, Math.min(100, pct));
      afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
    }
    setPct(50);

    function getClientX(evt){
      if (evt.touches && evt.touches[0]) return evt.touches[0].clientX;
      if (evt.changedTouches && evt.changedTouches[0]) return evt.changedTouches[0].clientX;
      return evt.clientX;
    }
    function onMove(evt){
      const rect = wrap.getBoundingClientRect();
      const x = getClientX(evt) - rect.left;
      const pct = (x / rect.width) * 100;
      setPct(pct);
    }
    function startDrag(evt){
      evt.preventDefault();
      try { wrap.setPointerCapture && wrap.setPointerCapture(evt.pointerId); } catch(e){}
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', endDrag, { once: true });
    }
    function endDrag(evt){
      document.removeEventListener('pointermove', onMove);
      try { wrap.releasePointerCapture && wrap.releasePointerCapture(evt && evt.pointerId); } catch(e){}
    }

    // HOVER en desktop
    wrap.addEventListener('pointermove', (e)=>{ if (e.pointerType === 'mouse') onMove(e); });

    // Drag desde el handle
    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', startDrag);

    // Click/tap en el wrapper salta el handle a esa posición
    wrap.addEventListener('pointerdown', function(e){
      if (e.target === handle) return;
      onMove(e);
    });

    // Touch fallback
    wrap.addEventListener('touchmove', onMove, { passive: true });
  }

  function scan(root){
    (root||document).querySelectorAll('.ba-wrap').forEach(initBA);
  }

  window.initBeforeAfter = scan;

  document.addEventListener('DOMContentLoaded', function(){
    scan(document);
  });
})();
