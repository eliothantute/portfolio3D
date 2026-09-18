import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { dioramaAudio } from './DioramaSoundEngine';

interface InteractiveLightSwitch3DProps {
  isLightOn: boolean;
  onToggle: () => void;
  position?: [number, number, number];
}

export const InteractiveLightSwitch3D: React.FC<InteractiveLightSwitch3DProps> = ({
  isLightOn,
  onToggle,
  position = [1.635, 1.30, 0.45],
}) => {
  const rockerRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Smooth rocker switch tilt animation
  useFrame((_, delta) => {
    if (rockerRef.current) {
      const targetRotZ = isLightOn ? -0.14 : 0.14;
      rockerRef.current.rotation.z = THREE.MathUtils.lerp(
        rockerRef.current.rotation.z,
        targetRotZ,
        Math.min(1, delta * 18)
      );
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const nextState = !isLightOn;
    dioramaAudio.playSwitch(nextState);
    onToggle();
  };

  return (
    <group
      position={position}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Wall Mounting Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.075, 0.12, 0.012]} />
        <meshStandardMaterial
          color={isHovered ? '#ffffff' : '#f0ede6'}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Recessed Switch Bezel */}
      <mesh position={[0, 0, 0.007]}>
        <boxGeometry args={[0.042, 0.075, 0.006]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>

      {/* Rocker Switch Button (Pivots up/down) */}
      <mesh ref={rockerRef} position={[0, 0, 0.011]}>
        <boxGeometry args={[0.038, 0.068, 0.01]} />
        <meshStandardMaterial
          color={isHovered ? '#f5f5f5' : '#e5e2da'}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Glowing Neon Status Indicator Dot */}
      <mesh position={[0, 0.022, 0.017]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.003, 12]} />
        <meshBasicMaterial
          color={isLightOn ? '#10b981' : '#f59e0b'}
          toneMapped={false}
        />
      </mesh>

      {/* Subtle indicator pointlight */}
      <pointLight
        position={[0, 0.022, 0.03]}
        color={isLightOn ? '#10b981' : '#f59e0b'}
        intensity={0.25}
        distance={0.3}
      />

      {/* 3D Floating Minimal Label Badge on Hover */}
      {isHovered && (
        <Html position={[0, 0.11, 0.04]} center distanceFactor={5.5} pointerEvents="none">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-white/20 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Interrupteur</span>
            <span className="text-[10px] text-zinc-400">• {isLightOn ? 'Éteindre' : 'Allumer'}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
