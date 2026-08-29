import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveTextProps {
  text: string;
  className?: string;
  hoverColor?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className = '',
  hoverColor = '#0066ff',
  as: Component = 'span',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const letters = text.split('');

  return (
    <Component className={`inline-flex flex-wrap ${className}`}>
      {letters.map((char, index) => {
        const isHovered = hoveredIdx === index;
        const isNeighbor = hoveredIdx !== null && Math.abs(hoveredIdx - index) === 1;

        return (
          <motion.span
            key={`${char}-${index}`}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            animate={{
              y: isHovered ? -8 : isNeighbor ? -3 : 0,
              scale: isHovered ? 1.12 : isNeighbor ? 1.04 : 1,
              rotate: isHovered ? (index % 2 === 0 ? -3 : 3) : 0,
              color: isHovered ? hoverColor : 'inherit',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 18,
            }}
            className="inline-block cursor-pointer select-none transition-colors duration-200"
            style={{
              display: char === ' ' ? 'inline' : 'inline-block',
              whiteSpace: 'pre',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </Component>
  );
};
