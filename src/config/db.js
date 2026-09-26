const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn('MONGODB_URI no está definida. El backend arrancará sin conexión a MongoDB.')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('Conectado a MongoDB')
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message)
  }
}

module.exports = connectDB
