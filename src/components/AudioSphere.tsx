import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  quality?: 'high' | 'low';
}

const BASE_RADIUS = 1.36;
const QUALITY_PRESETS = {
  high: { particleCount: 20000, haloParticleCount: 6000 },
  low: { particleCount: 9000, haloParticleCount: 2600 },
} as const;

// Per-particle polar fields (instead of static xyz) so each point can orbit its
// own latitude band over time — the basis for the flocking/murmuration motion.
const createSphereFields = (count: number) => {
  const theta0 = new Float32Array(count);
  const y = new Float32Array(count);
  const radiusXZ = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const yi = 1 - (i / (count - 1)) * 2;
    y[i] = yi;
    radiusXZ[i] = Math.sqrt(1 - yi * yi);
    theta0[i] = i * goldenAngle;
  }

  return { theta0, y, radiusXZ };
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

      // Keep only sub/kick region (20Hz-100Hz), with more weight on lower bins.
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

    if (groupRef.current) {
      groupRef.current.position.x = groupTargetXRef.current;
      groupRef.current.position.y = groupTargetYRef.current;

      const spin = 0.26 + kickEnergy * 0.45 + hoverStrengthRef.current * 0.32 + dragBoost;
      groupRef.current.rotation.y += delta * spin;
      groupRef.current.rotation.x += delta * (0.14 + kickEnergy * 0.09);
      groupRef.current.rotation.z += delta * 0.07;

      const targetScale = 1 + kickPulseRef.current * 0.26 - retractPulseRef.current * 0.1 + subEnergyRef.current * 0.06;
      groupScaleRef.current = THREE.MathUtils.lerp(
        groupScaleRef.current,
        targetScale,
        1 - Math.exp(-delta * 30)
      );
      groupRef.current.scale.setScalar(groupScaleRef.current);
    }

    const t = state.clock.elapsedTime;
    const primaryAttr = pointsPrimaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const secondaryAttr = pointsSecondaryRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    const haloAttr = pointsHaloRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    // Murmuration drift: each particle orbits its own latitude band at a
    // slightly different speed, with a slow band-shear and a fine per-particle
    // flutter layered on top — reads as a flock wheeling together rather than
    // a rigid rotating shell.
    const swarmSpeed = 0.05 + kickEnergy * 0.045;
    const flowRotation = t * swarmSpeed;
    const bandShearAmp = 0.16 + kickEnergy * 0.12;

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      const waveAmp =
        0.035
        + subEnergyRef.current * 0.15
        + kickEnergy * 0.05
        + clickImpulseRef.current * 0.03
        + hoverStrengthRef.current * 0.02
        + kickPulseRef.current * 0.18;

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const y0 = fields.y[i];
        const rXZ0 = fields.radiusXZ[i];
        const speedVar = 0.82 + 0.36 * Math.sin(i * 0.00097 + 1.7);
        const theta =
          fields.theta0[i]
          + flowRotation * speedVar
          + Math.sin(flowRotation * 0.4 + y0 * 2.6) * bandShearAmp
          + Math.sin(t * 0.55 + i * 0.00065) * 0.045;

        const dx = Math.cos(theta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(theta) * rXZ0;

        const rippleA = Math.sin(t * 2.3 + i * 0.011) * 0.42;
        const rippleB = Math.cos(t * 1.9 + i * 0.008) * 0.3;
        const rippleC = Math.sin((dx + dz) * 6.5 + t * 3.3) * 0.22;

        const beatShape =
          Math.sin(i * 0.008 + t * 5.4) * 0.58
          + Math.cos((dx - dy + dz) * 9.5 + t * 4.1) * 0.42;

        // Flare turbulence: layered high-frequency noise that only flares up with
        // bass energy, like plasma tendrils erupting off a solar storm surface.
        const flareTurbulence =
          (Math.sin(dx * 8.5 + t * 4.6 + i * 0.0006) * Math.cos(dz * 7.2 - t * 3.8 + i * 0.0004)
            + Math.sin(dy * 10.5 - t * 5.5 + i * 0.0009) * 0.6)
          * (subEnergyRef.current * 0.05 + kickEnergy * 0.045);

        const beatDeform = beatShape * kickPulseRef.current * 0.42;
        const beatRetract = beatShape * retractPulseRef.current * 0.15;

        const radialOffset = THREE.MathUtils.clamp(
          (rippleA + rippleB + rippleC) * waveAmp + beatDeform - beatRetract + flareTurbulence,
          -0.32,
          0.4
        );
        const radial = BASE_RADIUS + radialOffset;

        const swirl = 0.004 + kickEnergy * 0.016 + subEnergyRef.current * 0.008;
        primary[ix] = dx * radial + Math.sin(t + i * 0.002) * swirl;
        primary[ix + 1] = dy * radial + Math.cos(t * 1.2 + i * 0.0025) * swirl;
        primary[ix + 2] = dz * radial + Math.sin(t * 0.85 + i * 0.003) * swirl;

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
      const haloAmp = 0.028 + subEnergyRef.current * 0.05 + kickEnergy * 0.035 + kickPulseRef.current * 0.09;

      for (let i = 0; i < haloParticleCount; i += 1) {
        const ix = i * 3;
        const y0 = haloFields.y[i];
        const rXZ0 = haloFields.radiusXZ[i];
        const haloSpeedVar = 0.85 + 0.3 * Math.sin(i * 0.0015 + 0.6);
        const haloTheta =
          haloFields.theta0[i]
          + flowRotation * 0.65 * haloSpeedVar
          + Math.sin(flowRotation * 0.4 + y0 * 2.2) * bandShearAmp * 0.6;

        const dx = Math.cos(haloTheta) * rXZ0;
        const dy = y0;
        const dz = Math.sin(haloTheta) * rXZ0;

        const haloRipple = Math.sin(t * 0.95 + i * 0.021) * haloAmp;
        const haloRadius = BASE_RADIUS * 1.13 + haloRipple;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    if (primaryMaterialRef.current) {
      const targetSize = 0.016 + subEnergyRef.current * 0.006 + kickEnergy * 0.011 + kickPulseRef.current * 0.017;
      const targetOpacity = 0.68 + kickEnergy * 0.13 + clickImpulseRef.current * 0.08 + kickPulseRef.current * 0.07;

      primaryMaterialRef.current.size = THREE.MathUtils.lerp(
        primaryMaterialRef.current.size,
        targetSize,
        1 - Math.exp(-delta * 11)
      );
      primaryMaterialRef.current.opacity = THREE.MathUtils.lerp(
        primaryMaterialRef.current.opacity,
        Math.min(1, targetOpacity),
        1 - Math.exp(-delta * 11)
      );
    }

    if (secondaryMaterialRef.current) {
      const targetSize = 0.008 + kickEnergy * 0.0045 + kickPulseRef.current * 0.003;
      const targetOpacity = 0.26 + kickEnergy * 0.11 + kickPulseRef.current * 0.05;

      secondaryMaterialRef.current.size = THREE.MathUtils.lerp(
        secondaryMaterialRef.current.size,
        targetSize,
        1 - Math.exp(-delta * 11)
      );
      secondaryMaterialRef.current.opacity = THREE.MathUtils.lerp(
        secondaryMaterialRef.current.opacity,
        Math.min(0.9, targetOpacity),
        1 - Math.exp(-delta * 11)
      );
    }

    if (haloMaterialRef.current) {
      const targetSize = 0.0043 + kickEnergy * 0.0025 + kickPulseRef.current * 0.007;
      const targetOpacity = 0.07 + kickEnergy * 0.04 + hoverStrengthRef.current * 0.012 + kickPulseRef.current * 0.12;

      haloMaterialRef.current.size = THREE.MathUtils.lerp(
        haloMaterialRef.current.size,
        targetSize,
        1 - Math.exp(-delta * 11)
      );
      haloMaterialRef.current.opacity = THREE.MathUtils.lerp(
        haloMaterialRef.current.opacity,
        Math.min(0.22, targetOpacity),
        1 - Math.exp(-delta * 11)
      );
    }

    if (hitAreaRef.current) {
      const targetScale = 1.03 + hoverStrengthRef.current * 0.03 + clickImpulseRef.current * 0.04;
      hitAreaRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <Float speed={0.9} rotationIntensity={0.18} floatIntensity={0.45}>
      <group ref={groupRef}>
        <points ref={pointsPrimaryRef} geometry={primaryGeometry}>
          <pointsMaterial
            ref={primaryMaterialRef}
            color="#0a0a0a"
            size={0.016}
            sizeAttenuation
            transparent
            opacity={0.7}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            color="#161616"
            size={0.008}
            sizeAttenuation
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </points>

        <points ref={pointsHaloRef} geometry={haloGeometry}>
          <pointsMaterial
            ref={haloMaterialRef}
            color="#1f1f1f"
            size={0.0043}
            sizeAttenuation
            transparent
            opacity={0.08}
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
          <sphereGeometry args={[BASE_RADIUS * 1.05, 36, 36]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
};
