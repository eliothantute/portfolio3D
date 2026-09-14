import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Upload,
  RotateCw,
  Sun,
  Maximize2,
  Minimize2,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  Box,
  Sliders,
  Check,
  Download,
} from 'lucide-react';

export interface Interactive3DViewerProps {
  initialModelUrl?: string;
  initialImageUrl?: string;
  backgroundColor?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  shadowIntensity?: number;
  exposure?: number;
  environmentImage?: 'neutral' | 'legacy';
  className?: string;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const Interactive3DViewer: React.FC<Interactive3DViewerProps> = ({
  initialModelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  initialImageUrl,
  backgroundColor = 'transparent',
  autoRotate: initialAutoRotate = true,
  cameraControls = true,
  shadowIntensity: initialShadowIntensity = 1,
  exposure: initialExposure = 1,
  environmentImage = 'neutral',
  className = '',
  onHoverItem,
  onLeaveItem,
}) => {
  // Current active file state
  const [fileUrl, setFileUrl] = useState<string>(initialImageUrl || initialModelUrl);
  const [fileType, setFileType] = useState<'model' | 'image'>(initialImageUrl ? 'image' : 'model');
  const [fileName, setFileName] = useState<string>(
    initialImageUrl ? 'image-cv-3d.png' : 'Astronaut.glb'
  );
  const [fileSize, setFileSize] = useState<string>('Exemple 3D');

  // Controls state
  const [autoRotate, setAutoRotate] = useState<boolean>(initialAutoRotate);
  const [exposure, setExposure] = useState<number>(initialExposure);
  const [shadowIntensity, setShadowIntensity] = useState<number>(initialShadowIntensity);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    cardMesh: THREE.Mesh;
    animationId: number;
  } | null>(null);

  // 1. Dynamic injection of @google/model-viewer module
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'google-model-viewer-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // 2. Handle File Loading (Models: .glb, .gltf | Images: .png, .jpg, .webp, .svg)
  const processUploadedFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
    const is3DModel = ['glb', 'gltf'].includes(ext);

