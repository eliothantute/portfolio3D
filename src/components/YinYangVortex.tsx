import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';

interface YinYangVortexProps {
  interactive?: boolean;
}

const COUNT = 20000;
const RADIUS = 68;
const TWIST = 5;
const FLOW = 1.3;
const HEIGHT = 38;

const ParticleSwarm: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const speedMult = 1;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  // Pre-allocated random starting positions
  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        )
      );
    }
    return pos;
  }, []);

  // Precomputed invariant mathematical lookups (eliminates 40,000 divisions & square roots per frame)
  const mathData = useMemo(() => {
    const side = new Int8Array(COUNT);
    const blend = new Float32Array(COUNT);
    const angBase = new Float32Array(COUNT);
    const r = new Float32Array(COUNT);
    const sqrtU = new Float32Array(COUNT);
    const heightFactor = new Float32Array(COUNT);

    const half = COUNT * 0.5;
    const g = 2.399963229728653; // Golden angle ratio

    for (let i = 0; i < COUNT; i++) {
      const s = i < half ? -1 : 1;
      const local = s < 0 ? i : i - half;
      const u = (local + 0.5) / half;
      const sq = Math.sqrt(u);

      side[i] = s;
      blend[i] = 1.0 - u;
      angBase[i] = g * local;
      r[i] = RADIUS * sq;
      sqrtU[i] = sq;
      heightFactor[i] = HEIGHT * (0.5 - u);
    }

    return { side, blend, angBase, r, sqrtU, heightFactor };
  }, []);

  // Crystalline tetrahedron geometry: crisp black ink-sculpted particles on white backdrop
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.28), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.90,
      }),
    []
  );

  // Initialize particle colors in rich sculpted deep blacks and charcoal tones
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const color = new THREE.Color();
    const half = COUNT * 0.5;

    for (let i = 0; i < COUNT; i++) {
      const s = i < half ? -1 : 1;
      const local = s < 0 ? i : i - half;
      const u = (local + 0.5) / half;

      if (s < 0) {
        // Pure deep obsidian black arm with subtle contrast
        const lightness = 0.02 + 0.09 * u;
        color.setHSL(0.0, 0.0, lightness);
      } else {
        // Deep carbon/graphite arm with hint of dark slate
        const lightness = 0.04 + 0.12 * (1.0 - u);
        color.setHSL(0.62, 0.15, lightness);
      }
      mesh.setColorAt(i, color);
    }

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const time = state.clock.getElapsedTime() * speedMult;
    const timeFlow = time * FLOW;

    const { side, blend, angBase, r, sqrtU, heightFactor } = mathData;

    // Ultra-optimized 60-120 FPS kernel loop
    for (let i = 0; i < COUNT; i++) {
      const s = side[i];
      const spiral = angBase[i] + s * (timeFlow + TWIST * sqrtU[i]);

      const x = r[i] * Math.cos(spiral);
      const z = r[i] * Math.sin(spiral);
      const y = heightFactor[i] * Math.sin(spiral * 0.5 + time);

      const b = blend[i];
      target.set(s * x * b, y, z * b);

      positions[i].lerp(target, 0.1);
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />;
};

// Responsive positioning: offsets the vortex smoothly to the right half on desktop
const ResponsiveVortexScene: React.FC<{ interactive: boolean }> = ({ interactive }) => {
  const { viewport } = useThree();
  const controlsRef = useRef<OrbitControlsType>(null);

  const isMobile = viewport.width < 75;
  const targetX = isMobile ? 0 : Math.min(viewport.width * 0.22, 26);
  const targetY = isMobile ? -10 : 0;
  const scale = isMobile ? 0.72 : 0.98;

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(targetX, targetY, 0);
      controlsRef.current.update();
    }
  }, [targetX, targetY]);

  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 0.007]} />

      <group position={[targetX, targetY, 0]} scale={scale}>
        <ParticleSwarm />
      </group>

      {interactive && (
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={35}
          maxDistance={145}
          autoRotate={true}
          autoRotateSpeed={0.5}
          rotateSpeed={0.7}
          enableDamping={true}
          dampingFactor={0.06}
        />
      )}
    </>
  );
};

export const YinYangVortex: React.FC<YinYangVortexProps> = ({ interactive = true }) => {
  return (
    <div className="absolute inset-0 w-full h-full select-none bg-white overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 70], fov: 60 }}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <ResponsiveVortexScene interactive={interactive} />
      </Canvas>
    </div>
  );
};
