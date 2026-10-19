import React, { useEffect, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
}

// Decodes left-to-right from random characters into the final text, the
// glitchy eyebrow-label reveal seen on the Mondragon reference.
export const ScrambleText: React.FC<ScrambleTextProps> = ({ text, className, duration = 700 }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const letters = text.split('');

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const revealCount = Math.floor(progress * letters.length);
      const next = letters
        .map((ch, i) => (ch === ' ' || i < revealCount ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join('');
      setDisplay(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, duration]);

  return <span className={className}>{display}</span>;
};
