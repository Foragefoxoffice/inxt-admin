const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a job title'], trim: true },
  slug: { type: String, required: true, unique: true },
  department: { type: String, required: [true, 'Please add a department'] },
  location: String,
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'remote'], default: 'full-time' },
  experience: String,
  salary: String,
  description: { type: String, required: [true, 'Please add a job description'] },
  requirements: [String],
  benefits: [String],
  status: { type: String, enum: ['open', 'closed', 'draft'], default: 'open' },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Career', CareerSchema);
