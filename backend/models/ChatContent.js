const mongoose = require('mongoose');

const ChatContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    index: true
  }
}, { timestamps: true });

ChatContentSchema.index({ languageId: 1, status: 1 });
ChatContentSchema.index({ language: 1, status: 1 });

module.exports = mongoose.model('ChatContent', ChatContentSchema);
