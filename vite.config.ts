import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { IncomingMessage } from "node:http";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

type DevApiRequest = IncomingMessage & {
  body?: string;
};

type DevApiHandler = (
  req: DevApiRequest,
  res: NodeJS.WritableStream & {
    setHeader: (name: string, value: string) => void;
    statusCode: number;
    writableEnded: boolean;
    end: (chunk?: string) => void;
  }
) => Promise<void> | void;

const loadDevApiHandler = async (pathname: string): Promise<DevApiHandler | null> => {
  switch (pathname) {
    case "/games":
      return (await import("./api/games.js")).default;
    case "/invite-lookup":
      return (await import("./api/invite-lookup.js")).default;
    case "/login":
      return (await import("./api/login.js")).default;
    default:
      return null;
  }
};

const readRequestBody = async (req: DevApiRequest) => {
  if (req.method === "GET" || req.method === "HEAD" || req.body !== undefined) {
    return;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  req.body = Buffer.concat(chunks).toString("utf8");
};

const devApiPlugin = (): Plugin => ({
  name: "dev-api-middleware",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res, next) => {
      const pathname = (req.url ?? "").split("?")[0] || "/";
      const handler = await loadDevApiHandler(
        pathname.startsWith("/") ? pathname : `/${pathname}`
      );

      if (!handler) {
        next();
        return;
      }

      try {
        await readRequestBody(req as DevApiRequest);
        await handler(req as DevApiRequest, res);

        if (!res.writableEnded) {
          res.end();
        }
      } catch (error) {
        next(error as Error);
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    devApiPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
      manifest: {
        name: "#THEWORSTBATCHSIGNINGOFF",
        short_name: "WorstBatch",
        description: "Exclusive Batch Party 2026 - The greatest farewell party invitation",
        theme_color: "#0A0A0A",
        background_color: "#0A0A0A",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.pixabay\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "video-cache",
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
