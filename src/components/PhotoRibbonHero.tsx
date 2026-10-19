import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

import atelierBergerImg from '../assets/images/image_069-1-1.jpg';
import aumParisImg from '../assets/aum-paris.jpg';
import disfocusImg from '../assets/disfocus.jpg';
import chouquetteImg from '../assets/chouquette.jpg';
import oneshotImg from '../assets/images/oneshot-project.png';

const IMAGES = [atelierBergerImg, aumParisImg, disfocusImg, chouquetteImg, oneshotImg];

const SEGMENT_COUNT = 46;
const TWISTS = 5.25;

// A stadium/pill-shaped plane — reads as a cross-section of a twisted tube,
// closer to Mondragon's ribbon than a plain rectangle.
function createPillShape(width: number, height: number): THREE.Shape {
  const r = height / 2;
  const w = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -r);
  shape.lineTo(w - r, -r);
  shape.absarc(w - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-w + r, r);
  shape.absarc(-w + r, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  shape.closePath();
  return shape;
}

const CURVE_POINTS = [
  new THREE.Vector3(-8.6, 4.2, -1.4),
  new THREE.Vector3(-5.6, 3.1, -0.2),
  new THREE.Vector3(-2.6, 1.7, 0.9),
  new THREE.Vector3(0.2, 0.3, 1.1),
  new THREE.Vector3(3, -0.9, 0.3),
  new THREE.Vector3(5.6, -2, -0.8),
  new THREE.Vector3(7.8, -2.9, -1.8),
];

interface TileProps {
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  texture: THREE.Texture;
}

const RibbonTile: React.FC<TileProps> = ({ geometry, position, quaternion, texture }) => (
  <mesh geometry={geometry} position={position} quaternion={quaternion}>
    <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.2} metalness={0.85} envMapIntensity={1.4} />
  </mesh>
);

const RibbonGroup: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const textures = useTexture(IMAGES);

  const geometry = useMemo(() => new THREE.ShapeGeometry(createPillShape(2.5, 1.35), 20), []);

  const tiles = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(CURVE_POINTS);
    const axisZ = new THREE.Vector3(0, 0, 1);

    return Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      const t = i / (SEGMENT_COUNT - 1);
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const qAlign = new THREE.Quaternion().setFromUnitVectors(axisZ, tangent);
      const qTwist = new THREE.Quaternion().setFromAxisAngle(tangent, t * Math.PI * 2 * TWISTS);
      const quaternion = qTwist.multiply(qAlign);
      return { point, quaternion, texture: textures[i % textures.length] };
    });
  }, [textures]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.025;
    const pointer = state.pointer;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.12, 0.04);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.16, 0.04);
  });

  return (
    <group ref={groupRef} scale={0.62} position={[0.6, -0.3, 0]}>
      {tiles.map((tile, i) => (
        <RibbonTile key={i} geometry={geometry} position={tile.point} quaternion={tile.quaternion} texture={tile.texture} />
      ))}
    </group>
  );
};

// Keeps the ribbon fully in frame whatever the container's aspect ratio —
// without this, a narrow (mobile) container clips most of the ribbon out of
// the horizontal field of view since a perspective camera's horizontal FOV
// shrinks with the aspect ratio.
const CameraRig: React.FC<{ targetHalfWidth?: number }> = ({ targetHalfWidth = 5.4 }) => {
  const { camera, size } = useThree();

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    const vFovRad = THREE.MathUtils.degToRad(persp.fov);
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
    const z = targetHalfWidth / Math.tan(hFovRad / 2);
    persp.position.z = THREE.MathUtils.clamp(z, 7, 24);
    persp.updateProjectionMatrix();
  }, [camera, size, targetHalfWidth]);

  return null;
};

interface PhotoRibbonHeroProps {
  className?: string;
}

export const PhotoRibbonHero: React.FC<PhotoRibbonHeroProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 h-full w-full ${className}`}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 9], fov: 32 }}
        dpr={[1, 1.75]}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 6]} intensity={1.4} />
        <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#ffd9a0" />
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.8} />
          <CameraRig />
          <RibbonGroup />
        </Suspense>
      </Canvas>
    </div>
  );
};
