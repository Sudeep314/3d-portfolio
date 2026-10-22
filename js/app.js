/* =============================================================
   app.js — 3D Portfolio engine
   -------------------------------------------------------------
   Built with Three.js (loaded from CDN via the import map in
   index.html). No build step, no npm install.

   HOW IT WORKS (a map of the file):
     1. Data            -> reads window.PORTFOLIO from content.js
     2. Utils           -> tiny helpers (colour maths, random, DOM)
     3. Renderer/Scene  -> WebGL setup, camera, lights
     4. Textures        -> canvas-generated planet/label/glow textures
     5. Starfield       -> 2600 points of background stars
     6. The Core        -> you: a glowing planet at the centre
     7. Planets         -> one per skill domain, each with project moons
     8. Orbit controls  -> custom drag/scroll/pinch camera
     9. Picking         -> raycasting for hover + click
    10. Panel UI        -> the side drawer with all the details
    11. Render loop     -> the animation
   ============================================================= */

import * as THREE from 'three';

/* =============================================================
   1. DATA
   ============================================================= */
const P = window.PORTFOLIO;

/* =============================================================
   2. UTILITIES
   ============================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const TAU = Math.PI * 2;
const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;

function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shade(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  const c = (v) => Math.round(clamp(v * factor, 0, 255));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
/** Deterministic pseudo-random so the scene looks identical every reload. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
/** Escape text that goes into innerHTML. */
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* =============================================================
   3. RENDERER / SCENE / CAMERA
   ============================================================= */
const canvas = $('#scene');

/* --- Friendly failure if the browser can't do WebGL at all --- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
} catch (err) {
  console.error('WebGL unavailable:', err);
  const loader = $('#loader');
  if (loader) {
    loader.classList.remove('done');
    loader.innerHTML =
      '<p style="max-width:420px;text-align:center;color:#93a3bf">' +
      '<b style="color:#eaf2ff;display:block;margin-bottom:8px">This browser can\'t start WebGL</b>' +
      'The 3D scene needs WebGL. Try the latest Chrome, Edge or Firefox, and make sure hardware acceleration is enabled.</p>';
  }
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05060a');
scene.fog = new THREE.FogExp2('#05060a', 0.0165);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.set(0, 4, 15);

/* ---------- Lights ---------- */
scene.add(new THREE.AmbientLight('#7d93c9', 0.55));

const keyLight = new THREE.DirectionalLight('#ffffff', 1.9);
keyLight.position.set(6, 8, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight('#6ee7ff', 1.1);
rimLight.position.set(-7, -3, -6);
scene.add(rimLight);

const coreLight = new THREE.PointLight('#ffb35c', 90, 40, 2);
coreLight.position.set(0, 0, 0);
scene.add(coreLight);

/* =============================================================
   4. TEXTURE FACTORIES  (all drawn with Canvas 2D — no image files)
   ============================================================= */

/** A planet surface: base colour, darker poles, random landmasses/bands. */
function planetTexture(base, accent, seed) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const rand = seeded(seed);

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, shade(base, 1.35));
  grad.addColorStop(0.45, base);
  grad.addColorStop(1, shade(base, 0.55));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // landmasses / storms
  for (let i = 0; i < 60; i++) {
    const x = rand() * 512;
    const y = 40 + rand() * 176;
    const r = 8 + rand() * 44;
    ctx.globalAlpha = 0.05 + rand() * 0.16;
    ctx.fillStyle = rand() > 0.45 ? accent : shade(base, 0.45);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.35 + rand() * 0.5), rand() * Math.PI, 0, TAU);
    ctx.fill();
  }

  // horizontal bands
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? shade(base, 1.6) : shade(base, 0.4);
    const y = rand() * 256;
    ctx.fillRect(0, y, 512, 3 + rand() * 12);
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

/** A soft round glow, used for atmosphere halos and the core. */
function glowTexture(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, rgba(color, 0.95));
  g.addColorStop(0.25, rgba(color, 0.42));
  g.addColorStop(0.55, rgba(color, 0.12));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A rounded "pill" label that always faces the camera. */
function labelSprite(text, color) {
  const fontSize = 54;
  const font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  const textW = Math.ceil(probe.measureText(text).width);

  const w = textW + 46;
  const h = fontSize + 34;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  roundRect(ctx, 3, 6, w - 6, h - 12, (h - 12) / 2);
  ctx.fillStyle = 'rgba(8, 12, 24, 0.78)';
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.6);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#eaf2ff';
  ctx.fillText(text, w / 2, h / 2 + 1);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  const s = 0.0052;
  sprite.scale.set(w * s, h * s, 1);
  return sprite;
}

