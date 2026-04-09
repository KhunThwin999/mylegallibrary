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
  const serveStaticFile = (fileName: string, contentType: string) => (req: any, res: any) => {
    const possiblePaths = [
      path.join(process.cwd(), 'dist', fileName),
      path.join(process.cwd(), 'public', fileName),
      path.join(process.cwd(), fileName),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        res.header('Content-Type', contentType);
        return res.sendFile(filePath);
      }
    }
    res.status(404).send(`${fileName} not found`);
  };

  app.get('/sitemap.xml', serveStaticFile('sitemap.xml', 'application/xml'));
  app.get('/robots.txt', serveStaticFile('robots.txt', 'text/plain'));

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
