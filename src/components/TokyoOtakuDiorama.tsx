import React, { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Tv, Eye, Image as ImageIcon, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { dioramaAudio } from './diorama/DioramaSoundEngine';
import { InteractiveLightSwitch3D } from './diorama/InteractiveLightSwitch3D';
import { InteractiveItems3D } from './diorama/InteractiveItems3D';

interface TokyoOtakuDioramaProps {
  className?: string;
  theme?: 'light' | 'dark';
}

type LightingMood = 'night' | 'sunset' | 'cyberpunk';
type CameraView = 'diorama' | 'crt' | 'window' | 'posters';

const PHRASES = [
  'SO, WHAT\nDO YOU FEEL?',
  'ELIOT LAB //\nCREATIVE DEV',
  'PRESS START\nTO EXPLORE',
  'NEO TOKYO //\n02:42 AM',
  'WAKE UP,\nSAMURAI...',
];

const CAMERA_PRESETS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number] }> = {
  diorama: {
    pos: [1.6, 2.5, 4.4],
    target: [0.0, 0.7, 0.6],
  },
  crt: {
    pos: [-0.05, 1.15, 1.3],
    target: [-0.3, 0.88, -0.6],
  },
  window: {
    pos: [0.2, 1.4, 2.2],
    target: [0.6, 1.2, -1.0],
  },
  posters: {
    pos: [-0.35, 1.35, 1.35],
    target: [1.65, 1.35, 1.35],
  },
};

// Helper to draw authentic CRT scanline text texture
function createCrtTexture(text: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#030804';
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 320);
  grad.addColorStop(0, 'rgba(0, 40, 10, 0.4)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 18;
  ctx.fillStyle = colorHex;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = 54;
  const startY = 256 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, 256, startY + i * lineHeight);
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  const glareGrad = ctx.createLinearGradient(0, 0, 512, 512);
  glareGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  glareGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.16)');
  glareGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = glareGrad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Living Tokyo Window Sky: strictly framed behind bay window, with twinkling skyscraper lights, highway streams, and crossing airplanes
