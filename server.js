require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/config/db')
const guestRoutes = require('./src/api/guest/routes')
const karaokeRoutes = require('./src/api/karaoke/routes')
const mediaRoutes = require('./src/api/media/routes')
const { uploadsDir } = require('./src/api/media/upload')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

connectDB()

app.get('/', (req, res) => {
  res.json({
    message: 'Helenfest backend',
    status: 'ok',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'helenfest-back',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/guests', guestRoutes)
app.use('/api/karaoke', karaokeRoutes)
app.use('/api/media', mediaRoutes)
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
)

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`)
})
