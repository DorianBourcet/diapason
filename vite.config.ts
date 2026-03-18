import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'node:https'

export default defineConfig({
  base: '/diapason/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generic-proxy',
      configureServer(server) {
        server.middlewares.use('/proxy', (req, res) => {
          const match = req.url?.match(/^\/([^/]+)(\/.*)$/)
          if (!match) {
            res.statusCode = 400
            res.end('Invalid proxy URL')
            return
          }

          const [, domain, path] = match
          const options = {
            hostname: domain,
            path,
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
          }

          const request = https.request(options, (response) => {
            res.setHeader('Content-Type', 'application/json')
            response.pipe(res)
          })

          request.on('error', () => {
            res.statusCode = 502
            res.end('Proxy error')
          })
          request.end()
        })
      },
    },
  ],
})
