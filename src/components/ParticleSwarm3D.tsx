import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { getParticleControls } from '../state/particleControls';

interface ParticleSwarm3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const PARTICLE_COUNT = 24000;

// Crisp, high-fidelity soft circular alpha texture (Three.js standard for particle point sprites)
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.92)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
};

export const ParticleSwarm3D: React.FC<ParticleSwarm3DProps> = ({ analyserRef, quality = 'high' }) => {
  const count = quality === 'low' ? 12000 : PARTICLE_COUNT;
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Time & mouse tracker
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  // Audio frequency & energy tracking
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const smoothedEnergyRef = useRef(0);
  const kickEnergyRef = useRef(0);

  // Cached sprite texture
  const circleTexture = useMemo(() => createCircleTexture(), []);

  // Geometry initialization with typed float buffers
  const { geometry, positions, colors } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * goldenAngle;

      pos[i * 3] = Math.cos(theta) * radiusAtY;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radiusAtY;

      // Pure deep obsidian black seed
      const ink = 0.04 + (i % 5) * 0.01;
      col[i * 3] = ink;
      col[i * 3 + 1] = ink;
      col[i * 3 + 2] = ink;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    return { geometry: geo, positions: pos, colors: col };
  }, [count]);

  // Window mouse movement listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Frame simulation loop (Zero Garbage Collection, runs at 60 FPS)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Live tunable controls from HUD
    const ctrl = getParticleControls();
    timeRef.current += dt * ctrl.speed;
    const time = timeRef.current;

    // Smooth mouse coordinates
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;
    const mx = mouseRef.current.x * 2.0;
    const my = mouseRef.current.y * 2.0;

    // Process real-time Web Audio API energy
    let audioEnergy = 0;
    let kick = 0;
    if (analyserRef.current) {
      if (!frequencyDataRef.current) {
        frequencyDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      const data = frequencyDataRef.current;

      let bassSum = 0;
      for (let j = 0; j < 8; j++) bassSum += data[j];
      const currentBass = bassSum / (8 * 255);

      let totalSum = 0;
      for (let j = 8; j < 48; j++) totalSum += data[j];
      const currentEnergy = totalSum / (40 * 255);

      smoothedEnergyRef.current += (currentEnergy - smoothedEnergyRef.current) * 0.12;
      kick = Math.max(0, currentBass - smoothedEnergyRef.current * 1.3);
      kickEnergyRef.current = Math.max(kickEnergyRef.current * 0.88, kick);
      audioEnergy = smoothedEnergyRef.current;
    }

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = geometry.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const baseBreath = (1.0 + 0.22 * Math.sin(time * 1.5) + audioEnergy * 0.5) * ctrl.scale;
    const pKnot = 3.0;
    const qKnot = 8.0;

    // 24,000-unit simulation kernel:
    // Hyper-dimensional Tesseract breathing and rotating in 4D space
    const rotSpeed = ctrl.speed * 0.85;
    const t4D = time * rotSpeed;
    const breath4D = (1.0 + 0.28 * Math.sin(t4D * 1.4) + audioEnergy * 0.45) * ctrl.scale;

    const angleXW = t4D * 0.7;
    const angleYZ = t4D * 0.5;
    const angleZW = t4D * 0.35 + ctrl.twist * 0.2;

    const cosXW = Math.cos(angleXW);
    const sinXW = Math.sin(angleXW);
    const cosYZ = Math.cos(angleYZ);
    const sinYZ = Math.sin(angleYZ);
    const cosZW = Math.cos(angleZW);
    const sinZW = Math.sin(angleZW);

    const D = 2.4 + 0.3 * Math.sin(t4D * 0.9);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const p = i / count;

      // 4D lattice parameterization along the 32 edges and hyper-faces
      const edgeId = Math.floor(p * 32.0);
      const edgeFrac = (p * 32.0) % 1.0;

      // Bit extraction for 4D vertices (-1 or +1)
      const v0 = edgeId % 16;
      const x0 = (v0 & 1) ? 1.0 : -1.0;
      const y0 = (v0 & 2) ? 1.0 : -1.0;
      const z0 = (v0 & 4) ? 1.0 : -1.0;
      const w0 = (v0 & 8) ? 1.0 : -1.0;

      const axis = Math.floor(edgeId / 16);
      let x4 = x0 + (axis === 0 ? edgeFrac * 2.0 - 1.0 : 0.0);
      let y4 = y0 + (axis === 1 ? edgeFrac * 2.0 - 1.0 : 0.0);
      let z4 = z0 + (axis === 2 ? edgeFrac * 2.0 - 1.0 : 0.0);
      let w4 = w0 + (axis === 3 ? edgeFrac * 2.0 - 1.0 : 0.0);

      // 4D dynamic breathing pulsation
      x4 *= breath4D;
      y4 *= breath4D;
      z4 *= breath4D;
      w4 *= breath4D;

      // Quantum particle stream flowing through 4D space
      const flowPhase = (edgeFrac + t4D * 0.6) % 1.0;
      const jitter = Math.sin(p * 220.0 + t4D * 3.0) * ctrl.chaos * 0.18;

      // Double 4D rotation (XW and YZ planes)
      const x1 = x4 * cosXW - w4 * sinXW;
      const w1 = x4 * sinXW + w4 * cosXW;
      const y1 = y4 * cosYZ - z4 * sinYZ;
      const z1 = y4 * sinYZ + z4 * cosYZ;

      // ZW 4D rotation
      const z2 = z1 * cosZW - w1 * sinZW;
      const w2 = z1 * sinZW + w1 * cosZW;

      // 4D to 3D perspective projection
      const denom = Math.max(0.2, D - w2);
      const proj = 1.35 / denom;

      let xFinal = (x1 * proj + jitter) * 0.72;
      let yFinal = (y1 * proj + jitter) * 0.72;
      let zFinal = (z2 * proj + jitter) * 0.72;

      // Interactive mouse gravity deflection
      if (mouseRef.current.active) {
        const dx = xFinal - mx;
        const dy = yFinal - my;
        const distSq = dx * dx + dy * dy + 0.18;
        const force = 0.10 / distSq;
        xFinal += dx * force;
        yFinal += dy * force;
      }

      posArr[i3] = xFinal;
      posArr[i3 + 1] = yFinal;
      posArr[i3 + 2] = zFinal;

      // 4D depth shading: 4th dimension rendered through obsidian black to graphite ink
      const depth4D = Math.max(0.0, Math.min(1.0, (w2 + 1.8) / 3.6));
      const ink = 0.02 + 0.08 * (1.0 - depth4D) + 0.025 * Math.abs(Math.sin(flowPhase * Math.PI));

      colArr[i3] = ink;
      colArr[i3 + 1] = ink;
      colArr[i3 + 2] = ink * 1.04;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Slow ambient group drift
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.06 + mx * 0.15;
      groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.08 + my * 0.12;
      groupRef.current.rotation.z = Math.cos(time * 0.04) * 0.04;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.25}>
      <group ref={groupRef}>
        <points ref={pointsRef} geometry={geometry}>
          <pointsMaterial
            ref={materialRef}
            size={0.072}
            sizeAttenuation={true}
            map={circleTexture}
            transparent={true}
            opacity={0.92}
            vertexColors={true}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </Float>
  );
};
