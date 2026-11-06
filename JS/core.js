/* ==========================================================================
   AX core — shared interaction engine for every page.
   Needs gsap + ScrollTrigger (+ Lenis, optional) loaded first.
   Exposes window.AX for page scripts.
   ========================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.add('js');

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var AX = (window.AX = {
    reduce: reduce,
    fine: fine,
    mouse: { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 },
  });

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out' });

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  AX.lenis = lenis;

  var lastY = scrollY, nativeVel = 0;
  gsap.ticker.add(function () {
    nativeVel = nativeVel * 0.8 + (scrollY - lastY) * 0.2;
    lastY = scrollY;
  });
  AX.velocity = function () { return lenis ? lenis.velocity : nativeVel; };

  AX.scrollTo = function (target, opts) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (lenis) {
      lenis.scrollTo(el != null ? el : target, Object.assign({ duration: 1.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); } }, opts || {}));
    } else if (typeof target === 'number') {
      scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  /* ---------- pointer ---------- */
  addEventListener('pointermove', function (e) {
    AX.mouse.x = e.clientX; AX.mouse.y = e.clientY;
    AX.mouse.nx = (e.clientX / innerWidth) * 2 - 1;
    AX.mouse.ny = -((e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  /* ---------- cursor ---------- */
  if (fine) {
    html.classList.add('has-cursor');
    var dot = document.createElement('div'); dot.className = 'cursor';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var label = document.createElement('span'); ring.appendChild(label);
    document.body.append(dot, ring);
    var rx = AX.mouse.x, ry = AX.mouse.y;
    gsap.ticker.add(function () {
      var m = AX.mouse;
      rx += (m.x - rx) * 0.16; ry += (m.y - ry) * 0.16;
      dot.style.transform = 'translate3d(' + m.x + 'px,' + m.y + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    });
    document.addEventListener('pointerover', function (e) {
      var t = e.target instanceof Element ? e.target : null;
      var lab = t && t.closest('[data-cursor]');
      var hov = t && t.closest('a, button, [data-hover], input, label');
      html.classList.toggle('cur-label', !!lab);
      html.classList.toggle('cur-hover', !lab && !!hov);
      if (lab) label.textContent = lab.getAttribute('data-cursor');
    });
    document.addEventListener('pointerdown', function () { html.classList.add('cur-down'); });
    document.addEventListener('pointerup', function () { html.classList.remove('cur-down'); });
    document.addEventListener('mouseleave', function () { html.classList.add('cur-hidden'); });
    document.addEventListener('mouseenter', function () { html.classList.remove('cur-hidden'); });
  }

  /* ---------- text roll links ---------- */
  document.querySelectorAll('.roll').forEach(function (el) {
    var txt = el.textContent.trim();
    el.innerHTML = '';
    var s = document.createElement('span');
    s.setAttribute('data-text', txt); s.textContent = txt;
    el.appendChild(s);
  });

  /* ---------- split text into masked words ---------- */
  function split(el) {
    if (el.__split) return el.__split;
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
            w.appendChild(wi); frag.appendChild(w); words.push(wi);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.hasAttribute('data-nosplit')) {
          walk(n);
        }
      });
    })(el);
    el.__split = words;
    return words;
  }
  AX.split = split;

  AX.revealWords = function (el, opts) {
    var words = split(el);
    return gsap.to(words, Object.assign({
      y: 0, rotate: 0, duration: 1.3, ease: 'expo.out',
      stagger: parseFloat(el.getAttribute('data-stagger') || 0.045),
      delay: parseFloat(el.getAttribute('data-delay') || 0),
    }, opts || {}));
  };

  document.querySelectorAll('[data-split]').forEach(function (el) {
    split(el);
    if (reduce || el.getAttribute('data-split') === 'manual') return;
    AX.revealWords(el, { scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (reduce || el.getAttribute('data-reveal') === 'manual') return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.4,
      delay: parseFloat(el.getAttribute('data-delay') || 0),
      scrollTrigger: { trigger: el, start: 'top 98%' },
    });
  });

  /* ---------- count-up numbers ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || 0, 10);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var fmt = function (v) {
      var s = v.toFixed(dec);
      if (end >= 1000) s = Number(s).toLocaleString('en-AU');
      return pre + s + suf;
    };
    if (reduce) { el.textContent = fmt(end); return; }
    var o = { v: 0 }; el.textContent = fmt(0);
    gsap.to(o, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: function () { el.textContent = fmt(o.v); },
    });
  });

  /* ---------- 3D tilt + glare ---------- */
  AX.tilt = function (el) {
    if (!fine || reduce) return;
    var max = parseFloat(el.getAttribute('data-tilt') || 10);
    if (!el.querySelector(':scope > .glare')) {
      var g = document.createElement('span'); g.className = 'glare'; el.appendChild(g);
    }
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      gsap.to(el, { rotateY: (px - 0.5) * max * 2, rotateX: -(py - 0.5) * max * 2, transformPerspective: 1000, duration: 0.8, ease: 'power3.out' });
      el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%');
    });
    el.addEventListener('pointerleave', function () {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, .5)' });
    });
  };
  document.querySelectorAll('[data-tilt]').forEach(AX.tilt);

  /* ---------- magnetic ---------- */
  AX.magnetic = function (el) {
    if (!fine || reduce) return;
    var k = parseFloat(el.getAttribute('data-magnetic') || 0.35);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * k, y: (e.clientY - r.top - r.height / 2) * k, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', function () {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, .35)' });
    });
  };
  document.querySelectorAll('[data-magnetic]').forEach(AX.magnetic);

  /* ---------- parallax ---------- */
  if (!reduce) {
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-parallax'));
      gsap.fromTo(el, { y: function () { return -v * innerHeight * 0.5; } }, {
        y: function () { return v * innerHeight * 0.5; }, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    });
  }

  /* ---------- velocity marquees ---------- */
  document.querySelectorAll('.marquee').forEach(function (m) {
    var track = m.querySelector('.marquee-track');
    var base = track.innerHTML, n = 0;
    while (track.scrollWidth < m.offsetWidth * 1.2 && n++ < 12) track.insertAdjacentHTML('beforeend', base);
    var clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); m.appendChild(clone);
    var speed = parseFloat(m.getAttribute('data-speed') || 1);
    var dir = m.getAttribute('data-dir') === 'right' ? -1 : 1;
    var skew = m.hasAttribute('data-skew');
    var x = 0, visible = true, w = track.offsetWidth;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(m);
    addEventListener('resize', function () { w = track.offsetWidth; });
    gsap.ticker.add(function () {
      if (!visible) return;
      var v = AX.velocity();
      x -= dir * (reduce ? 0 : speed + v * 0.3);
      if (w) { x = x % w; if (x > 0) x -= w; }
      track.style.transform = clone.style.transform = 'translate3d(' + x + 'px,0,0)';
      if (skew) m.style.transform = 'skewX(' + gsap.utils.clamp(-12, 12, -v * 0.35) + 'deg)';
    });
  });

  /* ---------- progress bar ---------- */
  var bar = document.querySelector('.progress');
  if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- Melbourne clock ---------- */
  var clocks = document.querySelectorAll('[data-clock]');
  function tick() {
    var t = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    clocks.forEach(function (c) { c.textContent = t; });
  }
  if (clocks.length) { tick(); setInterval(tick, 1000); }

  /* ---------- menu ---------- */
  AX.menu = function (open) {
    html.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    document.querySelectorAll('.menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', open); });
  };
  document.querySelectorAll('.menu-btn').forEach(function (b) {
    b.addEventListener('click', function () { AX.menu(!html.classList.contains('menu-open')); });
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') AX.menu(false); });

  /* ---------- links: in-page scroll + curtain transitions ---------- */
  var curtain = document.querySelector('.curtain');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (/\.pdf$/i.test(url.pathname)) return;
    var samePage = url.pathname === location.pathname;
    if (samePage && url.hash) {
      e.preventDefault();
      var wasOpen = html.classList.contains('menu-open');
      AX.menu(false);
      setTimeout(function () { AX.scrollTo(url.hash === '#top' ? 0 : url.hash); }, wasOpen ? 450 : 0);
      return;
    }
    if (samePage) return;
    e.preventDefault();
    if (!curtain || reduce) { location.href = a.href; return; }
    var kinds = ['goo', 'pixel', 'shutter'];
    var now = html.dataset.tr || 'goo';
    var next = kinds[(kinds.indexOf(now) + 1 + ((Math.random() * 2) | 0)) % kinds.length];
    html.dataset.tr = next;
    try { sessionStorage.setItem('ax-tr', next); } catch (err) {}
    curtain.classList.remove('skip');
    curtain.classList.add('is-in');
    setTimeout(function () { location.href = a.href; }, 1050);
  });
  addEventListener('pageshow', function (e) {
    if (e.persisted && curtain) { curtain.classList.remove('is-in'); curtain.classList.add('skip'); AX.menu(false); }
  });

  /* arriving with a #hash from another page */
  if (location.hash && location.hash.length > 1) {
    addEventListener('load', function () {
      setTimeout(function () { AX.scrollTo(location.hash, { immediate: true }); }, 50);
    });
  }

  /* ---------- refresh once fonts/images settle ---------- */
  /* page scripts may add pins after shared triggers were made, so re-order
     every trigger by page position before measuring again */
  AX.refresh = function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  document.addEventListener('DOMContentLoaded', AX.refresh);
  if (document.fonts) document.fonts.ready.then(AX.refresh);
  addEventListener('load', AX.refresh);
})();
