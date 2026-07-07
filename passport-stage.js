import * as THREE from './vendor/three.module.js';

const canvas = document.getElementById('passport-stage');
const frame = document.getElementById('s4frame');
const song = document.getElementById('s4song');
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Opening the passport leads straight into the current reveal (The Residency),
// unless we arrived in "browse mode" (?tours) from the Past Tours button, which
// keeps the stamp archive reachable without a redirect loop.
const browseMode = /[?&](tours|past|passport|browse)/i.test(location.search);

const COLORS = {
  burgundy: '#5d1a1c',
  burgundyDeep: '#230709',
  red: '#9c2c25',
  navy: '#274066',
  green: '#2f5d43',
  gold: '#cba14a',
  goldBright: '#f1d986',
  paper: '#f3e7cb',
  paperWarm: '#e1d0a7',
  ink: '#241a12',
};

const BASE_DESTINATIONS = [
  { no: 'SPECIAL EDITION', title: 'The Movie', place: 'THE STORY SO FAR', date: 'SEASON FIVE', href: 'themovie/', kind: 'gold', rot: -3, glow: true, go: 'TAP TO PLAY' },
  { no: 'STAMP I', title: 'The Redemption Tour', place: 'CHICAGO - ILLINOIS', date: 'JUN 6 - 2025', href: 'redemptiontour/', kind: 'red', rot: -3, go: 'RE-ENTER' },
  { no: 'STAMP II', title: 'Season Two', place: 'CHICAGO - ILLINOIS', date: 'JUN 13 - 2026', href: 'next/', kind: 'navy', rot: 2, go: 'RE-ENTER' },
  { no: 'STAMP III', title: 'Season Three', place: "THE ONE AT JOSIE'S", date: 'JUN 20 - 2026', href: 'homeshow/', kind: 'red', rot: -2, go: 'RE-ENTER' },
  { no: 'III - SPECIAL', title: 'After Dark', place: 'DINNER & A MOVIE', date: 'JUN 20 - 2026', href: 'afterdark/', kind: 'navy', rot: 2, go: 'RE-ENTER' },
];

function capture(event, props) {
  try {
    if (window.posthog) window.posthog.capture(event, props || {});
  } catch (error) {
    // Analytics should never break the date book.
  }
}

function seasonFourFromRsvp(source) {
  let rsvp = source;
  if (!rsvp) {
    try { rsvp = JSON.parse(localStorage.getItem('next-date-rsvp') || 'null'); } catch (error) { rsvp = null; }
  }
  if (rsvp && rsvp.stamp === 'IV' && rsvp.mode && rsvp.mode !== 'neither') {
    return {
      no: 'STAMP IV',
      title: 'Season Four',
      place: 'THE ONE WITH WED WOBBIN',
      date: String(rsvp.day || 'JUL 3').toUpperCase(),
      href: 'stars/',
      kind: 'navy',
      rot: -2,
      go: "YOU'RE IN",
      seasonFour: true,
      entered: true,
    };
  }
  return {
    no: 'STAMP IV',
    title: 'Season Four',
    place: 'THE ONE WITH WED WOBBIN',
    date: 'PRESS HERE',
    href: 'stars/',
    kind: 'green',
    rot: -2,
    go: 'LOOK UP',
    seasonFour: true,
    glow: true,
  };
}

// The newest stamp in the book: the July 2-3 weekend, filed under The Residency.
const OPENING_NIGHT = {
  no: 'THE RESIDENCY',
  title: 'Opening Night',
  place: 'THE ONE WHERE SHE SAID YES',
  date: 'JUL 2-3 2026',
  href: 'openingnight/',
  kind: 'gold',
  rot: -2,
  glow: true,
  go: 'RELIVE IT',
};

let destinations = [...BASE_DESTINATIONS, seasonFourFromRsvp(), OPENING_NIGHT];

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function trackedText(ctx, text, x, y, spacing) {
  const chars = String(text).split('');
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, chars.length - 1);
  let cursor = x - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cursor + widths[i] / 2, y);
    cursor += widths[i] + spacing;
  }
}

