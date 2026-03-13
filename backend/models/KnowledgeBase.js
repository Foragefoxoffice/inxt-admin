const mongoose = require('mongoose');

/**
 * KnowledgeBase stores content + its vector embedding for RAG (Retrieval-Augmented Generation).
 * Each document in this collection is a searchable chunk derived from CMS content.
 *
 * Embedding model: nomic-embed-text (via Ollama) → 768-dimensional float vector
 * Similarity search: cosine similarity computed in application layer
 * (Upgrade path: MongoDB Atlas Vector Search index for large datasets)
 */
const KnowledgeBaseSchema = new mongoose.Schema({
  // ── Source reference ────────────────────────────────────
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  sourceModel: {
    type: String,
    enum: ['Blog', 'News', 'Career', 'ChatContent'],
    required: true,
    index: true
  },

  // ── Searchable content ──────────────────────────────────
  title: { type: String, required: true },
  content: { type: String, required: true }, // plain text, stripped of HTML/blocks

  // ── Multilingual filtering ──────────────────────────────
  language: { type: String, required: true, index: true }, // e.g. "en", "es", "fr"
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    index: true
  },

  // ── Vector embedding ────────────────────────────────────
  // nomic-embed-text produces 768-dim embeddings
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: (v) => v.length === 768,
      message: 'Embedding must be 768-dimensional (nomic-embed-text)'
    }
  },

  // ── Metadata ────────────────────────────────────────────
  embeddedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fast language-filtered search
KnowledgeBaseSchema.index({ sourceId: 1, sourceModel: 1 }, { unique: true });
KnowledgeBaseSchema.index({ language: 1, embeddedAt: -1 });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
