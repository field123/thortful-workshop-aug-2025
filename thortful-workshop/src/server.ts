import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * Enhanced to pass cookies to the Angular SSR application
 */
app.use((req, res, next) => {
  // Parse cookies from request headers
  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookies(cookieHeader);
  
  angularApp
    .handle(req, {
      server: {
        // Pass cookies to Angular's DI system
        providers: [
          {
            provide: 'SERVER_REQUEST_COOKIES',
            useValue: cookies
          }
        ]
      }
    })
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch(next);
});

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieString: string): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  
  if (!cookieString) {
    return cookies;
  }

  const pairs = cookieString.split(';');
  
  for (let pair of pairs) {
    pair = pair.trim();
    const [name, value] = pair.split('=');
    
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 * if not in production mode.
 */
if (isMainModule(import.meta.url) && process.env['NODE_ENV'] !== "production") {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

/**
 * Export the Express app for Vercel
 */
export { app };