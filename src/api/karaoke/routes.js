const { Router } = require('express')
const { createKaraoke, getKaraokeByEmail, getAllKaraoke } = require('./controller')

const router = Router()

router.post('/', createKaraoke)
router.get('/getUserSongs/:email', getKaraokeByEmail)
router.get('/all', getAllKaraoke)

module.exports = router
