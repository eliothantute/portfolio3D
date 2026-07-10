import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { AudioSphere } from './AudioSphere';

interface Background3DProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

export const Background3D: React.FC<Background3DProps> = ({ analyserRef }) => {
  return (
    <div className="pointer-events-auto absolute inset-0 z-[1] h-screen w-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 5, 3]} intensity={1.25} color="#ffd9cc" />
        <pointLight position={[-5, -2, -4]} intensity={1.1} color="#9be7ff" />

        <AudioSphere analyserRef={analyserRef} />

        <Environment resolution={256}>
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


