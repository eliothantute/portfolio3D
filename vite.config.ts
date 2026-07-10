import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const SOUNDCLOUD_TRACK_URL = 'https://soundcloud.com/zedenmusic/four-walls-zeden-remix';
const SOUNDCLOUD_CLIENT_ID = 'lmRjTI0FqeXygHMXc3hRzS7hth20PNk5';

const resolveSoundCloudStreamUrl = async () => {
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
    throw new Error('NO_TRANSCODINGS');
  }

  const preferred =
    transcodings.find((item) => item?.format?.protocol === 'progressive') || transcodings[0];

  if (!preferred?.url) {
    throw new Error('NO_TRANSCODING_URL');
  }

  const streamResponse = await fetch(`${preferred.url}?client_id=${SOUNDCLOUD_CLIENT_ID}`);
  if (!streamResponse.ok) {
    throw new Error('STREAM_LOOKUP_FAILED');
  }

  const streamData = (await streamResponse.json()) as {url?: string};
  if (!streamData.url) {
    throw new Error('SIGNED_URL_MISSING');
  }

  return streamData.url;
};

const soundCloudProxyPlugin = () => {
  const handler = async (_req: unknown, res: any) => {
    try {
      const url = await resolveSoundCloudStreamUrl();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({url}));
    } catch {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({error: 'SOUNDCLOUD_STREAM_UNAVAILABLE'}));
    }
  };

  return {
    name: 'soundcloud-stream-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/soundcloud/stream-url', handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/soundcloud/stream-url', handler);
    },
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), soundCloudProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