function fitText(ctx, text, x, y, maxWidth, options) {
  const { family, weight = '700', size = 44, min = 18, color = COLORS.ink, align = 'center' } = options;
  let fontSize = size;
  do {
    ctx.font = `${weight} ${fontSize}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth || fontSize <= min) break;
    fontSize -= 2;
  } while (fontSize > min);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function makeTexture(width, height, draw) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = width;
  textureCanvas.height = height;
  const ctx = textureCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function drawPaper(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#fff4d4');
  grad.addColorStop(0.55, COLORS.paper);
  grad.addColorStop(1, COLORS.paperWarm);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(95, 67, 33, .18)';
  ctx.lineWidth = 2;
  for (let y = 58; y < h; y += 48) {
    ctx.beginPath();
    ctx.moveTo(44, y);
    ctx.lineTo(w - 44, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(167, 126, 47, .65)';
  ctx.lineWidth = 8;
  roundedRect(ctx, 32, 32, w - 64, h - 64, 28);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(36, 26, 18, .14)';
  ctx.lineWidth = 2;
  roundedRect(ctx, 58, 58, w - 116, h - 116, 22);
  ctx.stroke();
}

function makeCoverTexture() {
  return makeTexture(1600, 1050, (ctx, w, h) => {
    const base = ctx.createRadialGradient(w * 0.54, h * 0.1, 120, w * 0.5, h * 0.55, h * 0.9);
    base.addColorStop(0, '#823033');
    base.addColorStop(0.34, COLORS.burgundy);
    base.addColorStop(1, COLORS.burgundyDeep);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#ffffff';
    for (let i = -w; i < w * 1.6; i += 34) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const sheen = ctx.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, 'rgba(255,255,255,.13)');
    sheen.addColorStop(0.22, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.72, 'rgba(241,217,134,.08)');
    sheen.addColorStop(1, 'rgba(0,0,0,.2)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 10;
    roundedRect(ctx, 205, 160, w - 410, h - 320, 18);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(241,217,134,.48)';
    ctx.lineWidth = 3;
    roundedRect(ctx, 244, 198, w - 488, h - 396, 12);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.goldBright;
    ctx.font = '800 26px Courier New, monospace';
    trackedText(ctx, 'PASSPORT  -  PASSEPORT', w / 2, 260, 8);

    ctx.strokeStyle = COLORS.goldBright;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, 395, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (const scale of [0.36, 0.68]) {
      ctx.beginPath();
      ctx.ellipse(w / 2, 395, 84 * scale, 84, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(w / 2 - 84, 395);
    ctx.lineTo(w / 2 + 84, 395);
    ctx.stroke();

    ctx.fillStyle = COLORS.goldBright;
    ctx.save();
    ctx.translate(w / 2, 395);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? 30 : 64;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font = '800 128px Playfair Display, Georgia, serif';
    ctx.fillText('PASSPORT', w / 2, 600);
    ctx.font = '700 28px Courier New, monospace';
    trackedText(ctx, 'REPUBLIC OF GOOD DATES', w / 2, 680, 10);
    ctx.font = '700 22px Courier New, monospace';
    trackedText(ctx, 'THIS PASSPORT BELONGS TO', w / 2, 780, 7);
    ctx.font = '700 82px Caveat, cursive';
    ctx.fillText('Josie', w / 2, 845);
    ctx.font = '900 48px Courier New, monospace';
    trackedText(ctx, 'TAP TO OPEN', w / 2, 958, 10);
  });
}

function makeIdentityTexture() {
  return makeTexture(1300, 1800, (ctx, w, h) => {
    drawPaper(ctx, w, h);
    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '800 82px Playfair Display, Georgia, serif';
    ctx.fillText('Identity Page', 110, 220);

    ctx.font = '700 24px Courier New, monospace';
    ctx.fillStyle = 'rgba(36,26,18,.55)';
    trackedText(ctx, 'TYPE P - ADVENTURES', 250, 104, 5);
    trackedText(ctx, 'NO. MJ 0001', w - 220, 104, 5);

    const rows = [
      ['HOLDER', 'Josie Garay', 'ISSUED BY', 'Matt Yee'],
      ['NATIONALITY', 'Frequent Flyer', 'CLEARANCE', 'Front Row, Naturally'],
      ['DATE OF ISSUE', 'JUN 2026', 'EXPIRES', 'When the doodles say so'],
    ];
    rows.forEach((row, index) => {
      const y = 360 + index * 185;
      ctx.fillStyle = 'rgba(36,26,18,.48)';
      ctx.font = '700 25px Courier New, monospace';
      trackedText(ctx, row[0], 178, y, 5);
      trackedText(ctx, row[2], 776, y, 5);
      ctx.fillStyle = COLORS.ink;
      ctx.font = '800 42px Playfair Display, Georgia, serif';
      ctx.fillText(row[1], 110, y + 62);
      ctx.fillText(row[3], 705, y + 62);
    });

    ctx.strokeStyle = 'rgba(95, 67, 33, .26)';
    ctx.setLineDash([8, 9]);
    ctx.beginPath();
    ctx.moveTo(100, 930);
    ctx.lineTo(w - 100, 930);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(36,26,18,.48)';
    ctx.font = '700 25px Courier New, monospace';
    trackedText(ctx, 'AUTHORIZED SIGNATURE', 250, 1028, 5);
    trackedText(ctx, 'STAMPS COLLECTED', w - 230, 1028, 5);
    ctx.fillStyle = '#5d1a1c';
    ctx.font = '700 72px Caveat, cursive';
    ctx.fillText('Matt Yee', 110, 1098);
    ctx.fillStyle = '#5d1a1c';
    ctx.font = '800 52px Playfair Display, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(destinations.length), w - 150, 1094);

    ctx.fillStyle = 'rgba(36,26,18,.08)';
    roundedRect(ctx, 98, 1280, w - 196, 260, 14);
    ctx.fill();
    ctx.fillStyle = 'rgba(36,26,18,.72)';
    ctx.textAlign = 'left';
    ctx.font = '700 31px Courier New, monospace';
    ctx.fillText('P<GOODDATES<GARAY<<JOSIE<<<<<<<<<<<<<<<', 130, 1370);
    ctx.fillText('MATTYEE<<ADVENTURES<<ONGOING<<DOODLEAPPROVED<<', 130, 1450);
  });
}

function makeDestinationsTexture() {
  return makeTexture(1300, 1800, (ctx, w, h) => {
    drawPaper(ctx, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(36,26,18,.48)';
    ctx.font = '700 28px Courier New, monospace';
    trackedText(ctx, 'ENTRY STAMPS', w / 2, 150, 8);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '800 86px Playfair Display, Georgia, serif';
    ctx.fillText('Destinations', w / 2, 245);
    ctx.fillStyle = 'rgba(36,26,18,.66)';
    ctx.font = '700 31px Special Elite, Courier New, monospace';
    ctx.fillText('Every stamp is a date. Tap one to revisit.', w / 2, 315);
    ctx.strokeStyle = 'rgba(167,126,47,.38)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(170, 385);
    ctx.bezierCurveTo(420, 345, 900, 345, 1130, 385);
    ctx.stroke();
  });
}

function stampColor(kind) {
  if (kind === 'navy') return COLORS.navy;
  if (kind === 'green') return COLORS.green;
  if (kind === 'gold') return COLORS.gold;
  return COLORS.red;
}

function makeStampTexture(destination) {
  const accent = stampColor(destination.kind);
  return makeTexture(900, 470, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(246,235,204,.95)';
    roundedRect(ctx, 14, 14, w - 28, h - 28, 30);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 13;
    roundedRect(ctx, 22, 22, w - 44, h - 44, 27);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 14]);
    roundedRect(ctx, 56, 56, w - 112, h - 112, 18);
    ctx.stroke();
    ctx.setLineDash([]);

    if (destination.glow) {
      const glow = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
      glow.addColorStop(0, 'rgba(241,217,134,.32)');
      glow.addColorStop(1, 'rgba(241,217,134,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent;
    ctx.font = '700 28px Courier New, monospace';
    trackedText(ctx, destination.no, w / 2, 110, 7);
    fitText(ctx, destination.title, w / 2, 204, w - 150, {
      family: 'Playfair Display, Georgia, serif',
      weight: '800',
      size: 56,
      min: 34,
      color: COLORS.ink,
    });
    ctx.fillStyle = accent;
    ctx.font = '700 30px Courier New, monospace';
    trackedText(ctx, destination.place, w / 2, 273, 5);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    roundedRect(ctx, w / 2 - 112, 306, 224, 46, 23);
    ctx.stroke();
    fitText(ctx, destination.date, w / 2, 330, 186, {
      family: 'Courier New, monospace',
      weight: '700',
      size: 25,
      min: 18,
      color: COLORS.ink,
    });
    ctx.fillStyle = 'rgba(36,26,18,.72)';
    ctx.font = '700 26px Courier New, monospace';
    trackedText(ctx, destination.go || 'RE-ENTER', w / 2, 395, 5);
  });
}

function makeMovieCalloutTexture() {
  return makeTexture(1100, 560, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = COLORS.goldBright;
    ctx.fillStyle = 'rgba(93,26,28,.96)';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';

    roundedRect(ctx, 104, 40, 890, 238, 34);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(241,217,134,.48)';
    ctx.lineWidth = 5;
    roundedRect(ctx, 136, 72, 826, 174, 24);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.goldBright;
    ctx.font = '900 78px Courier New, monospace';
    trackedText(ctx, 'JOSIE', 550, 120, 16);
    ctx.font = '900 78px Playfair Display, Georgia, serif';
    ctx.fillText('TAP THE MOVIE', 550, 196);

    ctx.strokeStyle = COLORS.goldBright;
    ctx.fillStyle = COLORS.goldBright;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(442, 286);
    ctx.bezierCurveTo(370, 360, 268, 420, 128, 486);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(108, 494);
    ctx.lineTo(202, 424);
    ctx.lineTo(182, 532);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(36,26,18,.24)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(444, 300);
    ctx.bezierCurveTo(374, 368, 278, 430, 148, 486);
    ctx.stroke();
  });
}

function fadeAudio(to, ms) {
  if (!song) return;
  const from = song.volume || 0;
  const steps = 24;
  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    song.volume = Math.max(0, Math.min(1, from + (to - from) * step / steps));
    if (step >= steps) clearInterval(timer);
  }, ms / steps);
}

function openSeasonFour() {
  if (!frame) return;
  capture('season_four_opened');
  frame.innerHTML = '';
  const close = document.createElement('button');
  close.className = 's4close';
  close.id = 's4close';
  close.type = 'button';
  close.setAttribute('aria-label', 'close');
  close.textContent = 'x';
  const iframe = document.createElement('iframe');
  iframe.src = 'stars/?embed=1';
  iframe.allow = 'autoplay; gyroscope; accelerometer; fullscreen';
  frame.append(close, iframe);
  frame.classList.add('show');

  if (song) {
    try {
      song.currentTime = 0;
      song.volume = 0;
      const play = song.play();
      if (play && play.then) play.then(() => fadeAudio(0.85, 1500)).catch(() => {});
    } catch (error) {}
  }
  close.addEventListener('click', closeSeasonFour, { once: true });
}

function closeSeasonFour() {
  if (frame) {
    frame.classList.remove('show');
    setTimeout(() => { frame.innerHTML = ''; }, 500);
  }
  try { if (song) song.pause(); } catch (error) {}
}

if (!canvas) {
  throw new Error('Missing passport-stage canvas');
}

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setClearColor(0x12090a, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12090a);
scene.fog = new THREE.Fog(0x12090a, 16, 42);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
camera.position.set(0, 0.7, 12);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(10, 10);

const root = new THREE.Group();
const closedGroup = new THREE.Group();
const openGroup = new THREE.Group();
const stampGroup = new THREE.Group();
root.add(closedGroup, openGroup);
scene.add(root);

scene.add(new THREE.HemisphereLight(0xffedc5, 0x130407, 1.32));
const key = new THREE.DirectionalLight(0xffd889, 2.2);
key.position.set(-5.5, 6.5, 7);
scene.add(key);
const rim = new THREE.PointLight(0x8eb4ff, 34, 22);
rim.position.set(5.4, 3.6, 5.8);
scene.add(rim);
const warm = new THREE.PointLight(0xff9a53, 32, 22);
warm.position.set(-5.2, 3.2, 5.2);
scene.add(warm);

const coverTexture = makeCoverTexture();
const identityTexture = makeIdentityTexture();
const destinationsTexture = makeDestinationsTexture();

const mat = {
  burgundy: new THREE.MeshStandardMaterial({ color: 0x5d1a1c, roughness: 0.58, metalness: 0.04, emissive: 0x210305, emissiveIntensity: 0.15 }),
  burgundyDark: new THREE.MeshStandardMaterial({ color: 0x220607, roughness: 0.72, metalness: 0.02 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xcba14a, roughness: 0.3, metalness: 0.55, emissive: 0x4f3007, emissiveIntensity: 0.2 }),
  paper: new THREE.MeshStandardMaterial({ color: 0xf3e7cb, roughness: 0.88, metalness: 0 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false }),
};

const desk = new THREE.Mesh(
  new THREE.PlaneGeometry(44, 44),
  new THREE.MeshStandardMaterial({ color: 0x170708, roughness: 0.86, metalness: 0.02, emissive: 0x060202, emissiveIntensity: 0.28 })
);
desk.rotation.x = -Math.PI / 2;
desk.position.y = -3.22;
desk.position.z = -3.8;
scene.add(desk);

const grid = new THREE.GridHelper(42, 38, 0x815b27, 0x24100d);
grid.position.copy(desk.position);
grid.position.y += 0.02;
grid.material.transparent = true;
grid.material.opacity = 0.18;
scene.add(grid);

const coverHit = new THREE.Mesh(
  new THREE.PlaneGeometry(8.6, 5.9),
  new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
);
coverHit.name = 'cover-hit';

const coverShell = new THREE.Group();
const coverBody = new THREE.Mesh(new THREE.BoxGeometry(8.6, 5.85, 0.52), mat.burgundy);
const coverFace = new THREE.Mesh(
  new THREE.PlaneGeometry(8.0, 5.25),
  new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.63, metalness: 0.03, emissive: 0x220405, emissiveIntensity: 0.18 })
);
coverFace.position.z = 0.275;
const coverBack = new THREE.Mesh(new THREE.BoxGeometry(8.72, 5.97, 0.12), mat.burgundyDark);
coverBack.position.z = -0.32;
const spine = new THREE.Mesh(new THREE.BoxGeometry(0.26, 5.92, 0.7), mat.gold);
spine.position.x = -4.42;
coverHit.position.z = 0.36;
coverShell.add(coverBack, coverBody, coverFace, spine, coverHit);
closedGroup.add(coverShell);

const coverAura = new THREE.Mesh(
  new THREE.PlaneGeometry(10.4, 7.0),
  new THREE.MeshBasicMaterial({ color: 0xd9a74e, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending })
);
coverAura.position.z = -0.18;
closedGroup.add(coverAura);

const pageMaterialLeft = new THREE.MeshStandardMaterial({ map: identityTexture, roughness: 0.9, metalness: 0.01 });
const pageMaterialRight = new THREE.MeshStandardMaterial({ map: destinationsTexture, roughness: 0.9, metalness: 0.01 });
const leftPage = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.25, 0.1), [mat.paper, mat.paper, mat.paper, mat.paper, pageMaterialLeft, mat.paper]);
const rightPage = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.25, 0.1), [mat.paper, mat.paper, mat.paper, mat.paper, pageMaterialRight, mat.paper]);
leftPage.position.set(-2.27, 0.08, 0);
rightPage.position.set(2.27, 0.08, 0);
leftPage.rotation.set(0, 0.035, -0.012);
rightPage.rotation.set(0, -0.035, 0.012);

const gutter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.28, 0.16), mat.gold);
gutter.position.set(0, 0.08, 0.04);

const openShadow = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 7.1), mat.shadow);
openShadow.position.set(0, -0.22, -0.24);
openShadow.scale.set(1, 0.9, 1);
openGroup.add(openShadow, leftPage, rightPage, gutter, stampGroup);

const stampMeshes = [];
const stampPositions = [
  [-2.28, 1.66, 0.14],
  [2.28, 1.66, 0.14],
  [-2.28, 0.22, 0.15],
  [2.28, 0.22, 0.15],
  [-2.28, -1.22, 0.16],
  [2.28, -1.22, 0.16],
  [-2.28, -2.42, 0.17],
];

function clearStampMeshes() {
  for (const mesh of stampMeshes) {
    if (mesh.material.map) mesh.material.map.dispose();
    mesh.material.dispose();
    mesh.geometry.dispose();
    stampGroup.remove(mesh);
  }
  stampMeshes.length = 0;
}

function buildStampMeshes() {
  clearStampMeshes();
  destinations.forEach((destination, index) => {
    const [x, y, z] = stampPositions[index] || [0, 0, 0.18];
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.42, 1.26),
      new THREE.MeshStandardMaterial({
        map: makeStampTexture(destination),
        roughness: 0.76,
        metalness: 0.02,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(x, y, z);
    mesh.rotation.z = THREE.MathUtils.degToRad(destination.rot || 0);
    mesh.userData.destination = destination;
    mesh.userData.base = mesh.position.clone();
    mesh.userData.baseRot = mesh.rotation.z;
    mesh.userData.phase = index * 0.72;
    mesh.userData.baseScale = 1;
    stampGroup.add(mesh);
    stampMeshes.push(mesh);
  });
}
buildStampMeshes();

const movieCallout = new THREE.Group();
const movieCalloutSign = new THREE.Mesh(
  new THREE.PlaneGeometry(3.9, 1.98),
  new THREE.MeshStandardMaterial({
    map: makeMovieCalloutTexture(),
    transparent: true,
    roughness: 0.74,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
);
movieCalloutSign.renderOrder = 18;
movieCalloutSign.userData.destination = destinations[0];
movieCallout.add(movieCalloutSign);
movieCallout.position.set(-1.34, 2.43, 0.48);
movieCallout.rotation.z = THREE.MathUtils.degToRad(-5);
movieCallout.userData.base = movieCallout.position.clone();
movieCallout.userData.baseScale = 1;
movieCallout.userData.mobileBase = new THREE.Vector3(-1.02, 2.42, 0.72);
movieCallout.userData.mobileScale = 1.42;
stampGroup.add(movieCallout);

function makeParticleField(count, radius, height, zMin, zMax) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(0xe7c878), new THREE.Color(0x9c2c25), new THREE.Color(0x274066), new THREE.Color(0xf3e7cb), new THREE.Color(0x7fa0ff)];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.48) * height;
    positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
    const color = palette[i % palette.length];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.64,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
}

const particles = makeParticleField(920, 22, 11, -8, 4.4);
scene.add(particles);

const sparkleTexture = makeTexture(128, 128, (ctx, w, h) => {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, 'rgba(255,232,158,.95)');
  grad.addColorStop(0.45, 'rgba(231,200,120,.3)');
  grad.addColorStop(1, 'rgba(231,200,120,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
});

const spriteGroup = new THREE.Group();
const spriteColors = [0xffe092, 0xcba14a, 0xff9c6b, 0x8fb0ff, 0xf3e7cb];
for (let i = 0; i < 46; i++) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sparkleTexture,
    color: spriteColors[i % spriteColors.length],
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  }));
  const base = new THREE.Vector3((Math.random() - 0.5) * 12, -2 + Math.random() * 6.8, 1.6 + Math.random() * 4.6);
  const side = i % 2 ? -1 : 1;
  const row = Math.floor(i / 2) % 12;
  const mobile = new THREE.Vector3(
    side * (1.8 + (row % 3) * 0.42),
    -2.72 + row * 0.48 + (i % 5) * 0.025,
    2.35 + (i % 4) * 0.26
  );
  sprite.position.copy(base);
  sprite.scale.setScalar(0.18 + Math.random() * 0.36);
  sprite.userData.base = base;
  sprite.userData.mobile = mobile;
  sprite.userData.phase = i * 0.47;
  sprite.userData.scale = sprite.scale.x;
  sprite.renderOrder = 20;
  spriteGroup.add(sprite);
}
scene.add(spriteGroup);

function makeTicketTexture(color, label) {
  return makeTexture(180, 520, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.fillStyle = 'rgba(246,235,204,.86)';
    roundedRect(ctx, -w * 0.38, -h * 0.45, w * 0.76, h * 0.9, 18);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    roundedRect(ctx, -w * 0.32, -h * 0.39, w * 0.64, h * 0.78, 13);
    ctx.stroke();
    ctx.setLineDash([7, 9]);
    ctx.lineWidth = 3;
    roundedRect(ctx, -w * 0.22, -h * 0.29, w * 0.44, h * 0.58, 9);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = color;
    ctx.font = '700 22px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    trackedText(ctx, label, 0, 0, 4);
    ctx.restore();
  });
}

const ticketGroup = new THREE.Group();
const ticketLayout = [
  { base: [-6.85, 2.45, 2.25], mobile: [-2.96, 2.42, 2.75], rot: [0.08, -0.45, -0.18], mrot: [0.04, -0.26, -0.08], color: COLORS.gold, label: 'ADMIT ONE' },
  { base: [6.78, 2.25, 2.1], mobile: [2.96, 2.24, 2.74], rot: [0.06, 0.4, 0.22], mrot: [0.03, 0.22, 0.08], color: COLORS.navy, label: 'FRONT ROW' },
  { base: [-7.35, 0.68, 2.5], mobile: [-2.88, 0.92, 2.65], rot: [-0.04, -0.5, 0.18], mrot: [-0.02, -0.25, 0.14], color: COLORS.red, label: 'GOOD DATE' },
  { base: [7.18, 0.5, 2.35], mobile: [2.88, 0.72, 2.65], rot: [-0.02, 0.48, -0.16], mrot: [-0.01, 0.25, -0.14], color: COLORS.gold, label: 'PASSPORT' },
  { base: [-6.28, -1.45, 2.05], mobile: [-2.58, -1.66, 2.78], rot: [0.12, -0.34, -0.32], mrot: [0.06, -0.18, -0.22], color: COLORS.navy, label: 'RE-ENTER' },
  { base: [6.34, -1.62, 2.22], mobile: [2.58, -1.82, 2.78], rot: [0.08, 0.38, 0.31], mrot: [0.05, 0.18, 0.2], color: COLORS.red, label: 'STAMPED' },
  { base: [-3.95, 3.46, 1.82], mobile: [-1.28, 3.0, 2.7], rot: [-0.08, -0.18, 0.52], mrot: [-0.04, -0.1, 0.42], color: COLORS.gold, label: 'OPEN' },
  { base: [4.08, 3.28, 1.86], mobile: [1.24, 2.9, 2.7], rot: [-0.07, 0.2, -0.46], mrot: [-0.03, 0.1, -0.4], color: COLORS.navy, label: 'DATE' },
  { base: [-4.7, -2.76, 2.12], mobile: [-1.22, -2.98, 2.7], rot: [0.1, -0.28, -0.58], mrot: [0.04, -0.12, -0.44], color: COLORS.red, label: 'JOSIE' },
  { base: [4.72, -2.92, 2.04], mobile: [1.2, -3.06, 2.7], rot: [0.09, 0.26, 0.56], mrot: [0.04, 0.12, 0.42], color: COLORS.gold, label: 'MATT' },
];
ticketLayout.forEach((ticket, index) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 1.5),
    new THREE.MeshStandardMaterial({
      map: makeTicketTexture(ticket.color, ticket.label),
      transparent: true,
      roughness: 0.7,
      metalness: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  mesh.position.fromArray(ticket.base);
  mesh.rotation.set(ticket.rot[0], ticket.rot[1], ticket.rot[2]);
  mesh.userData.base = new THREE.Vector3().fromArray(ticket.base);
  mesh.userData.mobile = new THREE.Vector3().fromArray(ticket.mobile);
  mesh.userData.baseRot = new THREE.Euler(ticket.rot[0], ticket.rot[1], ticket.rot[2]);
  mesh.userData.mobileRot = new THREE.Euler(ticket.mrot[0], ticket.mrot[1], ticket.mrot[2]);
  mesh.userData.phase = index * 0.62;
  mesh.userData.baseScale = 1;
  mesh.userData.mobileScale = index < 6 ? 0.9 : 0.78;
  mesh.renderOrder = 12;
  ticketGroup.add(mesh);
});
scene.add(ticketGroup);

const beamGroup = new THREE.Group();
function beam(color, x, y, z, ry, mobileX, mobileY, mobileZ, mobileRy) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(1.35, 10, 36, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.075, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  mesh.position.set(x, y, z);
  mesh.rotation.set(Math.PI / 2, ry, 0);
  mesh.userData.base = new THREE.Vector3(x, y, z);
  mesh.userData.mobile = new THREE.Vector3(mobileX, mobileY, mobileZ);
  mesh.userData.baseRy = ry;
  mesh.userData.mobileRy = mobileRy;
  beamGroup.add(mesh);
}
beam(0xffd36b, -6.5, 1.2, 1.2, -0.46, -2.65, 1.45, 0.45, -0.26);
beam(0x6f90ff, 6.5, 1.3, 1.1, 0.46, 2.65, 1.3, 0.45, 0.26);
beam(0xcba14a, 0, 1.7, 0.6, 0, 0, -2.35, 0.25, 0);
scene.add(beamGroup);

function setOpacity(group, opacity) {
  group.traverse((child) => {
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity ?? 1;
      material.transparent = opacity < 0.999 || material.transparent;
      material.opacity = material.userData.baseOpacity * opacity;
    }
  });
}

let width = 0;
let height = 0;
let compact = false;
let opened = false;
let openProgress = 0;
let last = performance.now();
let raf = 0;
let pointerX = 0;
let pointerY = 0;
let hovered = null;
let openedCaptured = false;

function resize() {
  const nextWidth = window.innerWidth || 1;
  const nextHeight = window.innerHeight || 1;
  if (nextWidth === width && nextHeight === height) return;
  width = nextWidth;
  height = nextHeight;
  compact = width < 720 || height > width * 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.45 : 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = compact ? 49 : 43;
  camera.updateProjectionMatrix();
}

function screenRay(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
}

function raycastInteractive(event) {
  screenRay(event);
  const objects = opened ? [...stampMeshes, movieCalloutSign] : [coverHit];
  const hit = raycaster.intersectObjects(objects, false)[0];
  return hit ? hit.object : null;
}

function openPassport() {
  if (opened) return;
  // Tap-to-open now leads into The Residency reveal (unless browsing past tours).
  if (!browseMode) {
    capture('passport_to_residency');
    window.location.href = 'residency/';
    return;
  }
  opened = true;
  document.body.classList.add('open');
  if (!openedCaptured) {
    openedCaptured = true;
    capture('passport_opened');
  }
}

function activateDestination(destination) {
  capture('destination_clicked', { title: destination.title });
  if (destination.seasonFour || destination.href === 'stars/') {
    if (!destination.entered) capture('next_experience_opened');
    openSeasonFour();
    return;
  }
  window.location.href = destination.href;
}

canvas.addEventListener('pointerdown', (event) => {
  if (frame && frame.classList.contains('show')) return;
  const hit = raycastInteractive(event);
  if (!opened) {
    openPassport();
    return;
  }
  if (hit && hit.userData.destination) activateDestination(hit.userData.destination);
}, { passive: true });

canvas.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / Math.max(1, window.innerWidth)) - 0.5;
  pointerY = (event.clientY / Math.max(1, window.innerHeight)) - 0.5;
  const hit = raycastInteractive(event);
  hovered = hit && hit.userData.destination ? hit : null;
  canvas.style.cursor = (!opened || hovered) ? 'pointer' : 'default';
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && frame && frame.classList.contains('show')) closeSeasonFour();
  if ((event.key === 'Enter' || event.key === ' ') && !opened) {
    event.preventDefault();
    openPassport();
  }
});

if (window.DB) {
  window.DB.load('stars', 'rsvp').then((rsvp) => {
    if (!rsvp || !rsvp.mode || rsvp.mode === 'neither') return;
    destinations = [...BASE_DESTINATIONS, seasonFourFromRsvp({ ...rsvp, stamp: 'IV' }), OPENING_NIGHT];
    buildStampMeshes();
  }).catch(() => {});
}

if (window.posthog) {
  const timezone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (error) { return ''; }
  })();
  capture('viewer_context', {
    timezone,
    locale: navigator.language,
    referrer: document.referrer,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    platform: navigator.platform,
  });
  try {
    if (posthog.setPersonProperties) posthog.setPersonProperties({ timezone, locale: navigator.language });
  } catch (error) {}
  const screenshot = (method) => capture('screenshot_suspected', { method, page: location.pathname });
  document.addEventListener('keydown', (event) => {
    if (event.metaKey && event.shiftKey && (event.key === '3' || event.key === '4' || event.key === '5')) screenshot(`mac_cmd_shift_${event.key}`);
  });
  document.addEventListener('keyup', (event) => {
    if (event.key === 'PrintScreen' || event.key === 'Snapshot') screenshot('printscreen');
  });
}

function animate(now) {
  resize();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now * 0.001;
  const targetOpen = opened ? 1 : 0;
  const mobileMix = compact ? 1 : 0;
  openProgress = THREE.MathUtils.damp(openProgress, targetOpen, reducedMotion ? 80 : 4.2, dt);

  const targetCameraZ = compact ? (opened ? 14.35 : 15.2) : (opened ? 11.72 : 11.0);
  const targetCameraY = compact ? (opened ? 0.36 : 0.58) : (opened ? 0.5 : 0.66);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 2.8, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraY, 2.8, dt);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerX * (compact ? 0.26 : 0.36), 2.4, dt);
  camera.lookAt(0, 0.05, 0);

  const closedScale = compact ? 0.74 : 1;
  const openScale = compact ? 0.76 : 1.03;
  closedGroup.scale.setScalar(closedScale);
  openGroup.scale.setScalar(openScale);
  closedGroup.position.set(0, compact ? 0.15 : 0.05, 0);
  openGroup.position.set(0, compact ? 0.0 : -0.02, -0.08);
  openGroup.rotation.x = compact ? -0.018 : -0.034;

  root.rotation.y = THREE.MathUtils.damp(root.rotation.y, pointerX * 0.055, 1.8, dt);
  root.rotation.x = THREE.MathUtils.damp(root.rotation.x, -pointerY * 0.028, 1.8, dt);

  coverShell.rotation.y = -openProgress * (compact ? 2.35 : 2.55) + Math.sin(t * 0.32) * 0.018;
  coverShell.rotation.z = -openProgress * (compact ? 0.28 : 0.36) + Math.sin(t * 0.28) * 0.012;
  coverShell.position.x = -openProgress * (compact ? 2.08 : 3.28);
  coverShell.position.y = Math.sin(t * 0.62) * 0.045 - openProgress * 0.16;
  coverShell.position.z = -openProgress * (compact ? 1.0 : 1.22);
  coverAura.material.opacity = (0.09 + Math.sin(t * 1.2) * 0.012) * (1 - openProgress * 0.55);

  const closedOpacity = Math.max(0, 1 - openProgress * 2.15);
  closedGroup.visible = closedOpacity > 0.01;
  openGroup.visible = openProgress > 0.005;
  setOpacity(closedGroup, closedOpacity);
  setOpacity(openGroup, openProgress);

  leftPage.rotation.y = 0.04 + Math.sin(t * 0.36) * 0.006;
  rightPage.rotation.y = -0.04 + Math.sin(t * 0.32 + 1.2) * 0.006;
  gutter.rotation.z = Math.sin(t * 0.3) * 0.01;

  stampMeshes.forEach((mesh, index) => {
    const phase = mesh.userData.phase;
    const primaryMobileScale = compact && index === 0 ? 1.16 : 1;
    const hoverScale = (hovered === mesh ? 1.08 : 1) * primaryMobileScale;
    const drift = openProgress * (0.012 + Math.sin(t * 0.8 + phase) * 0.018);
    mesh.position.x = mesh.userData.base.x + Math.sin(t * 0.55 + phase) * drift;
    mesh.position.y = mesh.userData.base.y + Math.sin(t * 0.7 + phase) * drift;
    mesh.position.z = mesh.userData.base.z + (hovered === mesh ? 0.09 : 0) + Math.sin(t * 0.9 + phase) * 0.012;
    mesh.rotation.z = mesh.userData.baseRot + Math.sin(t * 0.42 + phase) * 0.012;
    mesh.scale.setScalar(THREE.MathUtils.damp(mesh.scale.x, hoverScale, 8, dt));
    mesh.material.emissive = mesh.material.emissive || new THREE.Color(0x000000);
    mesh.material.emissive.setHex(hovered === mesh ? 0x2d2106 : 0x000000);
    mesh.material.emissiveIntensity = hovered === mesh ? 0.2 : 0;
  });
  const calloutBase = new THREE.Vector3().lerpVectors(movieCallout.userData.base, movieCallout.userData.mobileBase, mobileMix);
  movieCallout.position.x = calloutBase.x;
  movieCallout.position.y = calloutBase.y + Math.sin(t * 1.2) * (compact ? 0.05 : 0.035);
  movieCallout.position.z = calloutBase.z;
  movieCallout.rotation.z = THREE.MathUtils.degToRad(-5) + Math.sin(t * 0.9) * 0.018;
  const calloutScale = THREE.MathUtils.lerp(movieCallout.userData.baseScale, movieCallout.userData.mobileScale, mobileMix);
  movieCallout.scale.setScalar(calloutScale * (1 + Math.sin(t * 2.0) * 0.035));

  particles.rotation.y = Math.sin(t * 0.08) * 0.11 + openProgress * 0.06;
  particles.rotation.x = Math.sin(t * 0.05) * 0.035;
  particles.scale.set(compact ? 0.58 : 1, compact ? 0.82 : 1, compact ? 0.88 : 1);
  particles.material.size = compact ? 0.06 : 0.05;
  particles.material.opacity = 0.54 + Math.sin(t * 0.8) * 0.06;

  spriteGroup.children.forEach((sprite, index) => {
    const phase = sprite.userData.phase;
    const base = new THREE.Vector3().lerpVectors(sprite.userData.base, sprite.userData.mobile, mobileMix);
    sprite.position.x = base.x + Math.sin(t * 0.34 + phase) * (compact ? 0.11 : 0.22);
    sprite.position.y = base.y + Math.sin(t * 0.76 + phase) * (compact ? 0.16 : 0.34);
    sprite.position.z = base.z;
    sprite.material.opacity = 0.16 + (Math.sin(t * 1.25 + index) * 0.5 + 0.5) * 0.22;
    const scale = sprite.userData.scale * (compact ? 1.32 : 1) * (0.86 + Math.sin(t * 1.1 + phase) * 0.16);
    sprite.scale.set(scale, scale, 1);
  });
  spriteGroup.rotation.z = Math.sin(t * 0.09) * 0.035;

  ticketGroup.children.forEach((mesh, index) => {
    const phase = mesh.userData.phase;
    const base = new THREE.Vector3().lerpVectors(mesh.userData.base, mesh.userData.mobile, mobileMix);
    mesh.position.set(
      base.x + Math.sin(t * 0.38 + phase) * (compact ? 0.045 : 0.11),
      base.y + Math.sin(t * 0.7 + phase) * (compact ? 0.07 : 0.16),
      base.z + Math.sin(t * 0.5 + phase) * 0.035
    );
    mesh.rotation.x = THREE.MathUtils.lerp(mesh.userData.baseRot.x, mesh.userData.mobileRot.x, mobileMix) + Math.sin(t * 0.28 + phase) * 0.025;
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.userData.baseRot.y, mesh.userData.mobileRot.y, mobileMix) + Math.sin(t * 0.32 + phase) * 0.035;
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.userData.baseRot.z, mesh.userData.mobileRot.z, mobileMix) + Math.sin(t * 0.42 + phase) * 0.025;
    const scale = THREE.MathUtils.lerp(mesh.userData.baseScale, mesh.userData.mobileScale, mobileMix) * (0.95 + Math.sin(t * 0.9 + index) * 0.035);
    mesh.scale.setScalar(scale);
    mesh.material.opacity = (compact ? 0.82 : 0.72) + (Math.sin(t * 1.1 + index) * 0.5 + 0.5) * 0.12;
  });

  beamGroup.children.forEach((mesh, index) => {
    const base = new THREE.Vector3().lerpVectors(mesh.userData.base, mesh.userData.mobile, mobileMix);
    mesh.position.copy(base);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.userData.baseRy, mesh.userData.mobileRy, mobileMix) + Math.sin(t * 0.52 + index) * (compact ? 0.08 : 0.15);
    mesh.scale.setScalar(compact ? 0.56 : 1);
    mesh.material.opacity = (compact ? 0.035 : 0.065) + (Math.sin(t * 1.05 + index * 1.7) * 0.5 + 0.5) * (compact ? 0.025 : 0.045);
  });

  grid.rotation.y = Math.sin(t * 0.045) * 0.045;
  renderer.render(scene, camera);
  if (!reducedMotion) raf = requestAnimationFrame(animate);
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(resize, 120), { passive: true });
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
setOpacity(openGroup, 0);
renderer.render(scene, camera);
if (reducedMotion) animate(performance.now());
else raf = requestAnimationFrame(animate);
