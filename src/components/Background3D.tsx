import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { AudioSphere } from './AudioSphere';

interface Background3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isIntroActive: boolean;
}

const SpaceArrival: React.FC = () => {
  const { camera } = useThree();
  const { scene } = useGLTF('/landing-space/scene.gltf');
  const arrivalGroup = useRef<THREE.Group>(null);

  useEffect(() => {
    camera.position.set(0, 0.7, 5.8);
    camera.fov = 42;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    scene.traverse((child) => {
      if ('material' in child && child.material) {
        const material = child.material as THREE.Material;
        material.transparent = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (arrivalGroup.current) {
      arrivalGroup.current.rotation.y += delta * 0.08;
      arrivalGroup.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.035;
    }
  });

  return (
    <group ref={arrivalGroup}>
      <primitive object={scene} scale={1.65} />
    </group>
  );
};

useGLTF.preload('/landing-space/scene.gltf');

export const Background3D: React.FC<Background3DProps> = ({ analyserRef, isIntroActive }) => {
  return (
    <div
      className={`pointer-events-auto fixed inset-0 h-screen w-screen overflow-hidden transition-[z-index] duration-0 ${
        isIntroActive ? 'z-[30] bg-[#05070c]' : 'z-[1]'
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 5, 3]} intensity={1.25} color="#ffd9cc" />
        <pointLight position={[-5, -2, -4]} intensity={1.1} color="#9be7ff" />

        {isIntroActive && <SpaceArrival />}
        {!isIntroActive && <AudioSphere analyserRef={analyserRef} quality="high" />}
        {isIntroActive && (
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={3.8}
            maxDistance={9}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
            dampingFactor={0.06}
            enableDamping
          />
        )}

        <Environment resolution={192}>
          <Lightformer
            form="ring"
            color="#9ab6ff"
            intensity={0.9}
            scale={3.2}
            position={[0, 2.6, -4.2]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            color="#6e8cff"
            intensity={0.55}
            scale={[8, 1.2]}
            position={[-4.5, 0.9, -2.4]}
            rotation={[0, Math.PI / 2.8, 0]}
          />
          <Lightformer
            form="rect"
            color="#ff6f3d"
            intensity={0.3}
            scale={[7, 1]}
            position={[4.8, -0.6, -2.2]}
            rotation={[0, -Math.PI / 2.8, 0]}
          />
        </Environment>
      </Canvas>
    </div>
  );
};


