/* ==========================================================================
   AX.liquid — a living, shape-shifting liquid creature.
   Metaballs (marching cubes) that morph between forms:
     orb · pixels · serpent · spikes · ring · drip
   and reach tendrils toward the cursor (or any target you give it).

   Standalone:  AX.liquid({ canvas })                                  — owns renderer + loop
   Embedded:    AX.liquid({ host: { THREE, scene, camera }, parent })   — host renders

   Morphing:    sym.state.formA = 'orb'; sym.state.formB = 'spikes'; sym.state.mix = 0..1
   Provoke:     sym.state.rage = 0..1   (pulls any form toward spikes)
   ========================================================================== */
(() => {
  const AX = window.AX;

  AX.liquid = async function (o = {}) {
    const THREE = o.host ? o.host.THREE : await import('three');
    const { MarchingCubes } = await import('three/addons/objects/MarchingCubes.js');
    const small = innerWidth < 760 || matchMedia('(pointer: coarse)').matches;
    const opts = Object.assign({
      color: '#050507', rim: '#ffffff',
      resolution: small ? 24 : 48,          // the grid is rebuilt on the CPU every frame
      count: small ? 14 : 22,
      tendrils: small ? 1 : 3,
      drips: small ? 1 : 2,
      spread: 0.2, core: 1, speed: 0.5, strength: 1.1, scale: 2.2,
      iridescence: 0.35, roughness: 0.2, env: 0.35,
      eyes: false, pixel: 0, cameraZ: 6,
      form: 'orb',
      visible: () => true,
    }, o);

    /* ---------- renderer (standalone only) ---------- */
    let renderer = null, scene, camera;
    if (o.host) {
      scene = o.host.scene; camera = o.host.camera;
    } else {
      const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
      renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: !opts.pixel, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(opts.pixel || Math.min(devicePixelRatio, small ? 1.25 : 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      scene = new THREE.Scene();
      scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      camera.position.z = opts.cameraZ;
      if (opts.pixel) opts.canvas.style.imageRendering = 'pixelated';
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(opts.color), roughness: opts.roughness, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.04,
      iridescence: opts.iridescence, iridescenceIOR: 1.6, iridescenceThicknessRange: [120, 480],
      envMapIntensity: opts.env,
    });
    const mc = new MarchingCubes(opts.resolution, mat, false, false, 80000);
    mc.isolation = 72;
    mc.scale.setScalar(opts.scale);
    mc.frustumCulled = false;

    const group = new THREE.Group();
    group.add(mc);
    (o.parent || scene).add(group);

    const rimCol = new THREE.Color(opts.rim);
    const rim = new THREE.DirectionalLight(rimCol, 5); rim.position.set(-4, -2, -3);
    const rimPt = new THREE.PointLight(rimCol, 18, 10); rimPt.position.set(2.4, -2.2, 1.6);
    const rimTop = new THREE.DirectionalLight(rimCol, 2.5); rimTop.position.set(3, 4, -4);
    group.add(rim, rimPt, rimTop);
    if (!o.host) { const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6); scene.add(key); }

    /* ---------- eyes: narrow crescent slits ---------- */
    let eyes = null;
    if (opts.eyes) {
      const sh = new THREE.Shape();
      sh.moveTo(0, -0.18);
      sh.quadraticCurveTo(0.45, 0.32, 1.0, 0.42);
      sh.quadraticCurveTo(0.6, -0.02, 0, -0.18);
      const geo = new THREE.ShapeGeometry(sh, 32);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf6f6f0, side: THREE.DoubleSide, transparent: true, depthTest: false });
      const L = new THREE.Mesh(geo, eyeMat), R = new THREE.Mesh(geo, eyeMat);
      L.scale.x = -1; L.position.x = -0.12; R.position.x = 0.12; L.renderOrder = R.renderOrder = 20;
      eyes = new THREE.Group(); eyes.add(L, R); eyes.userData.mat = eyeMat;
      group.add(eyes);
    }

    /* ---------- actors ---------- */
    const rnd = (a, b) => a + Math.random() * (b - a);
    const N = opts.count;
    const balls = Array.from({ length: N }, () => ({
      phase: rnd(0, 6.28), speed: rnd(0.5, 1.3) * (Math.random() > 0.35 ? 1 : -1),
      tilt: rnd(-1.1, 1.1), r: rnd(0.55, 1.2), size: rnd(0.5, 1.05), wob: rnd(0, 9),
    }));
    const drips = Array.from({ length: opts.drips }, () => ({ x: 0.5, y: 0.5, z: 0.5, v: 0, life: rnd(0, 3) }));
    const chains = Array.from({ length: opts.tendrils }, (_, i) => ({ now: new THREE.Vector3(0.5, 0.5, 0.5), lag: 2.4 - i * 0.55, wob: i * 2.1 }));

    // directions for the spike form (fibonacci sphere)
    const M = Math.ceil(N / 2);
    const dirs = Array.from({ length: M }, (_, j) => {
      const y = 1 - (j + 0.5) / M * 2, r = Math.sqrt(1 - y * y), th = j * 2.39996;
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });

    /* Each form writes [x, y, z, size] (offsets from field centre) for ball i. */
    const FORMS = {
      orb: { core: 1, eye: 1, f(i, t, k, out) {
        const b = balls[i], a = t * b.speed + b.phase;
        const r = k * 0.19 * b.r * (1 + Math.sin(t * 1.6 + b.wob) * 0.22);
        out[0] = Math.cos(a) * r;
        out[1] = Math.sin(a) * r * Math.cos(b.tilt) + Math.sin(t * 0.8 + b.wob) * 0.025;
        out[2] = Math.sin(a) * r * Math.sin(b.tilt);
        out[3] = b.size * 0.8;
      } },
      pixels: { core: 0, eye: 0, f(i, t, k, out) {
        const gx = i % 4, gy = Math.floor(i / 4) % 3, gz = Math.floor(i / 12) % 2, sp = 0.15 * k;
        const jump = Math.max(0, Math.sin(t * 2.2 + i * 2.7)) ** 8 * 0.06;
        out[0] = (gx - 1.5) * sp;
        out[1] = (gy - 1) * sp + jump;
        out[2] = (gz - 0.5) * sp;
        out[3] = 0.5 * (0.75 + 0.35 * Math.sin(t * 2.4 + i * 1.7));
      } },
      serpent: { core: 0, eye: 0, f(i, t, k, out) {
        const u = i / (N - 1);
        out[0] = (u - 0.5) * 0.66 * k;
        out[1] = Math.sin(u * 7 - t * 2.6) * 0.08 * k;
        out[2] = Math.cos(u * 5 - t * 1.9) * 0.06 * k;
        out[3] = (1.2 - u * 0.9) * 0.72;
      } },
      spikes: { core: 0.8, eye: 1, f(i, t, k, out) {
        const j = Math.floor(i / 2) % M, seg = i % 2, d = dirs[j];
        const spin = t * 0.35, c = Math.cos(spin), s = Math.sin(spin);
        const dx = d[0] * c - d[2] * s, dz = d[0] * s + d[2] * c;
        const len = (0.14 + seg * 0.13) * k * (1 + 0.28 * Math.sin(t * 3.2 + j * 1.3));
        out[0] = dx * len; out[1] = d[1] * len; out[2] = dz * len;
        out[3] = seg ? 0.26 : 0.55;
      } },
      ring: { core: 0, eye: 0, f(i, t, k, out) {
        const a = (i / N) * Math.PI * 2 + t * 0.7, r = 0.27 * k;
        out[0] = Math.cos(a) * r;
        out[1] = Math.sin(a) * r * 0.32 + Math.sin(a * 3 + t * 2) * 0.02;
        out[2] = Math.sin(a) * r * 0.95;
        out[3] = 0.5 * (1 + 0.4 * Math.sin(a * 2 - t * 3));
      } },
      drip: { core: 0.7, eye: 1, f(i, t, k, out) {
        const u = (t * 0.22 + i / N) % 1;
        out[0] = Math.sin(i * 12.9) * 0.05 * k + Math.sin(t + i) * 0.01;
        out[1] = (0.1 - u * 0.5) * k;
        out[2] = Math.cos(i * 7.1) * 0.03;
        out[3] = 0.42 * (1 - u * 0.4) * Math.min(1, u * 6);
      } },
    };

    const state = {
      spread: opts.spread, core: opts.core, strength: opts.strength, speed: opts.speed,
      tendril: 1, melt: 0, spin: 0, eye: 1,
      formA: opts.form, formB: opts.form, mix: 0, rage: 0,
    };

    /* tendril target: the cursor, unless something else is set */
    let override = null;
    const wp = new THREE.Vector3(), ws = new THREE.Vector3(), target = new THREE.Vector3();
    const targetField = () => {
      group.getWorldPosition(wp); group.getWorldScale(ws);
      const dz = camera.position.z - wp.z;
      const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dz, hw = hh * camera.aspect;
      const s = opts.scale * ws.x;
      const nx = override ? override.nx : AX.mouse.nx, ny = override ? override.ny : AX.mouse.ny;
      target.set(
        THREE.MathUtils.clamp(0.5 + (nx * hw - wp.x) / (2 * s), 0.06, 0.94),
        THREE.MathUtils.clamp(0.5 + (ny * hh - wp.y) / (2 * s), 0.06, 0.94),
        0.72);
      return target;
    };

    if (renderer) {
      const resize = () => {
        const w = opts.canvas.clientWidth || innerWidth, h = opts.canvas.clientHeight || innerHeight;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      new ResizeObserver(resize).observe(opts.canvas); resize();
    }

    const A = [0, 0, 0, 0], R = [0, 0, 0, 0];
    let t = 0, blink = 3, last = performance.now();

    const tick = () => {
      const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!opts.visible()) return;
      const vel = Math.min(Math.abs(AX.velocity()) * 0.004, 0.4);
      t += dt * state.speed * (1 + vel * 4 + state.melt * 2 + state.rage * 1.5);

      mc.reset();
      const S = state.strength, SUB = 14;
      const k = (state.spread / 0.2) * (1 + vel * 0.8) * (1 + state.melt * 0.9);
      // form weights: either an explicit { form: weight } map, or formA → formB by mix
      let W = state.weights;
      if (!W) { W = {}; W[state.formA] = 1 - state.mix; W[state.formB] = (W[state.formB] || 0) + state.mix; }
      const active = [];
      let wsum = 0;
      for (const name in W) { const w = W[name]; if (w > 0.002 && FORMS[name]) { active.push([FORMS[name], w]); wsum += w; } }
      if (!active.length) { active.push([FORMS.orb, 1]); wsum = 1; }
      const fs = FORMS.spikes, rg = state.rage;
      let coreK = 0, eyeK = 0;
      for (const [f, w] of active) { coreK += f.core * w / wsum; eyeK += f.eye * w / wsum; }
      coreK = coreK * (1 - rg) + fs.core * rg;
      eyeK = eyeK * (1 - rg) + fs.eye * rg;

      const coreS = S * 3 * coreK * state.core * (1 - state.melt * 0.55) * (1 + Math.sin(t * 2.2) * 0.06);
      if (coreS > 0.05) mc.addBall(0.5, 0.5, 0.5, coreS, SUB);

      for (let i = 0; i < N; i++) {
        let x = 0, y = 0, z = 0, s = 0;
        for (const [f, w] of active) { f.f(i, t, k, A); const q = w / wsum; x += A[0] * q; y += A[1] * q; z += A[2] * q; s += A[3] * q; }
        if (rg > 0.001) { fs.f(i, t, k, R); x += (R[0] - x) * rg; y += (R[1] - y) * rg; z += (R[2] - z) * rg; s += (R[3] - s) * rg; }
        if (s > 0.02) mc.addBall(0.5 + x, 0.5 + y, 0.5 + z, S * s * (0.8 + state.melt * 0.7), SUB);
      }

      if (state.tendril > 0.01) {
        const tg = targetField();
        chains.forEach((c, i) => {
          c.now.lerp(tg, 1 - Math.exp(-dt * c.lag));
          const n = 8;
          for (let q = 1; q <= n; q++) {
            const f = q / n, reach = f * state.tendril * 0.92;
            const sway = Math.sin(t * 3 + q * 0.8 + c.wob) * 0.018 * f;
            mc.addBall(
              0.5 + (c.now.x - 0.5) * reach + sway,
              0.5 + (c.now.y - 0.5) * reach + Math.cos(t * 2.4 + q + c.wob) * 0.018 * f,
              0.5 + (c.now.z - 0.5 + i * 0.05) * reach,
              S * (0.6 - f * 0.42) * state.tendril, SUB);
          }
        });
      }

      for (const d of drips) {
        d.life -= dt;
        if (d.life <= 0) { d.x = 0.5 + rnd(-0.1, 0.1); d.z = 0.5 + rnd(-0.06, 0.06); d.y = 0.5 - 0.12 * coreK - state.spread * 0.4; d.v = 0; d.life = rnd(2.2, 4.5); }
        d.v += dt * 0.32; d.y -= d.v * dt;
        if (d.y > 0.05) mc.addBall(d.x, d.y, d.z, S * 0.32 * Math.min(1, d.life) * Math.max(0.2, coreK), SUB);
      }

      mc.update();
      mc.rotation.y = state.spin;

      if (eyes) {
        blink -= dt;
        if (blink < -0.16) blink = rnd(2.5, 6);
        const open = blink < 0 ? Math.abs(blink / 0.08 - 1) : 1;
        const coreR = Math.sqrt(Math.max(coreS, 0.01) / 86) * 2 * opts.scale;
        const tg = override || AX.mouse;
        eyes.position.set(tg.nx * 0.2 * coreR, 0.15 * coreR + tg.ny * 0.16 * coreR, coreR * 1.15);
        eyes.rotation.set(-tg.ny * 0.35, tg.nx * 0.55, 0);
        const s = Math.max(coreR, 0.3) * 0.5 * state.eye * Math.min(1, eyeK * 1.4);
        eyes.scale.set(s, s * Math.max(0.06, Math.min(1, open)) * (1 - rg * 0.45), s);
        eyes.visible = eyeK > 0.05;
        eyes.userData.mat.opacity = Math.min(1, eyeK * 1.4) * (1 - state.melt);
      }

      if (renderer) renderer.render(scene, camera);
    };
    window.gsap.ticker.add(tick);

    return {
      THREE, renderer, scene, camera, group, mc, mat, state, eyes, forms: Object.keys(FORMS),
      setColor(hex, dur = 1) { const c = new THREE.Color(hex); window.gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: dur }); },
      setRim(hex) { rim.color.set(hex); rimPt.color.set(hex); rimTop.color.set(hex); },
      rimColor: rim.color,
      lerpRim(c) { rim.color.copy(c); rimPt.color.copy(c); rimTop.color.copy(c); },
      setTarget(nx, ny) { override = nx == null ? null : { nx, ny }; },
      pulse(k = 1) { window.gsap.fromTo(state, { melt: 0.95 * k }, { melt: 0, duration: 1.8, ease: 'expo.out', overwrite: 'auto' }); },
      tick,
    };
  };
})();
