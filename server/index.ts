import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { config, describeConfig, ROOT_DIR } from './config';
import { api } from './routes';
import { handleUpgrade } from './realtime';
import { handleStandUpgrade } from './stand/registry';
import { sweepInactivity } from './classroom/manager';

/**
 * Point d'entrée du serveur LeGriot.
 *  - /api/*      API HTTP (classes, leçon, perception, voix, export)
 *  - /ws         temps réel téléphones + console enseignant
 *  - /ws/stand   supports robotisés ESP32
 *  - /           application React (Vite en dev, dist/ en prod)
 */

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '15mb' }));
app.use('/api', api);

const server =
  config.ssl.cert && config.ssl.key
    ? https.createServer({ cert: fs.readFileSync(config.ssl.cert), key: fs.readFileSync(config.ssl.key) }, app)
    : http.createServer(app);

// Nos WebSockets. Le HMR de Vite (protocole « vite-hmr ») garde son propre écouteur d'upgrade.
server.on('upgrade', (req, socket, head) => {
  if (req.headers['sec-websocket-protocol'] === 'vite-hmr') return;
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/ws') return handleUpgrade(req, socket, head);
  if (pathname === '/ws/stand') return handleStandUpgrade(req, socket, head);
  socket.destroy();
});

if (!config.isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: ROOT_DIR,
    server: { middlewareMode: true, ws: { server } },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const dist = path.join(ROOT_DIR, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

setInterval(sweepInactivity, 30_000).unref();

server.listen(config.port, () => {
  const scheme = config.ssl.cert ? 'https' : 'http';
  console.log(`\nLeGriot — serveur ${scheme}://localhost:${config.port}`);
  console.log(describeConfig());
  console.log('');
});
