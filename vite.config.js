import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { forwardTextsToDeepL } from './deepl-server-forward.js';

function deeplTranslateMiddleware(env) {
  return async function deeplApi(req, res, next) {
    const pathname = req.url?.split('?')[0] ?? '';
    if (pathname !== '/api/deepl/translate') {
      return next();
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const texts = body?.texts;
    if (!Array.isArray(texts)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Expected { texts: string[] }' }));
      return;
    }

    const key = String(env.DEEPL_API_KEY || env.VITE_DEEPL_API_KEY || '').trim();
    if (!key) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'DEEPL_KEY_MISSING', message: 'Set DEEPL_API_KEY or VITE_DEEPL_API_KEY in .env' }));
      return;
    }

    try {
      const translated = await forwardTextsToDeepL(texts, key);
      const payload = { translations: translated.map((text) => ({ text })) };
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    } catch (e) {
      res.statusCode = e.status && Number(e.status) >= 400 ? Number(e.status) : 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'DEEPL_ERROR',
          message: e.message || String(e),
        }),
      );
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'deepl-translate-api',
        configureServer(server) {
          server.middlewares.use(deeplTranslateMiddleware(env));
        },
      },
    ],
    server: {
      port: 8000,
      allowedHosts: [
        'localhost',
        'puls-fizica.vercel.app',
        'puls-fizica.ro',
        '.ngrok-free.app',
        '.ngrok-free.dev',
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
