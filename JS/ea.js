/* Essentially Australia — glass droplet, purchase path collapse, contrast slider */
(() => {
  const { gsap, ScrollTrigger, AX } = window;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  const hero = $('.hero');

  /* ---------- feeling chips ---------- */
  let setFeel = () => {};
  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach((c) => c.setAttribute('aria-pressed', c === chip));
      const col = chip.dataset.feel;
      gsap.to(hero, { '--tint': col, duration: 1.2, ease: 'power2.out' });
      setFeel(col);
    });
  });
  gsap.set(hero, { '--tint': '#8fb3c9' });

  /* ---------- 8 → 4 counter + AAA scramble ---------- */
  const pathNum = $('#pathNum');
  if (!AX.reduce) {
    const o = { v: 8 };
    gsap.to(o, { v: 4, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: pathNum, start: 'top 90%' }, onUpdate: () => { pathNum.textContent = Math.round(o.v); } });
    pathNum.textContent = '8';
  } else pathNum.textContent = '4';

  $$('[data-scramble]').forEach((el) => {
    const final = el.dataset.scramble, glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    if (AX.reduce) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        let f = 0;
        const id = setInterval(() => {
          f++;
          el.textContent = [...final].map((c, i) => (f > 8 + i * 4 ? c : glyphs[(Math.random() * glyphs.length) | 0])).join('');
          if (f > 8 + final.length * 4) clearInterval(id);
        }, 45);
      },
    });
  });

  /* ---------- purchase path: 8 pills collapse into 4 ---------- */
  const row = $('#pathRow');
  const keep = [0, 2, 5, 7];
  const pills = [];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'pstep' + (keep.includes(i) ? ' keep' : '');
    p.innerHTML = `<span>Step</span><b>0${i + 1}</b>`;
    row.appendChild(p);
    pills.push(p);
  }
  const bigNum = $('#pathBig');
  const layout = (prog) => {
    const W = row.clientWidth, gap = 10;
    const w8 = (W - 7 * gap) / 8, w4 = (W - 3 * gap) / 4;
    pills.forEach((p, i) => {
      const k = keep.indexOf(i);
      let x8 = i * (w8 + gap), x4, w4i;
      if (k >= 0) { x4 = k * (w4 + gap); w4i = w4; }
      else { // fold into the previous kept step
        const prevKeep = keep.filter((q) => q < i).pop();
        const kk = keep.indexOf(prevKeep);
        x4 = kk * (w4 + gap) + w4 - 20; w4i = 0;
      }
      const t = gsap.parseEase('expo.inOut')(prog);
      p.style.left = x8 + (x4 - x8) * t + 'px';
      p.style.width = Math.max(0, w8 + (w4i - w8) * t) + 'px';
      p.style.opacity = k >= 0 ? 1 : 1 - Math.min(1, t * 1.6);
      if (k >= 0) p.querySelector('b').textContent = '0' + (t > 0.5 ? k + 1 : i + 1);
    });
    bigNum.textContent = Math.round(8 - 4 * gsap.parseEase('expo.inOut')(prog));
  };
  mm.add('(min-width: 901px)', () => {
    const st = { p: 0 };
    layout(0);
    const tw = gsap.to(st, {
      p: 1, ease: 'none', onUpdate: () => layout(st.p),
      scrollTrigger: { trigger: '.path', start: 'top top', end: '+=120%', pin: true, scrub: 0.6, onRefresh: () => layout(st.p) },
    });
    const onR = () => layout(st.p);
    addEventListener('resize', onR);
    return () => { tw.kill(); removeEventListener('resize', onR); pills.forEach((p) => { p.style.cssText = ''; }); };
  });
  mm.add('(max-width: 900px)', () => {
    const removed = pills.filter((_, i) => !keep.includes(i));
    const tw = gsap.to(removed, { opacity: 0.15, scale: 0.9, duration: 1, stagger: 0.1, scrollTrigger: { trigger: row, start: 'top 75%' }, onComplete: () => { bigNum.textContent = '4'; } });
    return () => tw.kill();
  });

  /* ---------- contrast slider ---------- */
  const box = $('#contrastBox');
  const setSplit = (pct) => box.style.setProperty('--split', Math.max(4, Math.min(96, pct)) + '%');
  let dragging = false;
  const fromEvent = (e) => { const r = box.getBoundingClientRect(); setSplit(((e.clientX - r.left) / r.width) * 100); };
  box.addEventListener('pointerdown', (e) => { dragging = true; box.setPointerCapture(e.pointerId); fromEvent(e); });
  box.addEventListener('pointermove', (e) => { if (dragging || AX.fine) fromEvent(e); });
  box.addEventListener('pointerup', () => { dragging = false; });
  box.addEventListener('pointerleave', () => { if (AX.fine && !dragging) gsap.to(box, { '--split': '50%', duration: 1, ease: 'expo.out' }); });
  if (!AX.reduce) gsap.fromTo(box, { '--split': '92%' }, { '--split': '50%', duration: 2, ease: 'expo.inOut', scrollTrigger: { trigger: box, start: 'top 75%' } });

  /* ---------- prototype device: tilts flat as it scrolls in ---------- */
  if (!AX.reduce) {
    gsap.fromTo('.device', { rotateX: 28, scale: 0.86, y: 60 }, {
      rotateX: 0, scale: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: '.device-wrap', start: 'top 95%', end: 'top 25%', scrub: 0.6 },
    });
  }

  /* ---------- glass droplet (Three.js) ---------- */
  async function initDrop() {
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    const { mergeVertices } = await import('three/addons/utils/BufferGeometryUtils.js');
    const canvas = $('#drop');
    const small = () => innerWidth < 760;
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
    // phones: lighter everything. Real refraction (transmission) costs a second full render pass
    const lite = small() || matchMedia('(pointer: coarse)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.25 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 8);

    // teardrop: sphere remapped with the teardrop curve r = sin(φ)·sin(φ/2)^m
    let geo = new THREE.SphereGeometry(1, lite ? 72 : 160, lite ? 54 : 120);
    geo.deleteAttribute('uv'); geo.deleteAttribute('normal');
    geo = mergeVertices(geo);
    const pos = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const phi = Math.acos(THREE.MathUtils.clamp(v.y, -1, 1));
      const th = Math.atan2(v.z, v.x);
      const r = Math.sin(phi) * Math.pow(Math.sin(phi / 2), 1.1) * 1.05;
      pos.setXYZ(i, r * Math.cos(th), Math.cos(phi) * 1.2 - 0.15, r * Math.sin(th));
    }
    geo.computeVertexNormals();

    const col = new THREE.Color('#8fb3c9');
    const mat = lite
      ? new THREE.MeshPhysicalMaterial({ color: col.clone(), attenuationColor: col.clone(), transparent: true, opacity: 0.62, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6 })
      : new THREE.MeshPhysicalMaterial({
      color: col.clone(), transmission: 1, thickness: 1.6, roughness: 0.04, ior: 1.45,
      attenuationColor: col.clone(), attenuationDistance: 1.2, clearcoat: 1, clearcoatRoughness: 0.04,
      iridescence: 0.4, iridescenceIOR: 1.3, envMapIntensity: 1.3,
    });
    const drop = new THREE.Mesh(geo, mat);

    const coreMat = new THREE.MeshStandardMaterial({ color: col.clone(), emissive: col.clone(), emissiveIntensity: 1.4, roughness: 0.4 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 48, 48), coreMat);
    core.position.y = -0.45;

    const group = new THREE.Group();
    group.add(drop, core);
    scene.add(group);

    // feeling orbs orbiting behind/around — they refract through the glass
    const feels = ['#e9b949', '#8fb3c9', '#9bb88a', '#b07a5c'];
    const orbs = feels.map((c, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 32), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.3 }));
      m.userData.a = (i / 4) * Math.PI * 2;
      scene.add(m);
      return m;
    });
    // botanical rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8c9a8, transparent: true, opacity: 0.35 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.005, 6, 200), ringMat);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.003, 6, 200), ringMat.clone());
    ringB.material.opacity = 0.18;
    ringA.rotation.x = 1.3; ringB.rotation.x = 1.15; ringB.rotation.y = 0.4;
    scene.add(ringA, ringB);
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // the symbiote: a hollow ring of black liquid circling the drop, tendrils seeping out through the glass
    const sym = await AX.liquid({
      host: { THREE, scene, camera }, core: 0, spread: 0.4, scale: 2.6, strength: 0.32, count: small() ? 6 : 10,
      tendrils: small() ? 1 : 2, drips: 2, rim: '#8fb3c9', visible: () => visible,
    });
    sym.group.rotation.x = 0.35;

    setFeel = (hex) => {
      sym.setRim(hex); sym.pulse(0.6);
      const c = new THREE.Color(hex);
      [mat.color, mat.attenuationColor, coreMat.color, coreMat.emissive].forEach((target) => gsap.to(target, { r: c.r, g: c.g, b: c.b, duration: 1.2, ease: 'power2.out' }));
      gsap.fromTo(group.scale, { x: 1.12, y: 0.86, z: 1.12 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, .35)' });
    };

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      camera.position.z = w / h < 0.9 ? 10 : 8;
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    // drag to spin, click to wobble
    let spin = 0, spinVel = 0.004, drag = null, moved = 0;
    canvas.addEventListener('pointerdown', (e) => { drag = e.clientX; moved = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (drag === null) return;
      const dx = e.clientX - drag; drag = e.clientX; moved += Math.abs(dx);
      spinVel = dx * 0.004;
    });
    canvas.addEventListener('pointerup', () => {
      if (moved < 4) gsap.fromTo(group.scale, { x: 1.18, y: 0.82, z: 1.18 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, .3)' });
      drag = null;
    });

    const clock = new THREE.Clock();
    const tilt = { x: 0, y: 0 };
    gsap.from(group.position, { y: -4, duration: 2.2, ease: 'expo.out', delay: 0.4 });

    gsap.ticker.add(() => {
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      if (drag === null) spinVel += (0.004 - spinVel) * 0.03;
      spin += spinVel * (AX.reduce ? 0 : 1) * 60 * dt;
      tilt.x += (-AX.mouse.ny * 0.25 - tilt.x) * 0.05;
      tilt.y += (AX.mouse.nx * 0.35 - tilt.y) * 0.05;
      group.rotation.set(tilt.x + Math.sin(t * 0.8) * 0.06, spin + tilt.y, Math.sin(t * 0.6) * 0.05);
      group.position.x = 0;
      if (!gsap.isTweening(group.position)) group.position.y = Math.sin(t * 1.1) * 0.12;
      orbs.forEach((o, i) => {
        const a = o.userData.a + t * 0.35;
        o.position.set(Math.cos(a) * 2.0, Math.sin(a * 2 + i) * 0.35, Math.sin(a) * 2.0 * 0.45 - 0.3);
        o.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.25);
      });
      ringA.rotation.z += dt * 0.15; ringB.rotation.z -= dt * 0.1;
      renderer.render(scene, camera);
    });
  }
  initDrop().catch((e) => { console.warn('3D droplet disabled:', e); $('#drop').style.display = 'none'; });
})();
