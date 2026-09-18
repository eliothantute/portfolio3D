import React, { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { dioramaAudio } from './DioramaSoundEngine';

interface WindowBlinds3DProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Helper to calculate the 3D window curve point
function getWindowPoint(u: number): { x: number; z: number; nx: number; nz: number } {
  if (u <= 0.26) {
    const t = u / 0.26;
    const x = -1.72 + t * (-1.22 - -1.72);
    const z = 0.02 + t * (-1.26 - 0.02);
    const dx = -1.22 - -1.72;
    const dz = -1.26 - 0.02;
    const len = Math.hypot(-dz, dx);
    return { x, z, nx: -dz / len, nz: dx / len };
  } else if (u <= 0.74) {
    const t = (u - 0.26) / 0.48;
    const x = -1.22 + t * 2.44;
    const arc = 4.0 * t * (1.0 - t) * 0.05;
    const z = -1.26 - arc;
    return { x, z, nx: 0, nz: 1 };
  } else {
    const t = (u - 0.74) / 0.26;
    const x = 1.22 + t * (1.72 - 1.22);
    const z = -1.26 + t * (0.02 - -1.26);
    const dx = 1.72 - 1.22;
    const dz = 0.02 - -1.26;
    const len = Math.hypot(dz, -dx);
    return { x, z, nx: -dz / len, nz: dx / len };
  }
}

// Procedural horizontal blind slat texture with subtle ambient occlusion gaps
function createBlindSlatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e8e2d8';
  ctx.fillRect(0, 0, 64, 512);

  const slatHeight = 16;
  for (let y = 0; y < 512; y += slatHeight) {
    // Slat body highlight & shadow
    const grad = ctx.createLinearGradient(0, y, 0, y + slatHeight);
    grad.addColorStop(0, '#fbf8f2');
    grad.addColorStop(0.7, '#dfd7c9');
    grad.addColorStop(1, '#9b8f7e'); // Slit gap shadow
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 64, slatHeight - 1.5);

    // Darker gap
    ctx.fillStyle = '#483f34';
    ctx.fillRect(0, y + slatHeight - 1.5, 64, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 14);
  return texture;
}

export const WindowBlinds3D: React.FC<WindowBlinds3DProps> = ({ isOpen, onToggle }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cordRef = useRef<THREE.Group>(null);
  const currentProgress = useRef<number>(isOpen ? 0.0 : 1.0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const slatTexture = useMemo(() => createBlindSlatTexture(), []);

  // Base parametric geometry covering the 3 bay window panels
  const { geometry, positionAttr } = useMemo(() => {
    const segmentsX = 48;
    const segmentsY = 32;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const yMax = 2.65;
    const yMin = 0.12;

    for (let iy = 0; iy <= segmentsY; iy++) {
      const v = iy / segmentsY;
      const y = yMax - v * (yMax - yMin);
      for (let ix = 0; ix <= segmentsX; ix++) {
        const u = ix / segmentsX;
        const pt = getWindowPoint(u);
        // Position slightly in front of the window glass towards room
        positions.push(pt.x + pt.nx * 0.02, y, pt.z + pt.nz * 0.02);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < segmentsY; iy++) {
      for (let ix = 0; ix < segmentsX; ix++) {
        const a = iy * (segmentsX + 1) + ix;
        const b = a + 1;
        const c = a + (segmentsX + 1);
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    const posAttribute = new THREE.Float32BufferAttribute(positions, 3);
    geom.setAttribute('position', posAttribute);
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return { geometry: geom, positionAttr: posAttribute };
  }, []);

  // Animate blinds roll down / up using spring interpolation
  useFrame((_, delta) => {
    const target = isOpen ? 0.0 : 1.0;
    // Spring ease
    currentProgress.current = THREE.MathUtils.lerp(
      currentProgress.current,
      target,
      Math.min(1, delta * 6.5)
    );

    if (meshRef.current) {
      const pos = positionAttr.array as Float32Array;
      const segmentsX = 48;
      const segmentsY = 32;
      const yMax = 2.65;
      const yClosedMin = 0.12;
      // When closed, blind extends to yClosedMin. When open, compressed into top 18cm
      const activeBottomY = yMax - currentProgress.current * (yMax - yClosedMin);

      for (let iy = 0; iy <= segmentsY; iy++) {
        const v = iy / segmentsY;
        const currentY = yMax - v * (yMax - activeBottomY);
        for (let ix = 0; ix <= segmentsX; ix++) {
          const index = (iy * (segmentsX + 1) + ix) * 3;
          pos[index + 1] = currentY;
        }
      }
      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    // Subtle cord dangling animation
    if (cordRef.current) {
      const t = performance.now() * 0.002;
      cordRef.current.rotation.z = Math.sin(t * 1.5) * 0.02 + (isHovered ? 0.06 : 0);
      cordRef.current.position.y = 2.2 - currentProgress.current * 0.15;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    dioramaAudio.playBlinds(!isOpen);
    onToggle();
  };

  return (
    <group>
      {/* Top Header Blind Casing (Pelmet) following bay window curve */}
      <mesh position={[0, 2.68, -1.26]}>
        <boxGeometry args={[2.55, 0.08, 0.08]} />
        <meshStandardMaterial color="#40362f" roughness={0.7} />
      </mesh>

      {/* Main Animated Venetian Blind Mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
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
        <meshStandardMaterial
          map={slatTexture}
          roughness={0.65}
          metalness={0.05}
          side={THREE.DoubleSide}
          color={isHovered ? '#fffbf5' : '#ede5d8'}
          shadowSide={THREE.DoubleSide}
        />
      </mesh>

      {/* Interactive Blind Pull Cord with Wooden Tassel */}
      <group
        ref={cordRef}
        position={[1.28, 2.2, -1.23]}
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
        {/* Cord line */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.8, 8]} />
          <meshBasicMaterial color="#f5eedc" />
        </mesh>
        {/* Wooden handle tassel */}
        <mesh position={[0, -0.82, 0]}>
          <coneGeometry args={[0.018, 0.06, 12]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
