export interface Project {
  id: string;
  title: string;
  client?: string;
  subtitle: string;
  description: string;
  longDescription: string;
  year: string;
  category: string;
  role: string[];
  stack: string[];
  objective: string;
  status: string;
  liveUrl?: string;
  githubUrl?: string;
  image: string;
  featured?: boolean;
  isThreeD?: boolean;
  coordinates?: { lat: number; lng: number; locationName: string };
  metrics?: { label: string; value: string }[];
}

export type Language = 'fr' | 'en';

export interface CursorContextType {
  cursorText: string;
  setCursorText: (text: string) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}
