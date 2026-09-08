import React from 'react';

interface CustomCursorProps {
  cursorText?: string;
  isHovered?: boolean;
}

// Custom orange cursor removed as requested by user ("l'effet de la souris orange est moche")
export const CustomCursor: React.FC<CustomCursorProps> = () => {
  return null;
};
