import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const BASE_RADIUS = 1.48;
const QUALITY_PRESETS = {
  high: { particleCount: 28000, haloParticleCount: 8000 },
  low: { particleCount: 14000, haloParticleCount: 4000 },
} as const;

// Fibonacci spherical distribution - creates natural stippled murmuration geometry (essaim d'oiseaux)
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

export const AudioSphere: React.FC<AudioSphereProps> = ({ analyserRef, quality = 'high' }) => {
  const particleCount = QUALITY_PRESETS[quality].particleCount;
  const haloParticleCount = QUALITY_PRESETS[quality].haloParticleCount;

  const groupRef = useRef<THREE.Group>(null);
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

  // Global mouse coordinates & hover detection
  const mouseNdcRef = useRef(new THREE.Vector2(-999, -999));
  const hoverStrengthRef = useRef(0);
  const groupScaleRef = useRef(1);
  const raycasterRef = useRef(new THREE.Raycaster());
  const tempWorldPosRef = useRef(new THREE.Vector3());

  // Fibonacci positions cache
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

  // Global pointer listener ensures hover works regardless of overlay layers
  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      mouseNdcRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdcRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.08);

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
      kickPulseRef.current = Math.min(1.4, kickPulseRef.current + 0.75);
      retractPulseRef.current = 0.55;
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
      const effectiveRadius = BASE_RADIUS * groupScaleRef.current * 1.4;

      if (distToRay < effectiveRadius) {
        targetHover = THREE.MathUtils.clamp(1.0 - distToRay / effectiveRadius, 0.25, 1.0);
      }
    }

    hoverStrengthRef.current = THREE.MathUtils.lerp(
      hoverStrengthRef.current,
      targetHover,
      1 - Math.exp(-safeDelta * 8)
    );

    // Group Dynamics: Spin acceleration + gyroscopic tilt towards cursor on hover
    if (groupRef.current) {
      const baseSpin = 0.38 + instantOverall * 0.45 + kickPulseRef.current * 0.25;
      const hoverSpin = hoverStrengthRef.current * 1.5; // Accelerate spin significantly on hover
      groupRef.current.rotation.y += safeDelta * (baseSpin + hoverSpin);

      // Gyroscopic tilt towards mouse
      const tiltX = (mouseNdcRef.current.y || 0) * 0.32 * (0.3 + hoverStrengthRef.current * 0.7);
      const tiltZ = (mouseNdcRef.current.x || 0) * 0.24 * (0.3 + hoverStrengthRef.current * 0.7);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -tiltX, 1 - Math.exp(-safeDelta * 6));
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, 1 - Math.exp(-safeDelta * 6));

      // Organic Scale Expansion on Kick & Hover
      const targetScale = 1.0 + kickPulseRef.current * 0.18 - retractPulseRef.current * 0.08 + hoverStrengthRef.current * 0.18;
      groupScaleRef.current = THREE.MathUtils.lerp(groupScaleRef.current, targetScale, 1 - Math.exp(-safeDelta * 14));
      groupRef.current.scale.setScalar(groupScaleRef.current);
    }

    // Dynamic Murmuration Waves (essaim d'oiseaux)
    const t = state.clock.elapsedTime;
    const primaryAttr = pointsPrimaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const secondaryAttr = pointsSecondaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const haloAttr = pointsHaloRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      const waveAmp =
        0.038
        + subEnergyRef.current * 0.07
        + hoverStrengthRef.current * 0.045
        + kickPulseRef.current * 0.12;

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const dx = directions[ix];
        const dy = directions[ix + 1];
        const dz = directions[ix + 2];

        // Multi-frequency harmonic murmuration ripples
        const rippleA = Math.sin(t * 2.3 + i * 0.019) * 0.42;
        const rippleB = Math.cos(t * 1.9 + i * 0.013) * 0.3;
        const rippleC = Math.sin((dx + dz) * 6.5 + t * 3.3) * 0.22;

        const beatShape =
          Math.sin(i * 0.014 + t * 8.2) * 0.58
          + Math.cos((dx - dy + dz) * 9.5 + t * 5.7) * 0.42;

        const beatDeform = beatShape * kickPulseRef.current * 0.32;
        const beatRetract = beatShape * retractPulseRef.current * 0.12;

        const radialOffset = THREE.MathUtils.clamp(
          (rippleA + rippleB + rippleC) * waveAmp + beatDeform - beatRetract,
          -0.28,
          0.28
        );
        const radial = BASE_RADIUS + radialOffset;

        // Fluid flocking micro-swirl (amplified on hover)
        const swirl = (0.01 + subEnergyRef.current * 0.014) * (1.0 + hoverStrengthRef.current * 1.2);
        primary[ix] = dx * radial + Math.sin(t + i * 0.003) * swirl;
        primary[ix + 1] = dy * radial + Math.cos(t * 1.2 + i * 0.004) * swirl;
        primary[ix + 2] = dz * radial + Math.sin(t * 0.85 + i * 0.005) * swirl;

        // Concentric inner flock layer
        const innerRadius = radial * (0.93 + Math.sin(t * 0.9 + i * 0.01) * 0.03);
        secondary[ix] = dx * innerRadius;
        secondary[ix + 1] = dy * innerRadius;
        secondary[ix + 2] = dz * innerRadius;
      }

      primaryAttr.needsUpdate = true;
      secondaryAttr.needsUpdate = true;
    }

    if (haloAttr) {
      const halo = haloAttr.array as Float32Array;
      const haloAmp = 0.028 + subEnergyRef.current * 0.06 + kickPulseRef.current * 0.1 + hoverStrengthRef.current * 0.04;

      for (let i = 0; i < haloParticleCount; i += 1) {
        const ix = i * 3;
        const dx = haloDirections[ix];
        const dy = haloDirections[ix + 1];
        const dz = haloDirections[ix + 2];

        const haloRipple = Math.sin(t * 0.95 + i * 0.021) * haloAmp;
        const haloRadius = BASE_RADIUS * 1.15 + haloRipple;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    // Dynamic music & hover reactive size and opacity transitions
    if (primaryMaterialRef.current) {
      const targetSize = 0.016 + subEnergyRef.current * 0.008 + kickPulseRef.current * 0.01 + hoverStrengthRef.current * 0.005;
      const targetOpacity = 0.74 + subEnergyRef.current * 0.12 + kickPulseRef.current * 0.06 + hoverStrengthRef.current * 0.15;

      primaryMaterialRef.current.size = THREE.MathUtils.lerp(primaryMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      primaryMaterialRef.current.opacity = THREE.MathUtils.lerp(primaryMaterialRef.current.opacity, Math.min(0.96, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }

    if (secondaryMaterialRef.current) {
      const targetSize = 0.0085 + subEnergyRef.current * 0.004 + kickPulseRef.current * 0.003;
      const targetOpacity = 0.32 + subEnergyRef.current * 0.10 + kickPulseRef.current * 0.05 + hoverStrengthRef.current * 0.12;

      secondaryMaterialRef.current.size = THREE.MathUtils.lerp(secondaryMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      secondaryMaterialRef.current.opacity = THREE.MathUtils.lerp(secondaryMaterialRef.current.opacity, Math.min(0.85, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }

    if (haloMaterialRef.current) {
      const targetSize = 0.0045 + subEnergyRef.current * 0.002 + kickPulseRef.current * 0.005;
      const targetOpacity = 0.11 + subEnergyRef.current * 0.05 + hoverStrengthRef.current * 0.08 + kickPulseRef.current * 0.08;

      haloMaterialRef.current.size = THREE.MathUtils.lerp(haloMaterialRef.current.size, targetSize, 1 - Math.exp(-safeDelta * 11));
      haloMaterialRef.current.opacity = THREE.MathUtils.lerp(haloMaterialRef.current.opacity, Math.min(0.35, targetOpacity), 1 - Math.exp(-safeDelta * 11));
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Primary Dense Starling Flock - Deep Obsidian Stippling */}
        <points ref={pointsPrimaryRef} geometry={primaryGeometry}>
          <pointsMaterial
            ref={primaryMaterialRef}
            color="#0a0a0a"
            size={0.016}
            sizeAttenuation
            transparent
            opacity={0.74}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        {/* Secondary Inner Flocking Layer - Charcoal */}
        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            color="#18181b"
            size={0.0085}
            sizeAttenuation
            transparent
            opacity={0.32}
            depthWrite={false}
          />
        </points>

        {/* Outer Stardust Murmuration Halo - Graphite */}
        <points ref={pointsHaloRef} geometry={haloGeometry}>
          <pointsMaterial
            ref={haloMaterialRef}
            color="#27272a"
            size={0.0045}
            sizeAttenuation
            transparent
            opacity={0.11}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </Float>
  );
};
