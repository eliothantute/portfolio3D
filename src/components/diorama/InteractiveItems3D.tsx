import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DraggableRoomItem } from './DraggableRoomItem';

interface InteractiveItems3DProps {
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Procedural texture for Manga cover
function createMangaCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 384);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.5, '#fb923c');
  grad.addColorStop(1, '#818cf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 384);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(128, 192);
    const angle = (i / 20) * Math.PI * 2;
    ctx.lineTo(128 + Math.cos(angle) * 200, 192 + Math.sin(angle) * 200);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('少年 ELIOT', 40, 60);

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 36px sans-serif';
  ctx.fillText('VOL. 01', 50, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('REACT // THREE.JS', 35, 340);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural texture for Japanese drink can
function createDrinkCanTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 40, 256, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('ラムネ', 60, 110);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('RAMUNE SODA', 50, 145);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const InteractiveItems3D: React.FC<InteractiveItems3DProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const mangaTexture = useMemo(() => createMangaCoverTexture(), []);
  const drinkTexture = useMemo(() => createDrinkCanTexture(), []);

  return (
    <group>
      {/* 1. Retro 16-Bit Sega Style Gamepad */}
      <DraggableRoomItem
        initialPosition={[0.78, 0.05, 0.40]}
        rotation={[0, 0.35, 0]}
        groundY={0.05}
        liftHeight={0.18}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        label="Manette 16-Bit"
        icon="🎮"
      >
        <group>
          {/* Easy-grab generous invisible hitbox */}
          <mesh visible={false}>
            <boxGeometry args={[0.26, 0.08, 0.18]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Main Curved Controller Body */}
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.22, 0.03, 0.12]} />
            <meshStandardMaterial color="#1c1917" roughness={0.35} metalness={0.2} />
          </mesh>
          {/* Rounded wings */}
          <mesh position={[-0.09, 0.012, 0.02]}>
            <cylinderGeometry args={[0.055, 0.055, 0.028, 16]} />
            <meshStandardMaterial color="#1c1917" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0.09, 0.012, 0.02]}>
            <cylinderGeometry args={[0.055, 0.055, 0.028, 16]} />
            <meshStandardMaterial color="#1c1917" roughness={0.35} metalness={0.2} />
          </mesh>

          {/* D-Pad (Cross) */}
          <group position={[-0.065, 0.032, 0.01]}>
            <mesh>
              <boxGeometry args={[0.035, 0.01, 0.012]} />
              <meshStandardMaterial color="#44403c" roughness={0.5} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.012, 0.01, 0.035]} />
              <meshStandardMaterial color="#44403c" roughness={0.5} />
            </mesh>
          </group>

          {/* Action Buttons A, B, C */}
          <mesh position={[0.045, 0.032, 0.02]}>
            <cylinderGeometry args={[0.009, 0.009, 0.01, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
          <mesh position={[0.07, 0.032, 0.005]}>
            <cylinderGeometry args={[0.009, 0.009, 0.01, 12]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.3} />
          </mesh>
          <mesh position={[0.095, 0.032, -0.01]}>
            <cylinderGeometry args={[0.009, 0.009, 0.01, 12]} />
            <meshStandardMaterial color="#eab308" roughness={0.3} />
          </mesh>

          {/* Start Button */}
          <mesh position={[0, 0.032, 0.015]}>
            <boxGeometry args={[0.02, 0.006, 0.008]} />
            <meshStandardMaterial color="#78716c" roughness={0.5} />
          </mesh>
        </group>
      </DraggableRoomItem>

      {/* 2. Manga Tome Volume 01 (on the left side near the table) */}
      <DraggableRoomItem
        initialPosition={[-0.45, 0.05, 0.40]}
        rotation={[0, -0.28, 0]}
        groundY={0.05}
        liftHeight={0.18}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        label="Manga Shonen"
        icon="📖"
      >
        <group>
          {/* Easy-grab generous invisible hitbox */}
          <mesh visible={false}>
            <boxGeometry args={[0.22, 0.08, 0.30]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Manga Book Block (Paper Pages) */}
          <mesh position={[0, 0.018, 0]}>
            <boxGeometry args={[0.18, 0.032, 0.26]} />
            <meshStandardMaterial color="#fcfbf7" roughness={0.9} />
          </mesh>
          {/* Cover Art Layer */}
          <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
            <planeGeometry args={[0.26, 0.18]} />
            <meshStandardMaterial map={mangaTexture} roughness={0.4} />
          </mesh>
          {/* Spine Band */}
          <mesh position={[-0.092, 0.018, 0]}>
            <boxGeometry args={[0.005, 0.033, 0.262]} />
            <meshStandardMaterial color="#be123c" roughness={0.5} />
          </mesh>
        </group>
      </DraggableRoomItem>

      {/* 3. Japanese Ramune Soda Can (on the floor near the books) */}
      <DraggableRoomItem
        initialPosition={[0.82, 0.05, 0.85]}
        rotation={[0, 0.5, 0]}
        groundY={0.05}
        liftHeight={0.16}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        label="Ramune Soda"
        icon="🥤"
      >
        <group>
          {/* Easy-grab generous invisible hitbox */}
          <mesh visible={false}>
            <cylinderGeometry args={[0.08, 0.08, 0.22, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Can Cylinder Body */}
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.13, 24]} />
            <meshStandardMaterial map={drinkTexture} roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Silver Rim & Top Cap */}
          <mesh position={[0, 0.132, 0]}>
            <cylinderGeometry args={[0.033, 0.036, 0.006, 24]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Pull Ring Tab */}
          <mesh position={[0, 0.136, 0.008]}>
            <boxGeometry args={[0.014, 0.002, 0.022]} />
            <meshStandardMaterial color="#e4e4e7" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      </DraggableRoomItem>
    </group>
  );
};
