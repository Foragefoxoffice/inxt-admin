const mongoose = require('mongoose');

const NewsletterIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  featuredImage: String,
  author: String,
  description: String,
  issueDate: {
    type: Date,
    required: [true, 'Please add an issue date']
  },
  documents: [{
    _id: false,
    name: String,      // original filename
    url: String,       // stored path/URL
    size: Number,      // bytes
    mimeType: String
  }],
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft'
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsletterIssue', NewsletterIssueSchema);
