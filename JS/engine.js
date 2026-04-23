(function(){

  var cur = 0, busy = false;
  var SC = window.SCENES, N = SC.length;

  var stage  = document.getElementById('stage');
  var fill   = document.getElementById('progress-fill');
  var curEl  = document.getElementById('cur-scene');
  var totEl  = document.getElementById('total-scenes');
  var hint   = document.getElementById('hint');
  var dot    = document.getElementById('cursor');
  var flash  = document.getElementById('flash');
  var bPrev  = document.getElementById('btn-prev');
  var bNext  = document.getElementById('btn-next');
  var bTop   = document.getElementById('btn-top');
  var tmItems= document.querySelectorAll('.tm-item');

  /* ── BUILD SCENES ── */
  totEl.textContent = pad(N);
  SC.forEach(function(s){ stage.insertAdjacentHTML('beforeend', s.build()); });
  var els = stage.querySelectorAll('.scene');

  els[0].classList.add('active');
  anim(0);
  hud(0);

  /* ── CURSOR ── */
  var mx=innerWidth/2, my=innerHeight/2, cx=mx, cy=my;
  document.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; });
  (function loop(){
    cx+=(mx-cx)*.13; cy+=(my-cy)*.13;
    dot.style.left=cx+'px'; dot.style.top=cy+'px';
    requestAnimationFrame(loop);
  })();

  function bindDot(el){
    el.querySelectorAll('a,.p-card').forEach(function(n){
      n.addEventListener('mouseenter',function(){ dot.classList.add('grow'); });
      n.addEventListener('mouseleave',function(){ dot.classList.remove('grow'); });
    });
  }
  bindDot(document.body);

  /* ── FLASH ── */
  function pop(){
    flash.classList.add('pop');
    setTimeout(function(){ flash.classList.remove('pop'); },100);
  }

  /* ── NAVIGATE ── */
  function go(dir){
    var nxt=cur+dir;
    if(busy||nxt<0||nxt>=N) return;
    busy=true; pop();
    var from=els[cur], to=els[nxt];
    if(dir===1){
      from.classList.add('exit');
      from.classList.remove('active');
      to.classList.add('active');
    } else {
      from.classList.remove('active');
      to.style.clipPath='inset(0 0 0 100%)';
      to.style.transition='none';
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          to.style.transition='clip-path .65s cubic-bezier(.77,0,.175,1)';
          to.style.clipPath='inset(0 0% 0 0)';
          to.classList.add('active');
        });
      });
    }
    setTimeout(function(){
      from.classList.remove('exit');
      from.style.clipPath=''; from.style.transition='';
      to.style.clipPath='';   to.style.transition='';
      cur=nxt; hud(cur); anim(cur); busy=false;
    },720);
  }

  function goTo(idx){
    if(busy||idx===cur||idx<0||idx>=N) return;
    busy=true; pop();
    var from=els[cur], to=els[idx];
    var dir=idx>cur?1:-1;

    if(dir===1){
      from.classList.add('exit');
      from.classList.remove('active');
      to.classList.add('active');
    } else {
      from.classList.remove('active');
      to.style.clipPath='inset(0 0 0 100%)';
      to.style.transition='none';
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          to.style.transition='clip-path .65s cubic-bezier(.77,0,.175,1)';
          to.style.clipPath='inset(0 0% 0 0)';
          to.classList.add('active');
        });
      });
    }

    setTimeout(function(){
      from.classList.remove('exit');
      from.style.clipPath=''; from.style.transition='';
      to.style.clipPath='';   to.style.transition='';
      cur=idx; hud(cur); anim(cur); busy=false;
    },720);
  }

  /* ── ANIMATIONS ── */
  function anim(idx){
    var el=els[idx];
    el.querySelectorAll('.wi,.fu,.sl,.sc').forEach(function(n){ n.classList.remove('in'); });
    el.querySelectorAll('.s-cell,.p-card').forEach(function(n){ n.classList.remove('in'); });

    el.querySelectorAll('.wi').forEach(function(w){
      var d=parseInt(w.getAttribute('data-d')||0,10);
      setTimeout(function(){ w.classList.add('in'); },d);
    });
    ['fu','sl','sc'].forEach(function(cls){
      el.querySelectorAll('.'+cls).forEach(function(n){
        var d=parseInt(n.getAttribute('data-d')||0,10);
        setTimeout(function(){ n.classList.add('in'); },d);
      });
    });
    el.querySelectorAll('.s-cell').forEach(function(c,i){
      setTimeout(function(){ c.classList.add('in'); },170+i*68);
    });
    /* project cards stagger */
    el.querySelectorAll('.p-card').forEach(function(c,i){
      setTimeout(function(){ c.classList.add('in'); },120+i*90);
    });
    bindDot(el);
  }

  /* ── HUD ── */
  function hud(idx){
    curEl.textContent=pad(idx+1);
    fill.style.width=((idx/(N-1))*100)+'%';
    hint.style.opacity=idx===N-1?'0':'';
    bPrev.disabled=idx===0;
    bNext.disabled=idx===N-1;
    idx===N-1 ? bTop.classList.add('visible') : bTop.classList.remove('visible');
    SC[idx].light ? document.body.classList.add('light-scene') : document.body.classList.remove('light-scene');
    updateMenu(idx);
  }

  /* ── TOP MENU ── */
  function updateMenu(idx){
    var best=null;
    tmItems.forEach(function(btn){
      btn.classList.remove('active');
      var t=parseInt(btn.getAttribute('data-goto'),10);
      if(t<=idx && (best===null || t>parseInt(best.getAttribute('data-goto'),10))) best=btn;
    });
    if(best) best.classList.add('active');
  }

  tmItems.forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      goTo(parseInt(btn.getAttribute('data-goto'),10));
    });
  });

  function pad(n){ return String(n).padStart(2,'0'); }

  /* ── EVENTS ── */
  bNext.addEventListener('click',function(){ go(1); });
  bPrev.addEventListener('click',function(){ go(-1); });
  bTop.addEventListener('click', function(){ goTo(0); });

  document.addEventListener('click',function(e){
    if(e.target.tagName==='A') return;
    if(e.target.closest('#btn-prev,#btn-next,#btn-top,#top-menu')) return;
    if(e.target.closest('.p-card')) return;
    go(1);
  });

  document.addEventListener('keydown',function(e){
    if(e.code==='Space'||e.code==='ArrowRight'||e.code==='ArrowDown'){ e.preventDefault(); go(1); }
    if(e.code==='ArrowLeft'||e.code==='ArrowUp'){ e.preventDefault(); go(-1); }
    if(e.code==='Home'){ e.preventDefault(); goTo(0); }
  });

  var tx=0;
  document.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; });
  document.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx;
    if(dx<-40) go(1); if(dx>40) go(-1);
  });

})();