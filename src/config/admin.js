// Email con permiso para borrar cualquier archivo; se puede cambiar con ADMIN_EMAIL.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'helenuky_libra@hotmail.com').trim().toLowerCase()

const isAdminEmail = (email) => Boolean(email) && String(email).trim().toLowerCase() === ADMIN_EMAIL

module.exports = { isAdminEmail }
