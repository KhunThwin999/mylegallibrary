import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_SHEET_URL = 'https://opensheet.elk.sh/1HCOpKGKhv_Ggm3r6dtvldqUynv5z6vLy98jjeOSrS4I/Sheet1';

function fixDriveLink(url: string, type: 'preview' | 'download' | 'cover' | 'thumbnail' = 'preview') {
  if (!url) return '';
  const idMatch = url.match(/[-\w]{25,}/);
  const fileId = idMatch ? idMatch[0] : null;
  if (fileId) {
    if (type === 'preview') return `https://drive.google.com/file/d/${fileId}/preview`;
    if (type === 'cover') return `https://lh3.googleusercontent.com/d/${fileId}`;
    if (type === 'thumbnail') return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

async function startServer() {
  const app = express();
  const port = 3000;

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist/client')));
  }

  // Explicitly serve sitemap.xml and robots.txt
  const serveStaticFile = (fileName: string, contentType: string) => (req: any, res: any) => {
    const possiblePaths = [
      path.join(process.cwd(), 'dist/client', fileName),
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

  app.get('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      let template, render;
      if (process.env.NODE_ENV !== 'production') {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        // @ts-ignore
        render = (await import('./dist/server/entry-server.js')).render;
      }

      // Fetch initial data for SEO
      let initialBooks = [];
      try {
        const response = await fetch(GOOGLE_SHEET_URL);
        if (response.ok) {
          const data = await response.json();
          initialBooks = data.map((book: any, index: number) => {
            const id = book.id || String(index + 1);
            let coverUrl = book.cover ? fixDriveLink(book.cover, 'cover') : fixDriveLink(book.read || book.file, 'thumbnail');
            if (!coverUrl || coverUrl === book.cover) {
              if (!book.cover) coverUrl = `https://picsum.photos/seed/${id}/400/600`;
            }
            return {
              ...book,
              id: id,
              read: fixDriveLink(book.read, 'preview'),
              file: fixDriveLink(book.file, 'download'),
              cover: coverUrl,
              featured: String(book.featured).toUpperCase() === 'TRUE'
            };
          });

          // Sort on server to provide a consistent initial view
          initialBooks.sort((a: any, b: any) => a.title.localeCompare(b.title, 'my'));
        }
      } catch (e) {
        console.error('Server-side fetch failed', e);
      }

      const initialData = { books: initialBooks };
      const { html: appHtml } = await render(url, initialData);

      let html = template.replace(`<!--ssr-outlet-->`, appHtml);
      html = html.replace(`<script id="__INITIAL_DATA__" type="application/json"></script>`, 
                          `<script id="__INITIAL_DATA__" type="application/json">${JSON.stringify(initialData)}</script>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production' && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
