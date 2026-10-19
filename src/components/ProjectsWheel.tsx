import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Hand, X } from 'lucide-react';
import * as THREE from 'three';
import type { GestureRecognizer } from '@mediapipe/tasks-vision';
import { Project, Language } from '../types';

interface ProjectsWheelProps {
  projects: Project[];
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

const MIN_SLOTS = 16;
const CARD_W = 2;
const CARD_H = 3;
// The card turned toward the viewer sits on the left of the ring.
const FACING = -Math.PI / 2;
const TILT = -0.28;
const VISION_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';
const GESTURE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
const HAND_LINKS = [
  [0, 1, 2, 3, 4],
  [0, 5, 6, 7, 8],
  [0, 9, 10, 11, 12],
  [0, 13, 14, 15, 16],
  [0, 17, 18, 19, 20],
  [5, 9, 13, 17],
];

type GestureState = 'off' | 'loading' | 'on' | 'error';

interface Motion {
  rotation: number;
  target: number;
  velocity: number;
  pointer: { x: number; y: number };
  dragging: boolean;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

const openProject = (project: Project, onSelect: (p: Project) => void) => {
  const url = project.liveUrl || project.githubUrl;
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
  else onSelect(project);
};

// ─── 3D wheel ────────────────────────────────────────────────────────────────

const Card: React.FC<{
  url: string;
  angle: number;
  radius: number;
  active: boolean;
  onClick: () => void;
}> = ({ url, angle, radius, active, onClick }) => {
  const ref = useRef<THREE.Mesh>(null);
  const lift = useRef(0);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    lift.current += ((active ? 0.35 : 0) - lift.current) * 0.1;
    mesh.position.set(radius * Math.sin(angle), lift.current, radius * Math.cos(angle));
  });

