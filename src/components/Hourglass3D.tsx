import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

const CYCLE_SECONDS = 5;
const GRAIN_COUNT = 8;

const SandBulb: React.FC<{ progress: number; flipped?: boolean }> = ({ progress, flipped = false }) => {
  // progress: 1 = full pile, 0 = empty. The cone scales from the wide base.
  const h = Math.max(progress, 0.001) * 0.42;
  return (
    <mesh position={[0, flipped ? -0.46 + h / 2 : 0.46 - h / 2, 0]} rotation={[flipped ? 0 : Math.PI, 0, 0]} scale={[1, h / 0.42, 1]}>
      <coneGeometry args={[0.32, 0.42, 16, 1, true]} />
      <meshStandardMaterial color="#fafafa" roughness={0.85} />
    </mesh>
  );
};

// A short, near-continuous streak through the neck (on top of the discrete
// grains below) so the flow itself reads clearly at icon size.
const Stream: React.FC<{ active: boolean }> = ({ active }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = active;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.46, 6]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

const Grain: React.FC<{ offset: number; active: boolean }> = ({ offset, active }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime + offset) % CYCLE_SECONDS) / CYCLE_SECONDS;
    const fallT = (t * 11) % 1;
    ref.current.position.y = 0.23 - fallT * 0.46;
    ref.current.position.x = Math.sin(fallT * 20 + offset * 7) * 0.012;
    ref.current.visible = active;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.028, 6, 6]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

const HourglassScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = React.useState(1);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % CYCLE_SECONDS) / CYCLE_SECONDS;
    setProgress(1 - t);
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.35;
    }
  });

  const grains = useMemo(() => Array.from({ length: GRAIN_COUNT }, (_, i) => (i / GRAIN_COUNT) * CYCLE_SECONDS), []);
  const flowing = progress > 0.03 && progress < 0.98;

  return (
    <group ref={groupRef}>
      {/* Montants */}
      {[
        [0.28, 0.28],
        [-0.28, 0.28],
        [0.28, -0.28],
        [-0.28, -0.28],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <cylinderGeometry args={[0.018, 0.018, 0.96, 6]} />
          <meshStandardMaterial color="#000000" roughness={0.6} />
        </mesh>
      ))}

      {/* Capuchons */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 20]} />
        <meshStandardMaterial color="#000000" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 20]} />
        <meshStandardMaterial color="#000000" roughness={0.5} />
      </mesh>

      {/* Verre (deux cônes pointe à pointe) */}
      <mesh position={[0, 0.235, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.43, 20, 1, true]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} roughness={0.1} side={THREE.DoubleSide} />
        <Edges scale={1} threshold={1} color="#000000" />
      </mesh>
      <mesh position={[0, -0.235, 0]}>
        <coneGeometry args={[0.3, 0.43, 20, 1, true]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} roughness={0.1} side={THREE.DoubleSide} />
        <Edges scale={1} threshold={1} color="#000000" />
      </mesh>

      <SandBulb progress={progress} />
      <SandBulb progress={1 - progress} flipped />

      <Stream active={flowing} />
      {grains.map((offset, i) => (
        <Grain key={i} offset={offset} active={flowing} />
      ))}
    </group>
  );
};

interface Hourglass3DProps {
  className?: string;
}

export const Hourglass3D: React.FC<Hourglass3DProps> = ({ className = '' }) => {
  return (
    <div className={`h-8 w-8 shrink-0 ${className}`}>
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0.9, 0.2, 1.4], fov: 32 }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[2, 2, 2]} intensity={1.2} />
        <HourglassScene />
      </Canvas>
    </div>
  );
};
