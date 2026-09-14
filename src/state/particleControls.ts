export interface ParticleControls {
  scale: number;
  twist: number;
  speed: number;
  chaos: number;
}

export const defaultParticleControls: ParticleControls = {
  scale: 1.2,
  twist: 2.2,
  speed: 0.85,
  chaos: 0.45,
};

type Listener = (controls: ParticleControls) => void;
let currentControls = { ...defaultParticleControls };
const listeners = new Set<Listener>();

export const getParticleControls = () => currentControls;

export const setParticleControl = (key: keyof ParticleControls, value: number) => {
  currentControls = { ...currentControls, [key]: value };
  listeners.forEach((l) => l(currentControls));
};

export const resetParticleControls = () => {
  currentControls = { ...defaultParticleControls };
  listeners.forEach((l) => l(currentControls));
};

export const subscribeParticleControls = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
