/* lab.js — 3D WebGL Particle Mirror Lab — Adrija */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';

injectPreloader();
injectCursor();
injectScrollProgress();
injectNav('lab');
injectFooter();
initReveal();
initGlassCardGlow();

// ─── Three.js Core Setup ─────────────────────────────────────────
const canvas3d = document.querySelector('#canvas3d');
const frame = document.getElementById('hologram-frame');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#07050f');
scene.fog = new THREE.FogExp2('#07050f', 0.012);

const camera = new THREE.PerspectiveCamera(55, frame.clientWidth / frame.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 80);

const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post processing
const renderPass = new RenderPass(scene, camera);
// Rose-pink bloom for Adrija's aesthetic
const bloomPass = new UnrealBloomPass(new THREE.Vector2(800, 600), 2.4, 0.5, 0.1);
const rgbPass = new ShaderPass(RGBShiftShader);
rgbPass.uniforms['amount'].value = 0.0015;
const composer = new EffectComposer(renderer);
composer.addPass(renderPass); composer.addPass(bloomPass); composer.addPass(rgbPass);

function resize3D() {
  const w = frame.clientWidth, h = frame.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); composer.setSize(w, h);
}
resize3D();
window.addEventListener('resize', resize3D, { passive: true });

// ─── Audio ───────────────────────────────────────────────────────
let audioCtx, analyser, dataArray;
function initAudio(stream) {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 55;
  const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 200;
  const gain = audioCtx.createGain(); gain.gain.value = 0.1;
  osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination); osc.start();
  window.addEventListener('mousemove', e => {
    const my = e.clientY / window.innerHeight;
    if (audioCtx.state === 'running') filter.frequency.linearRampToValueAtTime(100 + (1 - my) * 800, audioCtx.currentTime + 0.1);
  });
  if (stream && stream.getAudioTracks().length > 0) {
    const src = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
    src.connect(analyser); dataArray = new Uint8Array(analyser.frequencyBinCount);
  }
}

// ─── Webcam ───────────────────────────────────────────────────────
const video = document.getElementById('webcam');
const vCanvas = document.getElementById('vCanvas');
const vCtx = vCanvas.getContext('2d', { willReadFrequently: true });
let webcamActive = false, engineRunning = false, holoReady = false;

// ─── Particles ────────────────────────────────────────────────────
const N = 10000;
function genShape(type) {
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let x = 0, y = 0, z = 0, r = 0, g = 1, b = 0.8;
    if (type === 'dna') {
      const t = (i / N) * Math.PI * 40, h = (i / N) * 100 - 50, R = 12, off = (i % 2) ? Math.PI : 0;
      x = Math.cos(t + off) * R + (Math.random() - .5) * 2;
      y = h + (Math.random() - .5) * 2;
      z = Math.sin(t + off) * R + (Math.random() - .5) * 2;
      // Rose-pink for Blossom DNA
      r = 0.96; g = 0.25; b = 0.55;
    } else if (type === 'knot') {
      const t = (i / N) * Math.PI * 2 * 120, p = 3, q = 4, rc = 15;
      x = rc * (Math.cos(p * t) + 2) * Math.cos(q * t) * .4 + (Math.random() - .5) * 3;
      y = rc * (Math.cos(p * t) + 2) * Math.sin(q * t) * .4 + (Math.random() - .5) * 3;
      z = rc * Math.sin(p * t) * .4 + (Math.random() - .5) * 3;
      // Microsoft Blue for Cloud Knot
      r = 0.0; g = 0.47; b = 0.83;
    } else if (type === 'grid') {
      const row = 20;
      x = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random() - .5);
      y = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random() - .5);
      z = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random() - .5);
      // Lavender for Glow Matrix
      r = 0.77; g = 0.71; b = 0.98;
    } else { // sphere
      const u = Math.random(), v = Math.random();
      const theta = u * 2 * Math.PI, phi = Math.acos(2 * v - 1), rad = 30;
      x = rad * Math.sin(phi) * Math.cos(theta);
      y = rad * Math.sin(phi) * Math.sin(theta);
      z = rad * Math.cos(phi);
      // Rose Gold for default sphere
      r = 0.91; g = 0.65; b = 0.60;
    }
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    col[i*3]=r; col[i*3+1]=g; col[i*3+2]=b;
  }
  return { pos, col };
}
const shapes = { dna: genShape('dna'), knot: genShape('knot'), grid: genShape('grid'), sphere: genShape('sphere') };
const basePos = new Float32Array(shapes.sphere.pos);
const baseCol = new Float32Array(shapes.sphere.col);
const rendPos = new Float32Array(shapes.sphere.pos);
const rendCol = new Float32Array(shapes.sphere.col);
const snapPos = new Float32Array(N * 3);
const snapCol = new Float32Array(N * 3);

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(rendPos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(rendCol, 3));
const mat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
const pts = new THREE.Points(geo, mat);
pts.position.x = 10;
scene.add(pts);

// Morph
let activeShape = 'sphere', transState = { progress: 0 };
function morphTo(id) {
  if (id === 'mirror' && !webcamActive) id = 'sphere';
  activeShape = id;
  gsap.to(rgbPass.uniforms['amount'], { value: 0.03, duration: 0.1, yoyo: true, repeat: 5, ease: 'rough' });
  gsap.to(camera.position, { x: (Math.random()-.5)*40, y: (Math.random()-.5)*20, z: 60+Math.random()*30, duration: 3, ease: 'power2.inOut', onUpdate: () => camera.lookAt(new THREE.Vector3(10,0,0)) });
  if (id === 'mirror') return;
  const tp = shapes[id]?.pos || shapes.sphere.pos;
  const tc = shapes[id]?.col || shapes.sphere.col;
  snapPos.set(basePos); snapCol.set(baseCol);
  transState.progress = 0; gsap.killTweensOf(transState);
  gsap.to(transState, { progress: 1, duration: 3.5, ease: 'expo.inOut', onUpdate: () => {
    for (let i = 0; i < N*3; i++) {
      basePos[i] = THREE.MathUtils.lerp(snapPos[i], tp[i], transState.progress);
      baseCol[i] = THREE.MathUtils.lerp(snapCol[i], tc[i], transState.progress);
    }
  }});
}

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse3D = new THREE.Vector2();
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({ visible: false }));
scene.add(plane);
frame.addEventListener('mousemove', e => {
  const r = frame.getBoundingClientRect();
  mouse3D.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mouse3D.y = -((e.clientY - r.top) / r.height) * 2 + 1;
});
frame.addEventListener('mouseleave', () => mouse3D.set(0, 0));

// HUD Nav
const holoNavItems = document.querySelectorAll('.holo-nav-item');
const holoPanels = document.querySelectorAll('.holo-panel');
holoNavItems.forEach(item => {
  item.addEventListener('click', () => {
    if (!holoReady) return;
    if (audioCtx?.state === 'running') {
      const blip = audioCtx.createOscillator(); blip.type = 'square';
      blip.frequency.setValueAtTime(600, audioCtx.currentTime);
      blip.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
      const bg = audioCtx.createGain(); bg.gain.setValueAtTime(0.06, audioCtx.currentTime);
      bg.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      blip.connect(bg); bg.connect(audioCtx.destination); blip.start(); blip.stop(audioCtx.currentTime + 0.1);
    }
    holoNavItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const t = item.getAttribute('data-target');
    morphTo(t);
    holoPanels.forEach(p => p.classList.remove('active'));
    document.getElementById(`holo-content-${t}`)?.classList.add('active');
  });
});

function startHolo(initial) {
  if (audioCtx?.state === 'suspended') audioCtx.resume();
  const launch = document.getElementById('holo-launch');
  if (launch) { launch.classList.add('hidden'); setTimeout(() => { launch.style.display = 'none'; }, 1100); }
  const ui = document.getElementById('holo-ui');
  if (ui) { ui.style.opacity = '1'; ui.style.pointerEvents = 'auto'; }
  morphTo(initial);
  holoReady = true; engineRunning = true;
}

