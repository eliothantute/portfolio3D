import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Project, Language } from '../types';

interface AtelierGlobeSectionProps {
  project: Project;
  lang: Language;
  onSelectProject: (project: Project) => void;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const AtelierGlobeSection: React.FC<AtelierGlobeSectionProps> = ({
  project,
  lang,
  onSelectProject,
  onHoverItem,
  onLeaveItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const root = new THREE.Group();
    scene.add(root);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 7),
      new THREE.MeshPhysicalMaterial({
        color: 0x132a69,
        roughness: 0.2,
        metalness: 0.06,
        transmission: 0.65,
        thickness: 1.8,
        ior: 1.28,
        clearcoat: 0.9,
        clearcoatRoughness: 0.22,
        transparent: true,
        opacity: 0.32,
      })
    );
    shell.position.x = 1.4;
    root.add(shell);

    const dotsCount = 14000;
    const dotPositions = new Float32Array(dotsCount * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < dotsCount; i += 1) {
      const y = 1 - (i / (dotsCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * golden;
      const radius = 1.54;

      dotPositions[i * 3] = radius * Math.cos(theta) * r + 1.4;
      dotPositions[i * 3 + 1] = radius * y;
      dotPositions[i * 3 + 2] = radius * Math.sin(theta) * r;
    }

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dots = new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({
        color: 0x8fb6ff,
        size: 0.006,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      })
    );
    root.add(dots);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.008, 24, 280),
      new THREE.MeshBasicMaterial({ color: 0x3d5fb9, transparent: true, opacity: 0.18 })
    );
    ring.position.x = 1.4;
    ring.rotation.x = Math.PI / 2.8;
    root.add(ring);

    scene.add(new THREE.AmbientLight(0x9fb8ff, 0.66));

    const keyLight = new THREE.DirectionalLight(0x9bbcff, 1.35);
    keyLight.position.set(3.4, 3.2, 3.9);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x2d57c3, 1.6, 13);
    rimLight.position.set(-2.2, -1.5, -2.8);
    scene.add(rimLight);

    const warmLight = new THREE.PointLight(0xff6a2a, 0.42, 8);
    warmLight.position.set(-2.8, 0.6, 2.5);
    scene.add(warmLight);

    let dragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotX = 0.09;
    let targetRotY = 0.26;
    let currentRotX = targetRotX;
    let currentRotY = targetRotY;

    const onDown = (e: MouseEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotY += dx * 0.0046;
      targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.0038, -0.55, 0.55);
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onUp = () => {
      dragging = false;
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    const handleResize = () => {
      const w = Math.max(canvas.clientWidth, 1);
      const h = Math.max(canvas.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    handleResize();

    const clock = new THREE.Clock();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!dragging) {
        targetRotY += 0.0011;
      }

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      root.rotation.x = currentRotX + Math.sin(t * 0.65) * 0.038;
      root.rotation.y = currentRotY;
      dots.rotation.y = -t * 0.08;
      ring.rotation.z = t * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.dispose();
      dotsGeo.dispose();
      shell.geometry.dispose();
      ring.geometry.dispose();
      (shell.material as THREE.Material).dispose();
      (dots.material as THREE.Material).dispose();
      (ring.material as THREE.Material).dispose();
    };
  }, []);

  return (
    <section id="globe" className="relative z-10 border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fd_100%)] px-5 py-24 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <article className="relative overflow-hidden rounded-[2rem] border border-[#ff6b2c]/35 bg-[#040b1f] text-white shadow-[0_24px_90px_rgba(8,15,38,0.45)] sm:rounded-[2.3rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_46%,rgba(43,90,220,0.35)_0%,rgba(15,31,84,0.18)_34%,rgba(4,11,31,0)_68%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,24,0.95)_0%,rgba(3,8,24,0.88)_28%,rgba(3,8,24,0.56)_48%,rgba(3,8,24,0.2)_66%,rgba(3,8,24,0)_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(rgba(137,167,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(137,167,255,0.12) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

          <canvas
            ref={canvasRef}
            onMouseEnter={() => onHoverItem?.('GLOBE')}
            onMouseLeave={onLeaveItem}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
          />

          <div className="relative z-10 flex min-h-[640px] flex-col px-6 pb-9 pt-8 sm:px-10 sm:pb-10 sm:pt-9 lg:px-12 lg:pb-12">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-[260px] items-center gap-4 rounded-full border border-[#ff6b2c]/45 bg-[#0f1322]/55 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.34em] text-[#ff6b2c] backdrop-blur-md sm:min-w-[360px]">
                <span>Projet en cours</span>
                <span className="h-px flex-1 bg-[#ff6b2c]/40" />
                <span className="text-white/55">47%</span>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/70">
                2026
                <span className="mx-3 text-white/30">|</span>
                3D / WebGL
              </div>
            </div>

            <div className="max-w-4xl space-y-6">
              <h2 className="font-display text-[3rem] font-black uppercase leading-[0.9] tracking-[-0.03em] text-white sm:text-[5.1rem] lg:text-[6.1rem]">
                Atelier Berger Globe 3D
              </h2>

              <p className="max-w-3xl text-lg leading-relaxed text-white/76 sm:text-[2rem] sm:leading-relaxed">
                Globe Map interactif pour l'agence Atelier Berger à travers le monde. De Paris à Dubaï, de Londres à Tokyo, leurs projets d'architecture intérieure, de joaillerie et d'hôtellerie de prestige.
              </p>
            </div>

            <div className="mt-auto border-t border-white/14 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap gap-3">
                  {project.stack.slice(0, 3).map((item, index) => (
                    <span
                      key={`${project.id}-stack-${index}`}
                      className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.26em] ${
                        index === 0
                          ? 'border-[#ff6b2c]/60 text-[#ff6b2c]'
                          : 'border-white/28 text-white/78'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onSelectProject(project)}
                  onMouseEnter={() => onHoverItem?.('PROJET')}
                  onMouseLeave={onLeaveItem}
                  className="lux-interactive inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/5 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-white hover:border-[#ff6b2c] hover:text-[#ff6b2c]"
                >
                  Voir le projet
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
