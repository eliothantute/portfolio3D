import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const BASE_RADIUS = 1.42;
const QUALITY_PRESETS = {
  high: { particleCount: 24000, haloParticleCount: 8000 },
  low: { particleCount: 12000, haloParticleCount: 4000 },
} as const;

// Per-particle initial polar coordinates & random phase seeds
const createSphereFields = (count: number) => {
  const theta0 = new Float32Array(count);
  const y = new Float32Array(count);
  const radiusXZ = new Float32Array(count);
  const seedA = new Float32Array(count);
  const seedB = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const yi = 1 - (i / (count - 1)) * 2;
    y[i] = yi;
    radiusXZ[i] = Math.sqrt(Math.max(0, 1 - yi * yi));
    theta0[i] = i * goldenAngle;
    seedA[i] = Math.sin(i * 0.173) * 5.2 + Math.cos(i * 0.381) * 4.1;
    seedB[i] = Math.cos(i * 0.247) * 5.8 + Math.sin(i * 0.513) * 3.4;
  }

  return { theta0, y, radiusXZ, seedA, seedB };
};

export const AudioSphere: React.FC<AudioSphereProps> = ({ analyserRef, quality = 'high' }) => {
  const particleCount = QUALITY_PRESETS[quality].particleCount;
  const haloParticleCount = QUALITY_PRESETS[quality].haloParticleCount;

  const groupRef = useRef<THREE.Group>(null);
  const pointsPrimaryRef = useRef<THREE.Points>(null);
  const pointsSecondaryRef = useRef<THREE.Points>(null);
  const pointsHaloRef = useRef<THREE.Points>(null);
  const hitAreaRef = useRef<THREE.Mesh>(null);
  const primaryMaterialRef = useRef<THREE.PointsMaterial>(null);
  const secondaryMaterialRef = useRef<THREE.PointsMaterial>(null);
  const haloMaterialRef = useRef<THREE.PointsMaterial>(null);

  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const subEnergyRef = useRef(0);
  const prevSubRef = useRef(0);
  const kickPulseRef = useRef(0);
  const prevKickPulseRef = useRef(0);
  const retractPulseRef = useRef(0);
  const beatCooldownRef = useRef(0);

  const hoverStrengthRef = useRef(0);
  const clickImpulseRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const groupTargetXRef = useRef(0);
  const groupTargetYRef = useRef(0);
  const groupScaleRef = useRef(1);

  const fields = useMemo(() => createSphereFields(particleCount), [particleCount]);
  const haloFields = useMemo(() => createSphereFields(haloParticleCount), [haloParticleCount]);

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

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isHoveringRef.current = true;
  };

  const handlePointerOut = () => {
    isHoveringRef.current = false;
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clickImpulseRef.current = 1;
    isDraggingRef.current = true;
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const releaseDrag = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointerup', releaseDrag);
    window.addEventListener('pointercancel', releaseDrag);

    return () => {
      window.removeEventListener('pointerup', releaseDrag);
      window.removeEventListener('pointercancel', releaseDrag);
    };
  }, []);

  useFrame((state, delta) => {
    const analyser = analyserRef.current;
    let subInstant = 0;

    if (analyser) {
      if (!frequencyDataRef.current || frequencyDataRef.current.length !== analyser.frequencyBinCount) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      analyser.getByteFrequencyData(frequencyDataRef.current);
      const freqStep = analyser.context.sampleRate / analyser.fftSize;

      let subWeightedSum = 0;
      let subWeightTotal = 0;

      for (let i = 0; i < frequencyDataRef.current.length; i += 1) {
        const hz = i * freqStep;
        if (hz < 20 || hz > 100) continue;

        const value = frequencyDataRef.current[i] / 255;
        const normalized = (hz - 20) / 80;
        const weight = 1.32 - normalized * 0.72;
        subWeightedSum += value * weight;
        subWeightTotal += weight;
      }

      subInstant = subWeightTotal > 0 ? subWeightedSum / subWeightTotal : 0;
    }

    const subLerp = subInstant > subEnergyRef.current ? 1 - Math.exp(-delta * 30) : 1 - Math.exp(-delta * 11);
    subEnergyRef.current = THREE.MathUtils.lerp(subEnergyRef.current, subInstant, subLerp);

    const subDelta = Math.max(0, subEnergyRef.current - prevSubRef.current);
    beatCooldownRef.current = Math.max(0, beatCooldownRef.current - delta);

    const beatDetected = subEnergyRef.current > 0.19 && subDelta > 0.009 && beatCooldownRef.current <= 0;
    if (beatDetected) {
      kickPulseRef.current = Math.min(1.2, kickPulseRef.current + 0.65);
      beatCooldownRef.current = 0.14;
    } else {
      kickPulseRef.current = THREE.MathUtils.lerp(kickPulseRef.current, 0, 1 - Math.exp(-delta * 9.5));
    }

    const kickDelta = kickPulseRef.current - prevKickPulseRef.current;
    retractPulseRef.current = Math.max(
      retractPulseRef.current * Math.exp(-delta * 16),
      Math.max(0, -kickDelta * 6)
    );
    prevKickPulseRef.current = kickPulseRef.current;
    prevSubRef.current = subEnergyRef.current;

    hoverStrengthRef.current = THREE.MathUtils.lerp(
      hoverStrengthRef.current,
      isHoveringRef.current ? 1 : 0,
      1 - Math.exp(-delta * 12)
    );
    clickImpulseRef.current = Math.max(0, clickImpulseRef.current - delta * 2.8);

    const kickEnergy = THREE.MathUtils.clamp(subEnergyRef.current * 2.2 + kickPulseRef.current * 1.2, 0, 2);
    const dragBoost = isDraggingRef.current ? 0.45 : 0;

    const dragX = THREE.MathUtils.clamp(state.pointer.x * 2.3, -2.6, 2.6);
    const dragY = THREE.MathUtils.clamp(state.pointer.y * 1.6, -1.8, 1.8);
    const settleFactor = isDraggingRef.current ? 1 - Math.exp(-delta * 16) : 1 - Math.exp(-delta * 4.5);

    groupTargetXRef.current = THREE.MathUtils.lerp(
      groupTargetXRef.current,
      isDraggingRef.current ? dragX : 0,
      settleFactor
    );
    groupTargetYRef.current = THREE.MathUtils.lerp(
      groupTargetYRef.current,
      isDraggingRef.current ? dragY : 0,
      settleFactor
    );

    const t = state.clock.elapsedTime;

    // Highly active organic tumbling & multi-axis 3D motion
    if (groupRef.current) {
      // Dynamic wandering across 3D coordinates
      const organicWanderX = Math.sin(t * 0.75) * 0.28 + Math.cos(t * 0.38) * 0.16;
      const organicWanderY = Math.cos(t * 0.85) * 0.22 + Math.sin(t * 0.45) * 0.14;
      const organicWanderZ = Math.sin(t * 0.6) * 0.2;

      groupRef.current.position.x = groupTargetXRef.current + organicWanderX;
      groupRef.current.position.y = groupTargetYRef.current + organicWanderY;
      groupRef.current.position.z = organicWanderZ;

      // Active tumbling rotations on X/Y/Z
      const spinSpeed = 0.55 + kickEnergy * 0.5 + hoverStrengthRef.current * 0.35 + dragBoost;
      groupRef.current.rotation.y += delta * (spinSpeed + Math.sin(t * 0.6) * 0.18);
      groupRef.current.rotation.x += delta * (0.35 + Math.cos(t * 0.7) * 0.12 + kickEnergy * 0.15);
      groupRef.current.rotation.z += delta * (0.2 + Math.sin(t * 0.5) * 0.08);

      // Living organic pulsation scale
      const organicBreath = Math.sin(t * 1.5) * 0.07 + Math.cos(t * 0.9) * 0.04;
      const targetScale =
        1
        + organicBreath
        + kickPulseRef.current * 0.28
        - retractPulseRef.current * 0.12
        + subEnergyRef.current * 0.1;

      groupScaleRef.current = THREE.MathUtils.lerp(
        groupScaleRef.current,
        targetScale,
        1 - Math.exp(-delta * 25)
      );
      groupRef.current.scale.setScalar(groupScaleRef.current);
    }

    const primaryAttr = pointsPrimaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const secondaryAttr = pointsSecondaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const haloAttr = pointsHaloRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    // Fast dynamic vortex flow
    const flowRotation = t * (0.22 + kickEnergy * 0.15);

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const y0 = fields.y[i];
        const rXZ0 = fields.radiusXZ[i];
        const sA = fields.seedA[i];
        const sB = fields.seedB[i];

        // Dynamic swirling angle
        const theta =
          fields.theta0[i]
          + flowRotation * (1.0 + 0.6 * Math.sin(sA + t * 0.7))
          + Math.sin(flowRotation * 0.8 + y0 * 3.8 + sB) * 0.45
          + Math.cos(t * 1.2 + y0 * 5.2) * 0.22;

        const dx = Math.cos(theta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(theta) * rXZ0;

        // High-energy organic harmonic waves (dramatic deformation)
        const wave1 = Math.sin(dx * 4.2 + dz * 3.6 + t * 2.8 + sA * 0.15) * 0.26;
        const wave2 = Math.cos(dy * 5.2 - dx * 3.2 + t * 2.3 + sB * 0.15) * 0.2;
        const wave3 = Math.sin((dx + dy + dz) * 6.5 - t * 3.4) * 0.15;
        const wave4 = Math.cos(dz * 8.2 + t * 4.1 + i * 0.0006) * 0.1;

        // Solar flare & plasma tendrils
        const plasmaTendrils =
          Math.sin(dx * 9.5 + t * 4.8 + sA)
          * Math.cos(dy * 8.8 - t * 4.2 + sB)
          * (0.16 + subEnergyRef.current * 0.12);

        const totalDeform = (wave1 + wave2 + wave3 + wave4 + plasmaTendrils) * (1 + kickPulseRef.current * 0.8);
        const radial = BASE_RADIUS + totalDeform;

        // Swirling micro-vortex currents
        const swirlX = Math.sin(t * 2.4 + sA) * 0.045;
        const swirlY = Math.cos(t * 2.1 + sB) * 0.045;
        const swirlZ = Math.sin(t * 2.6 + sA + sB) * 0.045;

        primary[ix] = dx * radial + swirlX;
        primary[ix + 1] = dy * radial + swirlY;
        primary[ix + 2] = dz * radial + swirlZ;

        // Concentric secondary dark core
        const innerOffset = Math.sin(t * 2.2 + y0 * 5.0 + sA * 0.3) * 0.09;
        const innerRadius = (radial - 0.12 + innerOffset) * 0.92;

        secondary[ix] = dx * innerRadius;
        secondary[ix + 1] = dy * innerRadius;
        secondary[ix + 2] = dz * innerRadius;
      }

      primaryAttr.needsUpdate = true;
      secondaryAttr.needsUpdate = true;
    }

    if (haloAttr) {
      const halo = haloAttr.array as Float32Array;

      for (let i = 0; i < haloParticleCount; i += 1) {
        const ix = i * 3;
        const y0 = haloFields.y[i];
        const rXZ0 = haloFields.radiusXZ[i];
        const sA = haloFields.seedA[i];
        const sB = haloFields.seedB[i];

        const haloTheta =
          haloFields.theta0[i]
          + flowRotation * 0.85
          + Math.sin(t * 1.4 + y0 * 3.4 + sA) * 0.38;

        const dx = Math.cos(haloTheta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(haloTheta) * rXZ0;

        const haloBreath = Math.sin(t * 2.0 + sB + y0 * 4.2) * 0.28 + Math.cos(t * 2.6 + sA) * 0.16;
        const haloRadius = BASE_RADIUS * 1.28 + haloBreath;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    if (primaryMaterialRef.current) {
      const pulseSize = 0.022 + Math.sin(t * 2.0) * 0.003 + kickEnergy * 0.008;
      const pulseOpacity = 0.86 + Math.sin(t * 1.5) * 0.08 + kickEnergy * 0.1;
      primaryMaterialRef.current.size = pulseSize;
      primaryMaterialRef.current.opacity = Math.min(0.98, pulseOpacity);
    }

    if (secondaryMaterialRef.current) {
      const pulseSize = 0.014 + Math.cos(t * 1.8) * 0.002 + kickEnergy * 0.005;
      const pulseOpacity = 0.68 + Math.cos(t * 1.7) * 0.07 + kickEnergy * 0.1;
      secondaryMaterialRef.current.size = pulseSize;
      secondaryMaterialRef.current.opacity = Math.min(0.85, pulseOpacity);
    }

    if (haloMaterialRef.current) {
      const pulseSize = 0.0085 + Math.sin(t * 2.2) * 0.0015 + kickEnergy * 0.003;
      const pulseOpacity = 0.38 + Math.sin(t * 1.8) * 0.06 + kickEnergy * 0.1;
      haloMaterialRef.current.size = pulseSize;
      haloMaterialRef.current.opacity = Math.min(0.55, pulseOpacity);
    }

    if (hitAreaRef.current) {
      const targetScale = 1.08 + hoverStrengthRef.current * 0.05 + clickImpulseRef.current * 0.06;
      hitAreaRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <Float speed={2.0} rotationIntensity={0.5} floatIntensity={0.9}>
      <group ref={groupRef}>
        {/* Primary Deep Black Particle Core */}
        <points ref={pointsPrimaryRef} geometry={primaryGeometry}>
          <pointsMaterial
            ref={primaryMaterialRef}
            color="#09090b"
            size={0.022}
            sizeAttenuation
            transparent
            opacity={0.88}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        {/* Secondary Dark Onyx / Charcoal Shell */}
        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            color="#27272a"
            size={0.014}
            sizeAttenuation
            transparent
            opacity={0.72}
            depthWrite={false}
          />
        </points>

        {/* Outer Dark Smoke / Stardust Halo */}
        <points ref={pointsHaloRef} geometry={haloGeometry}>
          <pointsMaterial
            ref={haloMaterialRef}
            color="#52525b"
            size={0.0085}
            sizeAttenuation
            transparent
            opacity={0.42}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        <mesh
          ref={hitAreaRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <sphereGeometry args={[BASE_RADIUS * 1.15, 36, 36]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
};
