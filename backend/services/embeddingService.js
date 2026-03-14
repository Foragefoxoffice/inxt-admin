/**
 * Embedding Service
 * Automatically generates and upserts vector embeddings into KnowledgeBase
 * whenever CMS content is created or updated.
 *
 * Call this AFTER a successful save — it runs asynchronously so it never
 * blocks the API response.
 */

const KnowledgeBase = require('../models/KnowledgeBase');
const { generateEmbedding, stripHtml, extractTextFromBlocks } = require('./aiProvider');

/**
 * Extract combined plain-text content from a CMS document.
 * Handles both block-based (Blog/News) and string-based (Career) content.
 */
function extractContent(doc, sourceModel) {
  const parts = [];

  if (doc.title) parts.push(doc.title);
  if (doc.excerpt) parts.push(doc.excerpt);

  // Block-based content (Blog, News)
  if (Array.isArray(doc.blocks) && doc.blocks.length > 0) {
    parts.push(extractTextFromBlocks(doc.blocks));
  } else if (doc.content) {
    parts.push(stripHtml(doc.content));
  }

  // Career-specific fields
  if (sourceModel === 'Career') {
    if (doc.department) parts.push(`Department: ${doc.department}`);
    if (doc.location) parts.push(`Location: ${doc.location}`);
    if (doc.type) parts.push(`Type: ${doc.type}`);
    if (Array.isArray(doc.requirements)) parts.push(doc.requirements.join('. '));
    if (Array.isArray(doc.benefits)) parts.push(doc.benefits.join('. '));
  }

  // News-specific fields
  if (sourceModel === 'News') {
    if (doc.eventLocation) parts.push(`Location: ${doc.eventLocation}`);
    if (doc.eventDate) parts.push(`Date: ${new Date(doc.eventDate).toDateString()}`);
  }

  return parts.filter(Boolean).join('\n').trim();
}

/**
 * Embed a CMS document and upsert into KnowledgeBase.
 * Runs asynchronously — errors are logged but never thrown to caller.
 *
 * @param {Object} doc - Mongoose document (Blog, News, Career)
 * @param {string} sourceModel - 'Blog' | 'News' | 'Career'
 * @param {string} languageCode - e.g. 'en', 'es' (from populated languageId)
 */
async function embedDocument(doc, sourceModel, languageCode) {
  try {
    const content = extractContent(doc, sourceModel);
    if (!content || content.length < 20) {
      console.log(`[Embedding] Skipped ${sourceModel}:${doc._id} — content too short`);
      return;
    }

    const embedding = await generateEmbedding(content);

    await KnowledgeBase.findOneAndUpdate(
      { sourceId: doc._id, sourceModel },
      {
        sourceId: doc._id,
        sourceModel,
        title: doc.title,
        content,
        language: (languageCode || 'en').toLowerCase(),
        languageId: doc.languageId,
        embedding,
        embeddedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`[Embedding] ✅ ${sourceModel}:${doc._id} embedded (${embedding.length}d, lang=${languageCode})`);
  } catch (err) {
    // Non-blocking — log and continue. Ollama may be offline.
    console.warn(`[Embedding] ⚠️  Failed to embed ${sourceModel}:${doc._id}:`, err.message);
  }
}

/**
 * Delete the embedding for a deleted CMS document.
 */
async function deleteEmbedding(sourceId, sourceModel) {
  try {
    await KnowledgeBase.deleteOne({ sourceId, sourceModel });
    console.log(`[Embedding] 🗑️  Removed embedding for ${sourceModel}:${sourceId}`);
  } catch (err) {
    console.warn(`[Embedding] Failed to delete embedding:`, err.message);
  }
}

/**
 * Re-embed ALL documents of a given model (bulk reindex).
 * Usage: call from a management endpoint or CLI script.
 *
 * @param {Model} MongooseModel - The Mongoose model (Blog, News, Career)
 * @param {string} sourceModel - 'Blog' | 'News' | 'Career'
 */
async function reindexAll(MongooseModel, sourceModel, statusQuery = { status: 'published' }) {
  console.log(`[Embedding] Starting full reindex for ${sourceModel}...`);
  const docs = await MongooseModel.find(statusQuery).populate('languageId', 'code');
  let success = 0, failed = 0;
  for (const doc of docs) {
    try {
      const lang = doc.languageId?.code || 'en';
      await embedDocument(doc, sourceModel, lang);
      success++;
      // Small delay to avoid overwhelming Ollama
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      failed++;
    }
  }
  console.log(`[Embedding] Reindex ${sourceModel}: ${success} ok, ${failed} failed`);
  return { success, failed };
}

module.exports = { embedDocument, deleteEmbedding, reindexAll };