/** Big gradient title text (your name above the core). */
function titleSprite(text) {
  const fontSize = 96;
  const tracking = 4;                  // px of letter-spacing
  const glow = 34;                     // shadowBlur — needs room on every side
  const font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  try { probe.letterSpacing = `${tracking}px`; } catch { /* older browsers */ }

  // Measure with the SAME letter-spacing the drawing uses. Measuring without it
  // makes the canvas too narrow, and the first and last letters get sliced off.
  // actualBoundingBox* gives the real ink extents, so nothing is ever clipped.
  const m = probe.measureText(text);
  const inkW = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
  const inkH = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);

  const padX = glow + 20;              // room for the glow on both sides
  const padY = glow + 20;              // room for the glow above and below
  const w = inkW + padX * 2;
  const h = inkH + padY * 2;

  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = `${tracking}px`; } catch { /* older browsers */ }

  const g = ctx.createLinearGradient(0, padY, 0, h - padY);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#a8e9ff');
  g.addColorStop(1, '#4f8cff');
  ctx.shadowColor = 'rgba(110, 231, 255, 0.55)';
  ctx.shadowBlur = glow;
  ctx.fillStyle = g;

  // Draw so the ink starts exactly `padX` from the left edge and the baseline
  // sits `padY` below the top — the glow then has somewhere to live.
  const baselineY = padY + m.actualBoundingBoxAscent;
  ctx.fillText(text, padX + m.actualBoundingBoxLeft, baselineY);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  const s = 0.0068;
  sprite.scale.set(w * s, h * s, 1);
  return sprite;
}

/* =============================================================
   5. STARFIELD
   ============================================================= */
function buildStarfield() {
  const count = 2600;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const rand = seeded(20260422);
  const tint = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // random point on a sphere shell
    const u = rand() * 2 - 1;
    const theta = rand() * TAU;
    const r = 60 + rand() * 60;
    const s = Math.sqrt(1 - u * u);
    positions[i * 3]     = r * s * Math.cos(theta);
    positions[i * 3 + 1] = r * u;
    positions[i * 3 + 2] = r * s * Math.sin(theta);

    // most stars white, a few blue/orange
    const roll = rand();
    tint.setHSL(roll > 0.88 ? 0.08 : roll < 0.1 ? 0.58 : 0.6, 0.45, 0.85);
    colors[i * 3] = tint.r; colors[i * 3 + 1] = tint.g; colors[i * 3 + 2] = tint.b;
    sizes[i] = rand() * 0.9 + 0.35;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.42,
    map: glowTexture('#ffffff'),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    fog: false
  });

  const points = new THREE.Points(geo, mat);
  points.renderOrder = -1;
  scene.add(points);
  return points;
}
const starfield = buildStarfield();

/* =============================================================
   6. THE CORE  — you
   ============================================================= */
const coreGroup = new THREE.Group();
scene.add(coreGroup);

const coreMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.15, 5),
  new THREE.MeshStandardMaterial({
    color: '#1d3a6e',
    emissive: '#2f77c4',
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.7,
    flatShading: true
  })
);
coreGroup.add(coreMesh);

// soft glow shell around the core
const coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTexture('#4f8cff'),
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  blending: THREE.AdditiveBlending
}));
coreHalo.scale.set(9, 9, 1);
coreGroup.add(coreHalo);

// a ring around the core
const coreRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.05, 0.022, 12, 128),
  new THREE.MeshBasicMaterial({ color: '#6ee7ff', transparent: true, opacity: 0.5 })
);
coreRing.rotation.x = Math.PI / 2.6;
coreGroup.add(coreRing);

// your name floating above the core
const nameSprite = titleSprite(P.profile.name);
nameSprite.position.set(0, 2.75, 0);
coreGroup.add(nameSprite);

// a second, tilted ring for depth
const coreRing2 = new THREE.Mesh(
  new THREE.TorusGeometry(2.55, 0.014, 10, 128),
  new THREE.MeshBasicMaterial({ color: '#f2994a', transparent: true, opacity: 0.32 })
);
coreRing2.rotation.set(Math.PI / 1.7, 0.4, 0);
coreGroup.add(coreRing2);

/* =============================================================
   7. PLANETS  (+ their project "moons")
   ============================================================= */
