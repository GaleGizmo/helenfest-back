const { Router } = require('express')
const multer = require('multer')
const { upload, MAX_FILES, MAX_VIDEO_BYTES } = require('./upload')
const { uploadMedia, getMedia, deleteMedia, deleteMediaByEmail } = require('./controller')
const requireAdmin = require('../../middleware/requireAdmin')

const router = Router()

function handleUpload(req, res, next) {
  upload.array('files', MAX_FILES)(req, res, (error) => {
    if (!error) return next()

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: `Los vídeos no pueden superar los ${MAX_VIDEO_BYTES / 1024 / 1024} MB.`,
        })
      }
      return res.status(400).json({ message: `Máximo ${MAX_FILES} archivos por envío.` })
    }

    res.status(400).json({ message: error.message })
  })
}

router.get('/', getMedia)
router.post('/', handleUpload, uploadMedia)
router.delete('/', requireAdmin, deleteMediaByEmail)
router.delete('/:id', requireAdmin, deleteMedia)

module.exports = router
