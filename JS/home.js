/* ==========================================================================
   Home — the liquid tells one story as you scroll:
   00 the creature watches you (and dozes off if you leave it alone)
   →  SINGULARITY: it spins into a vortex, swallows the hero, collapses to a point, bang
   01 a single pixel → a grid → a creature that looks back at you
   02 it gets hungry: a serpent that eats every course on the menu
   vi "Next on the menu: you." → THE GULP: jaws, chomp, darkness
   03 inside it: gut walls; drops peel off and burst six instincts open
   04 stomach acid rises; it eats one project to show the next
   05 it wraps the host (the photo) and peers over the top
   06 the jaws open from the inside and let you go; it settles to watch you
   ========================================================================== */
(() => {
  const { gsap, ScrollTrigger, AX } = window;
  const html = document.documentElement;
  const reduce = AX.reduce;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const mm = gsap.matchMedia();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a);

  if (!location.hash) { history.scrollRestoration = 'manual'; scrollTo(0, 0); }

  /* ---------- decode: text scrambles through glyphs, then resolves ---------- */
  const GLY = '▓▒░█#%&@$*+=<>/\\';
  function decode(el, dur = 900, delay = 0) {
    if (reduce || !el) return;
    const final = el.dataset.final || (el.dataset.final = el.textContent);
    const tok = (el._dec = (el._dec || 0) + 1);
    const t0 = performance.now() + delay;
    const tick = () => {
      if (el._dec !== tok) return;
      const p = (performance.now() - t0) / dur;
      if (p < 0) { requestAnimationFrame(tick); return; }
      let out = '';
      for (let i = 0; i < final.length; i++) out += final[i] === ' ' || i / final.length < p ? final[i] : GLY[(Math.random() * GLY.length) | 0];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
    };
    requestAnimationFrame(tick);
  }
  $$('.tc').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => decode(el, 700) }));
  $$('.nav-mid a, .ct-links a').forEach((a) => a.addEventListener('pointerenter', () => decode(a.querySelector('span') || a, 380)));

  /* ---------- the bite changes the page for good ---------- */
  let bitten = false, biteClip = '';
  const heroName = $('.hero-name');
  // carve a tooth-marked chunk out of "Angbo"
  function carveBite() {
    const box = heroName.getBoundingClientRect(), r = $('.hn-1').getBoundingClientRect();
    const W = box.width, H = box.height;
    const cx = r.right - box.left - r.width * 0.04, cy = r.top - box.top + r.height * 0.6, R = r.height * 0.5;
    const n = 30;
    let d = `M0 0H${W}V${H}H0Z`;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = R * (i % 2 ? 0.8 : 1) * (1 + Math.sin(i * 2.7) * 0.05);
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }
    biteClip = `path(evenodd, '${d}Z')`;
    if (!html.classList.contains('hero-free')) heroName.style.clipPath = biteClip;
    heroName.classList.add('has-bite');
  }
  // a jagged tooth-marked notch, as a clip-path polygon in % of the element
  function notch() {
    const top = Math.random() < 0.5, a = rnd(10, 55), b = a + rnd(24, 38), depth = rnd(30, 48), n = 9;
    const arc = [];
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n, d = depth * Math.sin((Math.PI * i) / n) * (i % 2 ? 0.72 : 1);
      arc.push(`${x.toFixed(1)}% ${(top ? d : 100 - d).toFixed(1)}%`);
    }
    return top
      ? `polygon(0% 0%, ${a}% 0%, ${arc.join(', ')}, ${b}% 0%, 100% 0%, 100% 100%, 0% 100%)`
      : `polygon(0% 0%, 100% 0%, 100% 100%, ${b}% 100%, ${arc.reverse().join(', ')}, ${a}% 100%, 0% 100%)`;
  }
  // everything it has touched looks chewed: knocked askew, some words missing a bite
  function chewText() {
    $$('.h2 .w, .origin-text .w, .contact-title .w').forEach((w) => {
      w.classList.add('chewed');
      w.style.rotate = `${rnd(-4, 4).toFixed(1)}deg`;
      w.style.translate = `0 ${rnd(-0.07, 0.07).toFixed(3)}em`;
      if (Math.random() < 0.28) w.style.clipPath = notch();
    });
    $$('.dl-t, .inst h3, .wt h3').forEach((el) => { el.classList.add('chewed'); el.style.rotate = `${rnd(-1.8, 1.8).toFixed(1)}deg`; });
  }
  // puncture wounds torn into the page right where the teeth met
  function wound(tips) {
    const pin = $('.gulp-pin');
    if (!pin || !tips || !tips.length) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'wounds'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    tips.forEach(({ x, y, s }) => {
      const R = s, pts = [];
      for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, r = R * rnd(0.55, 1.15); pts.push(`${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r * 1.25).toFixed(1)}`); }
      const bruise = document.createElementNS(ns, 'ellipse');
      bruise.setAttribute('class', 'bruise'); bruise.setAttribute('cx', x); bruise.setAttribute('cy', y); bruise.setAttribute('rx', R * 1.35); bruise.setAttribute('ry', R * 1.6);
      const hole = document.createElementNS(ns, 'polygon');
      hole.setAttribute('class', 'hole'); hole.setAttribute('points', pts.join(' '));
      svg.append(bruise, hole);
      const cracks = 2 + ((Math.random() * 3) | 0);
      for (let c = 0; c < cracks; c++) {
        let a = rnd(0, Math.PI * 2), px = x + Math.cos(a) * R, py = y + Math.sin(a) * R, d = `M${px.toFixed(1)} ${py.toFixed(1)}`;
        const segs = 3 + ((Math.random() * 3) | 0);
        for (let k = 0; k < segs; k++) { a += rnd(-0.6, 0.6); const l = rnd(8, 22); px += Math.cos(a) * l; py += Math.sin(a) * l; d += `L${px.toFixed(1)} ${py.toFixed(1)}`; }
        const cr = document.createElementNS(ns, 'path'); cr.setAttribute('class', 'crack'); cr.setAttribute('d', d); svg.appendChild(cr);
      }
    });
    pin.appendChild(svg);
  }
  // only the deepest teeth leave marks: every canine plus a few others
  const pickTips = (tips) => {
    const can = tips.filter((t) => t.canine), rest = tips.filter((t) => !t.canine).sort(() => Math.random() - 0.5).slice(0, 4);
    return can.concat(rest);
  };
  let biteTips = null;
  function bite() {
    if (bitten) return;
    bitten = true;
    html.classList.add('bitten');
    carveBite();
    if (!reduce) { chewText(); wound(pickTips(biteTips || defaultTips())); }
  }
  // if we arrive past the bite without seeing it, still leave marks along the middle
  function defaultTips() {
    const n = 13, out = [];
    for (let i = 0; i < n; i++) out.push({ x: ((i + 0.5) / n) * innerWidth, y: innerHeight / 2 + (i % 2 ? 14 : -14), s: rnd(9, 20) });
    return out;
  }
  addEventListener('resize', () => { if (bitten) carveBite(); });

  /* ---------- name letters: weight swells near the cursor ---------- */
  const chars = [];
  $$('.hn').forEach((el) => {
    const t = el.textContent.trim(); el.textContent = '';
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); chars.push({ el: s, w: 120 }); });
  });
  if (!reduce) gsap.set('.ch', { yPercent: 115 });
  let heroVisible = true;
  new IntersectionObserver((e) => { heroVisible = e[0].isIntersecting; }).observe($('.hero'));
  if (!reduce && AX.fine) {
    gsap.ticker.add(() => {
      if (!heroVisible) return;
      const rad = Math.max(innerWidth * 0.22, 220);
      chars.forEach((c, i) => {
        let k;
        if (AX.fine) {
          const r = c.el.getBoundingClientRect();
          k = Math.max(0, 1 - Math.hypot(r.left + r.width / 2 - AX.mouse.x, r.top + r.height / 2 - AX.mouse.y) / rad);
          k = k * k * (3 - 2 * k);
        } else k = 0.5 + 0.5 * Math.sin(performance.now() / 600 - i * 0.7);
        const tgt = bitten ? 900 - 640 * k : 120 + 720 * k;   // thin swells heavy; after the bite, heavy thins
        c.w += (tgt - c.w) * 0.12;
        c.el.style.fontVariationSettings = `'wght' ${c.w.toFixed(0)}, 'opsz' 72`;
      });
    });
  }

  /* ---------- the singularity pulls the whole hero into one point ---------- */
  const suck = { items: null };
  const suckEls = () => [...chars.map((c) => c.el), ...$$('.hero-top > span, .hero-foot > *'), $('.hero-cap')];
  function clearSuck() {
    if (!suck.items) return;
    suck.items.forEach(({ el }) => { el.style.translate = el.style.rotate = el.style.scale = el.style.filter = el.style.textShadow = ''; });
    suck.items = null;
    html.classList.remove('hero-free');
    if (biteClip) heroName.style.clipPath = biteClip;
  }
  // p: scroll progress through the hero; all: forced collapse (0..1); cx, cy: where the hole is
  function applySuck(p, all, cx, cy) {
    if (p <= 0) { clearSuck(); return; }
    if (!suck.items) {
      suck.items = suckEls().filter(Boolean).map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 + scrollY, ch: el.classList.contains('ch') };
      });
      html.classList.add('hero-free');
      heroName.style.clipPath = 'none';
    }
    const far = Math.hypot(innerWidth, innerHeight) * 0.6;
    suck.items.forEach((it, i) => {
      const nx = it.x, ny = it.y - scrollY, dx = nx - cx, dy = ny - cy, d0 = Math.hypot(dx, dy);
      const dn = clamp(d0 / far);
      const k = Math.max(ss(0.03 + 0.22 * dn, 0.5 + 0.05 * dn + (i % 3) * 0.01, p), all);
      const th = Math.atan2(dy, dx) + k * 2.6, rr = d0 * Math.pow(1 - k, 1.7);
      const tx = cx + Math.cos(th) * rr - nx, ty = cy + Math.sin(th) * rr - ny;
      // stretched along the pull, thinned across it: spaghettified
      const axis = ((((th * 180) / Math.PI) % 180) + 270) % 180 - 90;
      const sx = (1 + 4 * k * k) * (1 - Math.pow(k, 4)), sy = 1 - 0.9 * k;
      it.el.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      it.el.style.rotate = `${(axis * ss(0, 0.35, k)).toFixed(1)}deg`;
      it.el.style.scale = `${sx.toFixed(3)} ${sy.toFixed(3)}`;
      it.el.style.filter = k > 0.01 ? `blur(${(k * 2.2).toFixed(1)}px) opacity(${(1 - ss(0.8, 1, k)).toFixed(3)})` : '';
      if (it.ch) {
        const o = (k * 16).toFixed(1), a = (0.75 * Math.min(1, k * 2)).toFixed(2);
        it.el.style.textShadow = k > 0.01 ? `${o}px 0 rgba(255,30,70,${a}), -${o}px 0 rgba(30,190,255,${a})` : '';
      }
    });
  }
  addEventListener('resize', () => { clearSuck(); });

  /* ---------- intro ---------- */
  const introState = { v: reduce ? 1 : 0 };
  function intro() {
    AX.lockScroll(false);
    gsap.timeline()
      .to(introState, { v: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .to('.ch', { yPercent: 0, duration: 1.6, stagger: { each: 0.07, from: 'random' }, ease: 'expo.out' }, 0.25)
      .fromTo('.hero-cap', { opacity: 0, y: 24, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, clearProps: 'filter' }, 0.9)
      .fromTo('.hero-top > *, .hero-foot > *, .nav > *', { opacity: 0 }, { keyframes: { opacity: [0, 1, 0.15, 1, 0.4, 1] }, duration: 0.6, ease: 'none', stagger: 0.06 }, 0.6);
  }
  if (reduce) {
    $('.preloader').style.display = 'none';
    gsap.set('.hero-cap', { opacity: 1 });
  } else if (html.classList.contains('seen')) {
    gsap.delayedCall(0.35, intro);
  } else {
    AX.lockScroll(true);
    const num = $('#plNum'), o = { v: 0 };
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.timeline()
      .to('.pl-eyes svg', { opacity: 1, duration: 0.01 }, 0.3)
      .to('.pl-eyes svg', { scaleY: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0.3)
      .add(() => decode($('.pl-cap'), 1100), 0.6)
      .to('.pl-cap', { opacity: 1, duration: 0.3 }, 0.6)
      .to(o, { v: 100, duration: 2.1, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0.2)
      .to('.pl-eyes svg', { scaleY: 0.05, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.in' }, 1.5)
      .add(() => {
        fontsReady.then(() => {
          try { sessionStorage.setItem('ax-intro', '1'); } catch (e) {}
          gsap.timeline()
            .to('.pl-eyes svg', { scaleY: 0.02, duration: 0.18, ease: 'power2.in' })
            .to('.pl-cap, .pl-meta', { opacity: 0, duration: 0.4 }, 0)
            .to('.preloader', { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.15)
            .add(() => { $('.preloader').style.display = 'none'; $('.curtain').classList.add('skip'); html.classList.add('seen'); })
            .add(intro, 0.2);
        });
      }, 2.4);
  }

  /* ---------- origin: pinned; words surface while the pixel evolves ---------- */
  const words = AX.split($('.origin-text'));
  let stOrigin = null;
  if (!reduce) {
    gsap.set(words, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.origin-pin', start: 'top top', end: '+=230%', pin: true, scrub: true } });
    tl.to({}, { duration: 0.14 }).to(words, { opacity: 1, stagger: 0.05, duration: 0.01, ease: 'steps(1)' }).to({}, { duration: 0.12 });
    stOrigin = tl.scrollTrigger;
  }

  /* ---------- hunger: rows flicker on like failing lights ---------- */
  const rows = $$('.diet-list li');
  if (!reduce) {
    rows.forEach((li, i) => {
      gsap.fromTo(li, { opacity: 0 }, {
        keyframes: { opacity: [0, 1, 0.1, 0.8, 0, 1] }, duration: 0.7, ease: 'none', delay: i * 0.09 + Math.random() * 0.15,
        scrollTrigger: { trigger: '.diet-list', start: 'top 82%' },
      });
    });
  }
  let rowHover = null;
  rows.forEach((li) => {
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') rowHover = li; });
    li.addEventListener('pointerleave', () => { if (rowHover === li) rowHover = null; });
  });
  // the serpent takes a bite out of every course it reaches
  function feed(li) {
    if (li.classList.contains('fed')) return;
    li.classList.add('fed');
    const t = li.querySelector('.dl-t');
    if (t && !reduce) { t.style.clipPath = notch(); decode(t, 420); }
  }

  /* ---------- the gulp: pinned while it eats you ---------- */
  const gulpA = $('.gulp-a'), gulpT = $('.gulp-t');
  let stGulp = null;
  if (!reduce) stGulp = ScrollTrigger.create({ trigger: '.gulp-pin', start: 'top top', end: '+=230%', pin: true });

  /* ---------- inside: hover (or, on touch, the box in the middle) → the liquid circles that box ---------- */
  const boxes = $$('.inst');
  let boxHover = null;
  boxes.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; boxHover = el; boxes.forEach((x) => x.classList.toggle('is-form', x === el)); decode(el.querySelector('h3'), 450); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; if (boxHover === el) { boxHover = null; el.classList.remove('is-form'); } });
  });

  /* ---------- absorbed: pinned on desktop; the liquid eats a project to swap it ---------- */
  const titles = $$('.wt'), frames = $$('.wf');
  const wIdx = $('#wIdx');
  let activeWork = 0, stWork = null, frameHover = false;
  frames.forEach((f) => { f.addEventListener('pointerenter', () => { frameHover = true; }); f.addEventListener('pointerleave', () => { frameHover = false; }); });
  const setActive = (i) => {
    if (i === activeWork) return;
    activeWork = i;
    frames.forEach((f, k) => { f.style.opacity = k === i ? 1 : 0; f.style.pointerEvents = k === i ? 'auto' : 'none'; });
    titles.forEach((t, k) => t.classList.toggle('on', k === i));
    wIdx.textContent = pad(i + 1);
    decode(titles[i].querySelector('h3'), 650);
  };
  const wBar = $('#wBar');
  mm.add('(min-width: 901px)', () => {
    activeWork = -1; setActive(0);
    stWork = ScrollTrigger.create({ trigger: '.work-pin', start: 'top top', end: '+=240%', pin: true, onUpdate: (s) => { wBar.style.transform = `scaleX(${0.333 + 0.667 * s.progress})`; } });
    return () => {
      stWork = null;
      frames.forEach((f) => { f.style.opacity = ''; f.style.pointerEvents = ''; });
      titles.forEach((t) => { t.classList.remove('on'); t.style.opacity = ''; t.style.filter = ''; });
      activeWork = 0;
    };
  });

  /* ---------- the host: the photo pixelates into focus ---------- */
  const photo = $('.ap-inner img');
  if (!reduce) {
    gsap.fromTo(photo, { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.about-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
    const cv = document.createElement('canvas');
    cv.className = 'ap-px'; cv.setAttribute('aria-hidden', 'true'); cv.style.background = '#050505';
    $('.ap-inner').appendChild(cv);
    const tiny = document.createElement('canvas');
    const draw = (block) => {
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !photo.naturalWidth) return;
      cv.width = W; cv.height = H;
      const tw = Math.max(1, Math.round(W / block)), th = Math.max(1, Math.round(H / block));
      tiny.width = tw; tiny.height = th;
      const tc = tiny.getContext('2d');
      const ir = photo.naturalWidth / photo.naturalHeight, cr = W / H;
      let sw = photo.naturalWidth, sh = photo.naturalHeight, sx = 0, sy = 0;
      if (ir > cr) { sw = sh * cr; sx = (photo.naturalWidth - sw) * 0.56; } else { sh = sw / cr; sy = (photo.naturalHeight - sh) * 0.62; }
      tc.filter = 'grayscale(1) contrast(1.35) brightness(.85)';
      tc.drawImage(photo, sx, sy, sw, sh, 0, 0, tw, th);
      const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(tiny, 0, 0, W, H);
    };
    photo.loading = 'eager';
    const run = () => {
      const steps = [96, 64, 40, 24, 14, 8, 4], st = { i: 0 };
      draw(steps[0]); cv.style.background = 'transparent';
      gsap.timeline()
        .to(st, { i: steps.length - 1, duration: 1.4, ease: `steps(${steps.length - 1})`, onUpdate: () => draw(steps[Math.round(st.i)]) })
        .to(cv, { opacity: 0, duration: 0.35 });
    };
    ScrollTrigger.create({
      trigger: '.about-photo', start: 'top 75%', once: true,
      onEnter: () => (photo.complete ? Promise.resolve() : new Promise((r) => photo.addEventListener('load', r, { once: true }))).then(run),
    });
  }

  /* ---------- released: words flicker on like a neon sign ---------- */
  const cWords = AX.split($('.contact-title'));
  if (!reduce) {
    gsap.set(cWords, { y: 0, rotate: 0, opacity: 0 });
    ScrollTrigger.create({
      trigger: '.contact-title', start: 'top 70%', once: true,
      onEnter: () => cWords.forEach((w, i) => gsap.to(w, { keyframes: { opacity: [0, 1, 0, 0.6, 0, 1] }, duration: 0.8, ease: 'none', delay: 0.15 + i * 0.25 + Math.random() * 0.2 })),
    });
    gsap.from('.contact-cap, .ct-mail, .ct-links', { y: 40, opacity: 0, duration: 1.3, stagger: 0.1, scrollTrigger: { trigger: '.contact-cap', start: 'top 92%' } });
  } else gsap.set(cWords, { y: 0, rotate: 0 });

  if (reduce) { $('#gl').style.display = 'none'; $('#glf').style.display = 'none'; return; }

  /* ==========================================================================
     The liquid
     ========================================================================== */
  const stHero = ScrollTrigger.create({ trigger: '#origin', start: 'top bottom', end: 'top top' });
  const stDiet = ScrollTrigger.create({ trigger: '#diet', start: 'top bottom', end: 'top 35%' });
  const stGulpIn = ScrollTrigger.create({ trigger: '#gulp', start: 'top bottom', end: 'top top' });
  const stInst = ScrollTrigger.create({ trigger: '#instincts', start: 'top bottom', end: 'top -12%' });
  const stWorkIn = ScrollTrigger.create({ trigger: '#work', start: 'top bottom', end: 'top top' });
  const stAbout = ScrollTrigger.create({ trigger: '#about', start: 'top bottom', end: 'top 25%' });
  const stContact = ScrollTrigger.create({ trigger: '#contact', start: 'top bottom', end: 'top 5%' });
  // every beat of the story is a stop: scroll past one fast and the page holds there while it plays
  const at = (get, p) => () => { const s = typeof get === 'function' ? get() : get; return s ? s.start + (s.end - s.start) * p : NaN; };
  [
    [at(stHero, 0.62), 950],             // the bang
    at(() => stOrigin, 0), at(() => stOrigin, 1),
    at(stDiet, 1),
    at(() => stGulp, 0), [at(() => stGulp, 0.72), 1000], at(() => stGulp, 1),   // "next on the menu" → swallowed → inside
    at(() => stWork, 0.14), at(() => stWork, 0.36), at(() => stWork, 0.69), at(() => stWork, 1),
    at(stAbout, 1),
    [at(stContact, 0.26), 800],          // "it let you go"
  ].forEach((s) => (Array.isArray(s) ? AX.stop(s[0], s[1]) : AX.stop(s)));

  // "Work" lands where the first project is already on screen, not on the moment the acid fills it
  $$('a[href="#work"]').forEach((a) => a.addEventListener('click', (e) => {
    if (!stWork) return;                       // phones: the work section isn't pinned, the anchor is fine
    e.preventDefault();
    const wasOpen = html.classList.contains('menu-open');
    AX.menu(false);
    setTimeout(() => AX.scrollTo(stWork.start + (stWork.end - stWork.start) * 0.14), wasOpen ? 450 : 0);
  }));
  AX.refresh();

  const MOODS = { top: '#ff3b1f', origin: '#3d6bff', diet: '#00d68f', gulp: '#ff1f3d', instincts: '#ffb000', work: '#a46bff', about: '#ff2d87', contact: '#ff3b1f' };
  const moodIds = Object.keys(MOODS).map((id) => document.getElementById(id));
  // section tops measured once per layout change, not read back every frame
  let moodTops = [];
  const measureMoods = () => { const sy = scrollY; moodTops = moodIds.map((el) => el.getBoundingClientRect().top + sy); };
  ScrollTrigger.addEventListener('refresh', measureMoods); measureMoods();
  const statusEl = $('[data-status]'), formEl = $('[data-form]'), cellsEl = $('[data-cells]');
  const setText = (el, v) => { if (el && el.dataset.v !== v) { el.dataset.v = v; delete el.dataset.final; el.textContent = v; decode(el, 380); } };
  const eyesEl = $('#eyes'), halo = $('#halo'), dimEl = $('#dim');
  const desk = () => innerWidth > 900;
  const lite = !AX.fine || innerWidth < 760;   // phones and tablets: skip the costly extras
  // per-frame style writes only touch the DOM when the value actually changes
  const setS = (el, prop, v) => { const c = el._sc || (el._sc = {}); if (c[prop] !== v) { c[prop] = v; el.style[prop] = v; } };
  const rectOf = (el, padPx = 0) => { const r = el.getBoundingClientRect(); return { l: r.left - padPx, t: r.top - padPx, w: r.width + padPx * 2, h: r.height + padPx * 2 }; };
  // whichever of `els` sits closest to the middle of the screen
  const nearest = (els, at = 0.5) => {
    let best = null, bd = Infinity;
    const y = innerHeight * at;
    els.forEach((el) => { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const d = Math.abs(r.top + r.height / 2 - y); if (d < bd) { bd = d; best = el; } });
    return best;
  };

  /* ---------- cinematic captions above the liquid ---------- */
  const storyEl = $('#story'), stT = $('#story .st-t'), stS = $('#story .st-s');
  const STORIES = { gulp: ['Swallowed whole.', 'Log vi / Breach'], out: ['It let you go.', 'Log 06 / Release'] };
  let storyKey = '', storyO = -1;
  function story(key, o) {
    if (o > 0.01 && key !== storyKey) {
      storyKey = key; stT.textContent = STORIES[key][0]; stS.textContent = STORIES[key][1];
      delete stT.dataset.final; decode(stT, 650);
    }
    if (Math.abs(o - storyO) > 0.002) { storyEl.style.opacity = o.toFixed(3); storyO = o; }
  }

  // touching the screen counts as being awake, too
  let lastActive = performance.now();
  const wake = () => { lastActive = performance.now(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => addEventListener(ev, wake, { passive: true }));

  async function init() {
    if (document.fonts) await document.fonts.load('900 120px "Big Shoulders"').catch(() => {});
    const N = lite ? 440 : 950;
    const sw = await AX.swarm({ back: $('#gl'), front: $('#glf'), n: N });
    const { F } = sw;
    const A = sw.buf(), B = sw.buf(), T = sw.buf(), X = sw.buf(), G = sw.buf(), I = sw.buf(), Y = sw.buf();
    const THREE = sw.THREE;
    const mood = new THREE.Color(MOODS.top), mTarget = new THREE.Color();
    let lastMood = '', lastMoodT = -1;

    // the serpent's body is the head's recent path
    const TL = 64, trail = new Float32Array(TL * 2);
    const head = { x: innerWidth * 0.7, y: innerHeight * 0.5 };
    for (let i = 0; i < TL; i++) { trail[i * 2] = head.x - i * 9; trail[i * 2 + 1] = head.y; }

    // interaction: tap = splash, hold still = it rushes your finger/cursor and bristles
    const st = { hv: 0, fh: 0, rage: 0, lastBox: null, reach: 0, reachEl: null, sleep: 0 };
    let downAt = 0, downX = 0, downY = 0, holdTl = null;
    const release = () => {
      if (holdTl) { holdTl.kill(); holdTl = null; }
      gsap.killTweensOf(st, 'rage');
      gsap.to(st, { rage: 0, duration: 0.9, ease: 'power2.out' });
    };
    addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('a, button, input')) return;
      downAt = performance.now(); downX = e.clientX; downY = e.clientY;
      release();
      // a held press makes it lunge and bristle, but it always pulls itself back together
      holdTl = gsap.timeline()
        .to(st, { rage: 1, duration: 0.6, ease: 'power3.out' }, e.pointerType === 'mouse' ? 0.25 : 0.45)
        .to(st, { rage: 0, duration: 1.1, ease: 'power2.inOut' }, 2.2);
    });
    // a finger that moves is scrolling, not holding
    addEventListener('pointermove', (e) => { if (downAt && Math.hypot(e.clientX - downX, e.clientY - downY) > 12) { downAt = 0; release(); } }, { passive: true });
    addEventListener('pointerup', (e) => {
      if (!downAt) return;
      const held = performance.now() - downAt; downAt = 0;
      release();
      if (held < 250) { sw.splash(e.clientX, e.clientY, 1); reshape(e.clientX, e.clientY); }
    });
    addEventListener('pointercancel', () => { downAt = 0; release(); });
    addEventListener('blur', () => { downAt = 0; release(); });

    let t = 0, blink = 3, first = true, spinA = 0;

    /* ---------- click: it takes the next form where you clicked, then settles back ---------- */
    const SHAPES = ['spikes', 'ring', 'grid', 'vortex', 'blob'];
    const shape = { k: 0, i: -1, x: 0, y: 0, at: -1e9 };
    let settleTimer = 0;
    function reshape(x, y) {
      shape.i = (shape.i + 1) % SHAPES.length; shape.x = x; shape.y = y; shape.at = performance.now();
      gsap.to(shape, { k: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => gsap.to(shape, { k: 0, duration: 1.2, ease: 'power2.inOut', overwrite: true }), 2800);
    }
    function shapeAt(o, R) {
      const cx = shape.x, cy = shape.y, name = SHAPES[shape.i];
      if (name === 'spikes') return F.spikes(o, t, { cx, cy, R });
      if (name === 'ring') return F.ring(o, t, { l: cx - R, t: cy - R, w: R * 2, h: R * 2, pad: 0, speed: 0.9, thick: R * 0.22 });
      if (name === 'grid') return F.grid(o, t, { cx, cy, cell: R * 0.34, n: 6 });
      if (name === 'vortex') return F.vortex(o, t, { cx, cy, R: R * 1.2, spin: t * 3, flow: 0.4, tilt: 0.75 });
      return F.blob(o, t, { cx, cy, R });
    }

    /* ---------- expressions: the eyes change shape with a quick blink ---------- */
    const EXPR = {
      neutral: 'M122 46 Q160 18 214 10 Q178 44 122 46Z',
      angry: 'M118 54 Q166 34 216 6 Q178 40 118 54Z',
      surprised: 'M128 50 Q140 4 204 8 Q222 52 128 50Z',
      happy: 'M124 40 Q168 0 212 36 Q168 20 124 40Z',
      sleepy: 'M124 42 Q168 36 212 32 Q170 46 124 42Z',
    };
    const eyePaths = $$('#eyes path');
    let expr = 'neutral', exprNext = null;

    /* ---------- the singularity ---------- */
    const sing = { k: 0, state: 'open' };
    let singTl = null;
    const shockEls = $$('#shock i');
    function bang() {
      shake.v = 30;
      const d = Math.hypot(innerWidth, innerHeight) * 1.25;
      shockEls.forEach((el, i) => {
        el.style.width = el.style.height = d + 'px'; el.style.margin = `${-d / 2}px 0 0 ${-d / 2}px`;
        gsap.fromTo(el, { scale: 0.005, autoAlpha: 1 }, { scale: 1, autoAlpha: 0, duration: 1.2 + i * 0.4, delay: i * 0.07, ease: 'expo.out', overwrite: true });
      });
      gsap.fromTo('#flash', { autoAlpha: 0.95 }, { autoAlpha: 0, duration: 0.8, ease: 'power2.out', overwrite: true });
    }
    function doCollapse() {
      sing.state = 'closing';
      if (singTl) singTl.kill();
      singTl = gsap.timeline({ onComplete: () => { sing.state = 'closed'; } })
        .to(sing, { k: 1, duration: 0.5, ease: 'power4.in', onComplete: bang });
    }
    function unCollapse() {
      sing.state = 'open';
      if (singTl) singTl.kill();
      gsap.to(sing, { k: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
    }

    /* ---------- the bite ---------- */
    // jaws for progress p: split open → stretch to the screen edges → chomp shut
    const snap = { k: 0, state: 'open' }, teethFade = { v: 1 };
    const prOf = (rx, ry) => Math.min(Math.max(rx, ry) * 0.3, 210) + 2;
    const mawAt = (p, W, H, b, close = snap.k) => {
      let cx, cy, rx, ry, gap;
      if (p < 0.34) {
        const k = ease(p / 0.34);
        cx = b.cx; cy = b.cy; rx = b.R * (1 + 0.1 * k); ry = b.R * 0.9; gap = b.R * 1.15 * k;
      } else if (p < 0.72) {
        const k = ease((p - 0.34) / 0.38);
        cx = lerp(b.cx, W / 2, k); cy = lerp(b.cy, H / 2, k);
        rx = lerp(b.R * 1.1, W * 0.75, k); ry = lerp(b.R * 0.9, H * 0.8, k);
        gap = lerp(b.R * 1.15, H * 0.72, k);
        // wind-up: the jaws strain wider and tremble just before they snap
        const w = ss(0.58, 0.72, p);
        gap += H * 0.07 * w + Math.sin(t * 46) * 4 * w;
      } else {
        cx = W / 2; cy = H / 2; rx = W * 0.75; ry = H * 0.8;
        gap = H * 0.79 + Math.sin(t * 46) * 4 * (1 - close);
      }
      const shut = -prOf(rx, ry) * 0.7;
      if (p >= 0.6) gap = lerp(gap, shut, clamp(close));
      return { cx, cy, rx, ry, gap, pr: prOf(rx, ry) };
    };
    const shake = { v: 0 };
    const shakeEls = [$('#gl'), $('#glf'), $('#teeth')];
    let snapTl = null;
    const impact = () => { shake.v = 34; sw.splash(innerWidth / 2, innerHeight / 2, 0.7); biteTips = lastTips.slice(); bite(); };
    // the bite plays at its own speed: a fast snap, a second chew, then the teeth sink away
    function doSnap() {
      snap.state = 'closing';
      if (snapTl) snapTl.kill();
      snapTl = gsap.timeline({ onComplete: () => { snap.state = 'closed'; } })
        .to(snap, { k: 1, duration: 0.17, ease: 'power4.in', onComplete: impact })
        .to(snap, { k: 0.8, duration: 0.13, ease: 'power2.out' })
        .to(snap, { k: 1, duration: 0.12, ease: 'power3.in', onComplete: () => { shake.v = Math.max(shake.v, 16); } })
        .to(teethFade, { v: 0, duration: 0.6, ease: 'power2.in' }, '+=0.35');
    }
    function unSnap() {
      snap.state = 'open';
      if (snapTl) snapTl.kill();
      gsap.to(snap, { k: 0, duration: 0.45, ease: 'power2.out', overwrite: true });
      gsap.to(teethFade, { v: 1, duration: 0.3, overwrite: true });
    }

    // teeth: blunt incisors in the middle, long curved canines, a few chipped; lower row offset to interlock
    const NS = 'http://www.w3.org/2000/svg';
    const teethEl = $('#teeth'), TN = 13, mid0 = (TN - 1) / 2;
    const mkRow = (gid, hid, lower) => Array.from({ length: TN }, (_, j) => {
      const tooth = document.createElementNS(NS, 'path'); tooth.setAttribute('fill', lower ? 'url(#enLo)' : 'url(#enUp)');
      const hi = document.createElementNS(NS, 'path'); hi.setAttribute('fill', 'none'); hi.setAttribute('stroke', '#fff'); hi.setAttribute('stroke-linecap', 'round'); hi.setAttribute('stroke-opacity', '.55');
      $(gid).appendChild(tooth); $(hid).appendChild(hi);
      const dist = Math.abs(j - mid0) / mid0;
      const canine = lower ? (j === 2 || j === TN - 3) : (j === 3 || j === TN - 4);
      const incisor = dist < 0.25;
      return {
        tooth, hi,
        len: canine ? 1.55 : incisor ? 0.62 + Math.random() * 0.1 : 0.72 + Math.random() * 0.3,
        blunt: incisor ? 0.42 : canine ? 0.04 : 0.14 + Math.random() * 0.1,
        width: canine ? 0.74 : incisor ? 0.9 : 0.78 + Math.random() * 0.1,
        chip: Math.random() < 0.2 ? rnd(0.15, 0.3) : 0,
        tilt: rnd(-0.08, 0.08),
      };
    });
    const rowUp = mkRow('#rowUp', '#hiUp', false), rowLo = mkRow('#rowLo', '#hiLo', true);
    const gumUp = $('#gumUp'), gumLo = $('#gumLo'), thUp = $('#throatUp'), thLo = $('#throatLo');
    let teethShown = false, lastTips = [], lastK = 0;
    const f1 = (v) => v.toFixed(1);
    function drawRow(row, lip, dir, cx, span, len0, offset, tips) {
      const tw = span / TN, left = cx - span / 2 + offset;
      let gum = `M${f1(left)} ${f1(lip - dir * 14)}`;
      row.forEach((tt, j) => {
        const w = tw * tt.width, x0 = left + j * tw + (tw - w) / 2, x1 = x0 + w, mx = (x0 + x1) / 2;
        const L = len0 * tt.len, lean = ((mx - cx) / span) * tw * 0.55 + tt.tilt * w;
        const tipX = mx - lean, tipY = lip + dir * L, half = (w * tt.blunt) / 2;
        const root = lip - dir * 10, chipY = lip + dir * L * (1 - tt.chip);
        // left flank bulges out, right flank sweeps to the tip; chipped teeth lose a corner
        let d = `M${f1(x0)} ${f1(root)}C${f1(x0 - w * 0.06)} ${f1(lip + dir * L * 0.35)} ${f1(tipX - half - w * 0.18)} ${f1(lip + dir * L * 0.8)} ${f1(tipX - half)} ${f1(tipY)}`;
        d += `L${f1(tipX + half)} ${f1(tipY)}`;
        if (tt.chip) d += `L${f1(tipX + half + w * 0.12)} ${f1(chipY)}`;
        d += `C${f1(tipX + half + w * 0.2)} ${f1(lip + dir * L * 0.7)} ${f1(x1 + w * 0.04)} ${f1(lip + dir * L * 0.32)} ${f1(x1)} ${f1(root)}Z`;
        tt.tooth.setAttribute('d', d);
        tt.hi.setAttribute('d', `M${f1(x0 + w * 0.24)} ${f1(lip + dir * 6)}Q${f1(x0 + w * 0.2)} ${f1(lip + dir * L * 0.5)} ${f1(tipX - half - w * 0.02)} ${f1(lip + dir * L * 0.86)}`);
        tt.hi.setAttribute('stroke-width', f1(Math.max(1, w * 0.06)));
        // gum dips between teeth and rises over each one
        gum += `L${f1(x0 - tw * 0.04)} ${f1(lip + dir * 6)}Q${f1(mx)} ${f1(lip - dir * 7)} ${f1(x1 + tw * 0.04)} ${f1(lip + dir * 6)}`;
        if (tips) tips.push({ x: tipX, y: tipY, s: Math.max(7, L * 0.11), canine: tt.len > 1.2 });
      });
      gum += `L${f1(left + span)} ${f1(lip - dir * 14)}Z`;
      return gum;
    }
    function drawTeeth(m, W, H, dt) {
      if (!m || m.o < 0.01) { if (teethShown) { teethEl.style.opacity = 0; teethShown = false; } return; }
      teethShown = true;
      teethEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const span = m.rx * 1.62, tw = span / TN, len0 = tw * 1.1;
      const off = m.pr * 0.42;                                   // the liquid lip bulges past the flat edge
      let lipTop = m.cy - m.gap / 2 + off, lipBot = m.cy + m.gap / 2 - off;
      lipTop = Math.min(lipTop, m.cy - len0 * 0.42); lipBot = Math.max(lipBot, m.cy + len0 * 0.42);
      const tips = [];
      gumUp.setAttribute('d', drawRow(rowUp, lipTop, 1, m.cx, span, len0, 0, tips));
      gumLo.setAttribute('d', drawRow(rowLo, lipBot, -1, m.cx, span, len0, tw / 2, tips));
      lastTips = tips;
      // the throat: shadow falling off each lip into the mouth
      const g = Math.max(0, lipBot - lipTop);
      const tx0 = m.cx - m.rx * 0.82, twd = m.rx * 1.64;
      thUp.setAttribute('x', tx0); thUp.setAttribute('width', twd); thUp.setAttribute('y', lipTop - 4); thUp.setAttribute('height', Math.max(1, g * 0.32));
      thLo.setAttribute('x', tx0); thLo.setAttribute('width', twd); thLo.setAttribute('y', lipBot - Math.max(1, g * 0.32) + 4); thLo.setAttribute('height', Math.max(1, g * 0.32));
      // motion blur while the jaws are moving fast
      const kNow = m.k == null ? snap.k : m.k;
      const vel = Math.abs(kNow - lastK) / Math.max(dt, 0.001); lastK = kNow;
      const blur = Math.min(5, vel * 0.5);
      if (!lite) teethEl.style.filter = `drop-shadow(0 6px 10px rgba(0,0,0,.55))${blur > 0.3 ? ` blur(${blur.toFixed(1)}px)` : ''}`;
      teethEl.style.opacity = m.o.toFixed(3);
    }
    const eye = { x: innerWidth / 2, y: innerHeight / 2, s: 0, o: 0 };
    const fedAt = new Map();

    gsap.ticker.add(() => {
      const dt = Math.min(gsap.ticker.deltaRatio() / 60, 0.05);
      t += dt;
      const W = innerWidth, H = innerHeight, mn = Math.min(W, H), D = desk();
      const mx = AX.mouse.x, my = AX.mouse.y;
      let occ = 0, eyeTarget = null, k, dim = 0, teeth = null, glow = 0, storyK = '', storyV = 0, isInside = false;

      // resting places for the creature
      const heroB = { cx: W * (D ? 0.53 : 0.5), cy: H * (D ? 0.52 : 0.44), R: mn * (D ? 0.25 : 0.27) };
      const pix = { cx: W * (D ? 0.76 : 0.72), cy: H * (D ? 0.52 : 0.84) };
      const originB = { cx: pix.cx, cy: pix.cy, R: mn * (D ? 0.16 : 0.12) };
      const gulpB = { cx: W / 2, cy: H / 2, R: mn * (D ? 0.24 : 0.3) };
      const contactB = { cx: W * (D ? 0.87 : 0.8), cy: H * (D ? 0.78 : 0.5), R: mn * (D ? 0.12 : 0.12) };
      // left alone for a while, it dozes off: eyes shut, slow churn
      const idle = (performance.now() - lastActive) / 1000;
      st.sleep += ((idle > 7 ? 1 : 0) - st.sleep) * (idle > 7 ? 0.02 : 0.2);
      const blobT = (o, b, amt = 1) => { F.blob(o, t, { ...b, churn: 1 - 0.75 * st.sleep }); return F.tendril(o, t, { cx: b.cx, cy: b.cy + b.R * 0.1 * st.sleep, R: b.R, tx: mx, ty: my, amt: amt * (1 - st.sleep) }); };
      const eyeOn = (b) => ({ x: b.cx, y: b.cy - b.R * 0.12, s: (b.R * 1.15) / 200 });
      // inside the creature: gut walls take most of the liquid, `shape` gets a `frac` share
      const gutP = { W, H, thick: D ? 38 : 22 };
      const inside = (o, shape, frac) => { F.gut(G, t, gutP); return shape ? sw.combine(o, G, shape, frac) : sw.mix(o, G, G, 0); };

      // serpent head: hunts a diet row (hovered, or on touch, the one in the middle), then you
      const pgi = stGulpIn.progress;
      let hx = mx, hy = my, prey = null;
      if (pgi > 0.25) { const r = gulpT.getBoundingClientRect(); hx = r.left + r.width / 2; hy = r.top + r.height / 2; }
      else {
        prey = rowHover || (!AX.fine && stDiet.progress > 0.3 ? nearest(rows, 0.55) : null);
        if (prey) { const r = prey.querySelector('.dl-t').getBoundingClientRect(); hx = r.left + Math.min(r.width * 0.55, 520); hy = r.top + r.height / 2; }
        else if (!AX.fine) { hx = W * (0.5 + 0.3 * Math.sin(t * 0.7)); hy = H * (0.5 + 0.2 * Math.sin(t * 1.1)); }
      }
      head.x += (hx - head.x) * (1 - Math.exp(-dt * 4)); head.y += (hy - head.y) * (1 - Math.exp(-dt * 4));
      const lx = trail[0] - head.x, ly = trail[1] - head.y;
      if (lx * lx + ly * ly > 64) trail.copyWithin(2, 0, (TL - 1) * 2);
      trail[0] = head.x; trail[1] = head.y;
      if (prey && Math.hypot(head.x - hx, head.y - hy) < 50) { const v = (fedAt.get(prey) || 0) + dt; fedAt.set(prey, v); if (v > 0.45) feed(prey); }

      // on touch there's no hover: the box nearest the middle of the screen is the one it circles
      const pi = stInst.progress, pwi = stWorkIn.progress;
      if (!AX.fine) {
        const nb = pi > 0.3 && pwi < 0.5 ? nearest(boxes) : null;
        if (nb !== boxHover) { boxHover = nb; boxes.forEach((x) => x.classList.toggle('is-form', x === nb)); if (nb) decode(nb.querySelector('h3'), 450); }
      }

      st.fh += ((frameHover ? 1 : 0) - st.fh) * 0.08;
      st.hv += ((boxHover ? 1 : 0) - st.hv) * 0.1;
      if (boxHover) st.lastBox = boxHover;
      const drops = () => boxes.map((b) => { const r = b.getBoundingClientRect(); return { x: r.right - (D ? 34 : 26), y: r.top + (D ? 34 : 26) }; });
      const ringFrame = (o, i) => F.ring(o, t, Object.assign(rectOf(frames[Math.max(0, i)]), { pad: D ? 30 : 14, speed: 0.35 + st.fh * 1.2, thick: (D ? 20 : 12) + st.fh * 14 }));
      // phones: the project frame closest to the middle of the screen
      const ringNear = (o) => { const f = nearest(frames) || frames[0]; return F.ring(o, t, Object.assign(rectOf(f), { pad: 12, speed: 0.4, thick: 12 })); };
      const instRest = (o) => {
        F.drops(o, t, { pts: drops(), R: D ? 24 : 18 });
        if (st.hv > 0.01 && st.lastBox) { F.ring(X, t, Object.assign(rectOf(st.lastBox), { pad: D ? 16 : 8, speed: 1.1, thick: D ? 16 : 11 })); sw.mix(o, o, X, ease(st.hv)); }
        return o;
      };

      /* ---------- the story ---------- */
      const pc = stContact.progress, pa = stAbout.progress, pw = stWork ? stWork.progress : 0;
      const pg = stGulp ? stGulp.progress : 0, pd = stDiet.progress, po = stOrigin ? stOrigin.progress : 0, ph = stHero.progress;
      let boxReveal = null;
      if (po > 0 || pd > 0 || pgi > 0 || pg > 0 || pi > 0 || pwi > 0 || pa > 0 || pc > 0) {
        if (sing.state !== 'closed') { if (singTl) singTl.kill(); sing.k = 1; sing.state = 'closed'; }
      }
      if (pi > 0 || pwi > 0 || pa > 0 || pc > 0) {
        if (!bitten) bite();
        if (snap.state !== 'closed') { if (snapTl) snapTl.kill(); snap.k = 1; snap.state = 'closed'; teethFade.v = 0; }
      }

      if (pc > 0) {                                           // 06 RELEASED: the jaws open from the inside
        F.ring(A, t, Object.assign(rectOf($('.about-photo')), { pad: D ? 22 : 12, speed: 0.5, thick: D ? 22 : 14 }));
        inside(Y, A, 0.7);
        const rx = W * 0.75, ry = H * 0.8, pr = prOf(rx, ry), q = ss(0.36, 0.66, pc);
        const m = { cx: W / 2, cy: H / 2, rx, ry, pr, gap: lerp(-pr * 0.7, H * 2.2, ease(q)), k: q };
        F.maw(B, t, m);
        if (pc < 0.3) { sw.mix(T, Y, B, ease(pc / 0.3)); occ = ss(0.02, 0.22, pc); }
        else if (pc < 0.66) sw.mix(T, B, B, 0);
        else {
          blobT(X, contactB, ss(0.85, 1, pc)); k = ease((pc - 0.66) / 0.34);
          sw.mix(T, B, X, k); occ = 1 - ss(0.66, 0.84, pc);
          if (k > 0.6) eyeTarget = { ...eyeOn(contactB), o: ss(0.6, 1, k) };
        }
        if (pc >= 0.3 && pc < 0.66) occ = 1;
        teeth = { ...m, o: ss(0.3, 0.37, pc) * (1 - ss(0.54, 0.64, pc)) };
        storyK = 'out'; storyV = ss(0.16, 0.24, pc) * (1 - ss(0.31, 0.37, pc));
        isInside = pc < 0.25;
      } else if (pa > 0) {                                    // 05 THE HOST: it wraps the photo and peers over it
        if (D) ringFrame(A, activeWork); else ringNear(A);
        inside(Y, A, 0.7);
        F.ring(B, t, Object.assign(rectOf($('.about-photo')), { pad: D ? 22 : 12, speed: 0.5, thick: D ? 22 : 14 }));
        inside(X, B, 0.7);
        sw.mix(T, Y, X, ease(pa));
        const pr = $('.ap-inner').getBoundingClientRect();
        if (pa > 0.5) eyeTarget = { x: pr.left + pr.width / 2, y: pr.top - (D ? 4 : 2), s: Math.min(pr.width * 0.55, 230) / 200, o: ss(0.55, 0.9, pa) };
        isInside = true;
      } else if (stWork && pw > 0) {                          // 04 ABSORBED: circle the project; eat it to swap
        const swaps = [1 / 3, 2 / 3];
        const next = pw < swaps[0] ? 0 : pw < swaps[1] ? 1 : 2;
        let e = 0;
        swaps.forEach((b) => { e = Math.max(e, 1 - Math.abs(pw - b) / 0.09); });
        e = ss(0, 1, e);
        if (e > 0.92 || Math.abs(next - activeWork) > 1 || activeWork < 0) setActive(next);
        titles.forEach((tt, i) => { const on = i === activeWork; tt.style.opacity = on ? 1 - e : 0; tt.style.filter = `blur(${((on ? e : 1) * 12).toFixed(1)}px)`; });
        ringFrame(A, activeWork);
        if (pw < 0.1) { F.fill(B, t, { l: -80, t: -80, w: W + 160, h: H + 160 }); sw.mix(I, B, A, ease(pw / 0.1)); occ = 1 - ss(0, 0.08, pw); }
        else { F.fill(B, t, rectOf(frames[activeWork], 8)); sw.mix(I, A, B, e); occ = ss(0, 0.45, e); }
        inside(T, I, 1 - 0.3 * ss(0, 0.1, pw));
        isInside = true;
      } else if (pwi > 0) {                                   // 04 IN: stomach acid rises and eats the grid
        instRest(I); inside(A, I, 0.42);
        if (D) {
          const level = H * (1 - ease(pwi));
          F.fill(B, t, { l: -80, t: level - 10, w: W + 160, h: H - level + 120, wave: 26 });
          sw.mix(T, A, B, ss(0, 0.3, pwi)); occ = ss(0.05, 0.35, pwi);
          if (pwi > 0.8) eyeTarget = { x: W / 2, y: H * 0.55, s: (mn * 0.42) / 200, o: ss(0.85, 1, pwi) };
        } else { ringNear(B); inside(Y, B, 0.7); sw.mix(T, A, Y, ss(0.15, 0.6, pwi)); }
        isInside = true;
      } else if (pi > 0) {                                    // 03 INSIDE: drops peel off the gut walls and burst the boxes open
        instRest(I);
        inside(T, I, 0.42 * ss(0.15, 0.7, pi));
        boxReveal = pi;
        isInside = true;
      } else if (pg > 0) {                                    // vi THE GULP: "next on the menu: you" → chomp → darkness → its gut
        const mp = clamp((pg - 0.1) / 0.48) * 0.74;
        if (mp >= 0.73 && snap.state === 'open') doSnap();
        else if (mp < 0.66 && snap.state !== 'open') unSnap();
        const m = mawAt(mp, W, H, gulpB);
        if (pg < 0.1) {
          F.serpent(A, t, { trail }); blobT(B, gulpB, 0); sw.mix(T, A, B, ease(pg / 0.1));
          eyeTarget = { ...eyeOn(gulpB), o: ss(0.03, 0.1, pg) };
        } else {
          F.maw(T, t, { ...m, strand: ss(0.05, 0.14, mp) * (1 - ss(0.3, 0.48, mp)) });
          if (mp < 0.2) { blobT(A, gulpB, 0); sw.mix(T, A, T, ss(0, 0.2, mp)); }
          occ = ss(0.08, 0.3, mp);
          teeth = { ...m, o: ss(0.04, 0.14, mp) * teethFade.v };
          if (mp < 0.42) eyeTarget = { x: m.cx, y: m.cy - m.gap / 2 - m.ry * 0.42, s: (gulpB.R * 1.15) / 200, o: 1 - ss(0.3, 0.42, mp) };
        }
        // swallowed: everything goes dark, then the walls of its gut pull back around you
        if (snap.state !== 'open') {
          const q = ss(0.8, 0.98, pg);
          if (q > 0) { inside(X); sw.mix(T, T, X, ease(q)); }
          occ = 1 - ss(0.9, 1, pg);
          storyK = 'gulp'; storyV = ss(0.62, 0.67, pg) * (1 - ss(0.86, 0.95, pg));
          isInside = q > 0.5;
        }
      } else if (pd > 0) {                                    // 02 HUNGER: the creature stretches into a serpent
        blobT(A, originB, 1); F.serpent(B, t, { trail });
        k = ease(pd); sw.mix(T, A, B, k);
        if (k < 0.5) eyeTarget = { ...eyeOn(originB), o: 1 - k * 2 };
        else eyeTarget = { x: trail[0], y: trail[1] - 4, s: 0.2, o: ss(0.7, 1, k) };
      } else if (po > 0) {                                    // 01 ORIGIN: one pixel → grid → creature
        if (po < 0.24) F.pixel(T, t, { ...pix, size: 9 + Math.sin(t * 5) * 2 });
        else if (po < 0.5) { F.pixel(A, t, pix); F.grid(B, t, { cx: pix.cx, cy: pix.cy, cell: D ? 44 : 30 }); sw.mix(T, A, B, ease((po - 0.24) / 0.26)); }
        else if (po < 0.78) { F.grid(A, t, { cx: pix.cx, cy: pix.cy, cell: D ? 44 : 30 }); F.blob(B, t, originB); sw.mix(T, A, B, ease((po - 0.5) / 0.28)); }
        else { blobT(T, originB, ss(0.85, 1, po)); eyeTarget = { ...eyeOn(originB), o: 1 }; eyeTarget.s *= ss(0.78, 0.92, po); }
      } else if (ph > 0) {                                    // 00 → SINGULARITY: it spins up, eats the hero, collapses, bang
        if (ph >= 0.56 && sing.state === 'open') doCollapse();
        else if (ph < 0.46 && sing.state !== 'open') unCollapse();
        const c = { cx: lerp(heroB.cx, W / 2, ss(0, 0.3, ph)), cy: lerp(heroB.cy, H / 2, ss(0, 0.3, ph)) };
        let vR = lerp(heroB.R, mn * (D ? 0.5 : 0.62), ss(0.02, 0.3, ph));
        vR = lerp(vR, mn * 0.18, ss(0.3, 0.56, ph)) * (1 - sing.k * 0.97);
        spinA += dt * (0.6 + 5 * ss(0, 0.56, ph) + 10 * sing.k);
        F.vortex(B, t, { cx: c.cx, cy: c.cy, R: vR, spin: spinA, flow: 0.1 + 0.45 * ss(0.05, 0.5, ph) + sing.k, tilt: lerp(0.55, 1, ss(0.3, 0.56, ph)) });
        if (ph < 0.16) { blobT(A, heroB, 1 - ph / 0.16); sw.mix(T, A, B, ease(ph / 0.16)); } else sw.mix(T, B, B, 0);
        if (sing.k > 0) {
          const pm = ss(0.66, 0.96, ph);
          F.pixel(X, t, { cx: lerp(W / 2, pix.cx, pm), cy: lerp(H / 2, pix.cy, pm), size: 9 });
          sw.mix(T, T, X, sing.k);
        }
        // before the bang the disc swallows the letters; after it, the lone pixel floats above the void
        occ = Math.max(ss(0.12, 0.34, ph) * (1 - sing.k), sing.k * (1 - ss(0.8, 1, ph)));
        glow = ss(0.04, 0.4, ph) * (1 - sing.k);
        dim = ss(0.1, 0.5, ph) * 0.4 * (1 - sing.k) + sing.k * (1 - ss(0.74, 0.98, ph));
        eyeTarget = { x: c.cx, y: c.cy - vR * 0.04, s: Math.max(0.02, (vR * 0.95) / 200), o: introState.v * (1 - ss(0.3, 0.5, ph)) };
        applySuck(ph, sing.k, c.cx, c.cy);
      } else {                                                // 00 HERO: the creature
        blobT(T, heroB, introState.v);
        eyeTarget = { ...eyeOn(heroB), o: introState.v };
      }
      if (ph <= 0 || po > 0) applySuck(0);

      // inside it, the walls reach for whatever you point at
      const hv = AX.hoverEl;
      const reachOn = isInside && AX.fine && hv && hv.closest('main') && !hv.closest('.wf');
      if (reachOn) st.reachEl = hv;
      st.reach += ((reachOn ? 1 : 0) - st.reach) * 0.08;
      if (st.reach > 0.02 && st.reachEl && isInside) {
        const r = st.reachEl.getBoundingClientRect(), ex = r.left + r.width / 2, ey = r.top + r.height / 2;
        const dl = ex, dr = W - ex, dtp = ey, db = H - ey, dm = Math.min(dl, dr, dtp, db);
        const sx = dm === dl ? 0 : dm === dr ? W : ex, sy = dm === dtp ? 0 : dm === db ? H : ey;
        const cnt = 48, th = gutP.thick;
        for (let j = 0; j < cnt; j++) {
          const i = sw.N - 1 - j, f = (j + 1) / cnt, ff = f * 0.88 * ease(st.reach);
          const sway = Math.sin(t * 3 + f * 6) * 10 * f, ux = (ex - sx), uy = (ey - sy), ul = Math.hypot(ux, uy) || 1;
          T.x[i] = sx + ux * ff - (uy / ul) * sway; T.y[i] = sy + uy * ff + (ux / ul) * sway;
          T.r[i] = th * 0.75 * (1 - f * 0.6) + 4;
        }
      }

      // boxes burst open from the drop that lands on each one
      if (boxReveal !== null || pwi > 0 || pw > 0 || pa > 0 || pc > 0) {
        const p = boxReveal === null ? 1 : boxReveal;
        boxes.forEach((b, i) => {
          let rv;
          if (D) rv = clamp((p - 0.8 - i * 0.02) / 0.14);
          else { const r = b.getBoundingClientRect(); rv = boxReveal === null ? 1 : clamp((H * 0.92 - r.top) / (H * 0.4)); }
          setS(b, 'clipPath', rv >= 1 ? '' : `circle(${(rv * 170).toFixed(1)}% at calc(100% - ${D ? 34 : 26}px) ${D ? 34 : 26}px)`);
        });
      } else boxes.forEach((b) => setS(b, 'clipPath', `circle(0% at calc(100% - ${D ? 34 : 26}px) ${D ? 34 : 26}px)`));

      // hold anywhere: it rushes your cursor and bristles
      if (st.rage > 0.001) { F.spikes(X, t, { cx: mx, cy: my, R: D ? 120 : 90 }); sw.mix(T, T, X, st.rage); }

      // click: the liquid gathers where you clicked as its next form, face and all
      if (shape.k > 0.001) {
        const R = D ? 130 : 95;
        shapeAt(Y, R); sw.mix(T, T, Y, shape.k * 0.9);
        if (shape.k > 0.4) eyeTarget = { x: shape.x, y: shape.y - (SHAPES[shape.i] === 'grid' ? R * 0.2 : R * 0.12), s: (R * 1.15) / 200, o: ss(0.4, 0.8, shape.k) };
      }

      // the intro grows it out of nothing
      if (introState.v < 1 && ph === 0) for (let i = 0; i < sw.N; i++) T.r[i] *= 0.2 + 0.8 * introState.v;

      if (first) { sw.snap(T); first = false; }
      sw.step(dt, T, { k: 30, mx, my, repel: AX.fine && st.rage < 0.1 ? 1 : 0 });

      // mood colour follows the section in view
      let id = 'top';
      const scrY = scrollY;
      moodIds.forEach((el, i) => { if (moodTops[i] - scrY <= H / 2) id = el.id; });
      mTarget.set(MOODS[id]); mood.lerp(mTarget, 1 - Math.exp(-dt * 3));
      const hex = '#' + mood.getHexString();
      if (hex !== lastMood && t - lastMoodT > (lite ? 0.3 : 0.12)) { html.style.setProperty('--mood', hex); lastMood = hex; lastMoodT = t; }

      shake.v *= Math.exp(-dt * 7);
      const sx = (Math.random() - 0.5) * shake.v, sy = (Math.random() - 0.5) * shake.v;
      shakeEls.forEach((el) => setS(el, 'translate', shake.v > 0.3 ? `${sx.toFixed(1)}px ${sy.toFixed(1)}px` : ''));
      // DOM writes are batched at the end of the frame, after every position read
      setS(gulpA, 'opacity', snap.state !== 'open' && pg > 0.55 ? '0' : '1');
      drawTeeth(teeth, W, H, dt);
      sw.render(occ, mood, dt);
      setS(dimEl, 'opacity', (dim * 0.82).toFixed(3));
      story(storyK, storyV);
      const status = id === 'top' ? (ph > 0.3 ? 'Collapsing' : st.sleep > 0.5 ? 'Dormant' : 'Observing') : id === 'origin' ? 'Evolving' : id === 'diet' ? 'Feeding'
        : id === 'gulp' ? (snap.state === 'open' ? 'Hunting' : 'Breach') : id === 'contact' ? (pc > 0.6 ? 'Released' : 'Digesting') : 'Digesting';
      setText(statusEl, status);
      setText(formEl, po < 0.24 ? 'Pixel' : po < 0.5 ? 'Grid' : 'Organism');
      setText(cellsEl, po < 0.24 ? '1' : po < 0.5 ? '36' : String(sw.N));

      // eyes
      const et = eyeTarget || { x: eye.x, y: eye.y, s: eye.s, o: 0 };
      const ek = 1 - Math.exp(-dt * 9);
      eye.x += (et.x - eye.x) * ek; eye.y += (et.y - eye.y) * ek; eye.s += (et.s - eye.s) * ek; eye.o += (et.o * (1 - st.rage) - eye.o) * ek;
      // which face: angry when held or about to bite, startled by a click or a hard scroll,
      // pleased by something you point at, sleepy when left alone
      const sinceClick = performance.now() - shape.at;
      const want = st.rage > 0.3 || (pg > 0.1 && snap.state === 'open') ? 'angry'
        : sinceClick < 1300 || Math.abs(AX.velocity()) > 45 ? 'surprised'
        : st.sleep > 0.5 ? 'sleepy'
        : AX.fine && AX.hoverEl ? 'happy' : 'neutral';
      if (want !== expr && !exprNext) { exprNext = want; if (blink > 0) blink = 0; }
      blink -= dt; if (blink < -0.16) blink = 2.5 + Math.random() * 4;
      if (exprNext && blink < -0.07) { eyePaths.forEach((p) => p.setAttribute('d', EXPR[exprNext])); expr = exprNext; exprNext = null; }
      const open = Math.max(0.05, (blink < 0 ? Math.max(0.06, Math.abs(blink / 0.08 - 1)) : 1) * (1 - 0.94 * st.sleep));
      const look = clamp((mx - eye.x) / W, -0.5, 0.5) * eye.s * 60, lookY = clamp((my - eye.y) / H, -0.5, 0.5) * eye.s * 30;
      setS(eyesEl, 'opacity', eye.o.toFixed(2));
      eyesEl.style.transform = `translate(${(eye.x - 100 + look).toFixed(1)}px, ${(eye.y - 27 + lookY).toFixed(1)}px) scale(${eye.s.toFixed(3)}, ${(eye.s * open).toFixed(3)})`;

      // coloured backlight behind the eyes; the vortex glows like an accretion disc
      const R = eye.s * 200 * 1.4 + 120 + glow * mn * 0.7, hk = Math.max(eye.o, 0.25) * (1 + glow * 1.4);
      // a fixed 1000px glow, moved and scaled on the compositor: no full-screen repaint per frame
      halo.style.transform = `translate3d(${(eye.x - 500).toFixed(0)}px, ${(eye.y - 500).toFixed(0)}px, 0) scale(${(R / 500).toFixed(3)})`;
      setS(halo, 'opacity', Math.min(1, hk * 0.9).toFixed(2));
    });
  }

  init().catch((err) => {
    console.warn('Liquid disabled:', err);
    $('#gl').style.display = 'none'; $('#glf').style.display = 'none';
    boxes.forEach((b) => { b.style.clipPath = ''; });
  });
})();