  return (
    <Image
      ref={ref}
      url={url}
      scale={[CARD_W, CARD_H]}
      radius={0.08}
      side={THREE.DoubleSide}
      rotation={[0, Math.PI / 2 + angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
};

const Wheel: React.FC<{
  slots: Project[];
  motionRef: React.MutableRefObject<Motion>;
  activeSlot: number;
  onActiveChange: (slot: number) => void;
  onCardClick: (slot: number) => void;
}> = ({ slots, motionRef, activeSlot, onActiveChange, onCardClick }) => {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const count = slots.length;
  const step = (Math.PI * 2) / count;
  const radius = Math.max(3, Math.min(4.4, (size.width / size.height) * 3));

  useFrame((_, delta) => {
    const m = motionRef.current;
    const dt = Math.min(delta * 60, 3);

    if (Math.abs(m.velocity) > 1e-4) {
      m.target += m.velocity * dt;
      m.velocity *= m.dragging ? 1 : 0.95;
    } else if (!m.dragging) {
      // Ease to the nearest card once the wheel settles.
      m.target += (FACING + Math.round((m.target - FACING) / step) * step - m.target) * 0.06 * dt;
    }
    m.rotation += (m.target - m.rotation) * 0.1 * dt;
    if (group.current) group.current.rotation.y = m.rotation;

    const front = mod(Math.round((FACING - m.rotation) / step), count);
    if (front !== activeSlot) onActiveChange(front);

    camera.position.x += (-m.pointer.x * 1.6 - camera.position.x) * 0.06;
    camera.position.y += (6 + m.pointer.y * 1.4 - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group rotation={[TILT, 0, 0]} scale={Math.min(1, size.width / size.height / 0.75)}>
      <group ref={group}>
        {slots.map((project, i) => (
          <Card
            key={`${project.id}-${i}`}
            url={project.image}
            angle={i * step}
            radius={radius}
            active={i === activeSlot}
            onClick={() => onCardClick(i)}
          />
        ))}
      </group>
    </group>
  );
};

// ─── Hand tracking ───────────────────────────────────────────────────────────

const useHandControl = (
  enabled: boolean,
  motionRef: React.MutableRefObject<Motion>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  blobRef: React.RefObject<HTMLDivElement | null>,
  setState: (s: GestureState) => void,
  setGesture: (g: string) => void,
) => {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let recognizer: GestureRecognizer | null = null;
    let lastVideoTime = -1;
    let lastGesture = '';

    const start = async () => {
      setState('loading');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        });
        const video = videoRef.current;
        if (cancelled || !video) return;
        video.srcObject = stream;
        await video.play();

        const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(VISION_WASM);
        recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: GESTURE_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        if (cancelled) return;
        setState('on');
        raf = requestAnimationFrame(loop);
      } catch (err) {
        console.error('Hand control failed', err);
        if (!cancelled) setState('error');
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !recognizer || video.readyState < 2 || video.currentTime === lastVideoTime) return;
      lastVideoTime = video.currentTime;

      const result = recognizer.recognizeForVideo(video, performance.now());
      const m = motionRef.current;
      const gesture = result.gestures[0]?.[0]?.categoryName ?? '';
      if (gesture !== lastGesture) {
        lastGesture = gesture;
        setGesture(gesture);
      }

      if (gesture === 'Open_Palm') m.velocity = -0.02;
      else if (gesture === 'Closed_Fist') m.velocity = 0;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch);

      const hand = result.landmarks[0];
      const blob = blobRef.current;
      if (!hand) {
        if (blob) blob.style.opacity = '0';
        return;
      }

      // Map normalized video coords onto the object-fit: cover, mirrored video.
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(cw / vw, ch / vh);
      const ox = (vw * scale - cw) / 2;
      const oy = (vh * scale - ch) / 2;
      const toScreen = (p: { x: number; y: number }) => ({
        x: (1 - p.x) * vw * scale - ox,
        y: p.y * vh * scale - oy,
      });

      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      HAND_LINKS.forEach((chain) => {
        chain.forEach((idx, i) => {
          const p = toScreen(hand[idx]);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
      });
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      hand.forEach((lm) => {
        const p = toScreen(lm);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      const palm = toScreen(hand[9]);
      if (blob) {
        blob.style.opacity = '1';
        blob.style.transform = `translate3d(${palm.x}px, ${palm.y}px, 0) scale(${gesture === 'Closed_Fist' ? 0.7 : 1})`;
      }
      m.pointer.x = m.pointer.x * 0.7 + ((palm.x / cw) * 2 - 1) * 0.3;
      m.pointer.y = m.pointer.y * 0.7 + (-(palm.y / ch) * 2 + 1) * 0.3;
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      recognizer?.close();
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setGesture('');
    };
  }, [enabled, motionRef, videoRef, canvasRef, blobRef, setState, setGesture]);
};

// ─── Section ─────────────────────────────────────────────────────────────────

export const ProjectsWheel: React.FC<ProjectsWheelProps> = ({ projects, lang, onSelectProject, onHoverItem, onLeaveItem }) => {
  const fr = lang === 'fr';
  const slots = useMemo(() => {
    if (projects.length === 0) return [];
    const repeat = Math.max(1, Math.ceil(MIN_SLOTS / projects.length));
    return Array.from({ length: repeat }, () => projects).flat();
  }, [projects]);

  const motionRef = useRef<Motion>({ rotation: FACING, target: FACING, velocity: 0, pointer: { x: 0, y: 0 }, dragging: false });
  const [activeSlot, setActiveSlot] = useState(0);
  const [inView, setInView] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>('off');
  const [gesture, setGesture] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; t: number; moved: number } | null>(null);

  const handActive = gestureState === 'loading' || gestureState === 'on';
  useHandControl(handActive, motionRef, videoRef, handCanvasRef, blobRef, setGestureState, setGesture);

  const count = slots.length;
  const step = count ? (Math.PI * 2) / count : 0;
  const active = slots[activeSlot] ?? projects[0];
  const activeIndex = active ? projects.indexOf(active) : 0;

  useEffect(() => {
    motionRef.current.target = FACING;
    motionRef.current.velocity = 0;
    setActiveSlot(0);
  }, [projects]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView && handActive) setGestureState('off');
  }, [inView, handActive]);

  const goTo = useCallback(
    (slot: number) => {
      const m = motionRef.current;
      const current = Math.round((FACING - m.target) / step);
      let delta = mod(slot - current, count);
      if (delta > count / 2) delta -= count;
      m.velocity = 0;
      m.target -= delta * step;
    },
    [count, step],
  );

