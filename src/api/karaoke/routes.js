const { Router } = require('express')
const { createKaraoke, getKaraokeByEmail } = require('./controller')

const router = Router()

router.post('/', createKaraoke)
router.get('/:email', getKaraokeByEmail)

module.exports = router
