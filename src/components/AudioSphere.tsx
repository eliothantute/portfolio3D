import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';

interface AudioSphereProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

const PARTICLE_COUNT = 20000;
const HALO_PARTICLE_COUNT = 6000;
const BASE_RADIUS = 1.36;

const createSphereDirections = (count: number) => {
  const dirs = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * goldenAngle;

    dirs[i * 3] = Math.cos(theta) * r;
    dirs[i * 3 + 1] = y;
    dirs[i * 3 + 2] = Math.sin(theta) * r;
  }

  return dirs;
};

export const AudioSphere: React.FC<AudioSphereProps> = ({ analyserRef }) => {
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

  const directions = useMemo(() => createSphereDirections(PARTICLE_COUNT), []);
  const haloDirections = useMemo(() => createSphereDirections(HALO_PARTICLE_COUNT), []);

  const primaryGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    return geo;
  }, []);

  const secondaryGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    return geo;
  }, []);

  const haloGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HALO_PARTICLE_COUNT * 3), 3));
    return geo;
  }, []);

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

    const beatDetected = subEnergyRef.current > 0.16 && subDelta > 0.006 && beatCooldownRef.current <= 0;
    if (beatDetected) {
      kickPulseRef.current = 1.2;
      beatCooldownRef.current = 0.09;
    } else {
      kickPulseRef.current *= Math.exp(-delta * 14.5);
    }

    const kickDelta = kickPulseRef.current - prevKickPulseRef.current;
    retractPulseRef.current = Math.max(
      retractPulseRef.current * Math.exp(-delta * 23),
      Math.max(0, -kickDelta * 9.5)
    );
    prevKickPulseRef.current = kickPulseRef.current;
    prevSubRef.current = subEnergyRef.current;

    hoverStrengthRef.current = THREE.MathUtils.lerp(
      hoverStrengthRef.current,
      isHoveringRef.current ? 1 : 0,
      1 - Math.exp(-delta * 12)
    );
    clickImpulseRef.current = Math.max(0, clickImpulseRef.current - delta * 2.8);

    const kickEnergy = THREE.MathUtils.clamp(subEnergyRef.current * 2.6 + kickPulseRef.current * 1.4, 0, 2.8);
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

      const spin = 0.44 + kickEnergy * 0.58 + hoverStrengthRef.current * 0.32 + dragBoost;
      groupRef.current.rotation.y += delta * spin;
      groupRef.current.rotation.x += delta * (0.14 + kickEnergy * 0.08);
      groupRef.current.rotation.z += delta * 0.07;

      const targetScale = 1 + kickPulseRef.current * 0.22 - retractPulseRef.current * 0.09 + subEnergyRef.current * 0.03;
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

    if (primaryAttr && secondaryAttr) {
      const primary = primaryAttr.array as Float32Array;
      const secondary = secondaryAttr.array as Float32Array;

      const waveAmp =
        0.05
        + kickEnergy * 0.13
        + clickImpulseRef.current * 0.06
        + hoverStrengthRef.current * 0.04
        + kickPulseRef.current * 0.24;

      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const ix = i * 3;
        const dx = directions[ix];
        const dy = directions[ix + 1];
        const dz = directions[ix + 2];

        const rippleA = Math.sin(t * 2.3 + i * 0.019) * 0.42;
        const rippleB = Math.cos(t * 1.9 + i * 0.013) * 0.3;
        const rippleC = Math.sin((dx + dz) * 6.5 + t * 3.3) * 0.22;

        const beatShape =
          Math.sin(i * 0.014 + t * 8.2) * 0.58
          + Math.cos((dx - dy + dz) * 9.5 + t * 5.7) * 0.42;

        const beatDeform = beatShape * kickPulseRef.current * 0.34;
        const beatRetract = beatShape * retractPulseRef.current * 0.14;

        const radialOffset = THREE.MathUtils.clamp(
          (rippleA + rippleB + rippleC) * waveAmp + beatDeform - beatRetract,
          -0.25,
          0.25
        );
        const radial = BASE_RADIUS + radialOffset;

        const swirl = 0.009 + kickEnergy * 0.012;
        primary[ix] = dx * radial + Math.sin(t + i * 0.003) * swirl;
        primary[ix + 1] = dy * radial + Math.cos(t * 1.2 + i * 0.004) * swirl;
        primary[ix + 2] = dz * radial + Math.sin(t * 0.85 + i * 0.005) * swirl;

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
      const haloAmp = 0.04 + kickEnergy * 0.12 + kickPulseRef.current * 0.2;

      for (let i = 0; i < HALO_PARTICLE_COUNT; i += 1) {
        const ix = i * 3;
        const dx = haloDirections[ix];
        const dy = haloDirections[ix + 1];
        const dz = haloDirections[ix + 2];

        const haloRipple = Math.sin(t * 0.95 + i * 0.021) * haloAmp;
        const haloRadius = BASE_RADIUS * 1.13 + haloRipple;

        halo[ix] = dx * haloRadius;
        halo[ix + 1] = dy * haloRadius;
        halo[ix + 2] = dz * haloRadius;
      }

      haloAttr.needsUpdate = true;
    }

    if (primaryMaterialRef.current) {
      const targetSize = 0.018 + kickEnergy * 0.018 + kickPulseRef.current * 0.03;
      const targetOpacity = 0.74 + kickEnergy * 0.22 + clickImpulseRef.current * 0.16 + kickPulseRef.current * 0.12;

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
      const targetSize = 0.0085 + kickEnergy * 0.008 + kickPulseRef.current * 0.005;
      const targetOpacity = 0.3 + kickEnergy * 0.2 + kickPulseRef.current * 0.08;

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
      const targetSize = 0.0046 + kickEnergy * 0.005 + kickPulseRef.current * 0.013;
      const targetOpacity = 0.08 + kickEnergy * 0.07 + hoverStrengthRef.current * 0.02 + kickPulseRef.current * 0.22;

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
      const targetScale = 1.05 + hoverStrengthRef.current * 0.06 + clickImpulseRef.current * 0.08;
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
            size={0.018}
            sizeAttenuation
            transparent
            opacity={0.78}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </points>

        <points ref={pointsSecondaryRef} geometry={secondaryGeometry}>
          <pointsMaterial
            ref={secondaryMaterialRef}
            color="#161616"
            size={0.009}
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
            size={0.0045}
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
