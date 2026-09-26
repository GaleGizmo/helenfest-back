const Guest = require('./model')

async function createGuest(req, res) {
  try {
    const { email, name, companionName, hasChild, dish } = req.body

    if (!email || !name || typeof hasChild !== 'boolean') {
      return res.status(400).json({
        message: 'email, name y hasChild son obligatorios (hasChild debe ser booleano).',
      })
    }

    const guest = await Guest.create({ email, name, companionName, hasChild, dish })
    res.status(201).json(guest)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ya existe un invitado registrado con ese email.' })
    }
    res.status(500).json({ message: 'Error al registrar al invitado.', error: error.message })
  }
}

async function getGuests(req, res) {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 })
    res.json(guests)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los invitados.', error: error.message })
  }
}

async function getGuestByEmail(req, res) {
  try {
    const guest = await Guest.findOne({ email: req.params.email.toLowerCase() })
    if (!guest) {
      return res.status(404).json({ message: 'No hay ningún invitado registrado con ese email.' })
    }
    res.json(guest)
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar al invitado.', error: error.message })
  }
}

module.exports = { createGuest, getGuests, getGuestByEmail }
