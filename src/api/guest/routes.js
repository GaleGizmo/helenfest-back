const { Router } = require('express')
const { createGuest, getGuests, getGuestByEmail } = require('./controller')

const router = Router()

router.post('/', createGuest)
router.get('/', getGuests)
router.get('/:email', getGuestByEmail)

module.exports = router
