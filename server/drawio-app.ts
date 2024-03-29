import dnssd from 'dnssd'
import express from 'express'
import morgan from 'morgan'
import path from 'node:path'

interface AppParams {
  port: number
}

export default function createDrawioApp(args: AppParams) {
  const root = '/'

  const ad = new dnssd.Advertisement('_http._tcp', args.port, {
    name: 'Drawio',
    txt: { path: '/.well-known/appspecific/dev.abitti.json' }
  })

  const app = express()
  app.use(morgan('combined'))

  app.use('/.well-known/appspecific/dev.abitti.json', (req, res) => res.json({
    drawio: {
      name: 'Drawio',
      path: `${root}/`,
      filetypes: [
        { glob: '*.drawio' },
        { mime: 'text/xml', glob: '*.drawio.xml' }
      ]
    }
  }))

  const drawio = express.Router()
  drawio.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../index.html')))
  drawio.use('/public', express.static(path.resolve(__dirname, '../drawio/src/main/webapp')))
  app.use(root, drawio)

  const server = app.listen(args.port)
  ad.start()
  server.on('close', () => ad.stop())
  return server
}
