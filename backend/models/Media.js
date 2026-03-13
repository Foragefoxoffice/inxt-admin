const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  url: { type: String, required: true },
  mimetype: String,
  size: Number, // bytes
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', MediaSchema);
