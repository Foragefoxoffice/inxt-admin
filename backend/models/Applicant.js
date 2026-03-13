const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add applicant name'], trim: true },
  email: { type: String, required: [true, 'Please add an email'], lowercase: true },
  phone: String,
  resume: String, // URL/path to uploaded resume
  coverLetter: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
    required: true
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    default: 'new'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Applicant', ApplicantSchema);
