const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a title'], trim: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String, // plain text for search/fallback
  blocks: [{
    _id: false,
    type: {
      type: String,
      enum: ['richText', 'image', 'video', 'quote', 'heading'],
      default: 'richText'
    },
    data: mongoose.Schema.Types.Mixed
  }],
  featuredImage: String,
  eventDate: Date,
  eventLocation: String,
  category: { type: String, enum: ['news', 'event'], default: 'news' },
  tags: [String],
  author: String,
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },

  // ── SEO ──────────────────────────────────────────────
  seoMetaTitle: String,
  seoMetaDescription: String,
  seoKeywords: [String],
  canonicalUrl: String,
  robots: {
    type: String,
    enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'],
    default: 'index,follow'
  },
  structuredData: String,

  // ── Open Graph ───────────────────────────────────────
  ogTitle: String,
  ogDescription: String,
  ogImage: String,

  // ── Twitter Card ─────────────────────────────────────
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'player'],
    default: 'summary_large_image'
  },
  twitterTitle: String,
  twitterDescription: String,
  twitterImage: String,

  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);