const interactive = [];   // every mesh the user can click
const planets = [];

function buildPlanet(def, index) {
  const radius   = def.radius ?? 0.62;
  const distance = def.distance ?? 6 + index * 1.6;

  // -- orbit group: gives the orbit a tilt --
  const orbitGroup = new THREE.Group();
  orbitGroup.rotation.x = THREE.MathUtils.degToRad(def.tilt ?? -12);
  scene.add(orbitGroup);

  // -- the orbit path line --
  const pathPts = [];
  for (let k = 0; k <= 128; k++) {
    const a = (k / 128) * TAU;
    pathPts.push(new THREE.Vector3(Math.cos(a) * distance, 0, Math.sin(a) * distance));
  }
  const path = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pathPts),
    new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 0.2 })
  );
  orbitGroup.add(path);

  // -- the planet itself --
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 56, 36),
    new THREE.MeshStandardMaterial({
      map: planetTexture(def.color, def.accent || '#ffffff', (index + 7) * 977),
      roughness: 0.72,
      metalness: 0.14,
      emissive: new THREE.Color(def.color),
      emissiveIntensity: 0.05
    })
  );
  mesh.userData = { type: 'planet', def, obj: mesh, baseEmissive: 0.05 };
  interactive.push(mesh);
  orbitGroup.add(mesh);

  // -- atmosphere glow (slightly bigger, back side, additive) --
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.16, 32, 24),
    new THREE.MeshBasicMaterial({
      color: def.accent || def.color,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mesh.add(atmosphere);

  // -- optional Saturn-style ring --
  if (def.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.55, radius * 2.25, 96),
      new THREE.MeshBasicMaterial({
        color: def.accent || def.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.42
      })
    );
    ring.rotation.x = Math.PI / 2 - 0.22;
    mesh.add(ring);
  }

  // -- name label --
  const label = labelSprite(def.name, def.color);
  label.position.set(0, radius + 0.5, 0);
  label.userData = { type: 'planet', def, obj: mesh, baseEmissive: 0.05 };
  interactive.push(label);
  mesh.add(label);

  // -- project moons --
  const moons = [];
  const projects = (def.projects || []).slice(0, 3);
  projects.forEach((proj, k) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = 0.35 + k * 0.45;          // each moon on a tilted ring
    mesh.add(pivot);

    const moonR = 0.15;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(moonR, 22, 16),
      new THREE.MeshStandardMaterial({
        color: '#929396',
        emissive: new THREE.Color(def.color),
        emissiveIntensity: 0.4,
        roughness: 0.35,
        metalness: 0.2
      })
    );
    const md = radius + 0.62 + k * 0.3;
    moon.position.set(Math.cos(k) * md, 0, Math.sin(k) * md);
    moon.userData = { type: 'project', def: proj, planet: def, obj: moon, baseEmissive: 0.4 };
    interactive.push(moon);
    pivot.add(moon);

    // halo so the moon is easy to spot and click
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(def.accent || def.color),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    halo.scale.set(0.75, 0.75, 1);
    moon.add(halo);

    moons.push({ pivot, moon, speed: 0.55 + k * 0.3, dist: md });
  });

  planets.push({
    def, index, orbitGroup, mesh, label, moons,
    radius, distance,
    theta: (index / Math.max(1, P.planets.length)) * TAU + 0.35,
    speed: def.speed ?? 0.14,
    currentSpeed: def.speed ?? 0.14
  });
}

P.planets.forEach(buildPlanet);

/* =============================================================
   8. ORBIT CONTROLS  (hand written — no extra library needed)
   ============================================================= */
const cam = {
  theta: 0.55, phi: 1.18, radius: 16,        // current
  tTheta: 0.55, tPhi: 1.18, tRadius: 16,       // target (damped toward)
  target: new THREE.Vector3(0, 0, 0),
  tTarget: new THREE.Vector3(0, 0, 0)
};

const MIN_PHI = 0.18, MAX_PHI = Math.PI - 0.18;
const MIN_RADIUS = 3.2, MAX_RADIUS = 34;

let focused = null;   // the planet we are zoomed into

function resetView() {
  focused = null;
  cam.tTarget.set(0, 0, 0);
  cam.tRadius = 16;
  cam.tPhi = 1.18;
  updateFocusBar();
}

function focusPlanet(planet) {
  focused = planet;
  cam.tRadius = Math.max(MIN_RADIUS, planet.radius * 4.6 + 1.1);
  cam.tPhi = clamp(cam.tPhi, 0.5, 2.2);
  updateFocusBar();
}

