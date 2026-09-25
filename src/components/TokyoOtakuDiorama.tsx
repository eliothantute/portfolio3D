import React, { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Compass, Tv, Eye, Image as ImageIcon, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { dioramaAudio } from './diorama/DioramaSoundEngine';
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
  'WAKE UP,\nSAMURAI...',
  'REACT // 3D //\nTAILWIND CSS',
  '404 SLEEP\nNOT FOUND',
  'NEO TOKYO //\n02:42 AM',
  'PARIS 2026 //\nREADY TO BUILD',
  'INSERT COIN\nTO CONTINUE',
  'HELLO WORLD_\nLET’S TALK!',
];

const CAMERA_PRESETS: Record<CameraView, { pos: [number, number, number]; target: [number, number, number] }> = {
  diorama: {
    pos: [1.6, 2.5, 4.4],
    target: [0.0, 0.7, 0.6],
  },
  crt: {
    pos: [-0.05, 1.15, 1.3],
    target: [-0.33, 0.86, -0.68],
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

// Helper to draw authentic CRT scanline text texture with correct orientation (upright, left-to-right)
function createCrtTexture(text: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background deep phosphor dark
  ctx.fillStyle = '#030804';
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 320);
  grad.addColorStop(0, 'rgba(0, 40, 10, 0.45)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Vertical flip only (scale(1, -1)) so text is upright, line 1 on top, reading normal left-to-right
  ctx.save();
  ctx.translate(256, 256);
  ctx.scale(1, -1);
  ctx.translate(-256, -256);

  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 18;
  ctx.fillStyle = colorHex;
  ctx.font = '900 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = 54;
  const startY = 256 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, 256, startY + i * lineHeight);
    ctx.fillText(line, 256, startY + i * lineHeight);
  });
  ctx.restore();

  // CRT Scanlines
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Curved glass glare reflection
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

