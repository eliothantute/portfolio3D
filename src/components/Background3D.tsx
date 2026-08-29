import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AudioSphere } from './AudioSphere';

interface Background3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isIntroActive?: boolean;
}

// 3D Space Particle Tunnel & Depth Constellation
const SpaceWorldParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollY = useRef(0);

  // Generate 2500 depth particles scattered in a 3D tunnel volume
  const [positions, colors] = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;

      pos[i3] = Math.cos(theta) * radius;
      pos[i3 + 1] = Math.sin(theta) * radius;
      pos[i3 + 2] = (Math.random() - 0.5) * 60;

      const isAccent = Math.random() > 0.85;
      if (isAccent) {
        col[i3] = 0.0;     // R (electric blue accent)
        col[i3 + 1] = 0.4; // G
        col[i3 + 2] = 1.0; // B
      } else {
        const val = 0.5 + Math.random() * 0.4;
        col[i3] = val;
        col[i3 + 1] = val;
        col[i3 + 2] = val;
      }
    }

    return [pos, col];
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useFrame((state, delta) => {
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    const scrollTargetZ = scrollY.current * 0.015;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 6 - (scrollTargetZ % 30), 0.08);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.current.x * 0.8, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -mouse.current.y * 0.8, 0.05);
    state.camera.lookAt(0, 0, state.camera.position.z - 10);

    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * 0.02;
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x += delta * 0.08;
      ringRef1.current.rotation.y += delta * 0.12;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.x -= delta * 0.06;
      ringRef2.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group>
      {/* 3D Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>

      {/* Dimensional Portal Rings */}
      <mesh ref={ringRef1} position={[0, 0, -8]}>
        <torusGeometry args={[5.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#09090b" transparent opacity={0.16} />
      </mesh>

      <mesh ref={ringRef2} position={[0, 0, -16]}>
        <torusGeometry args={[9, 0.015, 16, 100]} />
        <meshBasicMaterial color="#27272a" transparent opacity={0.12} />
      </mesh>
    </group>
  );
};

export const Background3D: React.FC<Background3DProps> = ({ analyserRef }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <SpaceWorldParticles />
        {/* Prominent, highly visible black 3D organic sphere */}
        <group position={[0, 0.1, -2.4]} scale={1.42}>
          <AudioSphere analyserRef={analyserRef} quality="high" />
        </group>
      </Canvas>
    </div>
  );
};