const TokyoWindowSky: React.FC<{ mood: LightingMood; isHovered?: boolean }> = ({ mood, isHovered }) => {
  const skylineTexture = useTexture('/models/tokyo_skyline.jpg');
  const pointsRef = useRef<THREE.Points>(null);
  const beaconsRef = useRef<THREE.Points>(null);
  const trafficRef = useRef<THREE.Points>(null);
  const airplane1Ref = useRef<THREE.Group>(null);
  const airplane2Ref = useRef<THREE.Group>(null);
  const strobe1Ref = useRef<THREE.Mesh>(null);
  const strobe2Ref = useRef<THREE.Mesh>(null);
  const beacon1Ref = useRef<THREE.Mesh>(null);
  const beacon2Ref = useRef<THREE.Mesh>(null);

  useMemo(() => {
    skylineTexture.wrapS = THREE.RepeatWrapping;
    skylineTexture.wrapT = THREE.RepeatWrapping;
    // Repeat and offset with Y inverted (-1.0, 1.0) so buildings stand upright with sky at the top!
    skylineTexture.repeat.set(0.60, -1.0);
    skylineTexture.offset.set(0.20, 1.0);
  }, [skylineTexture]);

  // 1. Generate twinkling window lights on skyscrapers
  const { positions, colors, phases, speeds } = useMemo(() => {
    const count = 260;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);

    const colorPalette = [
      new THREE.Color('#38bdf8'), // Cyan neon
      new THREE.Color('#f59e0b'), // Amber window
      new THREE.Color('#fbbf24'), // Warm gold
      new THREE.Color('#ffffff'), // Crisp white
      new THREE.Color('#ff4444'), // Red window/sign
      new THREE.Color('#c084fc'), // Purple neon
    ];

    for (let i = 0; i < count; i++) {
      const theta = (0.69 + Math.random() * 0.62) * Math.PI;
      const r = 1.50 + Math.random() * 0.015;
      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);
      // Upright building levels: Y from 0.40 to 1.70
      const y = 0.40 + Math.random() * 1.30;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 1.2 + Math.random() * 3.5;
    }
    return { positions: pos, colors: col, phases: ph, speeds: sp };
  }, []);

  // 2. Skyscraper Radio Antenna Warning Beacons (synchronized red flashes)
  const beaconPositions = useMemo(() => {
    const pos = [
      [1.25 * Math.sin(0.78 * Math.PI), 1.78, 1.25 * Math.cos(0.78 * Math.PI)],
      [1.35 * Math.sin(0.92 * Math.PI), 1.84, 1.35 * Math.cos(0.92 * Math.PI)],
      [1.40 * Math.sin(1.04 * Math.PI), 1.92, 1.40 * Math.cos(1.04 * Math.PI)],
      [1.38 * Math.sin(1.15 * Math.PI), 1.82, 1.38 * Math.cos(1.15 * Math.PI)],
      [1.30 * Math.sin(1.24 * Math.PI), 1.74, 1.30 * Math.cos(1.24 * Math.PI)],
      [1.32 * Math.sin(0.85 * Math.PI), 1.70, 1.32 * Math.cos(0.85 * Math.PI)],
    ];
    return new Float32Array(pos.flat());
  }, []);

  // 3. Moving Expressway Highway Traffic Streams
  const { trafficPositions, trafficColors, trafficSpeeds, trafficOffsets } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      off[i] = (i / count);
      const isEast = i % 2 === 0;
      sp[i] = isEast ? 0.08 : -0.07;
      const c = isEast ? new THREE.Color('#fef08a') : new THREE.Color('#ef4444');
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { trafficPositions: pos, trafficColors: col, trafficSpeeds: sp, trafficOffsets: off };
  }, []);

  // Animate airplanes, beacons, traffic, and shimmering windows
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speedMult = isHovered ? 1.5 : 1.0;

    // 1. Airplane 1: High airliner crossing left-to-right across night sky above skyline
    if (airplane1Ref.current) {
      const progress = ((t * 0.035 * speedMult) % 1.0);
      const theta = (1.33 - progress * 0.66) * Math.PI;
      const r = 1.48;
      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);
      const y = 2.14 + Math.sin(t * 0.25) * 0.015;
      airplane1Ref.current.position.set(x, y, z);
      airplane1Ref.current.lookAt(
        r * Math.sin(theta - 0.05),
        y,
        r * Math.cos(theta - 0.05)
      );

      if (beacon1Ref.current) {
        const isBeacon = (t % 1.1) < 0.16;
        beacon1Ref.current.scale.setScalar(isBeacon ? 1.0 : 0.001);
      }
      if (strobe1Ref.current) {
        const m = t % 1.4;
        const isStrobe = m < 0.06 || (m > 0.14 && m < 0.20);
        strobe1Ref.current.scale.setScalar(isStrobe ? 1.4 : 0.001);
      }
    }

    // 2. Airplane 2 / Drone: Lower-altitude craft crossing right-to-left
    if (airplane2Ref.current) {
      const progress = ((t * 0.026 * speedMult + 0.48) % 1.0);
      const theta = (0.68 + progress * 0.65) * Math.PI;
      const r = 1.47;
      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);
      const y = 1.95 + Math.sin(t * 0.3) * 0.02;
      airplane2Ref.current.position.set(x, y, z);
      airplane2Ref.current.lookAt(
        r * Math.sin(theta + 0.05),
        y,
        r * Math.cos(theta + 0.05)
      );

      if (beacon2Ref.current) {
        const isBeacon = (t % 0.85) < 0.14;
        beacon2Ref.current.scale.setScalar(isBeacon ? 1.0 : 0.001);
      }
      if (strobe2Ref.current) {
        const isStrobe = (t % 1.5) < 0.07;
        strobe2Ref.current.scale.setScalar(isStrobe ? 1.2 : 0.001);
      }
    }

    // 3. Shimmering skyscraper windows
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const cols = geom.attributes.color;
      if (cols) {
        const arr = cols.array as Float32Array;
        for (let i = 0; i < phases.length; i++) {
          const shimmer = 0.5 + 0.5 * Math.sin(t * speeds[i] * (isHovered ? 2.0 : 1.0) + phases[i]);
          arr[i * 3] = colors[i * 3] * shimmer;
          arr[i * 3 + 1] = colors[i * 3 + 1] * shimmer;
          arr[i * 3 + 2] = colors[i * 3 + 2] * shimmer;
        }
        cols.needsUpdate = true;
      }
    }

    // 4. Skyscraper warning beacon blink
    if (beaconsRef.current) {
      const mat = beaconsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        const pulse = (Math.sin(t * 4.2) > 0.6) ? 1.0 : 0.12;
        mat.opacity = pulse;
      }
    }

    // 5. Flowing highway traffic on expressways
    if (trafficRef.current) {
      const geom = trafficRef.current.geometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < trafficOffsets.length; i++) {
          const u = ((trafficOffsets[i] + t * trafficSpeeds[i] * speedMult) % 1.0 + 1.0) % 1.0;
          const theta = (0.72 + u * 0.56) * Math.PI;
          const r = 1.49;
          arr[i * 3] = r * Math.sin(theta);
          arr[i * 3 + 1] = 0.42 + (i % 3) * 0.03;
          arr[i * 3 + 2] = r * Math.cos(theta);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  const skyColor = mood === 'sunset' ? '#fed7aa' : mood === 'cyberpunk' ? '#f472b6' : '#ffffff';

  return (
    <group raycast={() => null}>
      {/* 1. Curved Tokyo Skyline Backdrop strictly framed behind the bay window */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry
          args={[
            1.52,
            1.52,
            2.65,
            48,
            1,
            true,
            Math.PI * 0.68,
            Math.PI * 0.64,
          ]}
        />
        <meshBasicMaterial
          map={skylineTexture}
          color={skyColor}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* 2. Twinkling City Lights on Skyscrapers */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 3. Red Aviation Obstruction Beacons on Skyscraper Towers */}
      <points ref={beaconsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[beaconPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.024}
          color="#ff1111"
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 4. Expressway Traffic Headlights & Taillights Stream */}
      <points ref={trafficRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trafficPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[trafficColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.016}
          vertexColors
          transparent
          opacity={0.88}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 5. Crossing Airliner 1 with blinking strobes */}
      <group ref={airplane1Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.022, 0.005, 0.005]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh ref={strobe1Ref} position={[0.011, 0, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh ref={beacon1Ref} position={[0, 0.004, 0]}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
      </group>

      {/* 6. Crossing Airliner 2 */}
      <group ref={airplane2Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.018, 0.004, 0.004]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <mesh ref={strobe2Ref} position={[-0.009, 0, 0]}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <mesh ref={beacon2Ref} position={[0, 0.003, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// Subtle ambient dust particles visible in dark night mode
const AmbientDustParticles: React.FC<{ isRoomLightOn: boolean }> = ({ isRoomLightOn }) => {
  const count = 45;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.6;
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.6;
      sp[i] = 0.15 + Math.random() * 0.3;
    }
    return [pos, sp];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * 0.002;
      arr[i * 3] += Math.sin(t * 0.8 + i) * 0.0008;
      if (arr[i * 3 + 1] < 0.1) {
        arr[i * 3 + 1] = 2.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color={!isRoomLightOn ? '#38bdf8' : '#fed7aa'}
        transparent
        opacity={!isRoomLightOn ? 0.65 : 0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Internal 3D Scene Content
interface SceneContentProps {
  mood: LightingMood;
  isRoomLightOn: boolean;
  onToggleLight: () => void;
  phraseIndex: number;
  onNextPhrase: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  mood,
  isRoomLightOn,
  onToggleLight,
  phraseIndex,
  onNextPhrase,
  onDragStart,
  onDragEnd,
}) => {
  const { scene } = useGLTF('/models/tokyo_otaku_diorama.glb');

  const wallTexture = useTexture('/models/material_1_updated.png');
  useMemo(() => {
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    wallTexture.flipY = false;
  }, [wallTexture]);

  const crtLightRef = useRef<THREE.PointLight>(null);
  const duvetMeshRef = useRef<THREE.Mesh | null>(null);
  const initialDuvetY = useRef<number | null>(null);
  const flashAnim = useRef<number>(0);

  // Hover states for fluid 3D micro-animations
  const [isDuvetHovered, setIsDuvetHovered] = useState<boolean>(false);
  const [isTvHovered, setIsTvHovered] = useState<boolean>(false);
  const [isPostersHovered, setIsPostersHovered] = useState<boolean>(false);
  const [isWindowHovered, setIsWindowHovered] = useState<boolean>(false);

  const crtTexture = useMemo(() => {
    const textColor = mood === 'cyberpunk' ? '#f43f5e' : mood === 'sunset' ? '#fbbf24' : '#34d399';
    return createCrtTexture(PHRASES[phraseIndex], textColor);
  }, [phraseIndex, mood]);

  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toLowerCase();

        if (name.includes('hdri') || name.includes('sphere')) {
          mesh.visible = false;
          mesh.raycast = () => null;
        } else if (name.includes('pedestal')) {
          mesh.raycast = () => null;
        }

        if (name.includes('duvet') || name.includes('0.001_jn3_0.001')) {
          duvetMeshRef.current = mesh;
          if (initialDuvetY.current === null) {
            initialDuvetY.current = mesh.position.y;
          }
        }

        const setupMaterial = (mat: THREE.Material, meshName: string) => {
          if (!mat) return;
          const m = mat as THREE.MeshStandardMaterial;
          if (m.isMeshStandardMaterial) {
            m.envMapIntensity = 0.55;
            if (meshName.includes('base') || meshName.includes('bed')) {
              m.roughness = 0.92;
              m.metalness = 0.02;
            } else if (meshName.includes('screen') || meshName.includes('tv')) {
              m.roughness = 0.15;
              m.metalness = 0.85;
            } else {
              m.roughness = THREE.MathUtils.clamp(m.roughness, 0.4, 0.95);
              m.metalness = THREE.MathUtils.clamp(m.metalness, 0.0, 0.5);
            }
          }
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => setupMaterial(mat, mesh.name));
        } else if (mesh.material) {
          setupMaterial(mesh.material, mesh.name);
        }
      }
    });
    return s;
  }, [scene]);

  // Update wall texture with correct orientation for retro posters
  useEffect(() => {
    if (!wallTexture) return;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        if (name.includes('cylinder') || (mesh.material && (mesh.material as THREE.Material).name === 'material_1')) {
          const std = mesh.material as THREE.MeshStandardMaterial;
          if (std && std.isMeshStandardMaterial) {
            std.map = wallTexture;
            std.roughness = 0.88;
            std.metalness = 0.0;
            std.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, wallTexture]);

  // Update CRT screen material
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        if (name.includes('screen') || name.includes('017')) {
          const mat = new THREE.MeshBasicMaterial({
            map: crtTexture,
            toneMapped: false,
          });
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene, crtTexture]);

  useEffect(() => {
    flashAnim.current = 1.0;
  }, [phraseIndex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Duvet lifts smoothly on hover with subtle breathing motion
    if (duvetMeshRef.current) {
      const baseY = initialDuvetY.current ?? 0;
      const targetY = isDuvetHovered ? baseY + 0.40 + Math.sin(t * 3.5) * 0.025 : baseY;
      const targetRotX = isDuvetHovered ? -0.15 : 0;
      const targetRotZ = isDuvetHovered ? 0.08 : 0;

      duvetMeshRef.current.position.y = THREE.MathUtils.lerp(duvetMeshRef.current.position.y, targetY, 0.09);
      duvetMeshRef.current.rotation.x = THREE.MathUtils.lerp(duvetMeshRef.current.rotation.x, targetRotX, 0.09);
      duvetMeshRef.current.rotation.z = THREE.MathUtils.lerp(duvetMeshRef.current.rotation.z, targetRotZ, 0.09);
    }

    // 2. CRT Light pulse + extra glow when hovered
    if (crtLightRef.current) {
      flashAnim.current = Math.max(0, flashAnim.current - 0.07);
      const baseInt = !isRoomLightOn ? 55 : 30;
      const hoverBoost = isTvHovered ? 25 : 0;
      const flicker = 1.0 + Math.sin(t * 12) * 0.08 + Math.sin(t * 4.5) * 0.05;
      const flash = flashAnim.current * 45;
      crtLightRef.current.intensity = (baseInt + hoverBoost) * flicker + flash;
    }
  });

  const moodConfig = useMemo(() => {
    switch (mood) {
      case 'sunset':
        return {
          ambient: '#4a2818',
          ambientInt: 0.9,
          sunColor: '#f97316',
          sunInt: 2.2,
          roomColor: '#fed7aa',
          roomInt: 140,
          crtColor: '#fbbf24',
        };
      case 'cyberpunk':
        return {
          ambient: '#1e0524',
          ambientInt: 1.0,
          sunColor: '#06b6d4',
          sunInt: 1.8,
          roomColor: '#f43f5e',
          roomInt: 160,
          crtColor: '#f43f5e',
        };
      case 'night':
      default:
        return {
          ambient: isRoomLightOn ? '#0f172a' : '#040714',
          ambientInt: isRoomLightOn ? 0.8 : 0.35,
          sunColor: isRoomLightOn ? '#38bdf8' : '#1e3a8a',
          sunInt: isRoomLightOn ? 1.6 : 0.45,
          roomColor: '#e0f2fe',
          roomInt: isRoomLightOn ? 125 : 0,
          crtColor: '#34d399',
        };
    }
  }, [mood, isRoomLightOn]);

  return (
    <>
      <ambientLight color={moodConfig.ambient} intensity={moodConfig.ambientInt} />

      <directionalLight
        position={[4, 6, 3]}
        color={moodConfig.sunColor}
        intensity={moodConfig.sunInt}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      <directionalLight
        position={[-3, 4, -3]}
        color={mood === 'cyberpunk' ? '#ec4899' : '#3b82f6'}
        intensity={mood === 'cyberpunk' ? 0.9 : 0.45}
      />

      {/* Main Room Ceiling Light */}
      {isRoomLightOn && (
        <pointLight
          position={[0, 2.35, 0]}
          color={moodConfig.roomColor}
          intensity={moodConfig.roomInt}
          distance={5.2}
          decay={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0003}
        />
      )}

      {/* Vintage CRT TV Screen Glow */}
      <pointLight
        ref={crtLightRef}
        position={[0.62, 1.15, -0.65]}
        color={moodConfig.crtColor}
        distance={4.2}
        decay={2}
      />

      {/* Wall Posters Accent Spotlight */}
      <spotLight
        position={[0.5, 2.4, 0.8]}
        target-position={[-0.8, 1.45, -0.92]}
        color={isPostersHovered ? '#ffffff' : '#fde047'}
        intensity={isPostersHovered ? 18 : 6}
        angle={0.65}
        penumbra={0.8}
        distance={4.5}
      />

      {/* Unobstructed Living Tokyo Window Sky */}
      <TokyoWindowSky mood={mood} isHovered={isWindowHovered} />

      {/* Dynamic Dust Particles in Night Mode */}
      <AmbientDustParticles isRoomLightOn={isRoomLightOn} />

      {/* Interactive 3D Wall Light Switch */}
      <InteractiveLightSwitch3D
        isLightOn={isRoomLightOn}
        onToggle={onToggleLight}
        position={[1.635, 1.30, 0.45]}
      />

      {/* Draggable 3D Room Items (Gamepad, Manga, Ramune) */}
      <InteractiveItems3D
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />

      {/* Main GLTF Room Mesh */}
      <primitive object={clonedScene} />

      {/* Fluid Hover Detection Hitboxes & 3D Badges */}

      {/* 1. CRT TV Hover Zone */}
      <group
        position={[0.62, 1.15, -0.65]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsTvHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsTvHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNextPhrase();
        }}
      >
        <mesh visible={false}>
          <boxGeometry args={[0.55, 0.55, 0.45]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {isTvHovered && (
          <Html position={[0, 0.38, 0]} center distanceFactor={5.5} pointerEvents="none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-emerald-500/40 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-300">TV CRT Sony</span>
              <span className="text-[10px] text-zinc-400">• Zapper</span>
            </div>
          </Html>
        )}
      </group>

      {/* 2. Wall Posters Hover Zone */}
      <group
        position={[-0.8, 1.45, -0.92]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsPostersHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsPostersHovered(false);
        }}
      >
        <mesh visible={false}>
          <boxGeometry args={[1.5, 1.2, 0.15]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {isPostersHovered && (
          <Html position={[0, 0.55, 0.1]} center distanceFactor={5.5} pointerEvents="none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-purple-500/40 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
              <span className="text-xs">🖼️</span>
              <span className="font-semibold text-purple-300">Affiches Otaku</span>
              <span className="text-[10px] text-zinc-400">• Tokyo 1994</span>
            </div>
          </Html>
        )}
      </group>

      {/* 3. Futon / Duvet Hover Zone */}
      <group
        position={[0.05, 0.25, 0.85]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsDuvetHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsDuvetHovered(false);
        }}
      >
        <mesh visible={false}>
          <boxGeometry args={[0.70, 0.25, 0.75]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {isDuvetHovered && (
          <Html position={[0, 0.38, 0]} center distanceFactor={5.5} pointerEvents="none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-white/20 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
              <span className="text-xs">🛏️</span>
              <span className="font-semibold text-zinc-100">Futon Douillet</span>
              <span className="text-[10px] text-zinc-400">• Respirant</span>
            </div>
          </Html>
        )}
      </group>

      {/* 4. Tokyo Bay Window Hover Zone */}
      <group
        position={[0.0, 1.45, -1.25]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsWindowHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsWindowHovered(false);
        }}
      >
        <mesh visible={false}>
          <boxGeometry args={[2.2, 1.8, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {isWindowHovered && (
          <Html position={[0, 0.45, 0]} center distanceFactor={5.5} pointerEvents="none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-cyan-500/40 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
              <span className="text-xs">🌃</span>
              <span className="font-semibold text-cyan-300">Néo-Tokyo</span>
              <span className="text-[10px] text-zinc-400">• Vue Panoramique</span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

export const TokyoOtakuDiorama: React.FC<TokyoOtakuDioramaProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const [mood, setMood] = useState<LightingMood>('night');
  const [activeView, setActiveView] = useState<CameraView>('diorama');
  const [isRoomLightOn, setIsRoomLightOn] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [interactionToast, setInteractionToast] = useState<string | null>(null);
  const [isDraggingObject, setIsDraggingObject] = useState<boolean>(false);

  const controlsRef = useRef<any>(null);

  // Smooth camera transitions between presets
  const handleViewChange = useCallback((view: CameraView) => {
    setActiveView(view);
    const preset = CAMERA_PRESETS[view];
    if (controlsRef.current && preset) {
      const controls = controlsRef.current;
      const startPos = controls.object.position.clone();
      const startTarget = controls.target.clone();
      const endPos = new THREE.Vector3(...preset.pos);
      const endTarget = new THREE.Vector3(...preset.target);

      let p = 0;
      const anim = () => {
        p += 0.055;
        if (p < 1) {
          controls.object.position.lerpVectors(startPos, endPos, p);
          controls.target.lerpVectors(startTarget, endTarget, p);
          controls.update();
          requestAnimationFrame(anim);
        } else {
          controls.object.position.copy(endPos);
          controls.target.copy(endTarget);
          controls.update();
        }
      };
      requestAnimationFrame(anim);
    }
  }, []);

  const handleNextPhrase = useCallback(() => {
    dioramaAudio.playCrtZap();
    setPhraseIndex((prev) => {
      const nextIndex = (prev + 1) % PHRASES.length;
      const cleanPhrase = PHRASES[nextIndex].replace('\n', ' ');
      setInteractionToast(`📺 CRT : « ${cleanPhrase} »`);
      return nextIndex;
    });
    setTimeout(() => setInteractionToast(null), 2400);
  }, []);

  const handleToggleLight = useCallback(() => {
    setIsRoomLightOn((prev) => {
      const next = !prev;
      setInteractionToast(next ? '💡 Lumière allumée' : '🌙 Lumière éteinte : Mode Nuit immersif');
      setTimeout(() => setInteractionToast(null), 2400);
      return next;
    });
  }, []);

  const handleToggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      dioramaAudio.setMuted(next);
      setInteractionToast(next ? '🔇 Audio coupé' : '🔊 Effets sonores 3D activés !');
      setTimeout(() => setInteractionToast(null), 2200);
      return next;
    });
  }, []);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: CAMERA_PRESETS.diorama.pos, fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: mood === 'sunset' ? 1.12 : isRoomLightOn ? 1.05 : 0.88,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mood={mood}
            isRoomLightOn={isRoomLightOn}
            onToggleLight={handleToggleLight}
            phraseIndex={phraseIndex}
            onNextPhrase={handleNextPhrase}
            onDragStart={() => setIsDraggingObject(true)}
            onDragEnd={() => setIsDraggingObject(false)}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enabled={!isDraggingObject}
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 2 + 0.04}
          autoRotate={isAutoRotating && !isDraggingObject}
          autoRotateSpeed={0.9}
          dampingFactor={0.06}
          target={CAMERA_PRESETS.diorama.target}
        />
      </Canvas>

      {/* Floating Interactive Toast Feedback */}
      <AnimatePresence>
        {interactionToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none rounded-2xl border border-white/20 bg-zinc-950/85 px-4 py-2 shadow-2xl backdrop-blur-xl text-xs font-mono text-white flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{interactionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discreet Minimal Top HUD Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-2xl border border-zinc-200/80 bg-white/90 p-1 shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          {/* Camera View Buttons */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              id="btn-view-diorama"
              onClick={() => handleViewChange('diorama')}
              title="Vue Globale Diorama"
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                activeView === 'diorama'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              <Compass className="h-3 w-3" />
              <span className="hidden sm:inline">Diorama</span>
            </button>

            <button
              type="button"
              id="btn-view-crt"
              onClick={() => handleViewChange('crt')}
              title="Vue Téléviseur CRT"
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                activeView === 'crt'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              <Tv className="h-3 w-3" />
              <span className="hidden sm:inline">CRT TV</span>
            </button>

            <button
              type="button"
              id="btn-view-window"
              onClick={() => handleViewChange('window')}
              title="Vue Baie Vitrée Tokyo"
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                activeView === 'window'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Tokyo</span>
            </button>

            <button
              type="button"
              id="btn-view-posters"
              onClick={() => handleViewChange('posters')}
              title="Vue Mur des Posters Rétro"
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                activeView === 'posters'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Posters</span>
            </button>
          </div>

          {/* Quick Toggles: Light, Audio, Mood, Auto-rotate */}
          <div className="flex items-center gap-1 pl-1">
            {/* Room Light Switch Toggle */}
            <button
              type="button"
              id="btn-toggle-light"
              onClick={handleToggleLight}
              title={isRoomLightOn ? 'Éteindre la lumière (Mode Nuit)' : 'Allumer la lumière'}
              className={`flex items-center gap-1 rounded-xl px-2 py-1.5 font-mono text-[10.5px] font-semibold transition-all cursor-pointer ${
                !isRoomLightOn
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {isRoomLightOn ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-cyan-300" />}
              <span className="hidden md:inline">{isRoomLightOn ? 'Lumière' : 'Nuit'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              id="btn-toggle-audio"
              onClick={handleToggleAudio}
              title={isAudioMuted ? 'Activer le son Web Audio' : 'Couper le son'}
              className={`rounded-xl p-1.5 transition-all cursor-pointer ${
                !isAudioMuted
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {!isAudioMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            {/* Mood Palette Toggle */}
            <button
              type="button"
              onClick={() => setMood((m) => (m === 'night' ? 'sunset' : m === 'sunset' ? 'cyberpunk' : 'night'))}
              title={`Ambiance: ${mood.toUpperCase()} (Cliquer pour changer)`}
              className="flex items-center gap-1 rounded-xl px-2 py-1.5 font-mono text-[10.5px] font-medium text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {mood === 'night' && <span>🌙 Nuit</span>}
              {mood === 'sunset' && <span>🌅 Sunset</span>}
              {mood === 'cyberpunk' && <span>⚡ Neon</span>}
            </button>

            {/* Auto-rotate Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoRotating((r) => !r)}
              title={isAutoRotating ? 'Arrêter la rotation' : 'Rotation automatique'}
              className={`rounded-xl p-1.5 transition-all cursor-pointer ${
                isAutoRotating
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Discrete Interactive Hint Pill at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:flex items-center gap-2 rounded-full border border-white/20 bg-zinc-950/70 px-4 py-1.5 shadow-xl backdrop-blur-md text-[11px] font-mono text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Déplace la manette, le manga ou la canette à la souris • Survole la pièce pour révéler ses animations !</span>
      </div>
    </div>
  );
};
