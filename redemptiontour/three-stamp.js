import * as THREE from '../vendor/three.module.js';

const canvas = document.getElementById('stamp-stage');
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x100b08, 1);
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x120c08, 9, 32);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80);
  camera.position.set(0, 3.2, 10.8);
  const overlayScene = new THREE.Scene();
  const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const rig = new THREE.Group();
  scene.add(rig);

  const colors = {
    ink: 0x17100b,
    paper: 0xf2dfbd,
    paperDim: 0xb9995c,
    red: 0xcf3a22,
    redDark: 0x7e1f12,
    gold: 0xf1bd45,
    teal: 0x1f8a82,
    warm: 0xffd77a,
    chrome: 0xd8d1bd,
  };

  const mats = {
    ink: new THREE.MeshStandardMaterial({ color: colors.ink, roughness: 0.82, metalness: 0.08 }),
    red: new THREE.MeshStandardMaterial({ color: colors.red, roughness: 0.64, metalness: 0.02 }),
    gold: new THREE.MeshStandardMaterial({ color: colors.gold, roughness: 0.38, metalness: 0.42, emissive: 0x8b5200, emissiveIntensity: 0.42 }),
    teal: new THREE.MeshStandardMaterial({ color: colors.teal, roughness: 0.58, metalness: 0.06, emissive: 0x063f39, emissiveIntensity: 0.34 }),
    paper: new THREE.MeshStandardMaterial({ color: colors.paper, roughness: 0.9, metalness: 0 }),
    paperDim: new THREE.MeshStandardMaterial({ color: colors.paperDim, roughness: 0.92, metalness: 0 }),
    bulb: new THREE.MeshStandardMaterial({ color: colors.warm, emissive: colors.warm, emissiveIntensity: 2.2, roughness: 0.28 }),
  };

  scene.add(new THREE.HemisphereLight(0xffe3ae, 0x120806, 1.2));
  const key = new THREE.DirectionalLight(0xffd28a, 2.1);
  key.position.set(-4, 8, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x49c7b6, 24, 18);
  rim.position.set(5, 4.3, 2.2);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff9a4f, 28, 18);
  warm.position.set(-4.2, 3.2, 3.6);
  scene.add(warm);

  function canvasTexture(width, height, draw) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    draw(ctx, width, height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const signTexture = canvasTexture(1536, 768, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fff0c9');
    grad.addColorStop(0.54, '#e7c98e');
    grad.addColorStop(1, '#b88632');
    ctx.fillStyle = grad;
    roundRect(ctx, 32, 40, w - 64, h - 80, 44);
    ctx.fill();
    ctx.strokeStyle = '#1b1611';
    ctx.lineWidth = 24;
    ctx.stroke();
    ctx.strokeStyle = '#cf3a22';
    ctx.lineWidth = 8;
    roundRect(ctx, 82, 86, w - 164, h - 172, 30);
    ctx.stroke();
    ctx.fillStyle = '#1b1611';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 148px Anton, Impact, sans-serif';
    ctx.fillText('ONE DATE', w / 2, 245);
    ctx.fillStyle = '#cf3a22';
    ctx.fillText('ONE SHOT', w / 2, 382);
    ctx.font = '700 96px Caveat, cursive';
    ctx.fillStyle = '#a82a16';
    ctx.fillText('the redemption tour', w / 2, 520);
    ctx.font = '700 36px Courier New, monospace';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#4a3f31';
    ctx.fillText('LIVE IN CHICAGO', w / 2, 628);
  });

  const ticketTexture = canvasTexture(1024, 420, (ctx, w, h) => {
    ctx.fillStyle = '#efe3cc';
    roundRect(ctx, 18, 18, w - 36, h - 36, 26);
    ctx.fill();
    ctx.strokeStyle = '#1b1611';
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.fillStyle = '#cf3a22';
    ctx.fillRect(46, 48, w - 92, 68);
    ctx.fillStyle = '#efe3cc';
    ctx.font = '900 54px Anton, Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ADMIT ONE', 72, 101);
    ctx.fillStyle = '#1b1611';
    ctx.font = '900 116px Anton, Impact, sans-serif';
    ctx.fillText('FRONT ROW', 70, 238);
    ctx.font = '700 58px Caveat, cursive';
    ctx.fillStyle = '#c2901f';
    ctx.fillText('redemption tour', 74, 306);
    ctx.fillStyle = '#4a3f31';
    ctx.font = '700 28px Courier New, monospace';
    ctx.fillText('JUN 3-6 · CHICAGO', 76, 358);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = i % 3 ? '#1b1611' : '#cf3a22';
      ctx.fillRect(w - 250 + i * 7, 145, 3 + (i % 4) * 3, 180);
    }
  });

  const photoTexture = new THREE.TextureLoader().load('assets/matt-star.jpg');
  photoTexture.colorSpace = THREE.SRGBColorSpace;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x150f0a, roughness: 0.78, metalness: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.25;
  rig.add(floor);

  const grid = new THREE.GridHelper(42, 34, 0x9a6b28, 0x2f2218);
  grid.position.y = -1.22;
  grid.material.opacity = 0.28;
  grid.material.transparent = true;
  rig.add(grid);

  const skyline = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const x = -16 + i * 1.28;
    const h = 1.2 + ((i * 7) % 9) * 0.34;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.8 + (i % 3) * 0.18, h, 0.55 + (i % 2) * 0.18),
      i % 5 === 0 ? mats.teal : mats.ink
    );
    b.position.set(x, -1.25 + h / 2, -8.5 - (i % 4) * 0.18);
    skyline.add(b);

    for (let r = 0; r < Math.max(2, Math.floor(h * 1.35)); r++) {
      const lit = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.018), i % 2 ? mats.gold : mats.bulb);
      lit.position.set(x + ((r % 3) - 1) * 0.18, -0.62 + r * 0.34, b.position.z + 0.3);
      skyline.add(lit);
    }
  }
  rig.add(skyline);

  const marquee = new THREE.Group();
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 3.7, 0.28),
    [
      mats.gold, mats.gold, mats.gold, mats.gold,
      new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.72, metalness: 0.02, emissive: 0x352000, emissiveIntensity: 0.18 }),
      mats.red,
    ]
  );
  sign.position.set(0, 2.5, -2.4);
  marquee.add(sign);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(1.08, 5.5, 0.36), mats.red);
  blade.position.set(-4.8, 3.4, -2.62);
  blade.rotation.z = -0.04;
  marquee.add(blade);

  const bladeFace = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 4.78), new THREE.MeshStandardMaterial({ color: colors.paper, emissive: 0x4d2d05, emissiveIntensity: 0.18, roughness: 0.9 }));
  bladeFace.position.set(-4.8, 3.4, -2.42);
  marquee.add(bladeFace);

  const bulbGeometry = new THREE.SphereGeometry(0.075, 12, 8);
  const bulbPositions = [];
  for (let i = 0; i < 18; i++) {
    bulbPositions.push([-3.62 + i * 0.426, 4.44, -2.18]);
    bulbPositions.push([-3.62 + i * 0.426, 0.56, -2.18]);
  }
  for (let i = 0; i < 8; i++) {
    bulbPositions.push([-3.94, 0.86 + i * 0.48, -2.18]);
    bulbPositions.push([3.94, 0.86 + i * 0.48, -2.18]);
  }
  bulbPositions.forEach((p, i) => {
    const bulb = new THREE.Mesh(bulbGeometry, mats.bulb.clone());
    bulb.position.set(p[0], p[1], p[2]);
    bulb.userData.phase = i * 0.27;
    marquee.add(bulb);
  });

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 2.3),
    new THREE.MeshStandardMaterial({ map: photoTexture, roughness: 0.7, metalness: 0 })
  );
  photo.position.set(4.95, 2.4, -2.05);
  photo.rotation.y = -0.24;
  marquee.add(photo);

  rig.add(marquee);

  const tickets = [];
  for (let i = 0; i < 9; i++) {
    const mat = new THREE.MeshStandardMaterial({
      map: ticketTexture,
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.86,
    });
    const t = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), mat);
    const side = i % 2 ? -1 : 1;
    t.position.set(side * (4.8 + (i % 3) * 1.35), 0.2 + (i % 5) * 0.78, -0.6 - i * 0.35);
    t.rotation.set(-0.12 + i * 0.02, side * (0.46 + i * 0.03), side * (0.22 + i * 0.05));
    t.userData = { base: t.position.clone(), phase: i * 0.73, spin: side };
    tickets.push(t);
    rig.add(t);
  }

  function coneBeam(color, x, z, ry) {
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(1.05, 8.5, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    beam.position.set(x, 1.92, z);
    beam.rotation.set(Math.PI / 2, ry, 0);
    beam.userData = { baseY: ry };
    rig.add(beam);
    return beam;
  }
  const beams = [
    coneBeam(0xffc15d, -5.6, 2.2, -0.52),
    coneBeam(0x43c5b6, 5.6, 1.8, 0.52),
    coneBeam(0xcf3a22, 0, 3.3, 0),
  ];

  const particleCount = 780;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color(0xffd776),
    new THREE.Color(0xcf3a22),
    new THREE.Color(0x58c7b6),
    new THREE.Color(0xf3dfb8),
  ];
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 24;
    particlePositions[i * 3 + 1] = Math.random() * 9 - 0.3;
    particlePositions[i * 3 + 2] = Math.random() * -13 + 4.5;
    const c = palette[i % palette.length];
    particleColors[i * 3] = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  rig.add(particles);

  const foregroundCount = 180;
  const foregroundPositions = new Float32Array(foregroundCount * 3);
  const foregroundColors = new Float32Array(foregroundCount * 3);
  const foregroundPalette = [
    new THREE.Color(0xffd776),
    new THREE.Color(0xcf3a22),
    new THREE.Color(0x58c7b6),
    new THREE.Color(0xf3dfb8),
  ];
  for (let i = 0; i < foregroundCount; i++) {
    const side = i % 2 ? -1 : 1;
    foregroundPositions[i * 3] = side * (1.1 + Math.random() * 4.3);
    foregroundPositions[i * 3 + 1] = -0.8 + Math.random() * 6.8;
    foregroundPositions[i * 3 + 2] = 1.2 + Math.random() * 4.2;
    const c = foregroundPalette[i % foregroundPalette.length];
    foregroundColors[i * 3] = c.r;
    foregroundColors[i * 3 + 1] = c.g;
    foregroundColors[i * 3 + 2] = c.b;
  }
  const foregroundGeo = new THREE.BufferGeometry();
  foregroundGeo.setAttribute('position', new THREE.BufferAttribute(foregroundPositions, 3));
  foregroundGeo.setAttribute('color', new THREE.BufferAttribute(foregroundColors, 3));
  const foregroundParticles = new THREE.Points(
    foregroundGeo,
    new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  foregroundParticles.renderOrder = 900;
  scene.add(foregroundParticles);

  const sparkleTexture = canvasTexture(128, 128, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(255,215,118,.95)');
    grad.addColorStop(0.46, 'rgba(207,58,34,.4)');
    grad.addColorStop(1, 'rgba(207,58,34,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
  const overlaySparkles = new THREE.Group();
  const overlayColors = [0xffd776, 0xcf3a22, 0x58c7b6, 0xf3dfb8];
  for (let i = 0; i < 70; i++) {
    const material = new THREE.SpriteMaterial({
      map: sparkleTexture,
      color: overlayColors[i % overlayColors.length],
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set((Math.random() - 0.5) * 1.86, (Math.random() - 0.5) * 1.76, 0);
    sprite.scale.setScalar(0.075 + Math.random() * 0.15);
    sprite.userData = {
      base: sprite.position.clone(),
      phase: i * 0.41,
      scale: sprite.scale.x,
    };
    overlaySparkles.add(sprite);
  }
  overlayScene.add(overlaySparkles);

  const overlayHalos = new THREE.Group();
  [
    [-0.82, 0.66, 0xffd776, 0.72],
    [0.78, 0.58, 0x58c7b6, 0.62],
    [-0.72, -0.24, 0xcf3a22, 0.56],
    [0.7, -0.42, 0xffd776, 0.66],
    [0, 0.06, 0xf3dfb8, 0.44],
  ].forEach(([x, y, color, scale], i) => {
    const material = new THREE.SpriteMaterial({
      map: sparkleTexture,
      color,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(material);
    halo.position.set(x, y, 0);
    halo.scale.set(scale, scale, 1);
    halo.userData = { phase: i * 0.8, scale };
    overlayHalos.add(halo);
  });
  overlayScene.add(overlayHalos);

  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;
  let last = performance.now();

  function resize() {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 720 ? 1.35 : 1.55));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 720 ? 56 : 44;
    rig.scale.setScalar(width < 720 ? 0.86 : 1);
    camera.position.z = width < 720 ? 11.8 : 10.8;
    camera.position.y = width < 720 ? 3.45 : 3.2;
    camera.updateProjectionMatrix();
  }

  function animate(now) {
    resize();
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const t = now * 0.001;
    const compact = width < 720 || window.getComputedStyle(canvas).zIndex === '7000';

    rig.rotation.y += ((pointerX * 0.055) - rig.rotation.y) * 0.04;
    rig.rotation.x += ((-pointerY * 0.025) - rig.rotation.x) * 0.04;
    marquee.position.y = Math.sin(t * 0.9) * 0.035;
    particles.rotation.y = Math.sin(t * 0.08) * 0.08;

    for (const ticket of tickets) {
      const p = ticket.userData.phase;
      ticket.position.y = ticket.userData.base.y * (compact ? 0.82 : 1) + Math.sin(t * 0.9 + p) * 0.28;
      ticket.position.x = ticket.userData.base.x * (compact ? 0.46 : 1) + Math.sin(t * 0.45 + p) * 0.22;
      ticket.material.opacity = compact ? 0.38 : 0.86;
      ticket.rotation.z += dt * 0.11 * ticket.userData.spin;
      ticket.rotation.y += dt * 0.08 * ticket.userData.spin;
    }

    for (const child of marquee.children) {
      if (child.userData && child.userData.phase !== undefined && child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = 1.6 + Math.pow(Math.sin(t * 5.2 + child.userData.phase) * 0.5 + 0.5, 3) * 1.4;
      }
    }
    beams.forEach((beam, i) => {
      beam.rotation.y = beam.userData.baseY + Math.sin(t * 0.62 + i) * 0.18;
      beam.material.opacity = (compact ? 0.16 : 0.09) + (Math.sin(t * 1.2 + i * 1.7) * 0.5 + 0.5) * (compact ? 0.1 : 0.06);
    });

    particles.material.size = compact ? 0.05 : 0.035;
    particles.material.opacity = compact ? 0.34 : 0.58;
    foregroundParticles.material.size = compact ? 0 : 3;
    foregroundParticles.material.opacity = compact ? 0 : 0.4;
    foregroundParticles.rotation.z = Math.sin(t * 0.15) * 0.045;
    foregroundParticles.rotation.y = Math.sin(t * 0.1) * 0.08;
    overlaySparkles.children.forEach((sprite, i) => {
      const p = sprite.userData.phase;
      sprite.position.x = sprite.userData.base.x + Math.sin(t * 0.26 + p) * 0.035;
      sprite.position.y = sprite.userData.base.y + Math.sin(t * 0.48 + p) * 0.05;
      sprite.material.opacity = compact
        ? 0.08 + (Math.sin(t * 1.35 + i) * 0.5 + 0.5) * 0.16
        : 0;
      sprite.scale.setScalar(sprite.userData.scale * (0.82 + Math.sin(t * 1.1 + p) * 0.18));
    });
    overlayHalos.children.forEach((halo, i) => {
      halo.material.opacity = compact
        ? 0.07 + (Math.sin(t * 0.9 + halo.userData.phase) * 0.5 + 0.5) * 0.08
        : 0;
      const scale = halo.userData.scale * (1 + Math.sin(t * 0.7 + i) * 0.06);
      halo.scale.set(scale, scale, 1);
    });

    camera.lookAt(0, 1.65, -1.35);
    renderer.clear();
    renderer.render(scene, camera);
    if (compact) {
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCamera);
    }
    if (!reducedMotion) raf = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / Math.max(1, window.innerWidth)) - 0.5;
    pointerY = (event.clientY / Math.max(1, window.innerHeight)) - 0.5;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!raf && !reducedMotion) {
      last = performance.now();
      raf = requestAnimationFrame(animate);
    }
  });

  resize();
  renderer.render(scene, camera);
  if (!reducedMotion) raf = requestAnimationFrame(animate);
}
