import React, { useEffect, useRef, useState } from 'react';

interface ParticleTextProps {
  text: string;
  active: boolean;
  className?: string;
  /** Pixel step between sampled points; smaller = denser cloud. */
  density?: number;
}

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  seed: number;
  speed: number;
  reach: number;
  size: number;
  alpha: number;
  landDelay: number;
}

const PAD = 120;
const SWARM_MS = 260;
const RETURN_MS = 240;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Renders text normally; when `active` turns on, swaps it for a canvas of fine particles sampled
// from the exact glyph positions. They lift off and buzz around like a swarm of flies, then
// settle back onto the letters and the text reforms.
export const ParticleText: React.FC<ParticleTextProps> = ({ text, active, className = '', density = 3 }) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!active || reduceMotion.current) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!wrap || !canvas || !ctx) return;

    const box = wrap.getBoundingClientRect();
    const w = box.width + PAD * 2;
    const h = box.height + PAD * 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Draw each glyph at the exact spot the browser laid it out, stretched to its real width so
    // condensed variable fonts (which canvas can't always reproduce) still line up.
    const cs = getComputedStyle(wrap);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    wrap.querySelectorAll<HTMLSpanElement>('[data-ch]').forEach((span) => {
      const raw = span.textContent ?? '';
      const ch = cs.textTransform === 'uppercase' ? raw.toLocaleUpperCase() : cs.textTransform === 'lowercase' ? raw.toLocaleLowerCase() : raw;
      const r = span.getBoundingClientRect();
      if (!ch.trim() || !r.width) return;
      const measured = ctx.measureText(ch).width || r.width;
      ctx.save();
      ctx.translate(r.left - box.left + PAD, r.top - box.top + PAD + r.height / 2);
      ctx.scale(r.width / measured, 1);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const step = Math.max(2, Math.round(density * dpr));
    // Each hover gets its own temper: overall reach and a sideways drift the swarm leans into.
    const gust = 0.6 + Math.random() * 0.9;
    const driftX = (Math.random() - 0.5) * 60;
    const driftY = (Math.random() - 0.5) * 30;
    const particles: Particle[] = [];
    for (let py = 0; py < canvas.height; py += step) {
      for (let px = 0; px < canvas.width; px += step) {
        if (data[(py * canvas.width + px) * 4 + 3] > 128) {
          const ox = px / dpr + (Math.random() - 0.5) * step / dpr;
          const oy = py / dpr + (Math.random() - 0.5) * step / dpr;
          const fine = Math.random();
          particles.push({
            x: ox,
            y: oy,
            ox,
            oy,
            vx: 0,
            vy: 0,
            seed: Math.random() * 1000,
            speed: 0.003 + Math.pow(Math.random(), 2) * 0.02,
            reach: (10 + Math.pow(Math.random(), 3) * 110) * gust,
            size: 1.3 + fine * fine * 1.7,
            alpha: 0.55 + Math.random() * 0.45,
            landDelay: Math.random() * 120,
          });
        }
      }
    }
    if (!particles.length) return;

    setAnimating(true);
    const start = performance.now();
    let last = start;
    let raf = 0;

    const frame = (now: number) => {
      const t = now - start;
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const color = getComputedStyle(wrap).color;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = color;

      // Swarm radius grows on take-off, holds, then shrinks back to zero as the flies land.
      const lift = easeInOut(Math.min(1, t / 140));

      let settled = true;
      for (const p of particles) {
        // Particles land one by one rather than all at once.
        const land = t < SWARM_MS + p.landDelay ? 0 : Math.min(1, (t - SWARM_MS - p.landDelay) / RETURN_MS);
        if (land < 1) settled = false;
        const spread = lift * (1 - easeInOut(land));
        const pull = 0.06 + land * 0.32;
        const buzz = 1.4 * spread + 0.04;
        const a = t * p.speed + p.seed;
        const tx = p.ox + ((Math.sin(a) + Math.sin(a * 2.3 + p.seed) * 0.45) * p.reach + driftX) * spread;
        const ty = p.oy + ((Math.cos(a * 1.3 + p.seed * 0.7) + Math.sin(a * 3.1) * 0.35) * p.reach * 0.7 + driftY) * spread;
        // Occasional darts: a fly suddenly shoots off in a random direction.
        if (spread > 0.3 && Math.random() < 0.04 * dt) {
          const ang = Math.random() * Math.PI * 2;
          const kick = 3 + Math.random() * 9;
          p.vx += Math.cos(ang) * kick;
          p.vy += Math.sin(ang) * kick;
        }
        p.vx = (p.vx + (tx - p.x) * pull * dt + (Math.random() - 0.5) * buzz * dt) * 0.84;
        p.vy = (p.vy + (ty - p.y) * pull * dt + (Math.random() - 0.5) * buzz * dt) * 0.84;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (Math.abs(p.ox - p.x) > 0.5 || Math.abs(p.oy - p.y) > 0.5) settled = false;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      if (t > SWARM_MS + RETURN_MS + 300) settled = true;

      if (settled) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setAnimating(false);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      setAnimating(false);
    };
  }, [active, density]);

  // Words stay unbreakable so per-letter spans wrap exactly like the plain text would.
  const words = text.split(' ');
  return (
    <span ref={wrapRef} className={`relative inline-block ${className}`} aria-label={text}>
      <span aria-hidden="true" className={animating ? 'opacity-0' : 'opacity-100'}>
        {words.map((word, wi) => (
          <React.Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((ch, ci) => (
                <span key={ci} data-ch="">
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -PAD, top: -PAD, visibility: animating ? 'visible' : 'hidden' }}
      />
    </span>
  );
};
