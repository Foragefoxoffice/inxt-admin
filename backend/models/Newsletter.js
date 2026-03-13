const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  name: String,
  designation: String,
  companyName: String,
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: Date
});

// Compound unique: one email per country
NewsletterSchema.index({ email: 1, languageId: 1 }, { unique: true });

module.exports = mongoose.model('Newsletter', NewsletterSchema);
