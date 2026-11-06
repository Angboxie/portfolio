/* Casepop — generative case art, 3D phone case, sticker parallax */
(() => {
  const { gsap, AX } = window;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- generative "artist" designs (Canvas 2D) ---------- */
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ART = [
    { name: 'Sunburst', paint(c, w, h) {
      const g = c.createConicGradient(0.6, w * 0.35, h * 0.6);
      ['#ffd23f', '#ff4d8d', '#7c4dff', '#00d1b2', '#ffd23f'].forEach((col, i) => g.addColorStop(i / 4, col));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 24; i++) { c.save(); c.translate(w * 0.35, h * 0.6); c.rotate((i / 24) * Math.PI * 2); c.fillRect(w * 0.18, -2, w, 4); c.restore(); }
      c.fillStyle = '#0d0d0d'; c.beginPath(); c.arc(w * 0.35, h * 0.6, w * 0.16, 0, 7); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(w * 0.35, h * 0.6, w * 0.08, 0, 7); c.fill();
    } },
    { name: 'Stripe', paint(c, w, h) {
      c.fillStyle = '#f5f5f0'; c.fillRect(0, 0, w, h);
      c.save(); c.translate(w / 2, h / 2); c.rotate(-0.6);
      c.fillStyle = '#0d0d0d';
      for (let x = -h; x < h; x += w * 0.12) c.fillRect(x, -h, w * 0.06, h * 2);
      c.restore();
      c.fillStyle = '#ff4d8d'; c.beginPath(); c.arc(w * 0.62, h * 0.66, w * 0.26, 0, 7); c.fill();
      c.fillStyle = '#0d0d0d'; c.font = `900 ${w * 0.12}px Archivo, Arial Black, sans-serif`; c.textAlign = 'center';
      c.fillText('POP!', w * 0.62, h * 0.68);
    } },
    { name: 'Confetti', paint(c, w, h) {
      c.fillStyle = '#7c4dff'; c.fillRect(0, 0, w, h);
      const r = rand(7);
      const cols = ['#ffd23f', '#f5f5f0', '#ff4d8d', '#00d1b2'];
      for (let i = 0; i < 70; i++) {
        c.fillStyle = cols[(r() * 4) | 0];
        const x = r() * w, y = r() * h, s = 6 + r() * w * 0.09;
        if (r() > 0.5) { c.beginPath(); c.arc(x, y, s / 2, 0, 7); c.fill(); }
        else { c.save(); c.translate(x, y); c.rotate(r() * 3); c.fillRect(-s / 2, -s / 6, s, s / 3); c.restore(); }
      }
    } },
    { name: 'Waves', paint(c, w, h) {
      const cols = ['#0d0d0d', '#ff4d8d', '#f5f5f0', '#ffd23f', '#00d1b2'];
      const bands = 14;
      for (let i = 0; i <= bands; i++) {
        c.fillStyle = cols[i % cols.length];
        c.beginPath(); c.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) c.lineTo(x, (i / bands) * h + Math.sin(x / w * Math.PI * 3 + i) * h * 0.03);
        c.lineTo(w, h); c.closePath(); c.fill();
      }
    } },
  ];
  const paintCanvas = (canvas, idx, w = 512, h = 1024) => { canvas.width = w; canvas.height = h; ART[idx].paint(canvas.getContext('2d'), w, h); return canvas; };

  /* wall cards */
  $$('.wcard').forEach((card) => {
    const cv = document.createElement('canvas'); card.prepend(cv);
    const w = Math.round(card.clientWidth * 1.5) || 600;
    paintCanvas(cv, +card.dataset.art, w, w * 2);
  });

  /* swatches */
  const row = $('.swap-row');
  let swapTo = () => {};
  ART.forEach((a, i) => {
    const b = document.createElement('button');
    b.className = 'swap'; b.setAttribute('aria-label', a.name + ' design'); b.setAttribute('aria-pressed', i === 0);
    b.appendChild(paintCanvas(document.createElement('canvas'), i, 92, 128));
    b.addEventListener('click', () => { $$('.swap').forEach((x) => x.setAttribute('aria-pressed', x === b)); swapTo(i); });
    row.appendChild(b);
  });

  /* ---------- 3D phone case ---------- */
  async function initCase() {
    const THREE = await import('three');
    const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    const canvas = $('#case');
    const lite = innerWidth < 760 || matchMedia('(pointer: coarse)').matches;   // phones: lighter rendering
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.25 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 9);

    const textures = ART.map((_, i) => {
      const t = new THREE.CanvasTexture(paintCanvas(document.createElement('canvas'), i));
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    });
    const artMat = new THREE.MeshPhysicalMaterial({ map: textures[0], roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
    const sideMat = new THREE.MeshPhysicalMaterial({ color: 0x0d0d0d, roughness: 0.3, clearcoat: 1 });
    const screenMat = new THREE.MeshPhysicalMaterial({ color: 0x050507, roughness: 0.05, metalness: 0.2, clearcoat: 1 });
    // box face order: +x, -x, +y, -y, +z (art), -z (screen)
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.6, 3.2, 0.24, 8, 0.2), [sideMat, sideMat, sideMat, sideMat, artMat, screenMat]);

    const bumpMat = new THREE.MeshPhysicalMaterial({ color: 0x111114, roughness: 0.15, metalness: 0.4, clearcoat: 1 });
    const bump = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.08, 4, 0.12), bumpMat);
    bump.position.set(-0.36, 1.12, 0.14);
    const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x050510, roughness: 0, metalness: 0.9, clearcoat: 1 });
    const lensGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 32); lensGeo.rotateX(Math.PI / 2);
    [[-0.13, 0.13], [0.13, -0.05], [-0.13, -0.13]].forEach(([x, y]) => {
      const l = new THREE.Mesh(lensGeo, lensMat); l.position.set(-0.36 + x, 1.12 + y, 0.2); body.add(l);
    });
    body.add(bump);

    const group = new THREE.Group(); group.add(body); scene.add(group);
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe($('.hero'));
    // black liquid that pours out from behind the case and circles it
    const sym = await AX.liquid({
      host: { THREE, scene, camera }, core: 0, spread: 0.4, scale: 2.7, strength: 0.32, count: innerWidth < 760 ? 6 : 11,
      tendrils: innerWidth < 760 ? 1 : 2, drips: 2, rim: '#ff4d8d', visible: () => visible,
    });
    sym.group.rotation.set(0.25, 0, -0.15);
    const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(4, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xff4d8d, 3); rim.position.set(-5, 0, -3); scene.add(rim);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      camera.position.z = w / h < 0.8 ? 11 : 9;
    };
    new ResizeObserver(resize).observe(canvas); resize();

    // swap = one fast full spin, art changes while the back faces away
    const spinState = { extra: 0 };
    let current = 0;
    swapTo = (i) => {
      if (i === current) return;
      current = i;
      sym.pulse(0.8);
      gsap.killTweensOf(spinState);
      let swapped = false;
      gsap.fromTo(spinState, { extra: 0 }, {
        extra: Math.PI * 2, duration: 1.3, ease: 'expo.inOut',
        onUpdate() { if (!swapped && spinState.extra > Math.PI * 0.5) { artMat.map = textures[i]; artMat.needsUpdate = true; swapped = true; } },
        onComplete() { spinState.extra = 0; },
      });
      gsap.fromTo(group.position, { y: 0 }, { y: 0.35, duration: 0.65, ease: 'power2.out', yoyo: true, repeat: 1 });
    };

    // drag to spin
    let rotY = -0.35, velY = 0, rotX = 0, drag = null;
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      velY = (e.clientX - drag.x) * 0.01; rotX += (e.clientY - drag.y) * 0.005; drag = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('pointerup', () => { drag = null; });

    gsap.from(group.rotation, { y: -Math.PI * 2, duration: 2.4, ease: 'expo.out', delay: 0.3 });
    gsap.from(group.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 2, ease: 'expo.out', delay: 0.3 });
    const clock = new THREE.Clock();
    const tilt = { x: 0, y: 0 };

    gsap.ticker.add(() => {
      if (!visible) return;
      const t = clock.getElapsedTime();
      rotY += velY; velY *= 0.94;
      if (!drag) { rotX *= 0.94; rotY += ((-0.35 + Math.sin(t * 0.4) * 0.35) - rotY) * (AX.reduce ? 0 : 0.01); }
      tilt.x += (-AX.mouse.ny * 0.2 - tilt.x) * 0.06; tilt.y += (AX.mouse.nx * 0.35 - tilt.y) * 0.06;
      body.rotation.set(rotX + tilt.x + 0.08, rotY + tilt.y + spinState.extra, -0.12 + Math.sin(t * 0.7) * 0.03);
      if (!gsap.isTweening(group.position)) group.position.y = Math.sin(t * 1.2) * 0.08;
      renderer.render(scene, camera);
    });
  }
  initCase().catch((e) => { console.warn('3D case disabled:', e); $('#case').style.display = 'none'; });
})();