/* ---------- pointer handling ---------- */
const pointers = new Map();
let dragging = false;
let dragDistance = 0;
let lastX = 0, lastY = 0;
let pinchDistance = 0;

canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  dragging = true;
  dragDistance = 0;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.classList.add('is-grabbing');
  if (pointers.size === 2) pinchDistance = pinchSpan();
});

canvas.addEventListener('pointermove', (e) => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  // two fingers = pinch zoom
  if (pointers.size === 2) {
    const span = pinchSpan();
    if (pinchDistance > 0) {
      cam.tRadius = clamp(cam.tRadius * (pinchDistance / span), MIN_RADIUS, MAX_RADIUS);
    }
    pinchDistance = span;
    return;
  }

  if (dragging) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragDistance += Math.abs(dx) + Math.abs(dy);

    cam.tTheta -= dx * 0.0055;
    cam.tPhi = clamp(cam.tPhi - dy * 0.0045, MIN_PHI, MAX_PHI);
    hideTooltip();
  } else {
    updateHover(e);
  }
});

function endPointer(e, allowClick) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchDistance = 0;
  if (pointers.size === 0) {
    dragging = false;
    canvas.classList.remove('is-grabbing');
    // Only a real release counts as a click, AND only if the pointer barely moved.
    // (pointerleave must NOT count, or merely moving the mouse off the canvas
    //  would open whatever planet happened to be under the cursor.)
    if (allowClick && dragDistance < 7) handleClick(e);
  }
}
canvas.addEventListener('pointerup', (e) => endPointer(e, true));
canvas.addEventListener('pointercancel', (e) => endPointer(e, false));
canvas.addEventListener('pointerleave', () => hideTooltip());
// safety net in case a release is missed (e.g. released outside the window)
window.addEventListener('pointerup', (e) => {
  if (pointers.has(e.pointerId)) endPointer(e, true);
});

function pinchSpan() {
  const pts = Array.from(pointers.values());
  if (pts.length < 2) return 0;
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

// mouse wheel / trackpad zoom
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  cam.tRadius = clamp(cam.tRadius * (1 + e.deltaY * 0.0012), MIN_RADIUS, MAX_RADIUS);
}, { passive: false });

/* ---------- keyboard ---------- */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel();
  if (e.key.toLowerCase() === 'r') { resetView(); closePanel(); }
  if (e.key === 'ArrowLeft')  cam.tTheta -= 0.12;
  if (e.key === 'ArrowRight') cam.tTheta += 0.12;
  if (e.key === 'ArrowUp')    cam.tPhi = clamp(cam.tPhi - 0.08, MIN_PHI, MAX_PHI);
  if (e.key === 'ArrowDown')  cam.tPhi = clamp(cam.tPhi + 0.08, MIN_PHI, MAX_PHI);
});

/* =============================================================
   9. PICKING  (raycasting)
   ============================================================= */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let hovered = null;

function pickAt(e) {
  const rect = canvas.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(interactive, false);
  return hits.length ? hits[0].object : null;
}

function updateHover(e) {
  const obj = pickAt(e);
  const target = obj ? obj.userData.obj : null;

  if (target !== hovered) {
    if (hovered && hovered.material && hovered.material.emissiveIntensity !== undefined) {
      hovered.material.emissiveIntensity = hovered.userData.baseEmissive ?? 0.05;
    }
    hovered = target;
    if (hovered && hovered.material && hovered.material.emissiveIntensity !== undefined) {
      hovered.material.emissiveIntensity = 0.45;
    }
    canvas.classList.toggle('is-pointing', !!obj);
  }

  const tip = $('#tooltip');
  if (!obj) { tip.hidden = true; return; }

  const ud = obj.userData;
  tip.textContent = ud.type === 'planet'
    ? `${ud.def.name} — ${ud.def.tagline}`
    : ud.def.title;
  tip.hidden = false;
  tip.style.left = `${e.clientX}px`;
  tip.style.top = `${e.clientY}px`;
}

function hideTooltip() { $('#tooltip').hidden = true; }

function handleClick(e) {
  const obj = pickAt(e);
  if (!obj) {
    // clicking empty space = deselect and go back to the overview
    closePanel();
    resetView();
    return;
  }

  const ud = obj.userData;
  if (ud.type === 'planet') {
    focusPlanet(planets.find(p => p.def.id === ud.def.id));
    openPanel('planet', ud.def);
  } else if (ud.type === 'project') {
    const planet = planets.find(p => p.def.id === ud.planet.id);
    if (planet) focusPlanet(planet);
    openPanel('project', { project: ud.def, planet: ud.planet });
  }
}

