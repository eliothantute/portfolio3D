import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gamepad2, BookOpen, Coffee, Image, Tv, Zap, CheckCircle2 } from 'lucide-react';
import { dioramaAudio } from './DioramaSoundEngine';

export type InspectableItem = 'controller' | 'manga' | 'drink' | 'posters' | 'tv' | 'fridge' | null;

interface ObjectInspectionModalProps {
  activeItem: InspectableItem;
  onClose: () => void;
  onSelectItem?: (item: InspectableItem) => void;
}

const ITEM_TABS: { id: InspectableItem; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'controller', label: 'Manette', icon: Gamepad2 },
  { id: 'manga', label: 'Manga', icon: BookOpen },
  { id: 'drink', label: 'Ramune', icon: Coffee },
  { id: 'posters', label: 'Posters', icon: Image },
  { id: 'tv', label: 'CRT TV', icon: Tv },
  { id: 'fridge', label: 'Frigo', icon: Zap },
];

export const ObjectInspectionModal: React.FC<ObjectInspectionModalProps> = ({
  activeItem,
  onClose,
  onSelectItem,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop blur with soft fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/95"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'inspection"
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all cursor-pointer dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Quick Item Category Tabs */}
          {onSelectItem && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pr-10 mb-4 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/60">
              {ITEM_TABS.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeItem === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'controller') dioramaAudio.play8BitBeep(523.25);
                      else if (tab.id === 'manga') dioramaAudio.playPageFlip();
                      else if (tab.id === 'tv') dioramaAudio.playCrtZap();
                      else dioramaAudio.playSwitch(true);
                      onSelectItem(tab.id);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 1. RETRO GAMEPAD CONTROLLER */}
          {activeItem === 'controller' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Manette 16-Bit Genesis
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">SEGA MEGA // 6-BUTTON VINTAGE</p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Manette rétro ergonomique branchée sur la console otaku. Teste les boutons interactifs pour entendre les notes chiptune 8-bit synthétisées en direct !
              </p>

              {/* Interactive Virtual Controller Buttons */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center gap-4 text-white">
                <div className="flex items-center justify-between w-full px-4">
                  {/* D-Pad */}
                  <div className="relative w-20 h-20">
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(261.63); setButtonPressed('UP'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="absolute top-0 left-7 w-6 h-7 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-t-sm cursor-pointer"
                      title="Haut (Do)"
                    />
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(329.63); setButtonPressed('RIGHT'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="absolute top-7 right-0 w-7 h-6 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-r-sm cursor-pointer"
                      title="Droite (Mi)"
                    />
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(293.66); setButtonPressed('DOWN'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="absolute bottom-0 left-7 w-6 h-7 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-b-sm cursor-pointer"
                      title="Bas (Ré)"
                    />
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(349.23); setButtonPressed('LEFT'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="absolute top-7 left-0 w-7 h-6 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-l-sm cursor-pointer"
                      title="Gauche (Fa)"
                    />
                    <div className="absolute top-7 left-7 w-6 h-6 bg-zinc-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                    </div>
                  </div>

                  {/* Feedback display */}
                  <div className="font-mono text-xs text-zinc-400 text-center">
                    <span className="text-emerald-400">INPUT:</span> {buttonPressed || 'READY'}
                  </div>

                  {/* A, B, C Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(523.25); setButtonPressed('A'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 font-mono font-bold text-xs shadow-md transition-transform cursor-pointer"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(659.25); setButtonPressed('B'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-90 font-mono font-bold text-xs shadow-md transition-transform cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => { dioramaAudio.play8BitBeep(783.99); setButtonPressed('C'); }}
                      onMouseUp={() => setButtonPressed(null)}
                      className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 font-mono font-bold text-xs shadow-md transition-transform cursor-pointer"
                    >
                      C
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MANGA VOLUME 01 */}
          {activeItem === 'manga' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Manga Shonen • Volume 01
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">ELIOT LAB // CHAPTER INDEX</p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-500/5 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <span>CHAPITRES DISPONIBLES</span>
                  <span>TOME 01</span>
                </div>
                <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-sm">
                  <div className="py-2 flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Chapitre 1 : L'Éveil du Creative Dev</span>
                    <span className="font-mono text-xs text-zinc-400">Three.js / WebGL</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Chapitre 2 : La Forteresse React 19</span>
                    <span className="font-mono text-xs text-zinc-400">Architecture</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Chapitre 3 : L'Art du Shading</span>
                    <span className="font-mono text-xs text-zinc-400">GLSL / Post-FX</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dioramaAudio.playPageFlip()}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-mono text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tourner la page</span>
                <span className="text-[10px] text-zinc-400">(Bruit de papier 3D)</span>
              </button>
            </div>
          )}

          {/* 3. JAPANESE RAMUNE SODA */}
          {activeItem === 'drink' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Canette de Ramune Soda (ラムネ)
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">SAVEUR ORIGINALE // TOKYO REFRESH</p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Boisson gazeuse japonaise culte avec sa bille de verre scellée au goulot. Compagnon indispensable des nuits de code et des sessions gaming rétro.
              </p>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-3">
                  <span className="text-zinc-400 block mb-1">BOOST D'ÉNERGIE</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">+250% Créativité</span>
                </div>
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-3">
                  <span className="text-zinc-400 block mb-1">DISPONIBILITÉ</span>
                  <span className="font-bold text-cyan-500">Fraîche du frigo</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. WALL POSTERS */}
          {activeItem === 'posters' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                  <Image className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Collection de Posters Rétro
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">MUR OTAKU // ORIENTATION 100% CORRIGÉE</p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Toutes les affiches murales de la chambre ont été restaurées avec leurs typographies japonaises et anglaises parfaitement orientées et lisibles :
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  🍜 <span className="font-bold">RAMEN YA</span> (Tokyo 1994)
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  🦔 <span className="font-bold">SEGA SONIC</span> (Mega Drive)
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  🍙 <span className="font-bold">ONIGIRI</span> (Kome Art)
                </div>
                <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  ☕ <span className="font-bold">CUP NOODLE</span> (Akihabara)
                </div>
              </div>
            </div>
          )}

          {/* 5. VINTAGE CRT TV */}
          {activeItem === 'tv' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Tv className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Téléviseur CRT Rétro Sony Trinitron
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">TUBES CATHODIQUES // 50/60 HZ</p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Écran phosphore vert avec scanlines d'époque et texture dynamique. Clique sur les canaux ci-dessous pour zapper en direct :
              </p>

              <div className="flex gap-2">
                {['Canal 1 (Feeling)', 'Canal 2 (Eliot Lab)', 'Canal 3 (Start)', 'Canal 4 (Matrix)'].map((ch, i) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setSelectedChannel(i);
                      dioramaAudio.playCrtZap();
                    }}
                    className={`flex-1 py-2 px-1 text-center font-mono text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      selectedChannel === i
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    CH-0{i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. MINI-FRIDGE */}
          {activeItem === 'fridge' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-urbanist text-xl font-bold text-zinc-900 dark:text-white">
                    Mini-Réfrigérateur Compact
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">STOCKAGE FRAIS // OTAKU SURVIVAL</p>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900 text-zinc-300 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                  <span>CONTENU DU FRIGO</span>
                  <span>TEMP: 3.5°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• 3x Ramune Soda Melon & Original</span>
                  <span className="text-zinc-500">Frais</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• 2x Pocky Matcha Tea</span>
                  <span className="text-zinc-500">Crispy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• 1x Bouteille d'Eau Pure Mont Fuji</span>
                  <span className="text-zinc-500">Glacée</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