  const handleCardClick = useCallback(
    (slot: number) => {
      if (dragRef.current && dragRef.current.moved > 6) return;
      if (slot === activeSlot) openProject(slots[slot], onSelectProject);
      else goTo(slot);
    },
    [activeSlot, slots, onSelectProject, goTo],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, t: performance.now(), moved: 0 };
    motionRef.current.dragging = true;
    motionRef.current.velocity = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect && gestureState !== 'on') {
      motionRef.current.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      motionRef.current.pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    const drag = dragRef.current;
    if (!drag || !motionRef.current.dragging) return;
    const dx = e.clientX - drag.x;
    const now = performance.now();
    drag.moved += Math.abs(dx);
    const amount = (dx / (rect?.width ?? 1000)) * Math.PI * 1.2;
    motionRef.current.target += amount;
    motionRef.current.velocity = (amount / Math.max(now - drag.t, 1)) * 16;
    drag.x = e.clientX;
    drag.t = now;
  };
  const endDrag = () => {
    motionRef.current.dragging = false;
    window.setTimeout(() => {
      dragRef.current = null;
    }, 0);
  };

  if (!active) return null;
  const tags = (active.role ?? []).filter(Boolean).slice(0, 3);
  const gestureLabel: Record<string, string> = fr
    ? { Open_Palm: 'Main ouverte — rotation', Closed_Fist: 'Poing fermé — stop' }
    : { Open_Palm: 'Open palm — spinning', Closed_Fist: 'Closed fist — stop' };

  return (
    <div
      ref={stageRef}
      className="relative h-[78vh] min-h-[560px] w-full touch-pan-y select-none overflow-hidden rounded-[1.75rem] bg-zinc-950 text-white sm:rounded-[2.5rem]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        endDrag();
        if (gestureState !== 'on') motionRef.current.pointer = { x: 0, y: 0 };
        onLeaveItem?.();
      }}
      onMouseEnter={() => onHoverItem?.(fr ? 'GLISSER' : 'DRAG')}
    >
      {/* Webcam background (hand control only) */}
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full -scale-x-100 object-cover grayscale transition-opacity duration-700 ${gestureState === 'on' ? 'opacity-35' : 'opacity-0'}`}
      />

      <Canvas
        className="!absolute inset-0"
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 6, 6], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Wheel
            slots={slots}
            motionRef={motionRef}
            activeSlot={activeSlot}
            onActiveChange={setActiveSlot}
            onCardClick={handleCardClick}
          />
        </Suspense>
      </Canvas>

      <canvas ref={handCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-white/80 opacity-0 shadow-[0_0_24px_rgba(255,255,255,0.45)] transition-[opacity] duration-200"
      />

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 sm:text-xs">
          {fr ? 'Glisser pour tourner' : 'Drag to spin'}
        </span>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setGestureState(handActive ? 'off' : 'loading')}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md transition-colors hover:bg-white hover:text-zinc-950 sm:text-xs"
          >
            {handActive ? <X className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
            {gestureState === 'loading'
              ? fr ? 'Activation…' : 'Starting…'
              : handActive
                ? fr ? 'Couper la caméra' : 'Stop camera'
                : fr ? 'Contrôle à la main' : 'Hand control'}
          </button>
          <AnimatePresence>
            {gestureState === 'on' && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-[240px] text-right font-mono text-[10px] uppercase leading-relaxed tracking-wider text-white/60"
              >
                {gestureLabel[gesture] ?? (fr ? 'Main ouverte : tourner · Poing : stop' : 'Open palm: spin · Fist: stop')}
              </motion.p>
            )}
            {gestureState === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[240px] text-right font-mono text-[10px] uppercase leading-relaxed tracking-wider text-red-300"
              >
                {fr ? 'Caméra indisponible ou refusée' : 'Camera unavailable or denied'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active project */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 pt-24 sm:p-8">
        <div className="flex min-w-0 items-end gap-4 sm:gap-6">
          <AnimatePresence mode="wait">
            <motion.img
              key={active.id + '-thumb'}
              src={active.image}
              alt=""
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="hidden h-[180px] w-[120px] shrink-0 rounded-2xl object-cover shadow-2xl sm:block lg:h-[240px] lg:w-[160px]"
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="min-w-0"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/60 sm:text-xs">
                {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} — {active.year}
              </p>
              <h3 className="font-urbanist mt-1 truncate text-3xl text-white sm:text-5xl lg:text-6xl">{active.title}</h3>
              <p className="mt-2 line-clamp-1 font-mono text-[10px] uppercase tracking-wider text-white/50 sm:text-xs">
                {tags.join(' • ')}
              </p>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => openProject(active, onSelectProject)}
                className="pointer-events-auto mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 transition-transform hover:scale-[1.03]"
              >
                {fr ? 'Voir le projet' : 'View project'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto flex shrink-0 gap-2">
          <button
            type="button"
            aria-label={fr ? 'Projet précédent' : 'Previous project'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(mod(activeSlot - 1, count))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={fr ? 'Projet suivant' : 'Next project'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(mod(activeSlot + 1, count))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-zinc-950"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
