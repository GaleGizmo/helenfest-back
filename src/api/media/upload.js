const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

const MAX_FILES = 5
const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const MAX_VIDEO_BYTES = 150 * 1024 * 1024

// La extensión se deduce del mimetype validado, nunca del nombre que envía el cliente.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
}

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../../uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`),
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true)
    cb(new Error('Formato no permitido. Solo JPG, PNG, WebP, MP4, MOV o WebM.'))
  },
})

module.exports = { upload, uploadsDir, MAX_FILES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES }
