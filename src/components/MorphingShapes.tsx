import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Language } from '../types';

const PALETTE = ['#ff3c78', '#ff8c00', '#fff200', '#00cfff', '#b400ff', '#ffffff', '#ff4040'];
const MORPH_SPEED = 0.012;

const fit = (pts: THREE.Vector3[], size: number) => {
  const box = new THREE.Box3().setFromPoints(pts);
  const dims = box.getSize(new THREE.Vector3());
  const scale = size / (Math.max(dims.x, dims.y, dims.z) || 1);
  const centre = box.getCenter(new THREE.Vector3());
  return pts.map((p) => p.sub(centre).multiplyScalar(scale));
};

const torusKnot = (n: number) => {
  const geo = new THREE.TorusKnotGeometry(10, 3, 200, 16, 2, 3);
  const pos = geo.attributes.position;
  const pts = Array.from({ length: n }, (_, i) => new THREE.Vector3().fromBufferAttribute(pos, i % pos.count));
  geo.dispose();
  return fit(pts, 50);
};

const halvorsen = (n: number) => {
  const pts: THREE.Vector3[] = [];
  let x = 0.1, y = 0, z = 0;
  const a = 1.89, dt = 0.005;
  for (let i = 0; pts.length < n && i < n * 25; i++) {
    const dx = -a * x - 4 * y - 4 * z - y * y;
    const dy = -a * y - 4 * z - 4 * x - z * z;
    const dz = -a * z - 4 * x - 4 * y - x * x;
    x += dx * dt; y += dy * dt; z += dz * dt;
    if (i > 200 && i % 25 === 0) pts.push(new THREE.Vector3(x, y, z));
  }
  while (pts.length < n) pts.push(pts[Math.floor(Math.random() * pts.length)].clone());
  return fit(pts, 60);
};

const doubleHelix = (n: number) =>
  fit(
    Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 10;
      const r = 15 + (i % 2 ? -5 : 5);
      return new THREE.Vector3(Math.cos(angle) * r, (i / n) * 40 - 20, Math.sin(angle) * r);
    }),
    60,
  );

const deJong = (n: number) => {
  let x = 0.1, y = 0.1;
  return fit(
    Array.from({ length: n }, () => {
      const xn = Math.sin(1.4 * y) - Math.cos(-2.3 * x);
      y = Math.sin(2.4 * x) - Math.cos(-2.1 * y);
      x = xn;
      return new THREE.Vector3(x, y, Math.sin(x * y * 0.5));
    }),
    55,
  );
};

const SHAPES = [
  { name: 'Torus Knot', build: torusKnot },
  { name: 'Halvorsen', build: halvorsen },
  { name: 'Double Helix', build: doubleHelix },
  { name: 'De Jong', build: deJong },
];

const DRIFT = /* glsl */ `
  float t = time * 0.25 * random.z;
  float ax = t + random.y;
  float ay = t * 0.75 + random.x;
  float amp = (0.6 + sin(random.x + t * 0.6) * 0.3) * random.z;
  p.x += sin(ax + p.y * 0.06 + random.x * 0.1) * amp;
  p.y += cos(ay + p.z * 0.06 + random.y * 0.1) * amp;
  p.z += sin(ax * 0.85 + p.x * 0.06 + random.z * 0.1) * amp;
`;

