import fs from 'node:fs/promises';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const FUNCTION_ROUTE_PREFIX = '/.netlify/functions/';

function netlifyFunctionsDevPlugin() {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith(FUNCTION_ROUTE_PREFIX)) {
          next();
          return;
        }

        try {
          const requestUrl = new URL(request.url, 'http://127.0.0.1');
          const functionName = requestUrl.pathname.slice(FUNCTION_ROUTE_PREFIX.length).replace(/\/+$/, '');

          if (!functionName) {
            response.statusCode = 404;
            response.end('Function not found.');
            return;
          }

          const modulePath = fileURLToPath(new URL(`./netlify/functions/${functionName}.mjs`, import.meta.url));
          const stats = await fs.stat(modulePath);
          const moduleUrl = `${pathToFileURL(modulePath).href}?t=${stats.mtimeMs}`;
          const loadedModule = await import(moduleUrl);

          if (typeof loadedModule.handler !== 'function') {
            response.statusCode = 500;
            response.end(`Netlify function "${functionName}" does not export a handler.`);
            return;
          }

          const body = await new Promise((resolve, reject) => {
            const chunks = [];

            request.on('data', (chunk) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            request.on('end', () => {
              resolve(chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : '');
            });
            request.on('error', reject);
          });

          const result = await loadedModule.handler({
            httpMethod: request.method || 'GET',
            headers: request.headers,
            body,
            path: requestUrl.pathname,
            rawUrl: requestUrl.toString(),
            queryStringParameters: Object.fromEntries(requestUrl.searchParams.entries()),
            isBase64Encoded: false,
          });

          response.statusCode = result?.statusCode || 200;

          Object.entries(result?.headers || {}).forEach(([key, value]) => {
            if (value !== undefined) {
              response.setHeader(key, value);
            }
          });

          response.end(result?.body || '');
        } catch (error) {
          if (error?.code === 'ENOENT') {
            response.statusCode = 404;
            response.end('Function not found.');
            return;
          }

          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({
            error: error.message || 'Unable to execute local Netlify function.',
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    logLevel: 'error',
    plugins: [react(), netlifyFunctionsDevPlugin()],
    server: {
      host: '0.0.0.0',
    },
    preview: {
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
