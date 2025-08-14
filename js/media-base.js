// js/media-base.js
(function(){
  const cfg = window.__LUX_CONFIG__ || {};
  const IMB = cfg.IMAGES_BASE || "";
  const VIB = cfg.VIDEO_BASE  || "";
  if(!IMB && !VIB) return;

  function stripPrefix(p, dir){
    const re = new RegExp('^(?:\\.?\\/)?' + dir + '\\/','i');
    return p.replace(re, '');
  }
  function rewriteIn(root=document){
    if(IMB){
      root.querySelectorAll('img[src]').forEach(img=>{
        const src = img.getAttribute('src')||"";
        if(/^(?:\.?\/)?images\//i.test(src)){
          img.src = IMB + stripPrefix(src, 'images');
        }
      });
    }
    if(VIB){
      root.querySelectorAll('video source[src]').forEach(s=>{
        const src = s.getAttribute('src')||"";
        if(/^(?:\.?\/)?media\//i.test(src)){
          s.src = VIB + stripPrefix(src, 'media');
        }
      });
      root.querySelectorAll('video[poster]').forEach(v=>{
        const p = v.getAttribute('poster')||"";
        if(/^(?:\.?\/)?media\//i.test(p)){
          v.poster = VIB + stripPrefix(p, 'media');
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => rewriteIn(document));
  } else {
    rewriteIn(document);
  }
  new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{
    if(n.nodeType===1) rewriteIn(n);
  }))).observe(document.documentElement,{childList:true,subtree:true});
})();
