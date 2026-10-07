import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Audio-reactive mathematical particle presets.
 * Each fn receives: (i, count, time, params, target, color)
 * params.audio: { bass, mid, treble, energy, isBeat, beatIntensity, rawBands }
 *
 * Ported from infinite_fractal_cube.js, contained to a target container
 * (instead of the full window) and bindable to an external AnalyserNode
 * so it can react to the site's shared audio graph.
 */
export const PRESETS = {
    menger_cube: {
        name: "Infinite Fractal Cube (Menger Sponge)",
        params: { size: 55, depth: 3.5, spin: 0.45, pulse: 0.28 },
        fn: (i, count, time, params, target, color) => {
            const { size, depth, spin, pulse, audio } = params;

            const bass = audio ? audio.bass : 0;
            const treble = audio ? audio.treble : 0;
            const kick = (audio && audio.isBeat) ? 1.0 : (audio ? audio.beatIntensity : 0);
            const audioScale = 1.0 + (bass * 0.45 + kick * 0.35);

            const t = (i + 0.5) / count;
            let x = t, y = t * 1.7320508075688772, z = t * 2.23606797749979;
            x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
            let keep = 1.0;
            const maxIter = Math.min(5, Math.ceil(depth));
            for (let k = 0; k < maxIter; k++) {
                if (k >= depth) break;
                const xi = Math.floor(x * 3.0), yi = Math.floor(y * 3.0), zi = Math.floor(z * 3.0);
                const holes = (xi === 1 && yi === 1) || (xi === 1 && zi === 1) || (yi === 1 && zi === 1);
                keep *= holes ? 0.22 : 1.0;
                x = x * 3.0 - xi; y = y * 3.0 - yi; z = z * 3.0 - zi;
            }
            x = (x - 0.5) * 2.0; y = (y - 0.5) * 2.0; z = (z - 0.5) * 2.0;

            const s = size * audioScale * (0.75 + (pulse * (1.0 + bass * 0.5)) * 0.25 * Math.sin(time * 1.5));
            let px = x * s * keep, py = y * s * keep, pz = z * s * keep;

            const ay = time * (spin * (1.0 + (audio ? audio.energy * 0.4 : 0)));
            const cy = Math.cos(ay), sy = Math.sin(ay);
            const rx = px * cy - pz * sy, rz = px * sy + pz * cy;
            const ax = ay * 0.6, cx = Math.cos(ax), sx = Math.sin(ax);
            const ry = py * cx - rz * sx, rz2 = py * sx + rz * cx;
            target.set(rx, ry, rz2);

            const hue = (0.54 + 0.28 * keep + 0.08 * Math.sin(time * 0.8) + treble * 0.15) % 1;
            const light = Math.min(1.0, (0.2 + 0.65 * keep) + kick * 0.45);
            color.setHSL(hue, 0.95, light);
        }
    },
    sierpinski_tetra: {
        name: "Sierpinski Quantum Pyramid",
        params: { size: 65, depth: 4.0, spin: 0.5, pulse: 0.3 },
        fn: (i, count, time, params, target, color) => {
            const { size, depth, spin, pulse, audio } = params;
            const bass = audio ? audio.bass : 0;
            const kick = (audio && audio.isBeat) ? 1.0 : (audio ? audio.beatIntensity : 0);

            const v = [[0, 1.414, 0], [-1.155, -0.471, -1.0], [1.155, -0.471, -1.0], [0, -0.471, 1.155]];
            let seed = (i * 2654435761) >>> 0;
            let px = 0, py = 0, pz = 0, weight = 0.5;
            const iters = Math.min(8, Math.max(1, Math.round(depth + 2)));
            for (let k = 0; k < iters; k++) {
                const corner = (seed >> (k * 2)) & 3;
                px += v[corner][0] * weight;
                py += v[corner][1] * weight;
                pz += v[corner][2] * weight;
                weight *= 0.5;
            }
            const s = size * (1.0 + bass * 0.4 + kick * 0.35) * 0.9 * (1.0 + pulse * 0.2 * Math.sin(time * 2.0 + px));
            px *= s; py *= s; pz *= s;
            const a1 = time * spin, a2 = time * spin * 0.7;
            const x1 = px * Math.cos(a1) - pz * Math.sin(a1);
            const z1 = px * Math.sin(a1) + pz * Math.cos(a1);
            const y2 = py * Math.cos(a2) - z1 * Math.sin(a2);
            const z2 = py * Math.sin(a2) + z1 * Math.cos(a2);
            target.set(x1, y2, z2);
            const dist = Math.sqrt(px * px + py * py + pz * pz) / s;
            color.setHSL((0.78 + dist * 0.35 + 0.05 * Math.cos(time)) % 1, 0.9, Math.min(1.0, (0.35 + 0.55 * (1 - dist)) + kick * 0.4));
        }
    },
    mandelbulb: {
        name: "Mandelbulb 3D Core",
        params: { size: 48, depth: 3.2, spin: 0.35, pulse: 0.25 },
        fn: (i, count, time, params, target, color) => {
            const { size, spin, pulse, audio } = params;
            const bass = audio ? audio.bass : 0;
            const kick = (audio && audio.isBeat) ? 1.0 : (audio ? audio.beatIntensity : 0);

            const t = (i + 0.5) / count;
            const phi = Math.acos(1 - 2 * t);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r0 = (1.15 + 0.15 * Math.sin(t * 100)) * (1.0 + bass * 0.3);
            let x = r0 * Math.sin(phi) * Math.cos(theta), y = r0 * Math.sin(phi) * Math.sin(theta), z = r0 * Math.cos(phi);
            const cx = x, cy = y, cz = z;
            let n = 8.0 + (pulse + (audio ? audio.mid * 0.5 : 0)) * 1.5 * Math.sin(time);
            let trap = 1.0;
            for (let step = 0; step < 4; step++) {
                const r = Math.sqrt(x * x + y * y + z * z);
                if (r > 2.0) { trap = step / 4.0; break; }
                const th = Math.atan2(Math.sqrt(x * x + y * y), z), ph = Math.atan2(y, x), rn = Math.pow(r, 2.5);
                x = rn * Math.sin(th * n) * Math.cos(ph * n) + cx * 0.4;
                y = rn * Math.sin(th * n) * Math.sin(ph * n) + cy * 0.4;
                z = rn * Math.cos(th * n) + cz * 0.4;
            }
            const s = size * (1.0 + kick * 0.3) * (0.8 + 0.1 * Math.sin(time * 1.2)) * 0.8;
            let px = x * s, py = y * s, pz = z * s;
            const rot = time * spin;
            const rx = px * Math.cos(rot) - pz * Math.sin(rot);
            const rz = px * Math.sin(rot) + pz * Math.cos(rot);
            const ry = py * Math.cos(rot * 0.5) - rz * Math.sin(rot * 0.5);
            const rz2 = py * Math.sin(rot * 0.5) + rz * Math.cos(rot * 0.5);
            target.set(rx, ry, rz2);
            color.setHSL((0.08 + trap * 0.5 + 0.1 * Math.sin(time * 0.5)) % 1, 0.95, Math.min(1.0, 0.3 + 0.5 * trap + kick * 0.35));
        }
    },
    tesseract_4d: {
        name: "Cybernetic Tesseract 4D",
        params: { size: 58, depth: 3.0, spin: 0.6, pulse: 0.35 },
        fn: (i, count, time, params, target, color) => {
            const { size, spin, pulse, audio } = params;
            const bass = audio ? audio.bass : 0;
            const kick = (audio && audio.isBeat) ? 1.0 : (audio ? audio.beatIntensity : 0);

            const t = (i + 0.5) / count;
            const edgeIdx = Math.floor(t * 32);
            const edgeT = (t * 32) % 1.0;
            const v1 = edgeIdx & 15;
            const dim = (edgeIdx >> 4) & 3;
            const v2 = v1 ^ (1 << dim);
            const get4D = v => [(v & 1) ? 1 : -1, (v & 2) ? 1 : -1, (v & 4) ? 1 : -1, (v & 8) ? 1 : -1];
            const p1 = get4D(v1), p2 = get4D(v2);
            let x4 = p1[0] + (p2[0] - p1[0]) * edgeT, y4 = p1[1] + (p2[1] - p1[1]) * edgeT, z4 = p1[2] + (p2[2] - p1[2]) * edgeT, w4 = p1[3] + (p2[3] - p1[3]) * edgeT;
            const aXW = time * spin, aYZ = time * spin * 0.7;
            const nx = x4 * Math.cos(aXW) - w4 * Math.sin(aXW), nw = x4 * Math.sin(aXW) + w4 * Math.cos(aXW);
            const ny = y4 * Math.cos(aYZ) - z4 * Math.sin(aYZ), nz = y4 * Math.sin(aYZ) + z4 * Math.cos(aYZ);
            const factor = 1.0 / (2.4 + pulse * 0.4 * Math.sin(time) - nw * 0.65);
            const s = size * (1.0 + bass * 0.35 + kick * 0.3) * 0.9;
            target.set(nx * factor * s, ny * factor * s, nz * factor * s);
            color.setHSL((0.45 + (nw + 1) * 0.25 + 0.05 * Math.sin(time)) % 1, 1.0, Math.min(1.0, (0.25 + 0.5 * (factor / 1.5)) + kick * 0.4));
        }
    }
};

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        this._stopped = false;

        this.activePresetKey = "menger_cube";
        this.activePreset = PRESETS.menger_cube;
        this.params = { ...this.activePreset.params };
        this.customFn = null;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000206, 0.01);
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        this.camera.position.set(0, 15, 95);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height, false);
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.renderer.domElement.style.display = "block";
        this.container.appendChild(this.renderer.domElement);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.8, 0.4, 0.85);
        this.bloomPass.strength = 1.8;
        this.bloomPass.radius = 0.4;
        this.bloomPass.threshold = 0.05;
        this.composer.addPass(this.bloomPass);

        // Free orbit: drag to rotate the structure in any direction
        const isCoarsePointer = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.minDistance = 40;
        this.controls.maxDistance = 220;
        this.controls.target.set(0, 0, 0);
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.addEventListener("start", () => { this.controls.autoRotate = false; });
        this.controls.addEventListener("end", () => { this.controls.autoRotate = true; });
        // On touch devices, don't trap the vertical swipe gesture into a camera orbit.
        if (isCoarsePointer) {
            this.controls.enabled = false;
            this.renderer.domElement.style.touchAction = "pan-y";
        }

        // Pointer-driven distortion field (hover warps nearby particles)
        this.raycaster = new THREE.Raycaster();
        this.pointerNDC = new THREE.Vector2(0, 0);
        this.pointerPlane = new THREE.Plane();
        this.pointerWorld = new THREE.Vector3();
        this.pointerActive = false;
        this.hoverAmount = 0;
        this._camDir = new THREE.Vector3();

        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();

        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);

        this.positions = [];
        for (let i = 0; i < this.count; i++) {
            this.positions.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }

        this.startTime = performance.now();
        this.rawBands = new Float32Array(64);
        this.audioAnalysis = { bass: 0, mid: 0, treble: 0, energy: 0, isBeat: false, beatIntensity: 0, rawBands: this.rawBands };
        this.audioSmoothBass = 0;
        this.audioSmoothMid = 0;
        this.audioSmoothTreble = 0;
        this.beatPulseDecay = 0;
        this.prevInstantBass = 0;
        this.fluxThreshold = 0.03;
        this.avgBassEnergy = 0.15;
        this.animate = this.animate.bind(this);
        this.animate();
    }

    setPreset(presetKey) {
        if (PRESETS[presetKey]) {
            this.activePresetKey = presetKey;
            this.activePreset = PRESETS[presetKey];
            this.params = { ...this.activePreset.params };
            this.customFn = null;
        }
    }

    setParams(newParams) {
        this.params = { ...this.params, ...newParams };
    }

    /**
     * Bind an externally managed AnalyserNode (e.g. the site's shared
     * SoundCloud audio graph) instead of creating a dedicated AudioContext.
     */
    bindAnalyser(analyser) {
        if (!analyser || this.analyser === analyser) return;
        this.analyser = analyser;
        this.audioData = new Uint8Array(analyser.frequencyBinCount);
    }

    unbindAnalyser() {
        this.analyser = null;
        this.audioData = null;
    }

    /**
     * Update the pointer position in Normalized Device Coordinates (-1..1)
     * so the particle field can warp/distort around it on hover.
     */
    setPointerNDC(x, y) {
        this.pointerNDC.set(x, y);
        this.pointerActive = true;
    }

    clearPointer() {
        this.pointerActive = false;
    }

    /**
     * Resize the renderer/camera/composer to match the container.
     */
    resize(width, height) {
        if (!width || !height) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
        this.composer.setSize(width, height);
        if (this.bloomPass && this.bloomPass.setSize) {
            this.bloomPass.setSize(width, height);
        }
    }

    updateAudioAnalysis() {
        if (!this.analyser || !this.audioData) return;
        this.analyser.getByteFrequencyData(this.audioData);

        const binCount = this.analyser.frequencyBinCount;
        const step = Math.max(1, Math.floor(binCount / 64));
        for (let b = 0; b < 64; b++) {
            let sum = 0;
            for (let s = 0; s < step; s++) sum += this.audioData[b * step + s] || 0;
            this.rawBands[b] = (sum / step) / 255.0;
        }

        const getBand = (s, e) => {
            let sum = 0, cnt = 0;
            for (let i = s; i <= e && i < binCount; i++) { sum += this.audioData[i]; cnt++; }
            return cnt > 0 ? (sum / cnt) / 255.0 : 0;
        };

        const sub = getBand(1, 5);
        const bass = getBand(5, 16);
        const mid = getBand(16, 70);
        const treble = getBand(70, 240);
        const energy = sub * 0.45 + bass * 0.35 + mid * 0.15 + treble * 0.05;

        let instantKick = 0;
        for (let i = 1; i <= 5; i++) instantKick += this.audioData[i];
        instantKick /= (5 * 255.0);

        const flux = Math.max(0, instantKick - this.prevInstantBass);
        this.prevInstantBass = instantKick;
        this.fluxThreshold = this.fluxThreshold * 0.86 + flux * 0.14;
        this.avgBassEnergy = this.avgBassEnergy * 0.94 + instantKick * 0.06;

        let isBeat = false;
        if ((flux > 0.022 && flux > this.fluxThreshold * 1.25) || (instantKick > 0.45 && instantKick > this.avgBassEnergy * 1.3)) {
            if (this.beatPulseDecay < 0.35) {
                isBeat = true;
                this.beatPulseDecay = 1.0;
            }
        }
        this.beatPulseDecay *= 0.84;

        this.audioSmoothBass += (bass * 2.2 - this.audioSmoothBass) * 0.35;
        this.audioSmoothMid += (mid * 2.0 - this.audioSmoothMid) * 0.35;
        this.audioSmoothTreble += (treble * 2.5 - this.audioSmoothTreble) * 0.35;

        this.audioAnalysis = {
            bass: this.audioSmoothBass,
            mid: this.audioSmoothMid,
            treble: this.audioSmoothTreble,
            energy: energy * 2.0,
            isBeat,
            beatIntensity: this.beatPulseDecay,
            rawBands: this.rawBands
        };
    }

    animate() {
        if (this._stopped) return;
        requestAnimationFrame(this.animate);
        const nowTime = performance.now();
        const time = ((nowTime - this.startTime) * 0.001) * this.speedMult;
        this.updateAudioAnalysis();

        const count = this.count;
        const fn = this.customFn || this.activePreset.fn;
        const params = { ...this.params };
        const hasAudio = !!this.analyser;
        const isAudioActive = hasAudio && this.audioAnalysis && (this.audioAnalysis.energy > 0.008 || this.audioAnalysis.bass > 0.008);
        if (isAudioActive) {
            params.audio = this.audioAnalysis;
            const kickScale = (this.beatPulseDecay * 0.38 + this.audioSmoothBass * 0.28);
            this.mesh.scale.setScalar(1.0 + kickScale);
            if (this.bloomPass) {
                this.bloomPass.strength = 1.8 + (this.audioSmoothBass * 1.3 + this.beatPulseDecay * 2.2);
            }
        } else {
            this.mesh.scale.set(1, 1, 1);
            if (this.bloomPass) this.bloomPass.strength = 1.8;
        }

        const lerpRate = isAudioActive ? 0.24 : 0.1;
        const kickDecay = this.beatPulseDecay;

        this.controls.update();

        // Resolve the pointer's world-space position on a plane facing the camera,
        // passing through the orbit target, so it stays accurate at any rotation.
        this.hoverAmount += ((this.pointerActive ? 1 : 0) - this.hoverAmount) * 0.08;
        let distortionPoint = null;
        if (this.hoverAmount > 0.001) {
            this.camera.getWorldDirection(this._camDir);
            this.pointerPlane.setFromNormalAndCoplanarPoint(this._camDir, this.controls.target);
            this.raycaster.setFromCamera(this.pointerNDC, this.camera);
            if (this.raycaster.ray.intersectPlane(this.pointerPlane, this.pointerWorld)) {
                distortionPoint = this.pointerWorld;
            }
        }
        const distortRadius = 46;

        for (let i = 0; i < count; i++) {
            fn(i, count, time, params, this.target, this.pColor);

            if (distortionPoint) {
                const dx = this.target.x - distortionPoint.x;
                const dy = this.target.y - distortionPoint.y;
                const dz = this.target.z - distortionPoint.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 < distortRadius * distortRadius) {
                    const d = Math.sqrt(d2) || 0.0001;
                    const falloff = 1 - d / distortRadius;
                    const push = falloff * falloff * 40 * this.hoverAmount;
                    this.target.x += (dx / d) * push;
                    this.target.y += (dy / d) * push;
                    this.target.z += (dz / d) * push;
                    this.pColor.r = Math.min(1.0, this.pColor.r + falloff * 0.3 * this.hoverAmount);
                    this.pColor.b = Math.min(1.0, this.pColor.b + falloff * 0.3 * this.hoverAmount);
                }
            }

            if (isAudioActive && this.rawBands) {
                const bandVal = this.rawBands[i % 64] || 0;
                const dist = Math.sqrt(this.target.x * this.target.x + this.target.y * this.target.y + this.target.z * this.target.z) || 1.0;
                const nx = this.target.x / dist;
                const ny = this.target.y / dist;
                const nz = this.target.z / dist;

                const disp = (bandVal * 24.0) + (kickDecay * 18.0);
                this.target.x += nx * disp;
                this.target.y += ny * disp;
                this.target.z += nz * disp;

                if (kickDecay > 0.05) {
                    const flash = kickDecay * 0.65;
                    this.pColor.r = Math.min(1.0, this.pColor.r + flash);
                    this.pColor.g = Math.min(1.0, this.pColor.g + flash * 0.85);
                    this.pColor.b = Math.min(1.0, this.pColor.b + flash);
                }
            }

            this.positions[i].lerp(this.target, lerpRate);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

        this.composer.render();
    }

    dispose() {
        this._stopped = true;
        this.controls.dispose();
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.composer.passes.forEach((pass) => pass.dispose && pass.dispose());
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}