    if (!isImg && !is3DModel) {
      alert('Format non supporté. Veuillez importer un fichier 3D (.glb, .gltf) ou une image (.png, .jpg, .webp).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);
    setFileType(isImg ? 'image' : 'model');
    setFileName(file.name);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeMb} Mo`);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleResetToPreset = (type: 'model' | 'image') => {
    if (type === 'model') {
      setFileUrl('https://modelviewer.dev/shared-assets/models/Astronaut.glb');
      setFileType('model');
      setFileName('Astronaut.glb');
      setFileSize('Démo 3D');
    } else {
      setFileUrl('/assets/aum-paris-CLz-LyLm.jpg');
      setFileType('image');
      setFileName('Visual_Design_3D.jpg');
      setFileSize('Démo Image');
    }
  };

  // 3. Three.js Engine for Image 3D Display (Holographic Card / Plaque with OrbitControls)
  useEffect(() => {
    if (fileType !== 'image' || !threeCanvasRef.current || !fileUrl) return;

    const canvas = threeCanvasRef.current;
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 500;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    // Renderer with antialiasing and transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.maxDistance = 8;
    controls.minDistance = 1.5;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2 * exposure);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2 * exposure);
    keyLight.position.set(3, 4, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4 * exposure);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Texture loading for the 3D card
    const textureLoader = new THREE.TextureLoader();
    let cardMesh: THREE.Mesh;

    textureLoader.load(fileUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const imgAspect = texture.image ? texture.image.width / texture.image.height : 1.4;
      const cardHeight = 2.4;
      const cardWidth = cardHeight * Math.min(Math.max(imgAspect, 0.7), 1.8);

      // Card Box Geometry with bevel depth
      const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, 0.08);

      // Materials (Glass frame sides, front image, dark backing)
      const edgeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x18181b,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
      });

      const frontMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
      });

      const materials = [
        edgeMaterial, // right
        edgeMaterial, // left
        edgeMaterial, // top
        edgeMaterial, // bottom
        frontMaterial, // front
        edgeMaterial, // back
      ];

      cardMesh = new THREE.Mesh(geometry, materials);
      cardMesh.castShadow = true;
      cardMesh.receiveShadow = true;
      scene.add(cardMesh);

      // Subtle shadow floor plane
      const shadowGeo = new THREE.PlaneGeometry(cardWidth * 1.5, cardHeight * 1.5);
      const shadowMat = new THREE.ShadowMaterial({
        opacity: Math.min(shadowIntensity * 0.35, 0.8),
      });
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -cardHeight / 2 - 0.25;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);
    });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    threeSceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      cardMesh: cardMesh!,
      animationId: animId,
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, [fileType, fileUrl, autoRotate, exposure, shadowIntensity]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full overflow-hidden rounded-3xl border border-zinc-200/90 bg-zinc-950 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-white/15 ${className} ${
        isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen rounded-none' : 'min-h-[480px] h-[580px]'
      }`}
      style={{ backgroundColor }}
    >
      {/* Hidden File Input for GLB, GLTF, PNG, JPG, WEBP */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.png,.jpg,.jpeg,.webp,.svg"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Top Header HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Active File Info Pill */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3.5 py-1.5 backdrop-blur-xl shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-zinc-200 truncate max-w-[160px] sm:max-w-[240px]">
            {fileName}
          </span>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-400 uppercase">
            {fileType === 'image' ? 'Image 3D' : 'Modèle 3D'}
          </span>
          <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">
            ({fileSize})
          </span>
        </div>

        {/* Action Controls Group */}
        <div className="pointer-events-auto flex items-center gap-2 ml-auto">
          {/* Import Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => onHoverItem?.('IMPORTER UN FICHIER 3D OU IMAGE')}
            onMouseLeave={onLeaveItem}
            className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 font-urbanist text-xs font-extrabold text-zinc-950 shadow-lg transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            <span>Importer</span>
          </button>

          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer ${
              showSettings
                ? 'border-white bg-white text-zinc-950'
                : 'border-white/10 bg-zinc-900/80 text-zinc-300 hover:border-white/25 hover:bg-zinc-800'
            }`}
            title="Paramètres d'éclairage et d'affichage"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 transition-all hover:border-white/25 hover:bg-zinc-800 cursor-pointer"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas / Model-Viewer Surface */}
      <div className="relative h-full w-full">
        {fileType === 'model' ? (
          // 3D Model Display using @google/model-viewer
          React.createElement('model-viewer', {
            src: fileUrl,
            style: { width: '100%', height: '100%', outline: 'none' },
            ...(autoRotate ? { 'auto-rotate': true } : {}),
            ...(cameraControls ? { 'camera-controls': true } : {}),
            'shadow-intensity': shadowIntensity,
            exposure: exposure,
            'environment-image': environmentImage,
            loading: 'eager',
            'touch-action': 'pan-y',
            alt: 'Visualiseur 3D interactif',
          })
        ) : (
          // Image 3D Display using Three.js Interactive Holographic Plaque
          <canvas
            ref={threeCanvasRef}
            className="h-full w-full cursor-grab active:cursor-grabbing outline-none"
          />
        )}
      </div>

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-4 z-40 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-zinc-950/85 backdrop-blur-md pointer-events-none"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mb-4 animate-bounce">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-urbanist text-xl font-bold text-white mb-1">
              Déposez votre fichier ici
            </h4>
            <p className="font-mono text-xs text-zinc-400">
              Modèles 3D (.glb, .gltf) ou Images (.png, .jpg, .webp)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-16 right-4 z-30 w-72 rounded-2xl border border-white/15 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-urbanist text-xs font-bold text-white uppercase tracking-wider">
                Réglages 3D
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Studio</span>
            </div>

            {/* Auto Rotate Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="font-urbanist text-xs text-zinc-300">Rotation automatique</span>
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  autoRotate ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full transition-transform transform ${
                    autoRotate ? 'translate-x-6 bg-zinc-950' : 'translate-x-1 bg-zinc-400'
                  }`}
                />
              </button>
            </div>

            {/* Exposure Slider */}
            <div className="py-2.5 border-b border-white/5">
              <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-1">
                <span>Exposition</span>
                <span>{exposure.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Shadow Intensity Slider */}
            <div className="py-2.5 border-b border-white/5">
              <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-1">
                <span>Ombres Portées</span>
                <span>{shadowIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={shadowIntensity}
                onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Presets Quick Switch */}
            <div className="pt-3">
              <span className="block font-mono text-[10px] text-zinc-400 mb-2 uppercase">
                Exemples prêts à l’emploi
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleResetToPreset('model')}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-urbanist text-xs font-semibold text-zinc-200 hover:bg-white/10 cursor-pointer"
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>Modèle 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResetToPreset('image')}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-urbanist text-xs font-semibold text-zinc-200 hover:bg-white/10 cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Image 3D</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Guide Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/80 px-4 py-2 text-center backdrop-blur-xl shadow-xl">
          <span className="font-mono text-[11px] text-zinc-400">
            Glissez un fichier <strong className="text-white">.glb</strong>, <strong className="text-white">.gltf</strong> ou une image <strong className="text-white">.png / .jpg</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="pointer-events-auto font-urbanist text-[11px] font-bold text-white underline hover:text-zinc-300 cursor-pointer"
          >
            Parcourir
          </button>
        </div>
      </div>
    </div>
  );
};
