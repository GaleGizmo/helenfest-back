const crypto = require('crypto')

// Protege operaciones de administración con la clave ADMIN_KEY enviada en la cabecera x-admin-key.
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_KEY
  if (!expected) {
    return res.status(503).json({ message: 'Operación deshabilitada: falta ADMIN_KEY en el servidor.' })
  }

  const provided = Buffer.from(req.get('x-admin-key') || '')
  const wanted = Buffer.from(expected)
  const isValid = provided.length === wanted.length && crypto.timingSafeEqual(provided, wanted)

  if (!isValid) return res.status(401).json({ message: 'Clave de administrador incorrecta.' })
  next()
}

module.exports = requireAdmin
