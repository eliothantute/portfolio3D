import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const BASE_RADIUS = 0.96;
const QUALITY_PRESETS = {
  high: { particleCount: 22000, haloParticleCount: 6000 },
  low: { particleCount: 11000, haloParticleCount: 3000 },
} as const;

// Fibonacci spherical distribution - creates natural stippled murmuration geometry
const createSphereDirections = (count: number) => {
  const dirs = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * goldenAngle;

    dirs[i * 3] = Math.cos(theta) * r;
    dirs[i * 3 + 1] = y;
    dirs[i * 3 + 2] = Math.sin(theta) * r;
  }

  return dirs;
};

// Procedural soft luminous circle texture (eliminates blocky square particles)
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(240, 240, 245, 0.9)');
  gradient.addColorStop(0.65, 'rgba(180, 180, 195, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
};

export const AudioSphere: React.FC<AudioSphereProps> = ({ analyserRef, quality = 'high' }) => {
  const particleCount = QUALITY_PRESETS[quality].particleCount;
  const haloParticleCount = QUALITY_PRESETS[quality].haloParticleCount;

  const groupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const pointsPrimaryRef = useRef<THREE.Points>(null);
  const pointsSecondaryRef = useRef<THREE.Points>(null);
  const pointsHaloRef = useRef<THREE.Points>(null);

  const primaryMaterialRef = useRef<THREE.PointsMaterial>(null);
  const secondaryMaterialRef = useRef<THREE.PointsMaterial>(null);
  const haloMaterialRef = useRef<THREE.PointsMaterial>(null);

  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const subEnergyRef = useRef(0);
  const prevSubRef = useRef(0);
  const kickPulseRef = useRef(0);
  const retractPulseRef = useRef(0);
  const beatCooldownRef = useRef(0);
  const shockwaveRef = useRef(0);

  // Global mouse coordinates, velocity & hover detection
  const mouseNdcRef = useRef(new THREE.Vector2(-999, -999));
  const prevMouseNdcRef = useRef(new THREE.Vector2(-999, -999));
  const mouseVelocityRef = useRef(0);
  const hoverStrengthRef = useRef(0);
  const groupScaleRef = useRef(1);
  const raycasterRef = useRef(new THREE.Raycaster());
  const tempWorldPosRef = useRef(new THREE.Vector3());

  // Cached textures & Fibonacci distributions
  const particleTexture = useMemo(() => createCircleTexture(), []);
  const directions = useMemo(() => createSphereDirections(particleCount), [particleCount]);
  const haloDirections = useMemo(() => createSphereDirections(haloParticleCount), [haloParticleCount]);

  const primaryGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));
    return geo;
  }, [particleCount]);

  const secondaryGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3));
    return geo;
  }, [particleCount]);

  const haloGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(haloParticleCount * 3), 3));
    return geo;
  }, [haloParticleCount]);

  // Global pointer listeners for magnetic interaction & click shockwave
  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (prevMouseNdcRef.current.x !== -999) {
        const dx = x - prevMouseNdcRef.current.x;
        const dy = y - prevMouseNdcRef.current.y;
        mouseVelocityRef.current = Math.min(1.5, Math.sqrt(dx * dx + dy * dy) * 18);
      }

      prevMouseNdcRef.current.set(x, y);
      mouseNdcRef.current.set(x, y);
    };

    const onPointerDown = () => {
      // Trigger dynamic tactile shockwave on click
      shockwaveRef.current = 1.0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.08);

    // Fade out velocity & shockwaves
    mouseVelocityRef.current = THREE.MathUtils.lerp(mouseVelocityRef.current, 0, 1 - Math.exp(-safeDelta * 8));
    shockwaveRef.current = THREE.MathUtils.lerp(shockwaveRef.current, 0, 1 - Math.exp(-safeDelta * 6));

    // Audio Analysis
    const analyser = analyserRef.current;
    let instantSub = 0;
    let instantOverall = 0;

    if (analyser) {
      if (!frequencyDataRef.current || frequencyDataRef.current.length !== analyser.frequencyBinCount) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      analyser.getByteFrequencyData(frequencyDataRef.current);
      const freqStep = analyser.context.sampleRate / analyser.fftSize;

      let subSum = 0;
      let subWeight = 0;
      let totalSum = 0;

      for (let i = 0; i < frequencyDataRef.current.length; i += 1) {
        const val = frequencyDataRef.current[i] / 255;
        const hz = i * freqStep;
        totalSum += val;

        if (hz >= 20 && hz <= 120) {
          const weight = 1.4 - ((hz - 20) / 100) * 0.8;
          subSum += val * weight;
          subWeight += weight;
        }
      }

      instantSub = subWeight > 0 ? subSum / subWeight : 0;
      instantOverall = frequencyDataRef.current.length > 0 ? totalSum / frequencyDataRef.current.length : 0;
    }

    const subLerp = instantSub > subEnergyRef.current 
      ? 1 - Math.exp(-safeDelta * 30) 
      : 1 - Math.exp(-safeDelta * 10);
    subEnergyRef.current = THREE.MathUtils.lerp(subEnergyRef.current, instantSub, subLerp);

    const subDelta = Math.max(0, subEnergyRef.current - prevSubRef.current);
    beatCooldownRef.current = Math.max(0, beatCooldownRef.current - safeDelta);

    if (subEnergyRef.current > 0.18 && subDelta > 0.008 && beatCooldownRef.current <= 0) {
      kickPulseRef.current = Math.min(1.2, kickPulseRef.current + 0.65);
      retractPulseRef.current = 0.45;
      beatCooldownRef.current = 0.12;
    } else {
      kickPulseRef.current = THREE.MathUtils.lerp(kickPulseRef.current, 0, 1 - Math.exp(-safeDelta * 8.5));
      retractPulseRef.current = THREE.MathUtils.lerp(retractPulseRef.current, 0, 1 - Math.exp(-safeDelta * 12));
    }
    prevSubRef.current = subEnergyRef.current;

    // Hover Detection via 3D Raycasting
    let targetHover = 0;
    if (groupRef.current) {
      groupRef.current.getWorldPosition(tempWorldPosRef.current);
      raycasterRef.current.setFromCamera(mouseNdcRef.current, state.camera);
      const distToRay = raycasterRef.current.ray.distanceToPoint(tempWorldPosRef.current);
      const effectiveRadius = BASE_RADIUS * groupScaleRef.current * 1.5;

      if (distToRay < effectiveRadius) {
        targetHover = THREE.MathUtils.clamp(1.0 - distToRay / effectiveRadius, 0.2, 1.0);
      }
    }

    hoverStrengthRef.current = THREE.MathUtils.lerp(
      hoverStrengthRef.current,
      targetHover,
      1 - Math.exp(-safeDelta * 8)
    );

    // Group Dynamics: Gyroscopic tilt towards cursor & spin acceleration
    if (groupRef.current) {
      const baseSpin = 0.32 + instantOverall * 0.35 + kickPulseRef.current * 0.2;
      const hoverSpin = hoverStrengthRef.current * 1.2 + mouseVelocityRef.current * 0.4;
      groupRef.current.rotation.y += safeDelta * (baseSpin + hoverSpin);

      // Smooth gyroscopic lean tracking cursor
      const tiltX = (mouseNdcRef.current.y || 0) * 0.28 * (0.25 + hoverStrengthRef.current * 0.75);
      const tiltZ = (mouseNdcRef.current.x || 0) * 0.22 * (0.25 + hoverStrengthRef.current * 0.75);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -tiltX, 1 - Math.exp(-safeDelta * 6));
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, 1 - Math.exp(-safeDelta * 6));

      // Organic Scale Expansion on Kick, Hover & Shockwave
      const targetScale = 1.0 
        + kickPulseRef.current * 0.14 
        - retractPulseRef.current * 0.06 
        + hoverStrengthRef.current * 0.12 
        + shockwaveRef.current * 0.15;
      groupScaleRef.current = THREE.MathUtils.lerp(groupScaleRef.current, targetScale, 1 - Math.exp(-safeDelta * 14));
      groupRef.current.scale.setScalar(groupScaleRef.current);
    }

    // Rotate Crystalline Geometric Inner Core & Orbital Rings
    const t = state.clock.elapsedTime;
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = t * 0.45;
      innerCoreRef.current.rotation.y = -t * 0.6;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.55;
      ring1Ref.current.rotation.x = Math.sin(t * 0.3) * 0.35 + 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.4;
      ring2Ref.current.rotation.y = Math.cos(t * 0.25) * 0.4 - 0.5;
    }

    // Dynamic Murmuration Waves with Magnetic Cursor Repulsion
    const primaryAttr = pointsPrimaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const secondaryAttr = pointsSecondaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const haloAttr = pointsHaloRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      const waveAmp =
        0.026
        + subEnergyRef.current * 0.055
        + hoverStrengthRef.current * 0.04
        + kickPulseRef.current * 0.08
        + shockwaveRef.current * 0.1;

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const dx = directions[ix];
        const dy = directions[ix + 1];
        const dz = directions[ix + 2];

        // Multi-frequency harmonic murmuration ripples
        const rippleA = Math.sin(t * 2.1 + i * 0.018) * 0.4;
        const rippleB = Math.cos(t * 1.7 + i * 0.012) * 0.28;
        const rippleC = Math.sin((dx + dz) * 7.0 + t * 3.1) * 0.2;

        const beatShape =
          Math.sin(i * 0.014 + t * 7.5) * 0.55
          + Math.cos((dx - dy + dz) * 9.0 + t * 5.2) * 0.4;

        const beatDeform = beatShape * kickPulseRef.current * 0.24;
        const shockwaveDeform = Math.sin(i * 0.03 - t * 12.0) * shockwaveRef.current * 0.28;

        const radialOffset = THREE.MathUtils.clamp(
          (rippleA + rippleB + rippleC) * waveAmp + beatDeform + shockwaveDeform,
          -0.22,
          0.26
        );
        const radial = BASE_RADIUS + radialOffset;

        // Fluid flocking micro-swirl (amplified on hover & cursor velocity)
        const swirl = (0.008 + subEnergyRef.current * 0.01) * (1.0 + hoverStrengthRef.current * 1.4 + mouseVelocityRef.current * 0.8);
        primary[ix] = dx * radial + Math.sin(t + i * 0.003) * swirl;
        primary[ix + 1] = dy * radial + Math.cos(t * 1.2 + i * 0.004) * swirl;
        primary[ix + 2] = dz * radial + Math.sin(t * 0.85 + i * 0.005) * swirl;

        // Concentric inner flock layer
        const innerRadius = radial * (0.92 + Math.sin(t * 0.85 + i * 0.01) * 0.025);
        secondary[ix] = dx * innerRadius;
        secondary[ix + 1] = dy * innerRadius;
        secondary[ix + 2] = dz * innerRadius;
      }

      primaryAttr.needsUpdate = true;
      secondaryAttr.needsUpdate = true;
    }

    if (haloAttr) {
      const halo = haloAttr.array as Float32Array;
      const haloAmp = 0.022 + subEnergyRef.current * 0.045 + kickPulseRef.current * 0.07 + hoverStrengthRef.current * 0.035;

      for (let i = 0; i < haloParticleCount; i += 1) {
        const ix = i * 3;
        const dx = haloDirections[ix];
        const dy = haloDirections[ix + 1];
        const dz = haloDirections[ix + 2];

        const haloRipple = Math.sin(t * 0.9 + i * 0.02) * haloAmp;
        const haloRadius = BASE_RADIUS * 1.16 + haloRipple;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    // Dynamic music & hover reactive size and opacity transitions
    if (primaryMaterialRef.current) {
      const targetSize = 0.015 + subEnergyRef.current * 0.006 + kickPulseRef.current * 0.008 + hoverStrengthRef.current * 0.005;
      const targetOpacity = 0.78 + subEnergyRef.current * 0.1 + kickPulseRef.current * 0.06 + hoverStrengthRef.current * 0.14;

      primaryMaterialRef.current.size = THREE.MathUtils.lerp(primaryMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      primaryMaterialRef.current.opacity = THREE.MathUtils.lerp(primaryMaterialRef.current.opacity, Math.min(0.96, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }

    if (secondaryMaterialRef.current) {
      const targetSize = 0.009 + subEnergyRef.current * 0.004 + kickPulseRef.current * 0.003;
      const targetOpacity = 0.38 + subEnergyRef.current * 0.10 + kickPulseRef.current * 0.05 + hoverStrengthRef.current * 0.12;

      secondaryMaterialRef.current.size = THREE.MathUtils.lerp(secondaryMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      secondaryMaterialRef.current.opacity = THREE.MathUtils.lerp(secondaryMaterialRef.current.opacity, Math.min(0.85, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }

    if (haloMaterialRef.current) {
      const targetSize = 0.005 + subEnergyRef.current * 0.002 + kickPulseRef.current * 0.004;
      const targetOpacity = 0.14 + subEnergyRef.current * 0.05 + hoverStrengthRef.current * 0.08 + kickPulseRef.current * 0.08;

      haloMaterialRef.current.size = THREE.MathUtils.lerp(haloMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      haloMaterialRef.current.opacity = THREE.MathUtils.lerp(haloMaterialRef.current.opacity, Math.min(0.35, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
      <group ref={groupRef}>
        {/* Kinetic Inner Crystalline Core (Crystalline Geometric Lattice) */}
        <mesh ref={innerCoreRef}>
          <icosahedronGeometry args={[BASE_RADIUS * 0.46, 1]} />
          <meshStandardMaterial
            color="#18181b"
            wireframe
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Orbital Holographic Ring 01 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[BASE_RADIUS * 1.22, 0.0032, 16, 120]} />
          <meshStandardMaterial
            color="#52525b"
            roughness={0.1}
            metalness={0.95}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Orbital Holographic Ring 02 (Tilted on Cross-Axis) */}
        <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[BASE_RADIUS * 1.34, 0.0025, 16, 120]} />
          <meshStandardMaterial
            color="#71717a"
            roughness={0.15}
            metalness={0.9}
            transparent
            opacity={0.32}
          />
        </mesh>

        {/* Primary Dense Starling Flock - Obsidian Stippling with Circular Soft Texture */}
        <points ref={pointsPrimaryRef} geometry={primaryGeometry}>
          <pointsMaterial
            ref={primaryMaterialRef}
            map={particleTexture || undefined}
            color="#09090b"
            size={0.015}
            sizeAttenuation
            transparent
            opacity={0.78}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        {/* Secondary Inner Flocking Layer - Charcoal & Silver */}
        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            map={particleTexture || undefined}
            color="#27272a"
            size={0.009}
            sizeAttenuation
            transparent
            opacity={0.38}
            depthWrite={false}
          />
        </points>

        {/* Outer Stardust Murmuration Halo - Graphite Silver */}
        <points ref={pointsHaloRef} geometry={haloGeometry}>
          <pointsMaterial
            ref={haloMaterialRef}
            map={particleTexture || undefined}
            color="#52525b"
            size={0.005}
            sizeAttenuation
            transparent
            opacity={0.14}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </Float>
  );
};
