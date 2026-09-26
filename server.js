require('dotenv').config()
const express = require('express')
const connectDB = require('./src/config/db')
const guestRoutes = require('./src/api/guest/routes')

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

connectDB()

app.get('/', (req, res) => {
  res.json({
    message: 'Helenfest backend en construcción',
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

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`)
})
