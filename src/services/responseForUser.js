function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildKaraokeHtml(formattedEntries) {
  const rows = formattedEntries
    .map((entry) => {
      const songs = (entry.canciones || [])
        .map((song) => {
          const details = Object.entries(song.toObject ? song.toObject() : song)
            .filter(([key, val]) => key !== '_id' && val)
            .map(([key, val]) => `${escapeHtml(key)}: ${escapeHtml(val)}`)
            .join(' - ')
          return `<li>${details}</li>`
        })
        .join('')
      return `<tr><td>${escapeHtml(entry.email)}</td><td>${escapeHtml(entry.cantantes)}</td><td><ul>${songs}</ul></td></tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Karaoke</title>
  <style>
    body { font-family: sans-serif; padding: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Canciones de karaoke</h1>
  <table>
    <thead><tr><th>Email</th><th>Cantantes</th><th>Canciones</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

function buildGuestDishesHtml(formattedDishes) {
  const rows = formattedDishes
    .map((dish) => `<tr><td>${escapeHtml(dish.invitado)}</td><td>${escapeHtml(dish.email)}</td><td>${escapeHtml(dish["aportacion culinaria"])}</td></tr>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Platos de los invitados</title>
  <style>
    body { font-family: sans-serif; padding: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Platos de los invitados</h1>
  <table>
    <thead><tr><th>Invitado</th><th>Email</th><th>Aportación culinaria</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

module.exports = { buildKaraokeHtml, buildGuestDishesHtml }