document.getElementById('holo-start')?.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ video: { width: 100, height: 100 }, audio: true })
    .then(s => { video.srcObject = s; video.play(); webcamActive = true; initAudio(s); startHolo('mirror'); })
    .catch(() => {
      navigator.mediaDevices.getUserMedia({ video: { width: 100, height: 100 } })
        .then(s => { video.srcObject = s; video.play(); webcamActive = true; initAudio(null); startHolo('mirror'); })
        .catch(() => { initAudio(null); startHolo('dna'); });
    });
});
document.getElementById('holo-skip')?.addEventListener('click', () => { initAudio(null); startHolo('dna'); });

// ─── Render Loop ──────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (!engineRunning) return;
  const dt = Math.min(clock.getDelta(), 0.1);
  let audioBump = 0;
  if (analyser) { analyser.getByteFrequencyData(dataArray); let s = 0; for (let i=0;i<40;i++) s+=dataArray[i]; audioBump = (s/40)/255; }
  const envScale = 1 + audioBump * 0.8;

  if (activeShape === 'mirror' && webcamActive && video.readyState === video.HAVE_ENOUGH_DATA) {
    vCtx.drawImage(video, 0, 0, 100, 100);
    const d = vCtx.getImageData(0, 0, 100, 100).data;
    for (let i = 0; i < N; i++) {
      const xi = i % 100, yi = Math.floor(i / 100);
      const mx = ((100 - xi) - 50) * 0.8, my = (-(yi - 50)) * 0.8;
      const pi = i*4, r=d[pi]/255, g=d[pi+1]/255, b=d[pi+2]/255, br=(r+g+b)/3, mz=(br*30-15);
      const idx=i*3;
      basePos[idx]+=(mx-basePos[idx])*.1; basePos[idx+1]+=(my-basePos[idx+1])*.1; basePos[idx+2]+=(mz-basePos[idx+2])*.1;
      baseCol[idx]+=(r-baseCol[idx])*.1; baseCol[idx+1]+=(g-baseCol[idx+1])*.1; baseCol[idx+2]+=(b-baseCol[idx+2])*.1;
    }
  } else { pts.rotation.y += 0.001; }

  raycaster.setFromCamera(mouse3D, camera);
  const hits = raycaster.intersectObject(plane);
  let mp = null; if (hits.length > 0) mp = hits[0].point;

  for (let i = 0; i < N; i++) {
    const idx = i*3; let dx=0,dy=0,dz=0;
    if (mp) {
      const mx=mp.x-pts.position.x, my=mp.y;
      const dxr=rendPos[idx]-mx, dyr=rendPos[idx+1]-my, dsq=dxr*dxr+dyr*dyr;
      if (dsq<200) { const f=(200-dsq)/200; dx=dxr*f*.3; dy=dyr*f*.3; dz=f*20; }
    }
    const tx=basePos[idx]*(activeShape==='mirror'?1:envScale), ty=basePos[idx+1]*(activeShape==='mirror'?1:envScale), tz=basePos[idx+2]*(activeShape==='mirror'?1:envScale);
    rendPos[idx]+=(tx+dx-rendPos[idx])*.15; rendPos[idx+1]+=(ty+dy-rendPos[idx+1])*.15; rendPos[idx+2]+=(tz+dz-rendPos[idx+2])*.15;
    rendCol[idx]=THREE.MathUtils.lerp(baseCol[idx],1,audioBump*.8);
    rendCol[idx+1]=THREE.MathUtils.lerp(baseCol[idx+1],1,audioBump*.8);
    rendCol[idx+2]=THREE.MathUtils.lerp(baseCol[idx+2],1,audioBump*.8);
  }
  bloomPass.strength = 2.4 + audioBump * 2;
  rgbPass.uniforms['amount'].value = 0.0015 + Math.abs(mouse3D.x) * 0.001;
  geo.attributes.position.needsUpdate = true;
  geo.attributes.color.needsUpdate = true;
  composer.render();
}

// Start pre-rendering once in view
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting && !engineRunning) { engineRunning = true; animate(); } });
}, { threshold: 0.05 });
obs.observe(frame);
