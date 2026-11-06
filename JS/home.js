/* ==========================================================================
   Home — the liquid tells a story as you scroll:
   hero blob → swallows the screen → drains to a single pixel → pixel grid →
   creature opens its eyes → serpent follows you → spells "Instinct" →
   splits into six drops that burst the boxes open → floods and eats the grid →
   circles each project and eats it to swap → circles the photo →
   spells "Hello." → back to the creature.
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

  if (!location.hash) { history.scrollRestoration = 'manual'; scrollTo(0, 0); }

  /* ---------- decode: text scrambles through glyphs, then resolves ---------- */
  const GLY = '▓▒░█#%&@$*+=<>/\\';
  function decode(el, dur = 900, delay = 0) {
    if (reduce || !el) return;
    const final = el.dataset.final || (el.dataset.final = el.textContent);
    const t0 = performance.now() + delay;
    const tick = () => {
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
  let bitten = false;
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
    heroName.style.clipPath = `path(evenodd, '${d}Z')`;
    heroName.classList.add('has-bite');
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
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
  // everything after the bite looks chewed: knocked askew, some words missing a bite
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
    const pin = $('.origin-pin');
    if (!pin || !tips || !tips.length) return;
    pin.style.position = 'relative';
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
  function bite(fx) {
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
  if (!reduce) {
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

  /* ---------- intro ---------- */
  const introState = { v: reduce ? 1 : 0 };
  function intro() {
    if (AX.lenis) AX.lenis.start();
    gsap.timeline()
      .to(introState, { v: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .to('.ch', { yPercent: 0, duration: 1.6, stagger: { each: 0.07, from: 'random' }, ease: 'expo.out' }, 0.25)
      .fromTo('.hero-cap', { opacity: 0, y: 24, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6 }, 0.9)
      .fromTo('.hero-top > *, .hero-foot > *, .nav > *', { opacity: 0 }, { keyframes: { opacity: [0, 1, 0.15, 1, 0.4, 1] }, duration: 0.6, ease: 'none', stagger: 0.06 }, 0.6);
  }
  if (reduce) {
    $('.preloader').style.display = 'none';
    gsap.set('.hero-cap', { opacity: 1 });
  } else if (html.classList.contains('seen')) {
    gsap.delayedCall(0.35, intro);
  } else {
    if (AX.lenis) AX.lenis.stop();
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

  /* ---------- origin: pinned; words surface while the liquid evolves ---------- */
  const words = AX.split($('.origin-text'));
  let stOrigin = null;
  if (!reduce) {
    gsap.set(words, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.origin-pin', start: 'top top', end: '+=230%', pin: true, scrub: true } });
    tl.to({}, { duration: 0.14 }).to(words, { opacity: 1, stagger: 0.05, duration: 0.01, ease: 'steps(1)' }).to({}, { duration: 0.12 });
    stOrigin = tl.scrollTrigger;
  }

  /* ---------- diet: rows flicker on like failing lights ---------- */
  if (!reduce) {
    $$('.diet-list li').forEach((li, i) => {
      gsap.fromTo(li, { opacity: 0 }, {
        keyframes: { opacity: [0, 1, 0.1, 0.8, 0, 1] }, duration: 0.7, ease: 'none', delay: i * 0.09 + Math.random() * 0.15,
        scrollTrigger: { trigger: '.diet-list', start: 'top 82%' },
      });
    });
    gsap.from('.diet-out', { opacity: 0, filter: 'blur(14px)', scale: 1.06, duration: 1.6, scrollTrigger: { trigger: '.diet-out', start: 'top 92%' } });
  }
  let rowHover = null;
  $$('.diet-list li').forEach((li) => {
    li.addEventListener('pointerenter', () => { rowHover = li; });
    li.addEventListener('pointerleave', () => { if (rowHover === li) rowHover = null; });
  });

  /* ---------- instincts: hover → the liquid circles that box ---------- */
  const boxes = $$('.inst');
  let boxHover = null;
  boxes.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
    el.addEventListener('pointerenter', () => { boxHover = el; boxes.forEach((x) => x.classList.toggle('is-form', x === el)); decode(el.querySelector('h3'), 450); });
    el.addEventListener('pointerleave', () => { if (boxHover === el) { boxHover = null; el.classList.remove('is-form'); } });
  });

  /* ---------- work: pinned on desktop; the liquid eats a project to swap it ---------- */
  const titles = $$('.wt'), frames = $$('.wf');
  const wIdx = $('#wIdx'), wBar = $('#wBar');
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

  /* ---------- about: the photo pixelates into focus ---------- */
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
      if (ir > cr) { sw = sh * cr; sx = (photo.naturalWidth - sw) / 2; } else { sh = sw / cr; sy = (photo.naturalHeight - sh) * 0.62; }
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

  /* ---------- contact: words flicker on like a neon sign ---------- */
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
  const stInst = ScrollTrigger.create({ trigger: '#instincts', start: 'top bottom', end: 'top -12%' });
  const stWorkIn = ScrollTrigger.create({ trigger: '#work', start: 'top bottom', end: 'top top' });
  const stAbout = ScrollTrigger.create({ trigger: '#about', start: 'top bottom', end: 'top 25%' });
  const stContact = ScrollTrigger.create({ trigger: '#contact', start: 'top bottom', end: 'top 5%' });
  AX.refresh();

  const MOODS = { top: '#ff3b1f', origin: '#3d6bff', diet: '#00d68f', instincts: '#ffb000', work: '#a46bff', about: '#ff2d87', contact: '#ff3b1f' };
  const moodIds = Object.keys(MOODS).map((id) => document.getElementById(id));
  const eyesEl = $('#eyes'), halo = $('#halo'), dimEl = $('#dim');
  const desk = () => innerWidth > 900;
  const rectOf = (el, padPx = 0) => { const r = el.getBoundingClientRect(); return { l: r.left - padPx, t: r.top - padPx, w: r.width + padPx * 2, h: r.height + padPx * 2 }; };

  async function init() {
    if (document.fonts) await document.fonts.load('900 120px "Big Shoulders"').catch(() => {});
    const N = innerWidth < 760 ? 560 : 950;
    const sw = await AX.swarm({ back: $('#gl'), front: $('#glf'), n: N });
    const { F } = sw;
    const A = sw.buf(), B = sw.buf(), T = sw.buf(), X = sw.buf();
    const THREE = sw.THREE;
    const mood = new THREE.Color(MOODS.top), mTarget = new THREE.Color();
    let lastMood = '';

    // the serpent's body is the head's recent path
    const TL = 64, trail = new Float32Array(TL * 2);
    const head = { x: innerWidth * 0.7, y: innerHeight * 0.5 };
    for (let i = 0; i < TL; i++) { trail[i * 2] = head.x - i * 9; trail[i * 2 + 1] = head.y; }

    // interaction: click = splash, hold = it rushes your cursor and bristles
    const st = { hv: 0, fh: 0, rage: 0, lastBox: null };
    let downAt = 0, holdTl = null;
    const release = () => {
      if (holdTl) { holdTl.kill(); holdTl = null; }
      gsap.killTweensOf(st, 'rage');
      gsap.to(st, { rage: 0, duration: 0.9, ease: 'power2.out' });
    };
    addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('a, button, input')) return;
      downAt = performance.now();
      release();
      // a held press makes it lunge and bristle, but it always pulls itself back together
      holdTl = gsap.timeline()
        .to(st, { rage: 1, duration: 0.6, ease: 'power3.out' }, 0.25)
        .to(st, { rage: 0, duration: 1.1, ease: 'power2.inOut' }, 2.2);
    });
    addEventListener('pointerup', (e) => {
      if (!downAt) return;
      const held = performance.now() - downAt; downAt = 0;
      release();
      if (held < 250) sw.splash(e.clientX, e.clientY, 1);
    });
    addEventListener('pointercancel', () => { downAt = 0; release(); });
    addEventListener('blur', () => { downAt = 0; release(); });

    let t = 0, blink = 3, first = true, lastPh = 0;

    /* ---------- the bite ---------- */
    // jaws for hero progress p: split open → stretch to the screen edges → chomp shut
    const snap = { k: 0, state: 'open' }, teethFade = { v: 1 };
    const mawAt = (p, W, H, b, close = snap.k) => {
      const prOf = (rx, ry) => Math.min(Math.max(rx, ry) * 0.3, 210) + 2;
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
    const impact = () => { shake.v = 34; sw.splash(innerWidth / 2, innerHeight / 2, 0.7); biteTips = lastTips.slice(); bite(true); };
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
      const vel = Math.abs(snap.k - lastK) / Math.max(dt, 0.001); lastK = snap.k;
      const blur = Math.min(5, vel * 0.5);
      teethEl.style.filter = `drop-shadow(0 6px 10px rgba(0,0,0,.55))${blur > 0.3 ? ` blur(${blur.toFixed(1)}px)` : ''}`;
      teethEl.style.opacity = m.o.toFixed(3);
    }
    const eye = { x: innerWidth / 2, y: innerHeight / 2, s: 0, o: 0 };

    gsap.ticker.add(() => {
      const dt = Math.min(gsap.ticker.deltaRatio() / 60, 0.05);
      t += dt;
      const W = innerWidth, H = innerHeight, mn = Math.min(W, H), D = desk();
      const mx = AX.mouse.x, my = AX.mouse.y;
      let occ = 0, eyeTarget = null, k, dim = 0, teeth = null;

      // resting places for the creature
      const heroB = { cx: W * (D ? 0.53 : 0.5), cy: H * (D ? 0.52 : 0.47), R: mn * (D ? 0.25 : 0.3) };
      const coverB = { cx: W / 2, cy: H / 2, R: Math.hypot(W, H) * 0.78 };
      const pix = { cx: W * (D ? 0.76 : 0.72), cy: H * (D ? 0.52 : 0.84) };
      const originB = { cx: pix.cx, cy: pix.cy, R: mn * (D ? 0.16 : 0.12) };
      const contactB = { cx: W * (D ? 0.77 : 0.74), cy: H * (D ? 0.46 : 0.2), R: mn * (D ? 0.17 : 0.14) };
      const blobT = (o, b, amt = 1) => { F.blob(o, t, b); return F.tendril(o, t, { cx: b.cx, cy: b.cy, R: b.R, tx: mx, ty: my, amt }); };
      const eyeOn = (b) => ({ x: b.cx, y: b.cy - b.R * 0.12, s: (b.R * 1.15) / 200 });

      // serpent head: chases a hovered diet row, otherwise the cursor
      let hx = mx, hy = my;
      if (rowHover) { const r = rowHover.getBoundingClientRect(); hx = r.left + Math.min(r.width * 0.55, 520); hy = r.top + r.height / 2; }
      head.x += (hx - head.x) * (1 - Math.exp(-dt * 4)); head.y += (hy - head.y) * (1 - Math.exp(-dt * 4));
      const lx = trail[0] - head.x, ly = trail[1] - head.y;
      if (lx * lx + ly * ly > 64) trail.copyWithin(2, 0, (TL - 1) * 2);
      trail[0] = head.x; trail[1] = head.y;

      st.fh += ((frameHover ? 1 : 0) - st.fh) * 0.08;
      st.hv += ((boxHover ? 1 : 0) - st.hv) * 0.1;
      if (boxHover) st.lastBox = boxHover;
      const drops = () => boxes.map((b) => { const r = b.getBoundingClientRect(); return { x: r.right - 34, y: r.top + 34 }; });
      const ringFrame = (o, i) => F.ring(o, t, Object.assign(rectOf(frames[Math.max(0, i)]), { pad: 30, speed: 0.35 + st.fh * 1.2, thick: 20 + st.fh * 14 }));
      const instRest = (o) => {
        F.drops(o, t, { pts: drops(), R: 24 });
        if (st.hv > 0.01 && st.lastBox) { F.ring(X, t, Object.assign(rectOf(st.lastBox), { pad: 16, speed: 1.1, thick: 16 })); sw.mix(o, o, X, ease(st.hv)); }
        return o;
      };

      /* ---------- the story ---------- */
      const pc = stContact.progress, pa = stAbout.progress, pwi = stWorkIn.progress, pw = stWork ? stWork.progress : 0;
      const pi = stInst.progress, pd = stDiet.progress, po = stOrigin ? stOrigin.progress : 0, ph = stHero.progress;
      let boxReveal = null;
      if (po > 0 || pd > 0 || pi > 0 || pwi > 0 || pa > 0 || pc > 0) {
        if (!bitten) bite(false);
        if (snap.state !== 'closed') { if (snapTl) snapTl.kill(); snap.k = 1; snap.state = 'closed'; teethFade.v = 0; }
      }

      if (pc > 0) {                                           // CONTACT: photo ring → "Hello." → creature
        const wordP = { text: 'HELLO.', cx: W / 2, cy: H * 0.5, width: D ? 0.62 : 0.86 };
        if (pc < 0.45) { F.ring(A, t, Object.assign(rectOf($('.about-photo')), { pad: 22, speed: 0.5 })); F.word(B, t, wordP); sw.mix(T, A, B, ease(pc / 0.45)); occ = ss(0.15, 0.42, pc); }
        else if (pc < 0.55) { F.word(T, t, wordP); occ = 1; }
        else {
          F.word(A, t, wordP); blobT(B, contactB, ss(0.8, 1, pc)); k = ease((pc - 0.55) / 0.45);
          sw.mix(T, A, B, k); occ = 1 - ss(0.55, 0.78, pc);
          if (k > 0.6) eyeTarget = { ...eyeOn(contactB), o: ss(0.6, 1, k) };
        }
        dim = pc < 0.55 ? ss(0.1, 0.4, pc) : 1 - ss(0.55, 0.75, pc);
      } else if (pa > 0) {                                    // ABOUT: circle the photo
        if (D) ringFrame(A, activeWork); else F.blob(A, t, { cx: W * 0.82, cy: H * 0.86, R: mn * 0.09 });
        F.ring(B, t, Object.assign(rectOf($('.about-photo')), { pad: 22, speed: 0.5 }));
        sw.mix(T, A, B, ease(pa));
      } else if (stWork && pw > 0) {                          // WORK: circle the project; eat it to swap
        const swaps = [1 / 3, 2 / 3];
        const next = pw < swaps[0] ? 0 : pw < swaps[1] ? 1 : 2;
        let e = 0;
        swaps.forEach((b) => { e = Math.max(e, 1 - Math.abs(pw - b) / 0.09); });
        e = ss(0, 1, e);
        if (e > 0.92 || Math.abs(next - activeWork) > 1 || activeWork < 0) setActive(next);
        titles.forEach((tt, i) => { const on = i === activeWork; tt.style.opacity = on ? 1 - e : 0; tt.style.filter = `blur(${((on ? e : 1) * 12).toFixed(1)}px)`; });
        ringFrame(A, activeWork);
        if (pw < 0.1) { F.fill(B, t, { l: -80, t: -80, w: W + 160, h: H + 160 }); sw.mix(T, B, A, ease(pw / 0.1)); occ = 1 - ss(0, 0.08, pw); }
        else { F.fill(B, t, rectOf(frames[activeWork], 8)); sw.mix(T, A, B, e); occ = ss(0, 0.45, e); }
      } else if (pwi > 0) {                                   // WORK IN: a flood rises and eats the grid
        instRest(A);
        if (D) {
          const level = H * (1 - ease(pwi));
          F.fill(B, t, { l: -80, t: level - 10, w: W + 160, h: H - level + 120, wave: 26 });
          sw.mix(T, A, B, ss(0, 0.3, pwi)); occ = ss(0.05, 0.35, pwi);
          if (pwi > 0.8) eyeTarget = { x: W / 2, y: H * 0.55, s: (mn * 0.42) / 200, o: ss(0.85, 1, pwi) };
        } else { F.blob(B, t, { cx: W * 0.82, cy: H * 0.86, R: mn * 0.09 }); sw.mix(T, A, B, ease(pwi)); }
      } else if (pi > 0) {                                    // INSTINCTS: "Instinct" → six drops burst the boxes open
        const wordP = { text: 'INSTINCT', cx: W / 2, cy: H * 0.5, width: D ? 0.72 : 0.9 };
        if (pi < 0.42) { F.serpent(A, t, { trail }); F.word(B, t, wordP); sw.mix(T, A, B, ease(pi / 0.42)); occ = ss(0.22, 0.42, pi); }
        else if (pi < 0.55) { F.word(T, t, wordP); occ = 1; }
        else { F.word(A, t, wordP); instRest(B); sw.mix(T, A, B, ease(clamp((pi - 0.55) / 0.3))); occ = 1 - ss(0.55, 0.68, pi); }
        boxReveal = pi;
        dim = pi < 0.55 ? ss(0.15, 0.4, pi) : 1 - ss(0.55, 0.7, pi);
      } else if (pd > 0) {                                    // DIET: the creature stretches into a serpent
        blobT(A, originB, 1); F.serpent(B, t, { trail });
        k = ease(pd); sw.mix(T, A, B, k);
        if (k < 0.5) eyeTarget = { ...eyeOn(originB), o: 1 - k * 2 };
        else eyeTarget = { x: trail[0], y: trail[1] - 4, s: 0.2, o: ss(0.7, 1, k) };
      } else if (po > 0) {                                    // ORIGIN: drain to one pixel → grid → creature
        if (po < 0.14) {
          const m = mawAt(1, W, H, heroB, 1); F.maw(A, t, m); F.pixel(B, t, pix); k = ease(po / 0.14); sw.mix(T, A, B, k); occ = 1 - ss(0, 0.1, po);
          eyeTarget = { x: lerp(W / 2, pix.cx, k), y: lerp(H * 0.45, pix.cy, k), s: lerp(mn * 0.42, 4, k) / 200, o: 1 - ss(0.4, 1, k) };
        } else if (po < 0.24) F.pixel(T, t, pix);
        else if (po < 0.5) { F.pixel(A, t, pix); F.grid(B, t, { cx: pix.cx, cy: pix.cy, cell: D ? 44 : 30 }); sw.mix(T, A, B, ease((po - 0.24) / 0.26)); }
        else if (po < 0.78) { F.grid(A, t, { cx: pix.cx, cy: pix.cy, cell: D ? 44 : 30 }); F.blob(B, t, originB); sw.mix(T, A, B, ease((po - 0.5) / 0.28)); }
        else { blobT(T, originB, ss(0.85, 1, po)); eyeTarget = { ...eyeOn(originB), o: 1 }; eyeTarget.s *= ss(0.78, 0.92, po); }
      } else if (ph > 0) {                                    // HERO → it opens its jaws and bites the page
        if (ph >= 0.73 && snap.state === 'open') doSnap();
        else if (ph < 0.66 && snap.state !== 'open') unSnap();
        const m = mawAt(ph, W, H, heroB);
        F.maw(T, t, { ...m, strand: ss(0.05, 0.14, ph) * (1 - ss(0.3, 0.48, ph)) });
        if (ph < 0.2) { blobT(A, heroB, 1 - ph * 5); sw.mix(T, A, T, ss(0, 0.2, ph)); }
        occ = ss(0.08, 0.3, ph);
        teeth = { ...m, o: ss(0.04, 0.14, ph) * teethFade.v };
        if (ph < 0.42) eyeTarget = { x: m.cx, y: m.cy - m.gap / 2 - m.ry * 0.42, s: (heroB.R * 1.15) / 200, o: 1 - ss(0.3, 0.42, ph) };
        else eyeTarget = { x: W / 2, y: H * 0.42, s: (mn * 0.42) / 200, o: snap.state === 'closed' ? 1 - teethFade.v : 0 };
      } else {                                                // HERO: the creature
        blobT(T, heroB, introState.v);
        eyeTarget = { ...eyeOn(heroB), o: introState.v };
      }

      // boxes burst open from the drop that lands on each one
      if (boxReveal !== null || pwi > 0 || pw > 0 || pa > 0 || pc > 0) {
        const p = boxReveal === null ? 1 : boxReveal;
        boxes.forEach((b, i) => {
          const rv = clamp((p - 0.8 - i * 0.02) / 0.14);
          b.style.clipPath = rv >= 1 ? '' : `circle(${(rv * 170).toFixed(1)}% at calc(100% - 34px) 34px)`;
        });
      } else boxes.forEach((b) => { b.style.clipPath = 'circle(0% at calc(100% - 34px) 34px)'; });

      // hold anywhere: it rushes your cursor and bristles
      if (st.rage > 0.001) { F.spikes(X, t, { cx: mx, cy: my, R: D ? 120 : 90 }); sw.mix(T, T, X, st.rage); }

      // the intro grows it out of nothing
      if (introState.v < 1 && ph === 0) for (let i = 0; i < sw.N; i++) T.r[i] *= 0.2 + 0.8 * introState.v;

      if (first) { sw.snap(T); first = false; }
      sw.step(dt, T, { k: 30, mx, my, repel: AX.fine && st.rage < 0.1 ? 1 : 0 });

      // mood colour follows the section in view
      let id = 'top';
      moodIds.forEach((el) => { if (el.getBoundingClientRect().top <= H / 2) id = el.id; });
      mTarget.set(MOODS[id]); mood.lerp(mTarget, 1 - Math.exp(-dt * 3));
      const hex = '#' + mood.getHexString();
      if (hex !== lastMood) { html.style.setProperty('--mood', hex); lastMood = hex; }

      lastPh = ph;
      shake.v *= Math.exp(-dt * 7);
      const sx = (Math.random() - 0.5) * shake.v, sy = (Math.random() - 0.5) * shake.v;
      shakeEls.forEach((el) => { el.style.translate = shake.v > 0.3 ? `${sx.toFixed(1)}px ${sy.toFixed(1)}px` : ''; });
      drawTeeth(teeth, W, H, dt);
      sw.render(occ, mood, dt);
      dimEl.style.opacity = (dim * 0.82).toFixed(3);

      // eyes
      const et = eyeTarget || { x: eye.x, y: eye.y, s: eye.s, o: 0 };
      const ek = 1 - Math.exp(-dt * 9);
      eye.x += (et.x - eye.x) * ek; eye.y += (et.y - eye.y) * ek; eye.s += (et.s - eye.s) * ek; eye.o += (et.o * (1 - st.rage) - eye.o) * ek;
      blink -= dt; if (blink < -0.16) blink = 2.5 + Math.random() * 4;
      const open = blink < 0 ? Math.max(0.06, Math.abs(blink / 0.08 - 1)) : 1;
      const look = clamp((mx - eye.x) / W, -0.5, 0.5) * eye.s * 60, lookY = clamp((my - eye.y) / H, -0.5, 0.5) * eye.s * 30;
      eyesEl.style.opacity = eye.o.toFixed(3);
      eyesEl.style.transform = `translate(${(eye.x - 100 + look).toFixed(1)}px, ${(eye.y - 27 + lookY).toFixed(1)}px) scale(${eye.s.toFixed(3)}, ${(eye.s * open).toFixed(3)})`;

      // coloured backlight behind the eyes
      const R = eye.s * 200 * 1.4 + 120, hk = Math.max(eye.o, 0.25);
      const r8 = (mood.r * 255) | 0, g8 = (mood.g * 255) | 0, b8 = (mood.b * 255) | 0;
      halo.style.background = `radial-gradient(circle at ${eye.x.toFixed(0)}px ${eye.y.toFixed(0)}px, rgba(${r8},${g8},${b8},${(0.42 * hk).toFixed(3)}) 0, rgba(${r8},${g8},${b8},${(0.12 * hk).toFixed(3)}) ${(R * 0.5).toFixed(0)}px, transparent ${R.toFixed(0)}px)`;
    });
  }

  init().catch((err) => {
    console.warn('Liquid disabled:', err);
    $('#gl').style.display = 'none'; $('#glf').style.display = 'none';
    boxes.forEach((b) => { b.style.clipPath = ''; });
  });
})();
