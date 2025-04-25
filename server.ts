import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { validUrls } from './s-valid-paths';
import fs from 'node:fs';

export function app(): express.Express {
  const custom404Html = fs.readFileSync('./404.html', 'utf-8');
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files (assets) from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // Handle all other routes with SSR
  server.get('*', (req, res) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Early 404 detection for unknown URLs
    if (!isValidUrl(originalUrl)) {
      res.status(404).send(custom404Html);
      return;
    }

    commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
      .then((html) => {
        // After SSR, check if it's the 404 page
        if (originalUrl.includes('/404') || html.includes('<app-not-found') || html.includes('class="not-found-page"')) {
          res.status(404);
        }
        res.send(html);
      })
      .catch((err) => {
        console.error('Error during server-side rendering:', err);
        res.status(500).send('Internal Server Error');
      });
  });

  return server;
}

// URL Validation Function
function isValidUrl(url: string): boolean {
  const cleanUrl = url.split('?')[0]; // Remove query parameters

  // Allow static assets
  if (cleanUrl.match(/\\.[a-zA-Z0-9]+$/)) {
    return true;
  }

  // Check if the URL is an exact match
  if (validUrls.includes(cleanUrl)) {
    return true;
  }

  // No match = invalid URL
  return false;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
