const { Schema, model } = require('mongoose')

const songSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    duetWithHost: { type: Boolean, default: false },
  },
  { _id: false }
)

const karaokeSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    singers: { type: String, required: true, trim: true },
    songs: {
      type: [songSchema],
      validate: {
        validator: (songs) => songs.length >= 1 && songs.length <= 2,
        message: 'Debes proponer entre 1 y 2 canciones.',
      },
    },
  },
  { timestamps: true }
)

module.exports = model('Karaoke', karaokeSchema, 'karaoke')
