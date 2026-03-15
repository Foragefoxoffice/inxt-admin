const mongoose = require('mongoose');

const chatbotSettingsSchema = new mongoose.Schema({
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactWebsite: { type: String, default: '' },
  contactLabel: { type: String, default: 'Contact Us' },
}, { timestamps: true });

module.exports = mongoose.model('ChatbotSettings', chatbotSettingsSchema);
