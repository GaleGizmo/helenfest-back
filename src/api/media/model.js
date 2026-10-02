const { Schema, model } = require('mongoose')

const mediaSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    uploaderName: { type: String, required: true, trim: true },
    filename: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['image', 'video'], required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
)

module.exports = model('Media', mediaSchema, 'multimedia')
