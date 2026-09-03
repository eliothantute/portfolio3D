import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

const SOUNDCLOUD_TRACK_URL = 'https://soundcloud.com/zedenmusic/four-walls-zeden-remix';
const SOUNDCLOUD_CLIENT_ID = 'lmRjTI0FqeXygHMXc3hRzS7hth20PNk5';
const LOCAL_FALLBACK_AUDIO = '/audio/berlin.mp3';

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

  const trackName = 'ZEDEN // BERLIN';
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
      try {
        return await resolveDirectFromSoundCloud();
      } catch {
        return `${import.meta.env.BASE_URL || '/'}${LOCAL_FALLBACK_AUDIO.replace(/^\//, '')}`;
      }
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
      analyser.smoothingTimeConstant = 0.94;

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
            return Math.round(value * 0.82 + next * 0.18);
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
      onMouseEnter={() => onHoverItem?.(isPlaying ? 'PAUSE' : 'PLAY')}
      onMouseLeave={onLeaveItem}
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:shadow-md"
    >
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />

      {/* Mini Play / Pause Button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-white transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
      >
        <span className="text-[9px] leading-none ml-0.5">{isPlaying ? '❚❚' : '▶'}</span>
      </button>

      {/* Mini Equalizer Animated Bars */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label="Toggle Audio"
        className="flex items-end gap-[2px] h-3 cursor-pointer select-none px-0.5 border-none bg-transparent"
      >
        {bars.slice(0, 4).map((height, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full transition-all duration-100 ease-out"
            style={{
              height: isPlaying ? `${Math.max(25, height)}%` : '25%',
              backgroundColor: isPlaying ? '#0066ff' : '#d4d4d8',
            }}
          />
        ))}
      </button>

      {/* Discrete Track Title & Source Link */}
      <a
        href={SOUNDCLOUD_TRACK_URL}
        target="_blank"
        rel="noreferrer"
        title="Écouter sur SoundCloud ↗"
        className="font-mono text-[10px] font-semibold tracking-wider text-zinc-700 hover:text-blue-600 transition-colors select-none"
      >
        {isPlaying ? 'ZEDEN' : 'AUDIO'}
      </a>
    </div>
  );
};
