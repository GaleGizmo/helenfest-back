const Karaoke = require('./model')
const { buildKaraokeHtml } = require('../../services/responseForUser')

async function createKaraoke(req, res) {
  try {
    const { email, singers, songs } = req.body

    if (!email || !singers || !Array.isArray(songs) || songs.length < 1 || songs.length > 2) {
      return res.status(400).json({
        message: 'email, singers y entre 1 y 2 canciones son obligatorios.',
      })
    }

    if (songs.some((song) => !song.title)) {
      return res.status(400).json({ message: 'Cada canción necesita al menos un título.' })
    }

    const entry = await Karaoke.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email, singers, songs },
      { new: true, upsert: true, runValidators: true }
    )
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar tus canciones.', error: error.message })
  }
}

async function getKaraokeByEmail(req, res) {
  try {
    const entry = await Karaoke.findOne({ email: req.params.email.toLowerCase() })
    if (!entry) {
      return res.status(404).json({ message: 'Todavía no has propuesto ninguna canción.' })
    }
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar tus canciones.', error: error.message })
  }
}

async function getAllKaraoke(req, res) {
  try {
    const entries = await Karaoke.find()
    const formattedEntries = entries.map(entry => ({
      email: entry.email,
      cantantes: entry.singers,
      canciones: (entry.songs || []).map(song => ({
        titulo: song.title,
        enlace: song.link,
        ...(song.duetWithHost ? { "con Helenita": "sipii" } : {"con Helenita": "¿con quién?"})
      }))
    }))
    res.send(buildKaraokeHtml(formattedEntries))
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar todas las canciones.', error: error.message })
  }
}

module.exports = { createKaraoke, getKaraokeByEmail, getAllKaraoke }
