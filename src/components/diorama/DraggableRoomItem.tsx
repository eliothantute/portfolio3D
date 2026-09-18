import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { dioramaAudio } from './DioramaSoundEngine';

interface DraggableRoomItemProps {
  initialPosition: [number, number, number];
  rotation?: [number, number, number];
  groundY?: number;
  liftHeight?: number;
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children: React.ReactNode;
  label?: string;
  icon?: string;
}

export const DraggableRoomItem: React.FC<DraggableRoomItemProps> = ({
  initialPosition,
  rotation = [0, 0, 0],
  groundY = 0.05,
  liftHeight = 0.16,
  bounds = { minX: -1.4, maxX: 1.4, minZ: -1.1, maxZ: 2.1 },
  onDragStart,
  onDragEnd,
  children,
  label = 'Objet 3D',
  icon = '✨',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Position state (persisted across drags so objects stay where dropped)
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const velocityY = useRef<number>(0);
  const dragOffset = useRef<THREE.Vector3>(new THREE.Vector3());

  // Horizontal plane for raycasting
  const dragPlane = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), -initialPosition[1]));
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Global pointer move and pointer up when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersection = new THREE.Vector3();

      if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection)) {
        // Clamp to diorama room floor boundaries
        const clampedX = THREE.MathUtils.clamp(
          intersection.x - dragOffset.current.x,
          bounds.minX,
          bounds.maxX
        );
        const clampedZ = THREE.MathUtils.clamp(
          intersection.z - dragOffset.current.z,
          bounds.minZ,
          bounds.maxZ
        );
        targetPos.current.x = clampedX;
        targetPos.current.z = clampedZ;
        targetPos.current.y = groundY + liftHeight;
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      targetPos.current.y = groundY;
      velocityY.current = -0.04;
      dioramaAudio.playDrop();
      onDragEnd?.();
      document.body.style.cursor = 'default';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, camera, gl, groundY, liftHeight, bounds, onDragEnd]);

  // Frame loop: smooth follow, floating levitation on hover, and gravity drop bounce
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Horizontal smooth follow
    currentPos.current.x = THREE.MathUtils.lerp(
      currentPos.current.x,
      targetPos.current.x,
      Math.min(1, delta * 24)
    );
    currentPos.current.z = THREE.MathUtils.lerp(
      currentPos.current.z,
      targetPos.current.z,
      Math.min(1, delta * 24)
    );

    if (isDragging) {
      // Floating high while held
      currentPos.current.y = THREE.MathUtils.lerp(
        currentPos.current.y,
        targetPos.current.y,
        Math.min(1, delta * 18)
      );
      // Playful tilt based on movement speed
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        (targetPos.current.x - currentPos.current.x) * 2.5,
        0.15
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotation[0] + (targetPos.current.z - currentPos.current.z) * 2.5,
        0.15
      );
    } else {
      // Free falling / resting
      if (currentPos.current.y > groundY || Math.abs(velocityY.current) > 0.001) {
        velocityY.current -= 9.8 * delta * 0.45;
        currentPos.current.y += velocityY.current;

        // Bounce upon hitting ground
        if (currentPos.current.y <= groundY) {
          currentPos.current.y = groundY;
          velocityY.current = -velocityY.current * 0.38;
          if (Math.abs(velocityY.current) < 0.008) {
            velocityY.current = 0;
          }
        }
      } else {
        // Subtle levitation bob when hovered
        const hoverLift = isHovered ? 0.035 + Math.sin(t * 5.0) * 0.006 : 0;
        currentPos.current.y = groundY + hoverLift;
      }

      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotation[2], 0.12);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.12);
    }

    groupRef.current.position.copy(currentPos.current);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    dioramaAudio.playPickup();
    onDragStart?.();
    document.body.style.cursor = 'grabbing';

    // Calculate drag offset so object doesn't jump to cursor center
    dragPlane.current.constant = -(groundY + liftHeight);
    const intersection = new THREE.Vector3();
    if (e.ray.intersectPlane(dragPlane.current, intersection)) {
      dragOffset.current.x = intersection.x - currentPos.current.x;
      dragOffset.current.z = intersection.z - currentPos.current.z;
    }
  };

  return (
    <group
      ref={groupRef}
      position={initialPosition}
      rotation={rotation}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        if (!isDragging) {
          document.body.style.cursor = 'grab';
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        if (!isDragging) {
          document.body.style.cursor = 'default';
        }
      }}
    >
      {/* Dynamic Floor Shadow beneath object */}
      <mesh
        position={[0, -currentPos.current.y + groundY + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.13, 16]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={Math.max(0.08, 0.45 - (currentPos.current.y - groundY) * 1.6)}
          depthWrite={false}
        />
      </mesh>

      {/* Item Body with smooth scale transition on hover */}
      <group scale={isHovered || isDragging ? 1.06 : 1.0}>
        {children}
      </group>

      {/* 3D Floating Minimal Label Badge (only visible on hover, zero blocking popup) */}
      {isHovered && !isDragging && (
        <Html
          position={[0, liftHeight + 0.12, 0]}
          center
          distanceFactor={5.5}
          pointerEvents="none"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/85 text-white text-[11px] font-mono border border-white/20 shadow-2xl backdrop-blur-md whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-150">
            <span className="text-xs">{icon}</span>
            <span className="font-semibold text-zinc-100">{label}</span>
            <span className="text-[10px] text-emerald-400 font-medium">• Glisser</span>
          </div>
        </Html>
      )}
    </group>
  );
};
