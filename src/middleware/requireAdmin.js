const crypto = require('crypto')

function hasValidAdminKey(req) {
  const expected = process.env.ADMIN_KEY
  if (!expected) return false

  const provided = Buffer.from(req.get('x-admin-key') || '')
  const wanted = Buffer.from(expected)
  return provided.length === wanted.length && crypto.timingSafeEqual(provided, wanted)
}

// Protege operaciones de administración con la clave ADMIN_KEY enviada en la cabecera x-admin-key.
function requireAdmin(req, res, next) {
  if (!process.env.ADMIN_KEY) {
    return res.status(503).json({ message: 'Operación deshabilitada: falta ADMIN_KEY en el servidor.' })
  }

  if (!hasValidAdminKey(req)) return res.status(401).json({ message: 'Clave de administrador incorrecta.' })
  next()
}

module.exports = requireAdmin
module.exports.hasValidAdminKey = hasValidAdminKey
