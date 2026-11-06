/* ==========================================================================
   Symbiote infection layer — section drips. Loads after core.js on every page.
   ========================================================================== */
(() => {
  const { gsap, ScrollTrigger, AX } = window;
  const html = document.documentElement;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- drips helper: AX.drips(host, { color, count, max }) → set(progress) ---------- */
  AX.drips = (host, o = {}) => {
    const count = o.count || Math.max(10, Math.round(host.clientWidth / 70));
    const max = o.max || 160;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const layer = document.createElement('div');
    layer.className = 'drips'; layer.setAttribute('aria-hidden', 'true');
    layer.style.color = o.color || 'var(--goo)';
    layer.style.height = max + 80 + 'px';
    layer.innerHTML = '<b></b>';
    const band = layer.firstChild;
    const cols = [];
    for (let i = 0; i < count; i++) {
      const c = document.createElement('i');
      const w = o.full ? (host.clientWidth / count) * rnd(1.5, 2.1) : rnd(14, 44);
      c.style.left = `calc(${((i + rnd(0.1, 0.9)) / count) * 100}% - ${w / 2}px)`;
      c.style.width = w + 'px';
      layer.appendChild(c);
      cols.push({ el: c, h: o.full ? rnd(0.82, 1) : Math.pow(Math.random(), 1.6) * 0.95 + 0.05, lag: rnd(0, 0.3) });
    }
    host.prepend(layer);
    const set = (p) => cols.forEach((c) => {
      const q = Math.max(0, Math.min(1, (p - c.lag) / (1 - c.lag)));
      const h = q * c.h * max;
      c.el.style.height = h + 'px';
      c.el.style.visibility = h < 18 ? 'hidden' : 'visible';
    });
    const setAll = (p) => { band.style.visibility = p > 0.01 ? 'visible' : 'hidden'; set(p); };
    setAll(0);
    return { layer, set: setAll };
  };

  /* every boundary between two differently coloured blocks bleeds */
  const effBg = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  if (!AX.reduce && !document.body.hasAttribute('data-no-drips')) {
    const blocks = [...document.querySelectorAll('main > *')].filter((el) => el.offsetHeight > 40 && !el.hasAttribute('data-no-drip'));
    for (let i = 1; i < blocks.length; i++) {
      const prev = effBg(blocks[i - 1]), cur = effBg(blocks[i]);
      if (prev === cur) continue;
      const d = AX.drips(blocks[i], { color: prev, max: Math.min(220, innerHeight * 0.25) });
      ScrollTrigger.create({
        trigger: blocks[i], start: 'top bottom', end: 'top 25%', scrub: 0.6,
        onUpdate: (s) => d.set(s.progress),
      });
    }
  }

})();
