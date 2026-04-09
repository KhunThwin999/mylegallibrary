import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  // Explicitly serve sitemap.xml and robots.txt with correct MIME types
  app.get('/sitemap.xml', (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    const filePath = path.join(process.cwd(), isProd ? 'dist' : 'public', 'sitemap.xml');
    if (fs.existsSync(filePath)) {
      res.header('Content-Type', 'application/xml');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Sitemap not found');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    const filePath = path.join(process.cwd(), isProd ? 'dist' : 'public', 'robots.txt');
    if (fs.existsSync(filePath)) {
      res.header('Content-Type', 'text/plain');
      res.sendFile(filePath);
    } else {
      res.status(404).send('Robots.txt not found');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
