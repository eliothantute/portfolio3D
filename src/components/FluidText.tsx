import React, { useEffect, useRef } from 'react';

interface FluidTextProps {
  line1: string;
  line2: string;
  className?: string;
}

const TRAIL_LENGTH = 12;
const NOISE_SIZE = 256;

function generateNoiseData(): Uint8Array {
  const size = NOISE_SIZE;
  const data = new Uint8Array(size * size * 4);
  let seed = 48271;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const angle = rand() * Math.PI * 2;
      data[idx] = ((Math.cos(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 1] = ((Math.sin(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 2] = (rand() * 255) | 0;
      data[idx + 3] = 255;
    }
  }
  return data;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform sampler2D uNoiseTex;
uniform vec3 uEffectColor1;
uniform vec3 uEffectColor2;
uniform vec3 uEffectColor3;
uniform vec3 uEffectColor4;
uniform float uRadius;
uniform float uStrength;
uniform float uDistortion;
uniform vec2 uTrail[${TRAIL_LENGTH}];
uniform vec2 uTrailVelocities[${TRAIL_LENGTH}];
uniform float uTrailStrengths[${TRAIL_LENGTH}];

vec2 noiseTexCoord(vec2 i) {
    return (floor(mod(i, 256.0)) + 0.5) / 256.0;
}

float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    vec2 g00 = texture2D(uNoiseTex, noiseTexCoord(i)).rg * 2.0 - 1.0;
    vec2 g10 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 0.0))).rg * 2.0 - 1.0;
    vec2 g01 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(0.0, 1.0))).rg * 2.0 - 1.0;
    vec2 g11 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 1.0))).rg * 2.0 - 1.0;
    return mix(mix(dot(g00, f - vec2(0.0, 0.0)),
                   dot(g10, f - vec2(1.0, 0.0)), u.x),
               mix(dot(g01, f - vec2(0.0, 1.0)),
                   dot(g11, f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 3; ++i) {
        v += a * gnoise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv;
    vec2 pos = uv * aspect;

    // Fluid distortion accumulation
    vec2 fluidOffset = vec2(0.0);
    float fluidIntensity = 0.0;

    for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
        vec2 trailPos = uTrail[i] * aspect;
        float dist = distance(pos, trailPos);
        float r = uRadius;
        if (dist < r) {
            float factor = pow(1.0 - dist / r, 2.0) * uTrailStrengths[i];
            vec2 vel = uTrailVelocities[i];
            fluidOffset += vel * factor * uDistortion;
            fluidIntensity += factor;
        }
    }

    // Organic noise displacement
    float n = fbm(uv * 4.0 + uTime * 0.35 + fluidOffset * 3.0);
    vec2 distortedUv = uv + vec2(n * 0.06, -n * 0.06) * fluidIntensity;

    // Dynamic 4-color gradient blend
    float t = distortedUv.x + n * 0.3 + uTime * 0.1;
    vec3 col = mix(uEffectColor1, uEffectColor2, smoothstep(0.0, 0.45, fract(t)));
    col = mix(col, uEffectColor3, smoothstep(0.4, 0.8, fract(t)));
    col = mix(col, uEffectColor4, smoothstep(0.75, 1.0, fract(t)));

    float alpha = clamp(fluidIntensity * uStrength * 1.6, 0.0, 0.85);

    gl_FragColor = vec4(col * 1.25, alpha);
}
`;

export const FluidText: React.FC<FluidTextProps> = ({ line1, line2, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) return;

    // Compile Shaders
    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Noise Texture
    const noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    const noiseData = generateNoiseData();
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      NOISE_SIZE,
      NOISE_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      noiseData
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Uniform Locations
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uPointerActive = gl.getUniformLocation(program, 'uPointerActive');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uNoiseTex = gl.getUniformLocation(program, 'uNoiseTex');
    const uEffectColor1 = gl.getUniformLocation(program, 'uEffectColor1');
    const uEffectColor2 = gl.getUniformLocation(program, 'uEffectColor2');
    const uEffectColor3 = gl.getUniformLocation(program, 'uEffectColor3');
    const uEffectColor4 = gl.getUniformLocation(program, 'uEffectColor4');
    const uRadius = gl.getUniformLocation(program, 'uRadius');
    const uStrength = gl.getUniformLocation(program, 'uStrength');
    const uDistortion = gl.getUniformLocation(program, 'uDistortion');
    const uTrail = gl.getUniformLocation(program, 'uTrail');
    const uTrailVelocities = gl.getUniformLocation(program, 'uTrailVelocities');
    const uTrailStrengths = gl.getUniformLocation(program, 'uTrailStrengths');

    // Colors: Space Iridescent Blue / Indigo / Cyan / Violet
    gl.uniform3f(uEffectColor1, 0.23, 0.51, 0.96); // #3b82f6
    gl.uniform3f(uEffectColor2, 0.55, 0.65, 1.0);  // #8ea6ff
    gl.uniform3f(uEffectColor3, 0.38, 0.4, 0.94);  // #6366f1
    gl.uniform3f(uEffectColor4, 0.22, 0.74, 0.97); // #38bdf8

    gl.uniform1f(uRadius, 0.45);
    gl.uniform1f(uStrength, 0.95);
    gl.uniform1f(uDistortion, 0.45);
    gl.uniform1i(uNoiseTex, 0);

    // Trail State
    const trail = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: 0.5,
      y: 0.5,
      vx: 0,
      vy: 0,
      strength: 0,
    }));

    let pointerX = 0.5;
    let pointerY = 0.5;
    let smoothPointerX = 0.5;
    let smoothPointerY = 0.5;
    let prevPointerX = 0.5;
    let prevPointerY = 0.5;
    let pointerActive = 0;
    let pointerInside = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width;
      pointerY = 1.0 - (e.clientY - rect.top) / rect.height;
      pointerInside = true;
      pointerActive = 1;
    };

    const onPointerLeave = () => {
      pointerInside = false;
    };

    window.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth * dpr;
      const height = container.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const trailFlat = new Float32Array(TRAIL_LENGTH * 2);
    const trailVelFlat = new Float32Array(TRAIL_LENGTH * 2);
    const trailStrengths = new Float32Array(TRAIL_LENGTH);

    let startTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      // Smooth pointer
      smoothPointerX += (pointerX - smoothPointerX) * 0.12;
      smoothPointerY += (pointerY - smoothPointerY) * 0.12;

      const vx = (smoothPointerX - prevPointerX) * 2.5;
      const vy = (smoothPointerY - prevPointerY) * 2.5;
      prevPointerX = smoothPointerX;
      prevPointerY = smoothPointerY;

      // Pointer fade
      pointerActive += ((pointerInside ? 1 : 0) - pointerActive) * 0.08;

      // Decay trail
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trail[i].strength *= 0.94;
      }

      if (pointerInside) {
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
          trail[i].x = trail[i - 1].x;
          trail[i].y = trail[i - 1].y;
          trail[i].vx = trail[i - 1].vx;
          trail[i].vy = trail[i - 1].vy;
          trail[i].strength = trail[i - 1].strength;
        }
        trail[0].x = smoothPointerX;
        trail[0].y = smoothPointerY;
        trail[0].vx = vx;
        trail[0].vy = vy;
        trail[0].strength = 1.0;
      }

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trailFlat[i * 2] = trail[i].x;
        trailFlat[i * 2 + 1] = trail[i].y;
        trailVelFlat[i * 2] = trail[i].vx;
        trailVelFlat[i * 2 + 1] = trail[i].vy;
        trailStrengths[i] = trail[i].strength;
      }

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uPointer, smoothPointerX, smoothPointerY);
      gl.uniform1f(uPointerActive, pointerActive);
      gl.uniform1f(uTime, (now - startTime) * 0.001);
      gl.uniform2fv(uTrail, trailFlat);
      gl.uniform2fv(uTrailVelocities, trailVelFlat);
      gl.uniform1fv(uTrailStrengths, trailStrengths);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      gl.deleteTexture(noiseTex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block overflow-visible cursor-default select-none ${className}`}
    >
      {/* Interactive WebGL Fluid Shader Layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute -inset-8 z-10 h-[calc(100%+64px)] w-[calc(100%+64px)] rounded-3xl mix-blend-screen opacity-90 transition-opacity duration-300"
      />

      {/* Main High-Impact Typography */}
      <h1 className="relative z-20 font-display text-4xl font-black uppercase tracking-[0.06em] text-white sm:text-6xl lg:text-7xl xl:text-[5rem] leading-[1.05]">
        <span className="block drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
          {line1}
        </span>
        <span className="block bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(142,166,255,0.25)]">
          {line2}
        </span>
      </h1>
    </div>
  );
};
