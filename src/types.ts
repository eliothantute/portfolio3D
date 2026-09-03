export type SkillType = 'all' | 'frontend' | 'design' | 'app' | 'music';

export interface Project {
  id: string;
  title: string;
  client?: string;
  subtitle: string;
  description: string;
  longDescription: string;
  year: string;
  category: string;
  skillType?: 'frontend' | 'design' | 'app' | 'music';
  role: string[];
  stack: string[];
  objective: string;
  status: string;
  liveUrl?: string;
  githubUrl?: string;
  youtubeId?: string;
  image: string;
  video?: string;
  featured?: boolean;
  isThreeD?: boolean;
  coordinates?: { lat: number; lng: number; locationName: string };
  metrics?: { label: string; value: string }[];
}

export type Language = 'fr' | 'en';

export interface StackCategory {
  id: string;
  name: string;
  description: string;
  skills: string[];
  tag: string;
}

export interface ProfilePillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
}

export interface CursorContextType {
  cursorText: string;
  setCursorText: (text: string) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}
