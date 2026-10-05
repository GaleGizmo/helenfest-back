const { Router } = require('express')
const { createGuest, getGuests, getGuestByEmail, deleteGuestByEmail, getAllDishesByUser } = require('./controller')

const router = Router()

router.post('/', createGuest)
router.get('/', getGuests)
router.get('/getGuest/:email', getGuestByEmail)
router.get('/dishes', getAllDishesByUser)
router.delete('/deleteGuest/:email', deleteGuestByEmail)

module.exports = router
