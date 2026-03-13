const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a language name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a language code (e.g. EN)'],
    unique: true,
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Language', LanguageSchema);
