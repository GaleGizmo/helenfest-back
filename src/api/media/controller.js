const fs = require('fs/promises')
const Guest = require('../guest/model')
const Media = require('./model')
const { MAX_IMAGE_BYTES } = require('./upload')

function removeFiles(files) {
  return Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})))
}

async function uploadMedia(req, res) {
  const files = req.files || []

  try {
    const email = (req.body.email || '').trim().toLowerCase()

    if (!email || files.length === 0) {
      await removeFiles(files)
      return res.status(400).json({ message: 'Hace falta tu email y al menos un archivo.' })
    }

    const guest = await Guest.findOne({ email })
    if (!guest) {
      await removeFiles(files)
      return res.status(403).json({ message: 'Solo los invitados registrados pueden subir archivos.' })
    }

    const oversizedImage = files.find(
      (file) => file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_BYTES
    )
    if (oversizedImage) {
      await removeFiles(files)
      return res.status(413).json({
        message: `Las fotos no pueden superar los ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      })
    }

    const docs = await Media.insertMany(
      files.map((file) => ({
        email,
        uploaderName: guest.name,
        filename: file.filename,
        kind: file.mimetype.startsWith('video/') ? 'video' : 'image',
        mimeType: file.mimetype,
        size: file.size,
      }))
    )

    res.status(201).json(docs)
  } catch (error) {
    await removeFiles(files)
    res.status(500).json({ message: 'Error al guardar los archivos.', error: error.message })
  }
}

async function getMedia(req, res) {
  try {
    const items = await Media.find().sort({ createdAt: -1 }).limit(200)
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la galería.', error: error.message })
  }
}

module.exports = { uploadMedia, getMedia }