// Living Tokyo Window Sky: wide panoramic curved cyclorama with atmospheric gradient shader, city lights, highway and airplanes
const TokyoWindowSky: React.FC<{ mood: LightingMood }> = ({ mood }) => {
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
    skylineTexture.wrapT = THREE.ClampToEdgeWrapping;
  }, [skylineTexture]);

  // Wide panoramic cyclorama geometry (R=4.2m, H=7.5m, arc 198 deg)
  const skyGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      4.2,
      4.2,
      7.5,
      64,
      1,
      true,
      Math.PI * 0.45,
      Math.PI * 1.10
    );
  }, []);

  const skyShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: skylineTexture },
        uTime: { value: 0 },
        uZenithColor: { value: new THREE.Color('#020617') },
        uHorizonColor: { value: new THREE.Color('#0f172a') },
        uGlowColor: { value: new THREE.Color('#38bdf8') },
        uMood: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uGlowColor;
        uniform float uMood;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        void main() {
          // Cityscape occupies band vUv.y from 0.15 to 0.65
          float cityMin = 0.15;
          float cityMax = 0.65;
          float cityUvY = 1.0 - clamp((vUv.y - cityMin) / (cityMax - cityMin), 0.0, 1.0);
          
          vec2 texUv = vec2(fract(vUv.x * 1.5 + 0.10), cityUvY);
          vec4 cityTex = texture2D(uTexture, texUv);

          // Deep sky gradient from horizon up to zenith
          float skyGrad = smoothstep(0.35, 0.90, vUv.y);
          vec3 skyColor = mix(uHorizonColor, uZenithColor, skyGrad);

          // Atmospheric horizon light dome
          float horizonGlow = exp(-pow((vUv.y - 0.42) * 4.2, 2.0)) * 0.45;
          skyColor += uGlowColor * horizonGlow;

          // Twinkling stars in the upper night sky
          if (vUv.y > 0.52) {
            vec2 starGrid = floor(vUv * vec2(300.0, 150.0));
            float h = hash(starGrid);
            if (h > 0.982) {
              float twinkle = 0.4 + 0.6 * sin(uTime * (3.0 + h * 5.0) + h * 6.28);
              skyColor += vec3(1.0, 0.98, 0.95) * (h - 0.982) * 55.0 * twinkle * smoothstep(0.52, 0.70, vUv.y);
            }
          }

          // Vibrant city lights boost for Tokyo night skyline
          vec3 cityRgb = cityTex.rgb * 1.6;

          // Color grading for moods
          if (uMood > 1.5) {
            cityRgb = mix(cityRgb, cityRgb * vec3(1.4, 0.65, 1.5), 0.55);
          } else if (uMood > 0.5) {
            cityRgb = mix(cityRgb, cityRgb * vec3(1.4, 1.05, 0.75), 0.55);
          }

          // Shimmering building windows
          float shimmer = 0.97 + 0.03 * sin(uTime * 3.0 + vUv.x * 50.0);
          cityRgb *= shimmer;

          // Smooth blend of skyline into the night sky
          float cityFade = smoothstep(cityMax, cityMax - 0.10, vUv.y);
          float bottomFade = smoothstep(cityMin - 0.05, cityMin + 0.05, vUv.y);
          float inCity = cityFade * bottomFade;

          vec3 finalColor = mix(skyColor, cityRgb + skyColor * 0.25, inCity);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [skylineTexture]);

  // Update mood uniforms
  useEffect(() => {
    if (!skyShaderMaterial) return;
    if (mood === 'sunset') {
      skyShaderMaterial.uniforms.uZenithColor.value.set('#1e0b36');
      skyShaderMaterial.uniforms.uHorizonColor.value.set('#4c1d3d');
      skyShaderMaterial.uniforms.uGlowColor.value.set('#f97316');
      skyShaderMaterial.uniforms.uMood.value = 1.0;
    } else if (mood === 'cyberpunk') {
      skyShaderMaterial.uniforms.uZenithColor.value.set('#100424');
      skyShaderMaterial.uniforms.uHorizonColor.value.set('#1c053a');
      skyShaderMaterial.uniforms.uGlowColor.value.set('#f43f5e');
      skyShaderMaterial.uniforms.uMood.value = 2.0;
    } else {
      skyShaderMaterial.uniforms.uZenithColor.value.set('#020617');
      skyShaderMaterial.uniforms.uHorizonColor.value.set('#0a1128');
      skyShaderMaterial.uniforms.uGlowColor.value.set('#38bdf8');
      skyShaderMaterial.uniforms.uMood.value = 0.0;
    }
  }, [mood, skyShaderMaterial]);

  // City Lights, Warning Beacons & Expressway Streams scaled to depth R ≈ 4.15m
  const { positions, colors, phases, speeds } = useMemo(() => {
    const count = 280;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);

    const colorPalette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#fbbf24'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#ff4444'),
      new THREE.Color('#c084fc'),
    ];

    for (let i = 0; i < count; i++) {
      const theta = (0.52 + Math.random() * 0.96) * Math.PI;
      const r = 4.14 + Math.random() * 0.04;
      pos[i * 3] = r * Math.sin(theta);
      pos[i * 3 + 1] = 0.40 + Math.random() * 1.80;
      pos[i * 3 + 2] = -0.4 + r * Math.cos(theta);

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 1.2 + Math.random() * 3.5;
    }
    return { positions: pos, colors: col, phases: ph, speeds: sp };
  }, []);

  const beaconPositions = useMemo(() => {
    const angles = [0.62, 0.78, 0.92, 1.06, 1.22, 1.38];
    const heights = [2.2, 2.45, 2.3, 2.5, 2.15, 2.35];
    const r = 4.13;
    const pos: number[] = [];
    for (let i = 0; i < angles.length; i++) {
      pos.push(
        r * Math.sin(angles[i] * Math.PI),
        heights[i],
        -0.4 + r * Math.cos(angles[i] * Math.PI)
      );
    }
    return new Float32Array(pos);
  }, []);

  const { trafficPositions, trafficColors, trafficSpeeds, trafficOffsets } = useMemo(() => {
    const count = 48;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      off[i] = (i / count);
      const isEast = i % 2 === 0;
      sp[i] = isEast ? 0.06 : -0.055;
      const c = isEast ? new THREE.Color('#fef08a') : new THREE.Color('#ef4444');
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { trafficPositions: pos, trafficColors: col, trafficSpeeds: sp, trafficOffsets: off };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (skyShaderMaterial) {
      skyShaderMaterial.uniforms.uTime.value = t;
    }

    // Airplane 1: High airliner crossing left to right (R ≈ 4.1m, Y ≈ 3.2m)
    if (airplane1Ref.current) {
      const progress = ((t * 0.024) % 1.0);
      const theta = (1.40 - progress * 0.85) * Math.PI;
      const r = 4.08;
      const x = r * Math.sin(theta);
      const z = -0.4 + r * Math.cos(theta);
      const y = 3.10 + Math.sin(t * 0.25) * 0.03;
      airplane1Ref.current.position.set(x, y, z);
      airplane1Ref.current.lookAt(
        r * Math.sin(theta - 0.05),
        y,
        -0.4 + r * Math.cos(theta - 0.05)
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

    // Airplane 2: Lower commuter craft crossing right to left
    if (airplane2Ref.current) {
      const progress = ((t * 0.018 + 0.48) % 1.0);
      const theta = (0.58 + progress * 0.82) * Math.PI;
      const r = 4.05;
      const x = r * Math.sin(theta);
      const z = -0.4 + r * Math.cos(theta);
      const y = 2.65 + Math.cos(t * 0.2) * 0.025;
      airplane2Ref.current.position.set(x, y, z);
      airplane2Ref.current.lookAt(
        r * Math.sin(theta + 0.05),
        y,
        -0.4 + r * Math.cos(theta + 0.05)
      );

      if (beacon2Ref.current) {
        const isBeacon = (t % 0.85) < 0.14;
        beacon2Ref.current.scale.setScalar(isBeacon ? 1.0 : 0.001);
      }
      if (strobe2Ref.current) {
        const m = t % 1.2;
        const isStrobe = m < 0.06;
        strobe2Ref.current.scale.setScalar(isStrobe ? 1.3 : 0.001);
      }
    }

    // Window lights shimmer
    if (pointsRef.current) {
      const cols = pointsRef.current.geometry.attributes.color;
      if (cols) {
        const arr = cols.array as Float32Array;
        for (let i = 0; i < phases.length; i++) {
          const shimmer = 0.5 + 0.5 * Math.sin(t * speeds[i] + phases[i]);
          arr[i * 3] = colors[i * 3] * shimmer;
          arr[i * 3 + 1] = colors[i * 3 + 1] * shimmer;
          arr[i * 3 + 2] = colors[i * 3 + 2] * shimmer;
        }
        cols.needsUpdate = true;
      }
    }

    // Radio beacons blink
    if (beaconsRef.current) {
      const mat = beaconsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        const pulse = (Math.sin(t * 4.2) > 0.6) ? 1.0 : 0.12;
        mat.opacity = pulse;
      }
    }

    // Flowing highway traffic
    if (trafficRef.current) {
      const geom = trafficRef.current.geometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < trafficOffsets.length; i++) {
          const u = ((trafficOffsets[i] + t * trafficSpeeds[i]) % 1.0 + 1.0) % 1.0;
          const theta = (0.58 + u * 0.84) * Math.PI;
          const r = 4.12;
          arr[i * 3] = r * Math.sin(theta);
          arr[i * 3 + 1] = 0.44 + (i % 3) * 0.035;
          arr[i * 3 + 2] = -0.4 + r * Math.cos(theta);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group raycast={() => null}>
      {/* 1. Seamless Deep Tokyo Skyline Curved Cyclorama */}
      <mesh
        position={[0, 1.8, -0.4]}
        geometry={skyGeometry}
        material={skyShaderMaterial}
      />

      {/* 2. Twinkling City Lights on Distant Skyscrapers */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 3. Red Aviation Obstruction Beacons on Tower Spire Peaks */}
      <points ref={beaconsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[beaconPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          color="#ff2222"
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 4. Flowing Highway Traffic Streams */}
      <points ref={trafficRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trafficPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[trafficColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.024}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* 5. Crossing Airliner 1 */}
      <group ref={airplane1Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.008, 0.008]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh ref={strobe1Ref} position={[0.02, 0, 0]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh ref={beacon1Ref} position={[0, 0.008, 0]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
      </group>

      {/* 6. Crossing Airliner 2 */}
      <group ref={airplane2Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.032, 0.007, 0.007]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <mesh ref={strobe2Ref} position={[-0.016, 0, 0]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <mesh ref={beacon2Ref} position={[0, 0.006, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// Subtle ambient dust particles visible in dark night mode
const AmbientDustParticles: React.FC = () => {
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
        color="#38bdf8"
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Internal 3D Scene Content
interface SceneContentProps {
  mood: LightingMood;
  phraseIndex: number;
  onNextPhrase: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  mood,
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

  // Hover states for fluid 3D micro-animations (without text)
  const [isDuvetHovered, setIsDuvetHovered] = useState<boolean>(false);
  const [isTvHovered, setIsTvHovered] = useState<boolean>(false);

  const crtTexture = useMemo(() => {
    const textColor = mood === 'cyberpunk' ? '#f43f5e' : mood === 'sunset' ? '#fbbf24' : '#38bdf8';
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

  // Update CRT screen material with dynamic texture
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

    // 2. CRT Light pulse + extra glow when hovered (subtle realistic screen glow, no room flooding)
    if (crtLightRef.current) {
      flashAnim.current = Math.max(0, flashAnim.current - 0.07);
      const hoverBoost = isTvHovered ? 0.8 : 0;
      const flicker = 1.0 + Math.sin(t * 12) * 0.08 + Math.sin(t * 4.5) * 0.05;
      const flash = flashAnim.current * 1.5;
      crtLightRef.current.intensity = (1.6 + hoverBoost) * flicker + flash;
    }
  });

  const moodConfig = useMemo(() => {
    switch (mood) {
      case 'sunset':
        return {
          ambient: '#291e14',
          ambientInt: 0.95,
          sunColor: '#fed7aa',
          sunInt: 1.4,
          crtColor: '#fbbf24',
        };
      case 'cyberpunk':
        return {
          ambient: '#180e2b',
          ambientInt: 1.05,
          sunColor: '#c084fc',
          sunInt: 1.5,
          crtColor: '#f43f5e',
        };
      case 'night':
      default:
        return {
          ambient: '#1a2234',
          ambientInt: 1.1,
          sunColor: '#e2e8f0',
          sunInt: 1.35,
          crtColor: '#38bdf8',
        };
    }
  }, [mood]);

  // Direct mesh click handler on the 3D model
  const handlePointerDownMesh = (e: ThreeEvent<PointerEvent>) => {
    const targetName = e.object.name.toLowerCase();
    if (
      targetName.includes('screen') ||
      targetName.includes('tv') ||
      targetName.includes('017')
    ) {
      e.stopPropagation();
      onNextPhrase();
    }
  };

  return (
    <>
      <ambientLight color={moodConfig.ambient} intensity={moodConfig.ambientInt} />

      <directionalLight
        position={[4, 6, 3]}
        color={moodConfig.sunColor}
        intensity={moodConfig.sunInt}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Subtle CRT Screen local glow */}
      <pointLight
        ref={crtLightRef}
        position={[-0.33, 0.86, -0.68]}
        color={moodConfig.crtColor}
        distance={1.6}
        decay={2}
      />

      {/* Gallery Accent Lights to illuminate and reveal the wall posters clearly (Omnidirectional Warm Gallery Lights) */}
      <pointLight
        position={[1.05, 1.55, 1.25]}
        color="#fff8ed"
        intensity={14}
        distance={4.0}
        decay={2}
      />
      <pointLight
        position={[-0.15, 1.65, -0.45]}
        color="#f8fafc"
        intensity={9}
        distance={3.8}
        decay={2}
      />

      {/* Panoramic Living Tokyo Window Sky */}
      <TokyoWindowSky mood={mood} />

      {/* Dynamic Dust Particles in Night Mode */}
      <AmbientDustParticles />

      {/* Draggable 3D Room Items (Gamepad, Manga, Ramune) */}
      <InteractiveItems3D
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />

      {/* Main GLTF Room Mesh with direct TV click support */}
      <primitive
        object={clonedScene}
        onPointerDown={handlePointerDownMesh}
      />

      {/* Hitbox zones for interactions (Clean: no text badges or floating UI) */}

      {/* 1. CRT TV Interaction Hitbox directly centered on the TV monitor */}
      <mesh
        position={[-0.33, 0.86, -0.68]}
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
        onPointerDown={(e) => {
          e.stopPropagation();
          onNextPhrase();
        }}
      >
        <boxGeometry args={[0.70, 0.65, 0.60]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Futon / Duvet Hover Hitbox */}
      <mesh
        position={[0.05, 0.25, 0.85]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsDuvetHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsDuvetHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.75, 0.30, 0.80]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
};

export const TokyoOtakuDiorama: React.FC<TokyoOtakuDioramaProps> = ({
  className = '',
}) => {
  const [mood, setMood] = useState<LightingMood>('night');
  const [activeView, setActiveView] = useState<CameraView>('diorama');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isDraggingObject, setIsDraggingObject] = useState<boolean>(false);

  const controlsRef = useRef<any>(null);

  const handleViewChange = useCallback((view: CameraView) => {
    setActiveView(view);
    if (view !== 'diorama') {
      setIsAutoRotating(false);
    } else {
      setIsAutoRotating(true);
    }
    const preset = CAMERA_PRESETS[view];
    if (controlsRef.current) {
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
    setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
  }, []);



  const handleToggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      dioramaAudio.setMuted(next);
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
          toneMappingExposure: mood === 'sunset' ? 1.15 : mood === 'cyberpunk' ? 1.1 : 1.08,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mood={mood}
            phraseIndex={phraseIndex}
            onNextPhrase={handleNextPhrase}
            onDragStart={() => setIsDraggingObject(true)}
            onDragEnd={() => setIsDraggingObject(false)}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          enabled={!isDraggingObject}
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 2 + 0.04}
          autoRotate={isAutoRotating && !isDraggingObject}
          autoRotateSpeed={1.0}
          target={CAMERA_PRESETS.diorama.target}
        />
      </Canvas>

      {/* Discreet Minimal Top HUD Bar (Camera & Atmosphere Toggles) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-[calc(100%-1.5rem)] justify-end">
        <div className="flex items-center gap-0.5 sm:gap-1 rounded-2xl border border-zinc-200/80 bg-white/90 p-1 shadow-xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 scale-90 sm:scale-100 origin-top-right">
          {/* Camera View Buttons */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              id="btn-view-diorama"
              onClick={() => handleViewChange('diorama')}
              title="Vue Globale Diorama"
              className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 font-mono text-[10px] sm:text-[10.5px] font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 font-mono text-[10px] sm:text-[10.5px] font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 font-mono text-[10px] sm:text-[10.5px] font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 font-mono text-[10px] sm:text-[10.5px] font-semibold transition-all cursor-pointer ${
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
              {mood === 'night' && <span>🌙<span className="hidden sm:inline"> Nuit</span></span>}
              {mood === 'sunset' && <span>🌅<span className="hidden sm:inline"> Sunset</span></span>}
              {mood === 'cyberpunk' && <span>⚡<span className="hidden sm:inline"> Neon</span></span>}
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
    </div>
  );
};
