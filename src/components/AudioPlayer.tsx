import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

const SOUNDCLOUD_TRACK_URL = 'https://soundcloud.com/zedenmusic/four-walls-zeden-remix';
const SOUNDCLOUD_CLIENT_ID = 'lmRjTI0FqeXygHMXc3hRzS7hth20PNk5';

interface AudioPlayerProps {
  isMuted: boolean;
  toggleAudio: () => void;
  lang: Language;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  onHoverItem?: (text: string) => void;
  onLeaveItem?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isMuted,
  toggleAudio,
  lang,
  analyserRef,
  onHoverItem,
  onLeaveItem,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>([20, 45, 80, 30, 60, 90, 50, 70, 40, 85, 25, 65]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const trackName = 'ZEDEN // FOUR_WALLS_REMIX';
  const barCount = 12;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resolveViaProxy = async (): Promise<string> => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const proxyCandidates = ['/api/soundcloud/stream-url', `${baseUrl}/api/soundcloud/stream-url`];

    for (const endpoint of proxyCandidates) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as {url?: string};
        if (payload.url) {
          return payload.url;
        }
      } catch {
        // Ignore and continue to next endpoint/fallback strategy.
      }
    }

    throw new Error('SOUNDCLOUD_PROXY_UNAVAILABLE');
  };

  const resolveDirectFromSoundCloud = async (): Promise<string> => {
    const resolveEndpoint = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(
      SOUNDCLOUD_TRACK_URL,
    )}&client_id=${SOUNDCLOUD_CLIENT_ID}`;

    const resolveResponse = await fetch(resolveEndpoint);
    if (!resolveResponse.ok) {
      throw new Error('SOUNDCLOUD_RESOLVE_FAILED');
    }

    const track = (await resolveResponse.json()) as {
      media?: {
        transcodings?: Array<{format?: {protocol?: string}; url?: string}>;
      };
    };

    const transcodings = track.media?.transcodings;
    if (!transcodings?.length) {
      throw new Error('SOUNDCLOUD_TRANSCODING_MISSING');
    }

    const preferred =
      transcodings.find((item) => item?.format?.protocol === 'progressive') || transcodings[0];

    if (!preferred?.url) {
      throw new Error('SOUNDCLOUD_TRANSCODING_URL_MISSING');
    }

    const streamResponse = await fetch(`${preferred.url}?client_id=${SOUNDCLOUD_CLIENT_ID}`);
    if (!streamResponse.ok) {
      throw new Error('SOUNDCLOUD_STREAM_LOOKUP_FAILED');
    }

    const streamData = (await streamResponse.json()) as {url?: string};
    if (!streamData.url) {
      throw new Error('SOUNDCLOUD_STREAM_UNAVAILABLE');
    }

    return streamData.url;
  };

  const resolveSoundCloudStream = async (): Promise<string> => {
    try {
      return await resolveViaProxy();
    } catch {
      return resolveDirectFromSoundCloud();
    }
  };

  const ensureAudioGraph = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src) {
      const streamUrl = await resolveSoundCloudStream();
      audio.src = streamUrl;
      audio.load();
      setStreamReady(true);
      setStreamError(null);
    }

    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;

      source.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      sourceNodeRef.current = source;
      analyserNodeRef.current = analyser;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
      setStreamReady(false);
      setStreamError(lang === 'fr' ? 'Flux SoundCloud indisponible.' : 'SoundCloud stream unavailable.');
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onDurationChange = () => setDuration(audio.duration || 0);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
    };
  }, [lang]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const animateBars = () => {
      const analyser = analyserNodeRef.current;
      const data = dataArrayRef.current;

      if (!analyser || !data || !isPlaying) {
        setBars((prev) => prev.map((value) => Math.max(14, Math.floor(value * 0.92))));
      } else {
        analyser.getByteFrequencyData(data);
        setBars((prev) =>
          prev.map((value, index) => {
            const start = Math.floor((index / barCount) * data.length * 0.42);
            const end = Math.max(start + 1, Math.floor(((index + 1) / barCount) * data.length * 0.42));
            let sum = 0;
            for (let i = start; i < end; i += 1) {
              sum += data[i];
            }
            const avg = sum / (end - start);
            const next = Math.max(14, Math.min(100, Math.round((avg / 255) * 100)));
            return Math.round(value * 0.65 + next * 0.35);
          })
        );
      }

      animationFrameRef.current = requestAnimationFrame(animateBars);
    };

    animationFrameRef.current = requestAnimationFrame(animateBars);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      analyserRef.current = null;
      if (analyserNodeRef.current) {
        analyserNodeRef.current.disconnect();
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, [analyserRef]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isMuted) {
        toggleAudio();
      }

      await ensureAudioGraph();

      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setIsPlaying(false);
      setStreamError(
        lang === 'fr'
          ? 'Impossible de charger le stream SoundCloud. Ouvrez le lien direct.'
          : 'Unable to load the SoundCloud stream. Open the direct link.'
      );
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;

    const capped = Math.max(0, Math.min(value, duration || 0));
    audio.currentTime = capped;
    setCurrentTime(capped);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      onMouseEnter={() => onHoverItem?.('PLAY')}
      onMouseLeave={onLeaveItem}
      className={`fixed bottom-8 left-8 z-40 transition-all duration-500 rounded-2xl border border-white/15 bg-[#0a0a0a]/90 backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
        expanded ? 'w-80 p-5' : 'w-auto p-3 sm:p-4'
      }`}
    >
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-[#ff571a] text-black shadow-[0_0_20px_rgba(255,87,26,0.8)] scale-105'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
        >
          <span className="text-xs font-mono font-bold">{isPlaying ? '■' : '▶'}</span>
        </button>

        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-end gap-[3px] h-6 cursor-pointer select-none px-1"
        >
          {bars.map((height, i) => (
            <span
              key={i}
              className="w-1 rounded-t transition-all duration-100 ease-out"
              style={{
                height: isPlaying ? `${height}%` : '20%',
                backgroundColor: isPlaying ? (i % 3 === 0 ? '#ff571a' : '#ffffff') : '#444444',
                opacity: isPlaying ? 0.9 : 0.4,
              }}
            />
          ))}
        </div>

        <div
          onClick={() => setExpanded(!expanded)}
          className="hidden sm:flex flex-col cursor-pointer select-none max-w-[140px]"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#ff571a] font-bold">
            {isPlaying ? '● LIVE_SIGNAL' : streamReady ? 'AUDIO_STANDBY' : 'STREAM_LOAD'}
          </span>
          <span className="font-mono text-[10px] text-white/80 truncate font-medium">{trackName}</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/40 hover:text-white transition-colors ml-auto text-xs"
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.05}
          value={Math.min(currentTime, duration || currentTime)}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="w-full cursor-pointer accent-[#ff571a]"
          aria-label={lang === 'fr' ? 'Avancer dans la piste' : 'Seek audio track'}
        />
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 font-mono text-xs animate-fadeIn">
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.05}
              value={Math.min(currentTime, duration || currentTime)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#ff571a]"
              aria-label={lang === 'fr' ? 'Avancer dans la piste' : 'Seek audio track'}
            />
            <div className="flex justify-between text-[10px] text-white/65">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#ff571a] transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-white/60">
            <span>SOUND_LAB // ZEDEN</span>
            <span>44.1 kHz</span>
          </div>

          <p className="text-[11px] text-white/70 font-light leading-relaxed">
            {lang === 'fr'
              ? 'Lecture directe SoundCloud (stream API) avec analyse fréquentielle temps réel pour la sphère 3D.'
              : 'Direct SoundCloud playback (stream API) with real-time frequency analysis for the 3D sphere.'}
          </p>

          {streamError && (
            <p className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1">
              {streamError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <a
              href="https://open.spotify.com/intl-fr/artist/77sTx1uwPp7N9KlNPPGH49"
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center py-2 rounded text-[10px] uppercase font-bold hover:bg-emerald-500 hover:text-black transition-all"
            >
              Spotify ↗
            </a>

            <a
              href={SOUNDCLOUD_TRACK_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-[#ff571a]/10 border border-[#ff571a]/30 text-[#ff571a] text-center py-2 rounded text-[10px] uppercase font-bold hover:bg-[#ff571a] hover:text-black transition-all"
            >
              SoundCloud ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
