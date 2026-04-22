import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { Resend } from 'resend';

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
  app.use(express.json());
  const port = 3000;

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist/client'), { index: false }));
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

  // Visitor Stats Tracking
  let visitorCount = 0;
  const countFilePath = path.join(process.cwd(), 'visitor-count.txt');
  
  if (fs.existsSync(countFilePath)) {
    try {
      visitorCount = parseInt(fs.readFileSync(countFilePath, 'utf-8')) || 0;
    } catch (e) {
      visitorCount = 0;
    }
  }

  const incrementVisitorCount = () => {
    visitorCount++;
    try {
      fs.writeFileSync(countFilePath, visitorCount.toString());
    } catch (e) {
      console.error('Failed to save visitor count', e);
    }
  };

  app.get('/api/stats', (req, res) => {
    res.json({ visits: visitorCount });
  });

  // Book Request API
  app.post('/api/request-book', async (req, res) => {
    const { name, email: userEmail, bookTitle, details } = req.body;

    if (!bookTitle) {
      return res.status(400).json({ error: 'Book title is required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not set. Using fallback console log.');
      console.log('--- NEW BOOK REQUEST ---');
      console.log('Book:', bookTitle);
      console.log('From:', name || 'Anonymous', `(${userEmail || 'No Email'})`);
      console.log('Details:', details || 'No additional details');
      console.log('------------------------');
      return res.json({ success: true, message: 'Request logged (Service not configured)' });
    }

    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: 'Myanmar Legal Library <onboarding@resend.dev>',
        to: ['findjobe.taunggyi@gmail.com'],
        subject: `New Book Request: ${bookTitle}`,
        html: `
          <h3>New Book Request Recieved</h3>
          <p><strong>Book Title:</strong> ${bookTitle}</p>
          <p><strong>Requested By:</strong> ${name || 'Anonymous'}</p>
          <p><strong>Contact Email:</strong> ${userEmail || 'N/A'}</p>
          <p><strong>Additional Details:</strong></p>
          <p>${details || 'None provided'}</p>
          <hr />
          <p>This message was sent from the Myanmar Legal Library Request System.</p>
        `
      });

      if (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ error: 'Failed to send request' });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

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

      incrementVisitorCount();
      const initialData = { books: initialBooks, visits: visitorCount };
      const { html: appHtml } = await render(url, initialData);

      let html = template.replace(`<!--ssr-outlet-->`, appHtml);
      html = html.replace(`<script id="__INITIAL_DATA__" type="application/json"></script>`, 
                          `<script id="__INITIAL_DATA__" type="application/json">${JSON.stringify(initialData)}</script>`);

      // Dynamic Meta Injection for SEO
      let seoTitle = 'Myanmar Legal Library | Free Myanmar Law Books & Resources (မြန်မာဥပဒေစာကြည့်တိုက်)';
      let seoDesc = 'Myanmar Legal Library: Access a comprehensive collection of Myanmar law books, Constitution of Myanmar, Burma civil & criminal codes, and Supreme Court rulings. Free digital repository for legal practitioners and students.';
      let seoImage = 'https://myanmarlegallibrary.com/og-image.png';
      
      if (url === '/books' || url === '/library') {
        seoTitle = 'Legal Library: Browse Myanmar Law Books & Statutes (စာအုပ်စင်)';
        seoDesc = 'Explore hundreds of Myanmar legal books, foundation codes, and specialized law regulations. Download PDF versions of the Myanmar Penal Code, Civil Law, and Land Law resources.';
      } else if (url.startsWith('/book/')) {
        const bookId = url.split('/book/')[1];
        const book = initialBooks.find((b: any) => b.id === bookId);
        if (book) {
          seoTitle = `${book.title} | Myanmar Legal Book Detail`;
          seoDesc = book.description || `Read and download ${book.title} by ${book.author} (${book.year}). A key resource for Myanmar legal research in ${book.category}.`;
          seoImage = book.cover;
        }
      } else if (url === '/dictionary') {
        seoTitle = 'English-Myanmar Legal Dictionary | Law Terms & Definitions';
        seoDesc = 'Search and translate Myanmar legal terms with our comprehensive English-Myanmar law dictionary. Essential tool for legal translation and academic research.';
      } else if (url === '/latest') {
        seoTitle = 'Latest Legal Updates & New Laws | Myanmar Legal Library';
        seoDesc = 'Stay informed with the newest Myanmar laws, statutory amendments, and legal book arrivals. Monthly updates on Burma\'s evolving legal landscape.';
      } else if (url === '/about') {
        seoTitle = 'About Us: The Myanmar Legal Library Project';
        seoDesc = 'Learn about our mission to provide universal access to Myanmar law and legal information through a centralized digital repository.';
      } else if (url === '/rulings') {
        seoTitle = 'Myanmar Court Rulings & Supreme Court Decisions (တရားစီရင်ထုံးများ)';
        seoDesc = 'Access a database of high court and supreme court rulings in Myanmar. Search court decisions by year and legal category for precedent analysis.';
      } else if (url === '/penal-code') {
        seoTitle = 'Myanmar Penal Code (ရာဇသတ်ကြီး ဥပဒေ) - Myanmar Legal Library';
        seoDesc = 'Access the full Myanmar Penal Code and related criminal law enactments. Read and download digitized legal resources for free. မြန်မာနိုင်ငံ ရာဇသတ်ကြီး ဥပဒေ စာအုပ်များ။';
      } else if (url === '/civil-law') {
        seoTitle = 'Civil Law of Myanmar (တရားမ ဥပဒေ) - Myanmar Legal Library';
        seoDesc = 'Explore comprehensive digitized resources on Myanmar Civil Law, including civil codes and legal procedures. မြန်မာနိုင်ငံ တရားမ ဥပဒေ စာအုပ်များ။';
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fullUrl = `${baseUrl}${url}`;

      html = html.replace(/<title>.*?<\/title>/, `<title>${seoTitle}</title>`);
      html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${seoDesc}">`);
      html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${seoTitle}">`);
      html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${seoDesc}">`);
      html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${seoImage}">`);
      html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/, `<meta property="og:url" content="${fullUrl}">`);

      // Schema.org Structured Data
      let schemaData: any = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Myanmar Legal Library",
        "url": baseUrl,
        "description": "Comprehensive digital repository for Myanmar legal documentation."
      };

      if (url.startsWith('/book/')) {
        const bookId = url.split('/book/')[1];
        const book = initialBooks.find((b: any) => b.id === bookId);
        if (book) {
          schemaData = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": {
              "@type": "Person",
              "name": book.author || "Supreme Court of Myanmar"
            },
            "datePublished": book.year,
            "image": book.cover,
            "description": book.description || seoDesc,
            "genre": book.category,
            "publisher": {
              "@type": "Organization",
              "name": "Myanmar Legal Library"
            }
          };
        }
      } else if (url === '/books' || url === '/library') {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "Library",
          "name": "Myanmar Legal Library - Digital Collection",
          "url": `${baseUrl}${url}`,
          "description": seoDesc,
          "provider": {
            "@type": "Organization",
            "name": "Myanmar Legal Library"
          }
        };
      }

      const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`;
      html = html.replace(`</head>`, `${schemaScript}</head>`);

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
