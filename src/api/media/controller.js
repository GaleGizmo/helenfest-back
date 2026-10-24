const fs = require('fs/promises')
const path = require('path')
const mongoose = require('mongoose')
const Guest = require('../guest/model')
const Media = require('./model')
const { isAdminEmail } = require('../../config/admin')
const { hasValidAdminKey } = require('../../middleware/requireAdmin')
const { MAX_IMAGE_BYTES, uploadsDir } = require('./upload')

function removeFiles(files) {
  return Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})))
}

function removeStoredFiles(items) {
  return Promise.all(
    items.map((item) => fs.unlink(path.join(uploadsDir, path.basename(item.filename))).catch(() => {}))
  )
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
    const viewer = String(req.query.email || '').trim().toLowerCase()
    const canDeleteAll = isAdminEmail(viewer)
    const items = await Media.find().sort({ createdAt: -1 }).limit(200).lean()

    // El email de quien sube no se publica; solo se indica si el visitante puede borrar cada archivo.
    res.json(
      items.map(({ email, ...item }) => ({
        ...item,
        canDelete: canDeleteAll || (viewer !== '' && email === viewer),
      }))
    )
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la galería.', error: error.message })
  }
}

async function deleteMedia(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'El id no es válido.' })
    }

    const item = await Media.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'No existe ningún archivo con ese id.' })

    const user = String(req.get('x-user-email') || '').trim().toLowerCase()
    const isOwner = user !== '' && user === item.email
    if (!hasValidAdminKey(req) && !isOwner && !isAdminEmail(user)) {
      return res.status(403).json({ message: 'Solo puedes borrar los archivos que has subido tú.' })
    }

    await Media.deleteOne({ _id: item._id })
    await removeStoredFiles([item])
    res.json({ deleted: 1, filename: item.filename })
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar el archivo.', error: error.message })
  }
}

async function deleteMediaByEmail(req, res) {
  try {
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ message: 'Hace falta el parámetro ?email=.' })

    const items = await Media.find({ email })
    await Media.deleteMany({ email })
    await removeStoredFiles(items)

    res.json({ deleted: items.length, email })
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar los archivos.', error: error.message })
  }
}

module.exports = { uploadMedia, getMedia, deleteMedia, deleteMediaByEmail }
