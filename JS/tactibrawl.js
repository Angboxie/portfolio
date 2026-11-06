/* Tactibrawl — CRT hero, scroll score, swinging gallery, isometric placement demo, quest log */
(() => {
  const { gsap, ScrollTrigger, AX } = window;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  const pad = (n, l = 2) => String(n).padStart(l, '0');

  /* ---------- hero: parallax background, glitch title, intro ---------- */
  const bg = $('.hero-bg');
  if (!AX.reduce) {
    gsap.ticker.add(() => gsap.set(bg, { x: -AX.mouse.nx * 24, y: AX.mouse.ny * 16 }));
    gsap.fromTo(bg, { scale: 1.25, filter: 'brightness(0) contrast(2)' }, { scale: 1, filter: 'brightness(1) contrast(1)', duration: 2.2, ease: 'steps(12)', delay: 0.3 });
    gsap.to('.hero-bg img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('#title', { opacity: 0, scale: 1.6, duration: 0.9, ease: 'steps(6)', delay: 0.5 });
    gsap.from('.hud', { y: -30, opacity: 0, duration: 0.8, ease: 'steps(5)', delay: 0.9 });
  }
  const title = $('#title');
  const glitch = () => {
    title.classList.add('on');
    setTimeout(() => title.classList.remove('on'), 90 + Math.random() * 120);
  };
  if (!AX.reduce) {
    (function loop() { setTimeout(() => { glitch(); setTimeout(glitch, 140); loop(); }, 1800 + Math.random() * 2600); })();
    title.addEventListener('pointerenter', glitch);
  }
  addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && scrollY < innerHeight * 0.5 && document.activeElement === document.body) AX.scrollTo('#overview');
  });

  /* ---------- a pixel symbiote lurking in the forest ---------- */
  if (AX.liquid) {
    let heroVis = true;
    new IntersectionObserver((e) => { heroVis = e[0].isIntersecting; }).observe($('.hero'));
    AX.liquid({
      canvas: $('#tbSym'), pixel: 0.3, eyes: true, rim: '#c89b18', scale: 1.9, spread: 0.22,
      count: 8, tendrils: 2, visible: () => heroVis,
    }).then((sym) => {
      $('.hero').addEventListener('pointerdown', () => sym.pulse(1));
      if (!AX.reduce) gsap.from(sym.group.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.6, ease: 'elastic.out(1, .5)', delay: 1 });
    }).catch((e) => console.warn('pixel symbiote disabled:', e));
  }

  /* ---------- score climbs as you scroll; stage follows the section ---------- */
  const score = $('#score'), stage = $('#stage');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { score.textContent = pad(Math.round(s.progress * 999999), 6); } });
  ['#overview', '#screens', '#arena', '#roster', '#outcomes'].forEach((id, i) => {
    ScrollTrigger.create({ trigger: id, start: 'top 50%', onEnter: () => { stage.textContent = '1-' + (i + 2); }, onLeaveBack: () => { stage.textContent = '1-' + (i + 1); } });
  });

  /* ---------- screens: pinned horizontal gallery ---------- */
  const track = $('.gal-track');
  const shots = $$('.shot');
  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    let active = false;
    const idx = $('#galIdx');
    const tw = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.gal-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true,
        onToggle: (s) => { active = s.isActive; },
        onUpdate: (s) => { idx.textContent = pad(Math.min(5, 1 + Math.floor(s.progress * 5))) + ' / 05'; },
      },
    });
    const swing = () => {
      if (!active) return;
      shots.forEach((c) => {
        const r = c.getBoundingClientRect();
        const off = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
        gsap.set(c, { rotateY: off * -26, rotateZ: off * 2, z: -Math.abs(off) * 220, transformPerspective: 1500 });
      });
    };
    gsap.ticker.add(swing);
    return () => { gsap.ticker.remove(swing); tw.kill(); gsap.set([track, ...shots], { clearProps: 'transform' }); };
  });
  if (!AX.reduce) {
    mm.add('(max-width: 900px)', () => {
      shots.forEach((s) => gsap.from(s, { y: 70, opacity: 0, duration: 1, ease: 'steps(8)', scrollTrigger: { trigger: s, start: 'top 90%' } }));
    });
  }

  /* ---------- isometric arena: place your heroes ---------- */
  const iso = $('#iso');
  const tilt = $('#isoTilt');
  gsap.set(tilt, { rotationX: 58 }); gsap.set(iso, { rotation: -45 });
  const msg = $('#arenaMsg');
  const picks = $$('.pick');
  const UNITS = {
    tank: { img: '../Assets/tb-char-tank.png', c: '#c89b18', hp: 6 },
    healer: { img: '../Assets/tb-char-healer.png', c: '#2aa8b8', hp: 4 },
    mage: { img: '../Assets/tb-char-mage.png', c: '#c084fc', hp: 2 },
  };
  const tiles = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const t = document.createElement('div');
      const zone = r < 2 ? 'enemy' : r < 4 ? 'neutral' : 'grass';
      t.className = `tile ${zone}${(r + c) % 2 ? ' alt' : ''}`;
      t.dataset.r = r; t.dataset.c = c;
      if (zone === 'grass') { t.setAttribute('role', 'button'); t.setAttribute('tabindex', '0'); t.setAttribute('aria-label', `Tile row ${r + 1}, column ${c + 1}`); }
      iso.appendChild(t); tiles.push(t);
    }
  }
  const unitEl = (key, enemy) => {
    const u = UNITS[key];
    const el = document.createElement('div');
    el.className = 'unit' + (enemy ? ' enemy' : '');
    el.style.setProperty('--c', u.c);
    el.innerHTML = `<div class="u-inner" style="position:relative;width:100%;height:100%"><span class="bar"><i style="width:${(u.hp / 6) * 100}%"></i></span><img src="${u.img}" alt=""/></div>`;
    return el;
  };
  // opponent pieces
  [[0, 1, 'tank'], [1, 3, 'mage'], [0, 4, 'healer']].forEach(([r, c, k]) => tiles[r * 6 + c].appendChild(unitEl(k, true)));

  let selected = 'tank';
  const placed = {};
  const say = (t) => { msg.textContent = '> ' + t; gsap.fromTo(msg, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'steps(4)' }); };
  picks.forEach((p) => p.addEventListener('click', () => {
    selected = p.dataset.unit;
    picks.forEach((x) => x.setAttribute('aria-pressed', x === p));
    say(`${selected.toUpperCase()} ready.`);
  }));
  const place = (t) => {
    if (!t.classList.contains('grass')) {
      if (t.classList.contains('enemy')) say('That is enemy territory!');
      return;
    }
    if (t.querySelector('.unit')) { say('Tile occupied.'); return; }
    if (placed[selected]) placed[selected].remove();
    const el = unitEl(selected);
    t.appendChild(el);
    placed[selected] = el;
    if (!AX.reduce) gsap.from(el.querySelector('.u-inner'), { y: -260, duration: 0.7, ease: 'bounce.out' });
    $(`.pick[data-unit="${selected}"]`).classList.add('placed');
    const left = Object.keys(UNITS).filter((k) => !placed[k]);
    if (left.length) {
      selected = left[0];
      picks.forEach((x) => x.setAttribute('aria-pressed', x.dataset.unit === selected));
      say(`Placed! Next: ${selected.toUpperCase()}.`);
    } else {
      say('READY! All heroes deployed. FIGHT!');
      if (!AX.reduce) {
        gsap.fromTo(iso, { rotation: -45 }, { rotation: 315, duration: 1.6, ease: 'expo.inOut', onComplete: () => gsap.set(iso, { rotation: -45 }) });
        tiles.filter((x) => x.classList.contains('grass')).forEach((x, i) => gsap.fromTo(x, { background: '#c89b18' }, { background: '', duration: 0.6, delay: i * 0.02, ease: 'steps(3)', clearProps: 'background' }));
      }
    }
  };
  iso.addEventListener('click', (e) => { const t = e.target.closest('.tile'); if (t) place(t); });
  iso.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('tile')) { e.preventDefault(); place(e.target); } });
  $('#arenaReset').addEventListener('click', () => {
    Object.values(placed).forEach((u) => u.remove());
    Object.keys(placed).forEach((k) => delete placed[k]);
    picks.forEach((p) => { p.classList.remove('placed'); p.setAttribute('aria-pressed', p.dataset.unit === 'tank'); });
    selected = 'tank';
    gsap.set(iso, { rotation: -45 }); gsap.set(tilt, { rotationX: 58 });
    say('Board reset. Deploy your heroes.');
  });
  // the board leans toward the cursor
  const stageEl = $('.iso-stage');
  if (AX.fine && !AX.reduce) {
    stageEl.addEventListener('pointermove', (e) => {
      if (gsap.isTweening(iso)) return;
      const r = stageEl.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(tilt, { rotationX: 58 - ny * 10, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(iso, { rotation: -45 + nx * 12, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
    });
    stageEl.addEventListener('pointerleave', () => {
      gsap.to(tilt, { rotationX: 58, duration: 1.2, ease: 'elastic.out(1,.5)' });
      if (!gsap.isTweening(iso)) gsap.to(iso, { rotation: -45, duration: 1.2, ease: 'elastic.out(1,.5)' });
    });
  }
  if (!AX.reduce) {
    gsap.from(tiles, {
      opacity: 0, y: -40, duration: 0.5, ease: 'steps(4)', stagger: { each: 0.018, from: 'start' },
      scrollTrigger: { trigger: iso, start: 'top 80%' },
    });
  }

  /* ---------- quest log ticks itself off ---------- */
  const qs = $$('#quest li');
  ScrollTrigger.create({
    trigger: '#quest', start: 'top 70%', once: true,
    onEnter: () => {
      qs.forEach((li, i) => setTimeout(() => {
        li.classList.add('done'); li.querySelector('.qbox').textContent = '✓';
        if (!AX.reduce) gsap.fromTo(li, { x: 14 }, { x: 0, duration: 0.3, ease: 'steps(3)' });
        if (i === qs.length - 1) setTimeout(() => $('#qDone').classList.add('on'), 300);
      }, AX.reduce ? 0 : 350 * (i + 1)));
    },
  });
})();
