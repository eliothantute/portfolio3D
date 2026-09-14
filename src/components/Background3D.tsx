import React from 'react';

interface Background3DProps {
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
  isIntroActive?: boolean;
}

// Background3D disabled to remove all background tesseract sticks/noodles
export const Background3D: React.FC<Background3DProps> = () => {
  return null;
};
