const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  featuredImage: String,
  content: String, // Plain text for search
  blocks: [{
    _id: false,
    type: { 
      type: String, 
      enum: ['richText', 'image', 'video', 'quote', 'heading'], 
      default: 'richText' 
    },
    data: mongoose.Schema.Types.Mixed
  }],
  category: String,
  tags: [String],
  author: String,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishDate: Date,
  readingTime: Number, // in minutes

  // ── SEO ─────────────────────────────────────────────
  seoMetaTitle: String,
  seoMetaDescription: String,
  seoKeywords: [String],
  canonicalUrl: String,
  robots: {
    type: String,
    enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'],
    default: 'index,follow'
  },
  structuredData: String, // raw JSON-LD string

  // ── Open Graph ────────────────────────────────────────
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  ogType: {
    type: String,
    enum: ['article', 'website', 'product'],
    default: 'article'
  },

  // ── Twitter Card ─────────────────────────────────────
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'player'],
    default: 'summary_large_image'
  },
  twitterTitle: String,
  twitterDescription: String,
  twitterImage: String,

  // ── Sitemap ───────────────────────────────────────────
  sitemapPriority: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.7
  },
  sitemapChangefreq: {
    type: String,
    enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
    default: 'weekly'
  },

  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Webinar', BlogSchema);
