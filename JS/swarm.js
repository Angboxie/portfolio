/* ==========================================================================
   AX.swarm — a 2D liquid made of ~900 droplets.
   Droplets are splatted into a soft field on the GPU, then thresholded and
   shaded so they read as one glossy liquid with a coloured rim.
   Each frame the page fills a target buffer (a "formation"), and every
   droplet springs toward its target, so any formation morphs into any other.

   const sw = await AX.swarm({ back, front, n })
   sw.F.blob(buf, t, {...})   — formation library writes into a buffer
   sw.step(dt, buf)           — physics toward targets
   sw.render(occlude, mood)   — draw; occlude 0..1 also paints over the page
   ========================================================================== */
(() => {
  const AX = window.AX;
  const TAU = Math.PI * 2;

  AX.swarm = async function (o) {
    const THREE = await import('three');
    const back = o.back, front = o.front, fctx = front.getContext('2d');
    const N = o.n;

    /* ---------- GL ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas: back, alpha: true, antialias: false, premultipliedAlpha: true });
    // phones: render at 1x and a coarser field; the liquid is soft, the extra pixels only cost frames
    const small = innerWidth < 760 || matchMedia('(pointer: coarse)').matches;
    const dpr = small ? 1 : Math.min(devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    const floatOK = renderer.capabilities.isWebGL2 &&
      (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
    const FS = small ? 0.3 : 0.4; // field resolution vs CSS px
    // phones: cap droplet size. Huge droplets (the jaws, the flood) multiply pixel work;
    // 560 droplets of this size still merge into one solid mass
    const maxR = small ? 80 : Infinity;
    const field = new THREE.WebGLRenderTarget(4, 4, {
      type: floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false,
    });
    const AMP = floatOK ? 1 : 0.22, TH = floatOK ? 0.3 : 0.07;

    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const inst = new Float32Array(N * 3);
    const instAttr = new THREE.InstancedBufferAttribute(inst, 3);
    instAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('inst', instAttr);
    geo.instanceCount = N;

    const view = new THREE.Vector2(1, 1);
    const splat = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { uView: { value: view }, uAmp: { value: AMP } },
      vertexShader: /* glsl */`
        attribute vec3 inst; uniform vec2 uView; varying vec2 vQ;
        void main(){
          vQ = position.xy;
          vec2 p = inst.xy + position.xy * inst.z;
          gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform float uAmp; varying vec2 vQ;
        void main(){
          float d = dot(vQ, vQ);
          if (d > 1.0) discard;
          float f = 1.0 - d;
          gl_FragColor = vec4(f * f * f * uAmp, 0.0, 0.0, 1.0);
        }`,
      depthTest: false, depthWrite: false, transparent: true, side: THREE.DoubleSide,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    }));
    splat.frustumCulled = false;
    const fScene = new THREE.Scene(); fScene.add(splat);

    const mood = new THREE.Color('#ff3b1f');
    const texel = new THREE.Vector2();
    const shadeMat = new THREE.ShaderMaterial({
      uniforms: { tField: { value: field.texture }, uTexel: { value: texel }, uTh: { value: TH }, uTime: { value: 0 }, uMood: { value: mood } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: /* glsl */`
        uniform sampler2D tField; uniform vec2 uTexel; uniform float uTh, uTime; uniform vec3 uMood;
        varying vec2 vUv;
        float F(vec2 o){ return texture2D(tField, vUv + o * uTexel).r; }
        void main(){
          float f = F(vec2(0.0));
          float a = smoothstep(uTh * 0.9, uTh * 1.1, f);
          if (a <= 0.001) { gl_FragColor = vec4(0.0); return; }
          float dx = F(vec2(1.5, 0.0)) - F(vec2(-1.5, 0.0));
          float dy = F(vec2(0.0, 1.5)) - F(vec2(0.0, -1.5));
          // height saturates inside, so only the rim slopes: glossy, not lumpy
          float hk = 3.2;
          vec2 g = vec2(dx, dy) * (hk * exp(-max(f - uTh, 0.0) * hk) * 0.75 + 0.18);
          vec3 n = normalize(vec3(-g, 1.0));
          vec3 V = vec3(0.0, 0.0, 1.0);
          vec3 L1 = normalize(vec3(-0.5, 0.62, 0.62));
          vec3 L2 = normalize(vec3(0.65, -0.25, 0.7));
          float s1 = pow(max(dot(reflect(-L1, n), V), 0.0), 80.0);
          float s2 = pow(max(dot(reflect(-L2, n), V), 0.0), 26.0);
          float fres = pow(1.0 - n.z, 2.0);
          float tilt = 1.0 - n.z;
          float band = smoothstep(0.62, 0.66, sin(n.x * 5.0 + n.y * 8.0 + uTime * 0.25) * 0.5 + 0.5) * 0.12 * smoothstep(0.02, 0.2, tilt);
          // broad soft sheen from an overhead light, like wet latex
          float sheen = pow(max(dot(reflect(-normalize(vec3(-0.3, 0.75, 0.6)), n), V), 0.0), 9.0) * 0.16;
          vec3 col = vec3(0.008) + vec3(1.0) * (s1 * 1.5 + band + sheen) + vec3(0.8, 0.85, 1.0) * s2 * 0.25 * smoothstep(0.03, 0.25, tilt) + uMood * fres * 2.0;
          col += uMood * (1.0 - smoothstep(uTh, uTh * 1.9, f)) * 0.22;
          gl_FragColor = vec4(col * a, a);
        }`,
      depthTest: false, depthWrite: false, blending: THREE.NoBlending, side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shadeMat);
    shade.frustumCulled = false;
    const sScene = new THREE.Scene(); sScene.add(shade);
    const cam = new THREE.Camera();

    let W = 1, H = 1;
    const resize = () => {
      W = innerWidth; H = innerHeight;
      renderer.setSize(W, H, false);
      front.width = back.width; front.height = back.height;
      const fw = Math.max(2, Math.round(W * FS)), fh = Math.max(2, Math.round(H * FS));
      field.setSize(fw, fh);
      texel.set(1 / fw, 1 / fh);
      view.set(W, H);
      wordCache.clear();
    };

    /* ---------- particles ---------- */
    const x = new Float32Array(N), y = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N), r = new Float32Array(N);
    const sa = new Float32Array(N), sb = new Float32Array(N), sc = new Float32Array(N), kk = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      sa[i] = Math.random(); sb[i] = Math.random(); sc[i] = Math.random();
      kk[i] = 0.55 + 0.9 * Math.random();
      x[i] = innerWidth / 2; y[i] = innerHeight / 2; r[i] = 1;
    }
    const perm = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }

    // a second, independent shuffle decides which droplets join which group when two shapes share the liquid
    const sel = new Float32Array(N);
    { const s = Array.from({ length: N }, (_, i) => i); for (let i = N - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [s[i], s[j]] = [s[j], s[i]]; } s.forEach((v, i) => { sel[v] = i / N; }); }
    const buf = () => ({ x: new Float32Array(N), y: new Float32Array(N), r: new Float32Array(N) });
    /* split the liquid: a `frac` share of droplets takes shape B, the rest keep shape A */
    const combine = (out, A, B, frac) => {
      for (let i = 0; i < N; i++) { const S = sel[i] < frac ? B : A; out.x[i] = S.x[i]; out.y[i] = S.y[i]; out.r[i] = S.r[i]; }
      return out;
    };
    const mix = (out, A, B, k) => {
      if (k <= 0) { out.x.set(A.x); out.y.set(A.y); out.r.set(A.r); return out; }
      if (k >= 1) { out.x.set(B.x); out.y.set(B.y); out.r.set(B.r); return out; }
      for (let i = 0; i < N; i++) { out.x[i] = A.x[i] + (B.x[i] - A.x[i]) * k; out.y[i] = A.y[i] + (B.y[i] - A.y[i]) * k; out.r[i] = A.r[i] + (B.r[i] - A.r[i]) * k; }
      return out;
    };

    /* ---------- word sampling ---------- */
    const wordCache = new Map();
    function word(text, opt = {}) {
      const key = text + '|' + W + 'x' + H + '|' + (opt.width || 0.86);
      if (wordCache.has(key)) return wordCache.get(key);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d', { willReadFrequently: true });
      const family = opt.font || '"Big Shoulders", Impact, sans-serif';
      c.font = `900 100px ${family}`;
      const w100 = c.measureText(text).width || 100;
      const fs = Math.min((W * (opt.width || 0.86)) / w100 * 100, H * 0.42);
      c.font = `900 ${fs}px ${family}`;
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
      c.fillText(text, W / 2, H / 2);
      const d = c.getImageData(0, 0, W, H).data;
      let area = 0;
      for (let yy = 0; yy < H; yy += 3) for (let xx = 0; xx < W; xx += 3) if (d[(yy * W + xx) * 4 + 3] > 128) area += 9;
      const step = Math.max(3, Math.sqrt(area / N) * 0.92);
      const pts = [];
      for (let yy = step / 2; yy < H; yy += step) for (let xx = step / 2; xx < W; xx += step) {
        const jx = xx + (Math.random() - 0.5) * step * 0.4, jy = yy + (Math.random() - 0.5) * step * 0.4;
        const ix = Math.min(W - 1, Math.max(0, jx | 0)), iy = Math.min(H - 1, Math.max(0, jy | 0));
        if (d[(iy * W + ix) * 4 + 3] > 128) pts.push(jx - W / 2, jy - H / 2);
      }
      const M = pts.length / 2 || 1;
      const out = new Float32Array(N * 2);
      // sort roughly left→right so morphs into the word sweep across
      const order = Array.from({ length: M }, (_, i) => i).sort((p, q) => pts[p * 2] - pts[q * 2]);
      for (let i = 0; i < N; i++) { const s = order[Math.floor((perm[i] / N) * M) % M]; out[i * 2] = pts[s * 2] || 0; out[i * 2 + 1] = pts[s * 2 + 1] || 0; }
      const res = { pts: out, r: step * 1.45 };
      wordCache.set(key, res);
      return res;
    }

    /* ---------- formations ---------- */
    const F = {
      blob(o, t, p) {
        const { cx, cy, R, churn = 1 } = p;
        const pr = Math.min(R * 0.3, p.maxR || 210) + 2;
        for (let i = 0; i < N; i++) {
          const a = sa[i], b = sb[i], c = sc[i];
          const rr = R * 0.8 * Math.sqrt(a) * (1 + 0.07 * Math.sin(t * 1.7 + c * 11));
          const th = b * TAU + t * churn * (0.18 + 0.4 * c) * (a < 0.5 ? 1 : -0.7);
          o.x[i] = cx + Math.cos(th) * rr;
          o.y[i] = cy + Math.sin(th) * rr * 0.94;
          o.r[i] = pr * (0.7 + 0.5 * c);
        }
        return o;
      },
      /* two half-masses with flat lips facing each other: an open (or closing) mouth */
      maw(o, t, { cx, cy, rx, ry, gap, strand = 0 }) {
        const half = N >> 1, pr = Math.min(Math.max(rx, ry) * 0.3, 210) + 2;
        for (let i = 0; i < N; i++) {
          const up = i < half, rr = Math.sqrt(sa[i]);
          const th = (up ? Math.PI : 0) + sb[i] * Math.PI;
          const wob = Math.sin(t * 1.6 + sc[i] * 11) * 0.03;
          o.x[i] = cx + Math.cos(th) * rr * rx * (1 + wob);
          o.y[i] = cy + (up ? -gap / 2 : gap / 2) + Math.sin(th) * rr * ry * (1 + wob);
          o.r[i] = pr * (0.7 + 0.5 * sc[i]);
        }
        // saliva: thin strands stretch between the lips as the mouth opens, then snap
        if (strand > 0.01 && gap > 0) {
          const S = 5, SN = Math.min(150, Math.floor(N * 0.15)), per = Math.floor(SN / S), start = half - Math.floor(SN / 2);
          const lip = pr * 0.3, yT = cy - gap / 2 + lip, yB = cy + gap / 2 - lip;
          for (let q = 0; q < S * per; q++) {
            const i = start + q, s = q % S, f = Math.floor(q / S) / (per - 1);
            const bow = Math.sin(Math.PI * f);
            const sx = cx + ((s + 0.5) / S - 0.5) * rx * 1.05 + Math.sin(s * 3.1) * rx * 0.07 + Math.sin(t * 1.3 + s) * 6 * bow;
            const sy = yT + (yB - yT) * f + bow * gap * 0.07;
            const sr = (6.5 + 14 * (1 - bow) * (1 - bow)) * (0.6 + 0.4 * strand);
            o.x[i] += (sx - o.x[i]) * strand; o.y[i] += (sy - o.y[i]) * strand; o.r[i] += (sr - o.r[i]) * strand;
          }
        }
        return o;
      },
      pixel(o, t, { cx, cy, size = 10 }) {
        for (let i = 0; i < N; i++) { o.x[i] = cx + (sa[i] - 0.5) * 2; o.y[i] = cy + (sb[i] - 0.5) * 2; o.r[i] = size; }
        return o;
      },
      grid(o, t, { cx, cy, cell = 30, n = 6 }) {
        for (let i = 0; i < N; i++) {
          const k = perm[i] % (n * n), gx = k % n, gy = Math.floor(k / n);
          const hop = Math.pow(Math.max(0, Math.sin(t * 2.2 + k * 2.31)), 14) * cell * 0.7;
          o.x[i] = cx + (gx - (n - 1) / 2) * cell + (sa[i] - 0.5) * 2;
          o.y[i] = cy + (gy - (n - 1) / 2) * cell - hop + (sb[i] - 0.5) * 2;
          o.r[i] = cell * 0.4;
        }
        return o;
      },
      ring(o, t, { l, t: top, w, h, pad = 28, speed = 0.4, thick = 22 }) {
        const cx = l + w / 2, cy = top + h / 2, rx = w / 2 + pad, ry = h / 2 + pad;
        for (let i = 0; i < N; i++) {
          const th = (perm[i] / N) * TAU + t * speed;
          const out = sc[i] > 0.965 ? 26 + Math.sin(t * 2 + i) * 10 : 0;
          const band = (sa[i] - 0.5) * thick + out;
          const sx = Math.cos(th), sy = Math.sin(th);
          // superellipse so it hugs rectangles
          const k = 4, den = Math.pow(Math.pow(Math.abs(sx), k) + Math.pow(Math.abs(sy), k), 1 / k);
          o.x[i] = cx + (sx / den) * (rx + band);
          o.y[i] = cy + (sy / den) * (ry + band);
          o.r[i] = 11 + 6 * sb[i];
        }
        return o;
      },
      fill(o, t, { l, t: top, w, h, wave = 0 }) {
        const cols = Math.max(1, Math.ceil(Math.sqrt(N * w / Math.max(1, h)))), rows = Math.ceil(N / cols);
        const cw = w / cols, ch = h / rows, rad = Math.max(cw, ch) * 1.35 + 10;
        for (let i = 0; i < N; i++) {
          const k = perm[i], col = k % cols, row = Math.floor(k / cols);
          let px = l + (col + 0.5) * cw + (sa[i] - 0.5) * cw * 0.6, py = top + (row + 0.5) * ch + (sb[i] - 0.5) * ch * 0.6;
          if (wave && row === 0) py += Math.sin(px * 0.012 + t * 2.4) * wave;
          o.x[i] = px + Math.sin(t * 1.3 + sc[i] * 9) * 4; o.y[i] = py + Math.cos(t * 1.1 + sa[i] * 9) * 4;
          o.r[i] = rad;
        }
        return o;
      },
      serpent(o, t, { trail, width = 46 }) {
        const L = trail.length / 2;
        for (let i = 0; i < N; i++) {
          const u = sa[i];
          const f = u * (L - 1), j = Math.floor(f), q = f - j;
          const j2 = Math.min(L - 1, j + 1);
          const px = trail[j * 2] + (trail[j2 * 2] - trail[j * 2]) * q;
          const py = trail[j * 2 + 1] + (trail[j2 * 2 + 1] - trail[j * 2 + 1]) * q;
          const tx = trail[j2 * 2] - trail[j * 2], ty = trail[j2 * 2 + 1] - trail[j * 2 + 1];
          const tl = Math.hypot(tx, ty) || 1;
          const taper = width * (1.05 - u * 0.8);
          const side = (sb[i] - 0.5) * taper * 0.9;
          o.x[i] = px - (ty / tl) * side; o.y[i] = py + (tx / tl) * side;
          o.r[i] = taper * 0.62 + 3;
        }
        return o;
      },
      word(o, t, { text, cx, cy, width }) {
        const wd = word(text, { width });
        for (let i = 0; i < N; i++) {
          o.x[i] = cx + wd.pts[i * 2] + Math.sin(t * 1.6 + sc[i] * 7) * 1.2;
          o.y[i] = cy + wd.pts[i * 2 + 1] + Math.cos(t * 1.4 + sa[i] * 7) * 1.2;
          o.r[i] = wd.r;
        }
        return o;
      },
      drops(o, t, { pts, R = 22 }) {
        const K = pts.length;
        for (let i = 0; i < N; i++) {
          const k = perm[i] % K, p = pts[k];
          const rr = R * 0.75 * Math.sqrt(sa[i]), th = sb[i] * TAU + t * (0.4 + sc[i]);
          o.x[i] = p.x + Math.cos(th) * rr; o.y[i] = p.y + Math.sin(th) * rr + Math.sin(t * 2 + k) * 3;
          o.r[i] = R * 0.38 + 2;
        }
        return o;
      },
      spikes(o, t, { cx, cy, R = 110 }) {
        const K = 15;
        for (let i = 0; i < N; i++) {
          const ray = perm[i] % K, u = sa[i];
          const ang = (ray / K) * TAU + t * 0.25 + Math.sin(t * 3 + ray) * 0.05;
          const len = R * (0.15 + 1.5 * u * u) * (1 + 0.2 * Math.sin(t * 6 + ray * 2));
          o.x[i] = cx + Math.cos(ang) * len; o.y[i] = cy + Math.sin(ang) * len;
          o.r[i] = R * 0.3 * (1 - u * 0.88) + 2.5;
        }
        return o;
      },
      /* an accretion disc: spiral arms that stream inward around a dense core */
      vortex(o, t, { cx, cy, R, spin = 0, arms = 3, flow = 0.2, tilt = 0.6 }) {
        const pr = Math.min(R * 0.1, 56) + 3;
        for (let i = 0; i < N; i++) {
          const a = sa[i], b = sb[i], c = sc[i];
          if (c < 0.2) {                                 // the core
            const rr = R * 0.15 * Math.sqrt(a), th = b * TAU + spin * 1.5;
            o.x[i] = cx + Math.cos(th) * rr; o.y[i] = cy + Math.sin(th) * rr;
            o.r[i] = R * 0.1 + 3;
            continue;
          }
          const u = (((a - t * flow) % 1) + 1) % 1;      // falls inward, then re-enters at the rim
          const arm = perm[i] % arms;
          const th = (arm / arms) * TAU + u * 4.2 - spin;
          const rr = R * (0.14 + 0.86 * u);
          const w = R * 0.055 * (0.35 + u) * (b - 0.5) * 2;
          const px = Math.cos(th) * rr - Math.sin(th) * w, py = Math.sin(th) * rr + Math.cos(th) * w;
          o.x[i] = cx + px; o.y[i] = cy + py * tilt;
          const fade = Math.min(1, u / 0.08) * Math.min(1, (1 - u) / 0.12);
          o.r[i] = pr * (0.35 + 0.8 * u) * fade + 0.5;
        }
        return o;
      },
      /* inside the creature: walls line every edge of the screen, squeezing in slow waves,
         with strands of liquid hanging between them */
      gut(o, t, { W: w, H: h, thick = 36 }) {
        const per = 2 * (w + h), SN = 9;
        for (let i = 0; i < N; i++) {
          const c = sc[i];
          if (c > 0.92) {                                // strands
            const k = perm[i] % SN, f = sa[i], top = k % 2 === 0;
            const len = thick * (1.4 + 2.2 * Math.pow(Math.sin(t * 0.7 + k * 1.9), 2));
            const sx = w * ((k + 0.5) / SN) + Math.sin(k * 3.7) * w * 0.03 + Math.sin(t * 1.1 + k + f * 2) * 6 * f;
            o.x[i] = sx; o.y[i] = top ? thick * 0.4 + f * len : h - thick * 0.4 - f * len;
            o.r[i] = thick * 0.5 * (1 - f * 0.65) + 3;
            continue;
          }
          const s = (sa[i] * per + t * 24) % per;
          let x, y, nx, ny;
          if (s < w) { x = s; y = 0; nx = 0; ny = 1; }
          else if (s < w + h) { x = w; y = s - w; nx = -1; ny = 0; }
          else if (s < 2 * w + h) { x = w - (s - w - h); y = h; nx = 0; ny = -1; }
          else { x = 0; y = h - (s - 2 * w - h); nx = 1; ny = 0; }
          const wave = 0.5 + 0.5 * Math.sin(s * 0.009 - t * 2.1);
          const d = thick * (0.3 + 0.9 * wave) * sb[i];
          o.x[i] = x + nx * d; o.y[i] = y + ny * d;
          o.r[i] = thick * (0.45 + 0.4 * wave) + 2;
        }
        return o;
      },
      /* reroutes `count` droplets (from the end, skipping `from`) into a chain reaching from the blob toward a point */
      tendril(o, t, { cx, cy, R, tx, ty, amt = 1, count = 40, from = 0 }) {
        if (amt < 0.01) return o;
        const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy) || 1;
        const len = Math.min(d, R * 2.6) * amt, ux = dx / d, uy = dy / d;
        for (let j = 0; j < count; j++) {
          const i = N - 1 - from - j, f = (j + 1) / count;
          const sway = Math.sin(t * 3 + f * 6) * 14 * f;
          o.x[i] = cx + ux * len * (0.3 + 0.7 * f) - uy * sway;
          o.y[i] = cy + uy * len * (0.3 + 0.7 * f) + ux * sway;
          o.r[i] = R * 0.24 * (1 - f * 0.72) + 4;
        }
        return o;
      },
    };

    /* ---------- physics ---------- */
    const impulses = [];
    function splash(px, py, power = 1) { if (impulses.length < 5) impulses.push({ x: px, y: py, p: power, age: 0 }); }
    function step(dt, T, opt = {}) {
      const K = opt.k || 30, mx = opt.mx, my = opt.my, rep = opt.repel || 0;
      const rk = 1 - Math.exp(-dt * 7);
      // ripples travel outward through the liquid; it wobbles but stays whole
      for (let q = impulses.length - 1; q >= 0; q--) { impulses[q].age += dt; if (impulses[q].age > 1.6) impulses.splice(q, 1); }
      for (let i = 0; i < N; i++) {
        const k = K * kk[i], damp = 1.25 * Math.sqrt(k);
        let tx = T.x[i], ty = T.y[i];
        for (const imp of impulses) {
          const dx = tx - imp.x, dy = ty - imp.y, d = Math.hypot(dx, dy) || 1;
          const front = imp.age * 520, band = d - front;
          if (band > -160 && band < 60) {
            const amp = 30 * imp.p * Math.exp(-imp.age * 2.2) * Math.exp(-d / 700);
            const w = Math.sin(band * 0.045) * Math.exp(-(band * band) / 9000);
            tx += (dx / d) * amp * w; ty += (dy / d) * amp * w;
          }
        }
        let ax = (tx - x[i]) * k - vx[i] * damp, ay = (ty - y[i]) * k - vy[i] * damp;
        if (rep) {
          const dx = x[i] - mx, dy = y[i] - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 95) * 9000 * rep; ax += (dx / d) * f; ay += (dy / d) * f; }
        }
        vx[i] += ax * dt; vy[i] += ay * dt;
        x[i] += vx[i] * dt; y[i] += vy[i] * dt;
        r[i] += (T.r[i] - r[i]) * rk;
        inst[i * 3] = x[i]; inst[i * 3 + 1] = y[i]; inst[i * 3 + 2] = Math.min(maxR, Math.max(0.5, r[i]));
      }
      instAttr.needsUpdate = true;
    }
    function snap(T) { x.set(T.x); y.set(T.y); r.set(T.r); vx.fill(0); vy.fill(0); }

    let frontDirty = false, time = 0, backUp = false;
    function render(occlude, moodColor, dt) {
      time += dt;
      shadeMat.uniforms.uTime.value = time;
      if (moodColor) mood.copy(moodColor);
      renderer.setRenderTarget(field); renderer.clear(); renderer.render(fScene, cam);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(sScene, cam);
      // phones: copying the GL canvas into a 2D canvas every frame stalls the GPU,
      // so the liquid canvas itself steps in front of the page instead
      if (small) {
        const up = occlude > 0.5;
        if (up !== backUp) { back.style.zIndex = up ? 3 : ''; backUp = up; }
      } else if (occlude > 0.004) {
        fctx.clearRect(0, 0, front.width, front.height);
        fctx.globalAlpha = Math.min(1, occlude);
        fctx.drawImage(back, 0, 0);
        frontDirty = true;
      } else if (frontDirty) { fctx.clearRect(0, 0, front.width, front.height); frontDirty = false; }
    }

    resize();
    addEventListener('resize', resize);
    return { N, F, buf, mix, combine, step, snap, render, splash, word, mood, THREE, get W() { return W; }, get H() { return H; } };
  };
})();
