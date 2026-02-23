import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
// import { allowedHosts } from './vite.allowed-hosts.js';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    allowedHosts: [
      'localhost',
      'puls-fizica.vercel.app',
      'puls-fizica.ro',
      '.ngrok-free.app',
      '.ngrok-free.dev'
    ],
    proxy: {
      '/api/webhook': {
        target: 'https://automations.puls-fizica.ro',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/webhook/, '/webhook');
          console.log('Rewriting path:', path, '→', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err.code, err.message);
            if (res && !res.headersSent) {
              res.writeHead(502, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({ 
                error: 'Proxy connection error', 
                message: err.message,
                code: err.code
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('→ Proxy request:', req.method, req.url);
            console.log('  → Target:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('← Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
