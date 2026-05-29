import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'node:https'

export default defineConfig({
  base: '/diapason/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generic-proxy',
      configureServer(server) {
        server.middlewares.use('/proxy', (req, res) => {
          const match = req.url?.match(/^\/([^/:]+)(?::(\d+))?(\/[^?]*)(\?.*)?$/)
          if (!match) {
            res.statusCode = 400
            res.end('Invalid proxy URL')
            return
          }

          const [, hostname, port, pathname, search = ''] = match
          const options = {
            hostname,
            port: port ? Number(port) : 443,
            path: `${pathname}${search}`,
            method: req.method,
          }

          const request = https.request(options, (response) => {
            if (response.headers['content-type']) {
              res.setHeader('Content-Type', response.headers['content-type'])
            }
            res.statusCode = response.statusCode ?? 200
            response.pipe(res)
          })

          request.on('error', () => {
            res.statusCode = 502
            res.end('Proxy error')
          })
          // Forward the incoming request body (e.g. POST JSON payloads); for
          // bodyless requests this ends the upstream request immediately.
          req.pipe(request)
        })
      },
    },
  ],
})
