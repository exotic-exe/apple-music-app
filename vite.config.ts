import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import resolveHandler from './api/resolve.ts';

function resolveApiPlugin() {
  const middleware = async (req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/resolve')) {
      try {
        await resolveHandler(req, res);
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    next();
  };

  return {
    name: 'resolve-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    resolveApiPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
