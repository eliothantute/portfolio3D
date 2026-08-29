import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const BASE_RADIUS = 1.38;
const QUALITY_PRESETS = {
  high: { particleCount: 22000, haloParticleCount: 7000 },
  low: { particleCount: 10000, haloParticleCount: 3000 },
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
    seedA[i] = Math.sin(i * 0.137) * 4.5 + Math.cos(i * 0.311) * 3.2;
    seedB[i] = Math.cos(i * 0.219) * 5.1 + Math.sin(i * 0.473) * 2.8;
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
      kickPulseRef.current = Math.min(1.2, kickPulseRef.current + 0.55);
      beatCooldownRef.current = 0.15;
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

    const kickEnergy = THREE.MathUtils.clamp(subEnergyRef.current * 2 + kickPulseRef.current * 1, 0, 2);
    const dragBoost = isDraggingRef.current ? 0.35 : 0;

    const dragX = THREE.MathUtils.clamp(state.pointer.x * 2.1, -2.4, 2.4);
    const dragY = THREE.MathUtils.clamp(state.pointer.y * 1.45, -1.5, 1.5);
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

    // Organic 3D wandering & multi-axis rotation
    if (groupRef.current) {
      // Natural organic drift wandering on X/Y/Z
      const organicWanderX = Math.sin(t * 0.55) * 0.18 + Math.cos(t * 0.28) * 0.12;
      const organicWanderY = Math.cos(t * 0.65) * 0.15 + Math.sin(t * 0.35) * 0.08;

      groupRef.current.position.x = groupTargetXRef.current + organicWanderX;
      groupRef.current.position.y = groupTargetYRef.current + organicWanderY;

      // Organic tumbling rotation
      const spinSpeed = 0.35 + kickEnergy * 0.4 + hoverStrengthRef.current * 0.3 + dragBoost;
      groupRef.current.rotation.y += delta * (spinSpeed + Math.sin(t * 0.4) * 0.08);
      groupRef.current.rotation.x += delta * (0.22 + Math.cos(t * 0.5) * 0.06 + kickEnergy * 0.1);
      groupRef.current.rotation.z += delta * (0.12 + Math.sin(t * 0.3) * 0.04);

      // Organic breathing scale pulsation
      const organicBreath = Math.sin(t * 1.2) * 0.04 + Math.cos(t * 0.7) * 0.025;
      const targetScale =
        1
        + organicBreath
        + kickPulseRef.current * 0.24
        - retractPulseRef.current * 0.1
        + subEnergyRef.current * 0.08;

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

    // Fluid organic particle dynamics
    const flowRotation = t * (0.12 + kickEnergy * 0.08);

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const y0 = fields.y[i];
        const rXZ0 = fields.radiusXZ[i];
        const sA = fields.seedA[i];
        const sB = fields.seedB[i];

        // Multi-frequency organic flow orbital angles
        const theta =
          fields.theta0[i]
          + flowRotation * (0.8 + 0.4 * Math.sin(sA + t * 0.4))
          + Math.sin(flowRotation * 0.6 + y0 * 3.2 + sB) * 0.28
          + Math.cos(t * 0.8 + y0 * 4.5) * 0.12;

        const dx = Math.cos(theta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(theta) * rXZ0;

        // Multi-layer organic sinusoidal noise waves (constantly alive & deforming)
        const wave1 = Math.sin(dx * 3.4 + dz * 2.8 + t * 1.8 + sA * 0.1) * 0.14;
        const wave2 = Math.cos(dy * 4.2 - dx * 2.5 + t * 1.5 + sB * 0.1) * 0.11;
        const wave3 = Math.sin((dx + dy + dz) * 5.2 - t * 2.2) * 0.08;
        const wave4 = Math.cos(dz * 6.5 + t * 2.8 + i * 0.0004) * 0.05;

        // Plasma turbulence spikes
        const plasmaTurbulence =
          Math.sin(dx * 8.2 + t * 3.4 + sA)
          * Math.cos(dy * 7.5 - t * 2.9 + sB)
          * 0.07;

        // Total organic radius deformation
        const audioAmp = 1 + subEnergyRef.current * 0.8 + kickEnergy * 0.6 + kickPulseRef.current * 1.2;
        const totalDeform = (wave1 + wave2 + wave3 + wave4 + plasmaTurbulence) * audioAmp;

        const radial = BASE_RADIUS + totalDeform;

        // Organic micro-swirl vortex
        const swirlX = Math.sin(t * 1.6 + sA) * 0.022;
        const swirlY = Math.cos(t * 1.4 + sB) * 0.022;
        const swirlZ = Math.sin(t * 1.8 + sA + sB) * 0.022;

        primary[ix] = dx * radial + swirlX;
        primary[ix + 1] = dy * radial + swirlY;
        primary[ix + 2] = dz * radial + swirlZ;

        // Concentric inner aura shell with dynamic phase shift
        const innerOffset = Math.sin(t * 1.6 + y0 * 4.0 + sA * 0.2) * 0.06;
        const innerRadius = (radial - 0.08 + innerOffset) * 0.94;

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
          + flowRotation * 0.75
          + Math.sin(t * 0.9 + y0 * 2.8 + sA) * 0.24;

        const dx = Math.cos(haloTheta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(haloTheta) * rXZ0;

        // Outer stardust halo organic breathing wave
        const haloBreath = Math.sin(t * 1.4 + sB + y0 * 3.5) * 0.16 + Math.cos(t * 1.9 + sA) * 0.09;
        const haloRadius = BASE_RADIUS * 1.22 + haloBreath;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    if (primaryMaterialRef.current) {
      const pulseSize = 0.013 + Math.sin(t * 1.5) * 0.0015 + kickEnergy * 0.006;
      const pulseOpacity = 0.38 + Math.sin(t * 1.2) * 0.05 + kickEnergy * 0.15;
      primaryMaterialRef.current.size = pulseSize;
      primaryMaterialRef.current.opacity = pulseOpacity;
    }

    if (secondaryMaterialRef.current) {
      const pulseSize = 0.008 + Math.cos(t * 1.4) * 0.001 + kickEnergy * 0.003;
      const pulseOpacity = 0.24 + Math.cos(t * 1.6) * 0.04 + kickEnergy * 0.08;
      secondaryMaterialRef.current.size = pulseSize;
      secondaryMaterialRef.current.opacity = pulseOpacity;
    }

    if (haloMaterialRef.current) {
      const pulseSize = 0.0045 + Math.sin(t * 1.8) * 0.0008 + kickEnergy * 0.002;
      const pulseOpacity = 0.14 + Math.sin(t * 1.4) * 0.03 + kickEnergy * 0.06;
      haloMaterialRef.current.size = pulseSize;
      haloMaterialRef.current.opacity = pulseOpacity;
    }

    if (hitAreaRef.current) {
      const targetScale = 1.05 + hoverStrengthRef.current * 0.04 + clickImpulseRef.current * 0.05;
      hitAreaRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.65}>
      <group ref={groupRef}>
        <points ref={pointsPrimaryRef} geometry={primaryGeometry}>
          <pointsMaterial
            ref={primaryMaterialRef}
            color="#0066ff"
            size={0.013}
            sizeAttenuation
            transparent
            opacity={0.38}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            color="#6366f1"
            size={0.008}
            sizeAttenuation
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </points>

        <points ref={pointsHaloRef} geometry={haloGeometry}>
          <pointsMaterial
            ref={haloMaterialRef}
            color="#38bdf8"
            size={0.0045}
            sizeAttenuation
            transparent
            opacity={0.14}
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
          <sphereGeometry args={[BASE_RADIUS * 1.08, 36, 36]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
};