/* =============================================================
   10. PANEL UI
   ============================================================= */
const panel = $('#panel');
const panelBody = $('#panelBody');
const scrim = $('#scrim');
const navButtons = $$('.nav-btn');

function openPanel(type, data) {
  panelBody.innerHTML = renderPanel(type, data);
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  scrim.hidden = false;
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === type));
  panel.scrollTop = 0;
  if (type === 'resume') checkResume();
}

function closePanel() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  scrim.hidden = true;
  navButtons.forEach(b => b.classList.remove('active'));
}

$('#panelClose').addEventListener('click', closePanel);
scrim.addEventListener('click', closePanel);
$('#resetView').addEventListener('click', () => { resetView(); closePanel(); });

/* ---------- panel click delegation (project buttons) ---------- */
panelBody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-project]');
  if (!btn) return;
  const idx = Number(btn.dataset.project);
  const flat = allProjects();
  if (flat[idx]) openPanel('project', flat[idx]);
});

/* ---------- helpers for rendering ---------- */
function allProjects() {
  const out = [];
  P.planets.forEach(planet => {
    (planet.projects || []).forEach(proj => out.push({ project: proj, planet }));
  });
  return out;
}
function levelPct(level) {
  const map = { 'beginner': 38, 'intermediate': 68, 'learning': 45, 'advanced': 92 };
  return map[String(level).toLowerCase()] ?? 55;
}
function levelClass(level) {
  const map = { 'beginner': 'beginner', 'intermediate': 'intermediate', 'learning': 'learning', 'advanced': 'advanced' };
  return map[String(level).toLowerCase()] ?? 'beginner';
}
function linkBtn(href, label) {
  if (!href) return '';
  return `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

/* ---------- the renderers ---------- */
function renderPanel(type, data) {
  switch (type) {
    case 'about':    return renderAbout();
    case 'skills':   return renderSkills();
    case 'projects': return renderProjects();
    case 'contact':  return renderContact();
    case 'resume':   return renderResume();
    case 'planet':   return renderPlanet(data);
    case 'project':  return renderProject(data);
    default:         return '';
  }
}

function renderAbout() {
  const a = P.about;
  return `
    <p class="eyebrow">${esc(P.profile.role)}</p>
    <h2>${esc(a.heading)}</h2>
    <p class="lead" style="margin-top:8px">${esc(P.profile.tagline)}</p>

    ${P.profile.photo ? `<img class="about-photo" id="aboutPhoto" src="${esc(P.profile.photo)}" alt="Photo of ${esc(P.profile.name)}" />` : ''}

    ${a.paragraphs.map(p => `<p style="margin-top:14px">${esc(p)}</p>`).join('')}

    <h3>Quick facts</h3>
    <div class="facts">
      ${a.facts.map(f => `<div class="fact"><span>${esc(f.label)}</span><span>${esc(f.value)}</span></div>`).join('')}
    </div>

    ${P.education?.length ? `
      <h3>Education</h3>
      <div class="timeline">
        ${P.education.map(e => `
          <div class="tl-item">
            <div class="tl-year">${esc(e.period || '')}</div>
            <h4>${esc(e.degree)}</h4>
            <p>${esc(e.school || '')}${e.note ? ' — ' + esc(e.note) : ''}</p>
          </div>`).join('')}
      </div>` : ''}

    ${P.achievements?.length ? `
      <h3>Achievements</h3>
      <div class="facts">
        ${P.achievements.map(x => `<div class="fact"><span>${esc(x.detail)}</span><span>${esc(x.title)}</span></div>`).join('')}
      </div>` : ''}

    <h3>Stats</h3>
    <div class="stats-grid">
      ${P.stats.map(s => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}
    </div>

    ${P.timeline?.length ? `
      <h3>Timeline</h3>
      <div class="timeline">
        ${P.timeline.map(t => `
          <div class="tl-item">
            <div class="tl-year">${esc(t.year)}</div>
            <h4>${esc(t.title)}</h4>
            <p>${esc(t.detail)}</p>
          </div>`).join('')}
      </div>` : ''}

    <div class="btn-row">
      <button class="btn btn-primary" data-panel="projects">View projects</button>
      <button class="btn" data-panel="contact">Get in touch</button>
    </div>`;
}

function renderSkills() {
  return `
    <p class="eyebrow">Skill map</p>
    <h2>Skills &amp; domains</h2>
    <p>Each of these is a planet in the 3D scene. Click one to fly to it.</p>

    <div class="planet-list">
      ${P.planets.map(pl => `
        <button class="planet-row" data-planet="${esc(pl.id)}">
          <span class="planet-swatch" style="--sw:${esc(pl.color)}"></span>
          <span class="pr-body">
            <b>${esc(pl.name)}</b>
            <small>${esc(pl.tagline)} · ${esc(pl.level)}</small>
          </span>
          <span class="arrow">→</span>
        </button>`).join('')}
    </div>

    <h3>Every skill</h3>
    ${P.planets.map(pl => `
      <div style="margin-bottom:18px">
        <p class="tagline-s" style="margin-bottom:8px">${esc(pl.name)}</p>
        ${(pl.skills || []).map(s => `
          <div class="skill">
            <div class="skill-head">
              <span>${esc(s.name)}</span>
              <span class="lvl lvl-${levelClass(s.level)}">${esc(s.level)}</span>
            </div>
            <div class="bar"><i style="width:${levelPct(s.level)}%"></i></div>
          </div>`).join('')}
      </div>`).join('')}`;
}

function renderProjects() {
  const flat = allProjects();
  return `
    <p class="eyebrow">Portfolio</p>
    <h2>Projects</h2>
    <p>${flat.length} things I've built so far. Click any project for the details.</p>
    <div class="proj-list" style="margin-top:18px">
      ${flat.map((item, i) => `
        <button class="proj" data-project="${i}">
          <strong>${esc(item.project.title)}</strong>
          <span>${esc(item.project.blurb)}</span>
          <em>${esc(item.planet.name)} · ${esc((item.project.tech || []).join(' · '))}</em>
        </button>`).join('')}
    </div>`;
}

function renderPlanet(def) {
  return `
    <p class="eyebrow" style="color:${esc(def.color)}">${esc(def.level)} · ${esc(def.tagline)}</p>
    <h2>${esc(def.name)}</h2>
    <p style="margin-top:12px">${esc(def.description)}</p>

    <h3>Skills in this domain</h3>
    ${(def.skills || []).map(s => `
      <div class="skill">
        <div class="skill-head">
          <span>${esc(s.name)}</span>
          <span class="lvl lvl-${levelClass(s.level)}">${esc(s.level)}</span>
        </div>
        <div class="bar"><i style="width:${levelPct(s.level)}%"></i></div>
      </div>`).join('')}

    ${def.projects?.length ? `
      <h3>Projects (${def.projects.length})</h3>
      <div class="proj-list">
        ${def.projects.map(p => `
          <button class="proj" data-project="${allProjects().findIndex(i => i.project.title === p.title && i.planet.id === def.id)}">
            <strong>${esc(p.title)}</strong>
            <span>${esc(p.blurb)}</span>
            <em>${esc((p.tech || []).join(' · '))}</em>
          </button>`).join('')}
      </div>` : ''}

    <div class="btn-row">
      <button class="btn" data-panel="skills">All skills</button>
      <button class="btn" data-panel="contact">Contact me</button>
    </div>`;
}

function renderProject({ project, planet }) {
  return `
    <p class="eyebrow" style="color:${esc(planet.color)}">${esc(planet.name)}</p>
    <h2>${esc(project.title)}</h2>
    <p class="lead" style="margin-top:8px">${esc(project.blurb)}</p>

    ${project.description ? `<p style="margin-top:12px">${esc(project.description)}</p>` : ''}

    <div class="chips">
      ${(project.tech || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
    </div>

    ${project.highlights?.length ? `
      <h3>Highlights</h3>
      <ul style="margin:0; padding-left:20px; color:var(--ink-dim); font-size:0.9rem">
        ${project.highlights.map(h => `<li style="margin-bottom:6px">${esc(h)}</li>`).join('')}
      </ul>` : ''}

    <div class="btn-row">
      ${linkBtn(project.links?.github, 'View on GitHub')}
      ${linkBtn(project.links?.demo, 'Live demo')}
      <button class="btn" data-panel="projects">All projects</button>
    </div>`;
}

function renderContact() {
  const c = P.contact;
  const l = P.profile.links || {};
  return `
    <p class="eyebrow">Contact</p>
    <h2>${esc(c.heading)}</h2>
    <p style="margin-top:10px">${esc(c.text)}</p>

    <div style="margin-top:16px">
      <span class="available"><i></i>${esc(c.availability)}</span>
    </div>

    <div class="contact-list">
      ${P.profile.email ? `<a href="mailto:${esc(P.profile.email)}"><span class="k">Email</span>${esc(P.profile.email)}</a>` : ''}
      ${P.profile.phone ? `<a href="${esc(P.profile.phoneLink || '#')}"><span class="k">Phone</span>${esc(P.profile.phone)}</a>` : ''}
      ${P.profile.whatsapp ? `<a href="${esc(P.profile.whatsapp)}" target="_blank" rel="noopener"><span class="k">WhatsApp</span>Chat with me directly</a>` : ''}
      ${P.profile.location ? `<div><span class="k">Location</span>${esc(P.profile.location)}</div>` : ''}
      ${l.github ? `<a href="${esc(l.github)}" target="_blank" rel="noopener"><span class="k">GitHub</span>${esc(l.github.replace('https://', ''))}</a>` : ''}
      ${l.linkedin ? `<a href="${esc(l.linkedin)}" target="_blank" rel="noopener"><span class="k">LinkedIn</span>${esc(l.linkedin.replace('https://', '').replace(/\/$/, ''))}</a>` : ''}
      ${l.x ? `<a href="${esc(l.x)}" target="_blank" rel="noopener"><span class="k">X</span>${esc(l.x.replace('https://', ''))}</a>` : ''}
    </div>

    <p class="muted" style="margin-top:14px">${esc(c.responseTime)}</p>

    <h3>Or send a message</h3>
    <form id="contactForm">
      <label class="field">
        <span>Your name</span>
        <input type="text" name="name" placeholder="Vicky" required />
      </label>
      <label class="field">
        <span>Your email</span>
        <input type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label class="field">
        <span>Message</span>
        <textarea name="message" placeholder="Hey! I saw your 3D portfolio…" required></textarea>
      </label>
      <button class="btn btn-primary" type="submit">Open in my mail app</button>
    </form>
    <p class="muted" style="margin-top:10px">
      No backend needed — the form composes an email in your mail client.
      To receive messages automatically, plug in Formspree or Netlify Forms later.
    </p>`;
}

function renderResume() {
  const path = P.profile.resume;
  return `
    <p class="eyebrow">Résumé</p>
    <h2>My resume</h2>
    <p>
      A clean, one-page version of everything on this site — education, projects,
      skills and contact details. Open it, then use your browser's
      <b>Print &rarr; Save as PDF</b> to get a proper A4 PDF you can send to anyone.
    </p>
    <div class="btn-row">
      <a class="btn btn-primary" href="resume.html" target="_blank" rel="noopener">Open the resume page</a>
      <a class="btn" id="resumeLink" href="${esc(path)}" target="_blank" rel="noopener" hidden>Download PDF</a>
      <button class="btn" data-panel="contact">Contact me instead</button>
    </div>
    <p class="muted" id="resumeNote" style="margin-top:14px">Checking for a PDF at <code>${esc(path)}</code>…</p>`;
}

/** The resume PDF may not have been added yet — check instead of 404ing. */
function checkResume() {
  const path = P.profile.resume;
  const note = $('#resumeNote');
  const link = $('#resumeLink');
  if (!note || !link) return;
  if (!path) {
    link.hidden = true;
    note.textContent = 'No PDF resume is set — the printable resume page works on its own.';
    return;
  }
  fetch(path, { method: 'HEAD' })
    .then(r => {
      if (r.ok) {
        link.hidden = false;
        note.innerHTML = `PDF found — <code>${esc(path)}</code>. You can also use the printable page above.`;
      } else {
        link.hidden = true;
        note.innerHTML = 'No PDF added yet — the printable page above is the live one. ' +
          'Drop a PDF at <code>' + esc(path) + '</code> and this button appears on its own.';
      }
    })
    .catch(() => {
      link.hidden = true;
      note.innerHTML = 'No PDF added yet — use the printable page above.';
    });
}

/* ---------- nav wiring ---------- */
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.panel;
    if (panel.classList.contains('open') && btn.classList.contains('active')) {
      closePanel();
    } else {
      openPanel(type);
    }
  });
});

/* buttons inside the panel that switch sections */
panelBody.addEventListener('click', (e) => {
  const sw = e.target.closest('[data-panel]');
  if (sw && sw.dataset.panel) {
    openPanel(sw.dataset.panel);
    return;
  }
  const pl = e.target.closest('[data-planet]');
  if (pl) {
    const planet = planets.find(p => p.def.id === pl.dataset.planet);
    if (planet) { focusPlanet(planet); closePanel(); }
  }
});

/* ---------- the contact form (mailto, no backend) ---------- */
panelBody.addEventListener('submit', (e) => {
  if (e.target.id !== 'contactForm') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = `Portfolio enquiry from ${f.get('name')}`;
  const body = `${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`;
  window.location.href = `mailto:${P.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* =============================================================
   HERO / STATS + PROFILE GLUE
   ============================================================= */
$('#brandName').textContent = P.profile.name;
$('#brandRole').textContent = P.profile.role;
$('#brandAvatar').textContent = P.profile.initials || P.profile.name.slice(0, 2).toUpperCase();

/* If a real photo exists, use it in the top-left avatar */
if (P.profile.photo) {
  const img = new Image();
  img.onload = () => {
    const av = $('#brandAvatar');
    av.textContent = '';
    av.appendChild(img);
  };
  img.src = P.profile.photo;
}

/* Broken photo -> hide the image in the About panel */
panelBody.addEventListener('error', (e) => {
  if (e.target.id === 'aboutPhoto') e.target.style.display = 'none';
}, true);

/* =============================================================
   FOCUS BAR
   ============================================================= */
function updateFocusBar() {
  const bar = $('#focusBar');
  if (!focused) { bar.hidden = true; return; }
  bar.hidden = false;
  $('#focusLabel').textContent = focused.def.name;
  bar.querySelector('.focus-dot').style.background = focused.def.color;
  bar.querySelector('.focus-dot').style.boxShadow = `0 0 12px ${focused.def.color}`;
}

/* =============================================================
   11. RENDER LOOP
   ============================================================= */
const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  /* --- camera damping --- */
  cam.theta = lerp(cam.theta, cam.tTheta, 0.08);
  cam.phi   = lerp(cam.phi,   cam.tPhi,   0.08);
  cam.radius = lerp(cam.radius, cam.tRadius, 0.08);

  /* --- where are we looking? (follows the focused planet) --- */
  if (focused) {
    const wp = new THREE.Vector3();
    focused.mesh.getWorldPosition(wp);
    cam.tTarget.copy(wp);
  }
  cam.target.lerp(cam.tTarget, 0.08);

  const sp = Math.sin(cam.phi);
  camera.position.set(
    cam.target.x + cam.radius * sp * Math.sin(cam.theta),
    cam.target.y + cam.radius * Math.cos(cam.phi),
    cam.target.z + cam.radius * sp * Math.cos(cam.theta)
  );
  camera.lookAt(cam.target);

  /* --- core --- */
  coreMesh.rotation.y += dt * 0.11;
  coreMesh.rotation.x += dt * 0.05;
  coreRing.rotation.z += dt * 0.14;
  coreRing2.rotation.z -= dt * 0.1;
  coreHalo.material.opacity = 0.45 + Math.sin(elapsed * 1.4) * 0.1;
  nameSprite.position.y = 2.75 + Math.sin(elapsed * 0.8) * 0.08;

  /* --- planets --- */
  planets.forEach(p => {
    // slow the orbit down when a planet is focused, speed it up otherwise
    const goal = focused === p ? 0 : (focused ? p.speed * 0.25 : p.speed);
    p.currentSpeed = lerp(p.currentSpeed, goal, 0.06);
    p.theta += p.currentSpeed * dt;

    const bob = Math.sin(elapsed * 0.6 + p.index) * 0.12;
    p.mesh.position.set(
      Math.cos(p.theta) * p.distance,
      bob,
      Math.sin(p.theta) * p.distance
    );
    p.mesh.rotation.y += dt * 0.3;

    // moons
    p.moons.forEach(m => { m.pivot.rotation.y += dt * m.speed; });
  });

  /* --- stars drift --- */
  starfield.rotation.y += dt * 0.004;

  renderer.render(scene, camera);
}

/* =============================================================
   RESIZE
   ============================================================= */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 2));
}
window.addEventListener('resize', onResize);

/* =============================================================
   GO
   ============================================================= */
animate();

// hide the loader once the first frames are on screen
requestAnimationFrame(() => {
  setTimeout(() => $('#loader').classList.add('done'), 550);
});

// expose a couple of things for debugging in the console
window.__scene = { scene, camera, renderer, planets, nameSprite, P };
