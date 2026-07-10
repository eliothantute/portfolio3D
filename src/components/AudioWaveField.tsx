import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AudioWaveFieldProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

export const AudioWaveField: React.FC<AudioWaveFieldProps> = ({ analyserRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const energyRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(17, 12, 120, 90);
    const pos = geo.attributes.position.array as Float32Array;
    positionsRef.current = pos;
    basePositionsRef.current = new Float32Array(pos);
    return geo;
  }, []);

  useFrame((state, delta) => {
    const analyser = analyserRef.current;
    let bass = 0;
    let mids = 0;

    if (analyser) {
      if (!frequencyDataRef.current || frequencyDataRef.current.length !== analyser.frequencyBinCount) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      analyser.getByteFrequencyData(frequencyDataRef.current);

      const bassBins = Math.max(10, Math.floor(frequencyDataRef.current.length * 0.14));
      const midStart = bassBins;
      const midEnd = Math.max(midStart + 1, Math.floor(frequencyDataRef.current.length * 0.35));

      let bassSum = 0;
      for (let i = 0; i < bassBins; i += 1) bassSum += frequencyDataRef.current[i];

      let midSum = 0;
      for (let i = midStart; i < midEnd; i += 1) midSum += frequencyDataRef.current[i];

      bass = bassSum / (bassBins * 255);
      mids = midSum / ((midEnd - midStart) * 255);
    }

    const targetEnergy = bass * 1.8 + mids * 0.7;
    energyRef.current = THREE.MathUtils.lerp(energyRef.current, targetEnergy, 1 - Math.exp(-delta * 8));

    const positions = positionsRef.current;
    const base = basePositionsRef.current;
    if (!positions || !base || !meshRef.current) return;

    const time = state.clock.elapsedTime;
    const amp = 0.18 + energyRef.current * 1.65;

    for (let i = 0; i < positions.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];

      const waveA = Math.sin(x * 0.52 + time * 2.7) * 0.42;
      const waveB = Math.cos(y * 0.58 - time * 2.1) * 0.35;
      const waveC = Math.sin((x + y) * 0.32 - time * 3.5) * 0.25;

      positions[i + 2] = (waveA + waveB + waveC) * amp;
    }

    const positionAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    positionAttr.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, -2.2, -3.4]}
      rotation={[-1.08, 0, 0]}
    >
      <meshBasicMaterial
        color="#6d8dff"
        wireframe
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};