const PARTICLE_VERT = /* glsl */ `
  uniform float time;
  attribute float size;
  attribute vec3 random;
  varying vec3 vCol;
  varying float vR;
  void main() {
    vCol = color;
    vR = random.z;
    vec3 p = position;
    ${DRIFT}
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = size * (0.9 + 0.1 * sin(time * 1.15 + random.y)) * (350.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const PARTICLE_FRAG = /* glsl */ `
  uniform float time;
  varying vec3 vCol;
  varying float vR;
  vec3 hueShift(vec3 c, float h) {
    const vec3 k = vec3(0.57735);
    return c * cos(h) + cross(k, c) * sin(h) + k * dot(k, c) * (1.0 - cos(h));
  }
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.05, 0.0, d);
    float flare = pow(max(0.0, sin(atan(uv.y, uv.x) * 6.0 + time * 2.0 * vR)), 4.0) * smoothstep(0.5, 0.0, d);
    float glow = smoothstep(0.4, 0.1, d);
    float alpha = core + flare * 0.5 + glow * 0.2;
    if (alpha < 0.01) discard;
    vec3 c = hueShift(vCol, time * 0.1);
    vec3 col = mix(mix(c, vec3(1.0, 0.95, 0.9), core), c, flare * 0.5 + glow * 0.5);
    gl_FragColor = vec4(col, alpha);
  }`;

const SPARKLE_VERT = /* glsl */ `
  uniform float time;
  attribute float size;
  attribute vec3 random;
  void main() {
    vec3 p = position;
    ${DRIFT}
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = size * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const STAR_VERT = /* glsl */ `
  attribute float size;
  attribute float random;
  varying vec3 vColor;
  varying float vRnd;
  void main() {
    vColor = color;
    vRnd = random;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (250.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const STAR_FRAG = /* glsl */ `
  uniform float time;
  varying vec3 vColor;
  varying float vRnd;
  void main() {
    float a = (1.0 - smoothstep(0.4, 0.5, length(gl_PointCoord - 0.5))) * (0.7 + 0.3 * sin(time * (0.6 + vRnd * 0.3) + vRnd * 5.0));
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }`;

const DOT_FRAG = /* glsl */ `
  void main() {
    float a = 1.0 - smoothstep(0.4, 0.5, length(gl_PointCoord - 0.5));
    if (a < 0.01) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, a);
  }`;

const pointsMaterial = (vertexShader: string, fragmentShader: string, vertexColors: boolean) =>
  new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    vertexColors,
    blending: THREE.AdditiveBlending,
  });

export const MorphingShapes: React.FC<{ lang: Language }> = ({ lang }) => {
  const fr = lang === 'fr';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const morphRef = useRef<() => void>(() => {});
  const [shape, setShape] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const mobile = window.innerWidth < 768;
    const PC = mobile ? 5000 : 15000;
    const SC = mobile ? 500 : 1500;
    const STARS = mobile ? 2000 : 7000;
    const { width, height } = container.getBoundingClientRect();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050203, 0.012);
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2500);
    camera.position.set(0, 0, 80);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x040307);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STARS * 3);
    const starCol = new Float32Array(STARS * 3);
    const starSize = new Float32Array(STARS);
    const starRnd = new Float32Array(STARS);
    for (let i = 0; i < STARS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 900 * Math.cbrt(Math.random());
      starPos.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
      const c = new THREE.Color().setHSL(Math.random() * 0.6, 0.3 + 0.3 * Math.random(), 0.55 + 0.35 * Math.random());
      starCol.set([c.r, c.g, c.b], i * 3);
      starSize[i] = 0.25 + Math.pow(Math.random(), 4) * 2.1;
      starRnd[i] = Math.random() * Math.PI * 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSize, 1));
    starGeo.setAttribute('random', new THREE.BufferAttribute(starRnd, 1));
    const starMat = pointsMaterial(STAR_VERT, STAR_FRAG, true);
    scene.add(new THREE.Points(starGeo, starMat));

    // Particles
    const palette = PALETTE.map((c) => new THREE.Color(c));
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PC * 3);
    const pCol = new Float32Array(PC * 3);
    const pSize = new Float32Array(PC);
    const pRnd = new Float32Array(PC * 3);
    const hsl = { h: 0, s: 0, l: 0 };
    for (let i = 0; i < PC; i++) {
      palette[Math.floor(Math.random() * palette.length)].getHSL(hsl);
      const c = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.05,
        Math.min(1, Math.max(0.7, hsl.s + (Math.random() - 0.5) * 0.3)),
        Math.min(0.9, Math.max(0.5, hsl.l + (Math.random() - 0.5) * 0.4)),
      );
      pCol.set([c.r, c.g, c.b], i * 3);
      pSize[i] = 0.7 + Math.random() * 1.1;
      pRnd.set([Math.random() * 10, Math.random() * Math.PI * 2, 0.5 + 0.5 * Math.random()], i * 3);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
    pGeo.setAttribute('random', new THREE.BufferAttribute(pRnd, 3));
    const pMat = pointsMaterial(PARTICLE_VERT, PARTICLE_FRAG, true);
    scene.add(new THREE.Points(pGeo, pMat));

    // Sparkles share the first SC particle positions.
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(SC * 3);
    const sSize = new Float32Array(SC);
    const sRnd = new Float32Array(SC * 3);
    for (let i = 0; i < SC; i++) {
      sSize[i] = 0.5 + Math.random() * 0.8;
      sRnd.set([Math.random() * 10, Math.random() * Math.PI * 2, 0.5 + 0.5 * Math.random()], i * 3);
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('size', new THREE.BufferAttribute(sSize, 1));
    sGeo.setAttribute('random', new THREE.BufferAttribute(sRnd, 3));
    const sMat = pointsMaterial(SPARKLE_VERT, DOT_FRAG, false);
    scene.add(new THREE.Points(sGeo, sMat));

    const writeShape = (idx: number, target: Float32Array) => {
      SHAPES[idx].build(PC).forEach((p, j) => target.set([p.x, p.y, p.z], j * 3));
    };
    writeShape(0, pPos);
    sPos.set(pPos.subarray(0, SC * 3));

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.4, 0.15);
    composer.addPass(bloom);
    const after = new AfterimagePass();
    after.uniforms.damp.value = 0.85;
    composer.addPass(after);
    composer.addPass(new OutputPass());

    let current = 0;
    let morph: { from: Float32Array; to: Float32Array; next: number; prog: number } | null = null;
    morphRef.current = () => {
      if (morph) return;
      const next = (current + 1) % SHAPES.length;
      const to = new Float32Array(PC * 3);
      writeShape(next, to);
      morph = { from: pPos.slice(), to, next, prog: 0 };
      setShape(next);
    };

    let raf = 0;
    let visible = false;
    let elapsed = 0;
    let last = performance.now();
    const loop = () => {
      raf = visible ? requestAnimationFrame(loop) : 0;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      controls.update();
      starMat.uniforms.time.value = elapsed;
      pMat.uniforms.time.value = elapsed;
      sMat.uniforms.time.value = elapsed;

      if (morph) {
        morph.prog = Math.min(1, morph.prog + MORPH_SPEED);
        const e = 1 - Math.pow(1 - morph.prog, 3);
        for (let i = 0; i < pPos.length; i++) pPos[i] = morph.from[i] + (morph.to[i] - morph.from[i]) * e;
        sPos.set(pPos.subarray(0, SC * 3));
        pGeo.attributes.position.needsUpdate = true;
        sGeo.attributes.position.needsUpdate = true;
        if (morph.prog >= 1) {
          current = morph.next;
          morph = null;
        }
      }
      composer.render(dt);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(container);

    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      [starGeo, pGeo, sGeo].forEach((g) => g.dispose());
      [starMat, pMat, sMat].forEach((m) => m.dispose());
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing">
      <canvas ref={canvasRef} className="block h-full w-full touch-pan-y" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)]" />

      <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md sm:left-6 sm:top-6">
        {SHAPES[shape].name}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 sm:right-6 sm:top-6">
        {fr ? 'Glisser pour explorer' : 'Drag to explore'}
      </span>

      <button
        type="button"
        onClick={() => morphRef.current()}
        className="absolute bottom-5 left-1/2 min-h-[44px] -translate-x-1/2 rounded-full border border-white/15 bg-white/5 px-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-zinc-950 sm:bottom-7"
      >
        {fr ? 'Transformer' : 'Morph shape'}
      </button>
    </div>
  );
};
