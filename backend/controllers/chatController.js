const KnowledgeBase = require('../models/KnowledgeBase');
const { generateEmbedding, generateChatResponse, cosineSimilarity, checkHealth, PROVIDER_NAME } = require('../services/aiProvider');
const { sendSuccess, sendError } = require('../utils/helpers');

// Language name map for the system prompt
const LANGUAGE_NAMES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ar: 'Arabic', hi: 'Hindi', zh: 'Chinese', pt: 'Portuguese',
  it: 'Italian', ru: 'Russian', ja: 'Japanese', ko: 'Korean'
};

/**
 * POST /api/chat
 * Body: { message: string, language: string }
 *
 * Flow:
 * 1. Generate embedding for the user question
 * 2. Fetch all KnowledgeBase docs for the requested language
 * 3. Compute cosine similarity and pick top-k most relevant chunks
 * 4. Build a RAG system prompt with the context
 * 5. Send to Ollama phi3 and return the response
 */
exports.chat = async (req, res) => {
  try {
    const { message, language: rawLang = 'en', topK = 5 } = req.body;
    const language = rawLang.toLowerCase();

    if (!message || message.trim().length === 0) {
      return sendError(res, 'Message is required', 400);
    }

    if (message.trim().length > 1000) {
      return sendError(res, 'Message too long (max 1000 characters)', 400);
    }

    // Step 1: Embed the user question
    let questionEmbedding;
    try {
      questionEmbedding = await generateEmbedding(message.trim());
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: `AI service unavailable. Please check your ${PROVIDER_NAME} connection.`,
        detail: err.message
      });
    }

    // Step 2: Fetch all knowledge base entries for this language
    // For large datasets, replace with MongoDB Atlas $vectorSearch
    const candidates = await KnowledgeBase.find(
      { language },
      { title: 1, content: 1, sourceModel: 1, embedding: 1 }
    ).lean();

    if (candidates.length === 0) {
      // Fallback: try to find any content if no language match
      const anyContent = await KnowledgeBase.countDocuments();
      if (anyContent === 0) {
        return sendSuccess(res, {
          response: "I don't have any knowledge base content yet. Please add some content to the CMS first.",
          sources: [],
          language
        });
      }
      return sendSuccess(res, {
        response: `I don't have content in the requested language (${LANGUAGE_NAMES[language] || language}) yet.`,
        sources: [],
        language
      });
    }

    // Step 3: Compute cosine similarity and separate manual vs CMS content
    const scored = candidates.map((doc) => ({
      ...doc,
      score: cosineSimilarity(questionEmbedding, doc.embedding)
    }));

    const THRESHOLD = 0.3;
    const limit = Math.min(topK, 5);

    // Manual content (ChatContent) has priority over CMS content
    const manualChunks = scored
      .filter((c) => c.sourceModel === 'ChatContent' && c.score > THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const cmsChunks = scored
      .filter((c) => c.sourceModel !== 'ChatContent' && c.score > THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit - manualChunks.length);

    // Combine: manual first, then CMS to fill remaining slots
    const topChunks = [...manualChunks, ...cmsChunks];

    if (topChunks.length === 0) {
      return sendSuccess(res, {
        response: "I couldn't find relevant information in our knowledge base to answer your question.",
        sources: [],
        language
      });
    }

    // Step 4: Build the RAG system prompt — manual content block always comes first
    const langName = LANGUAGE_NAMES[language] || language;

    const manualBlock = manualChunks.length > 0
      ? `=== PRIORITY: Manual Knowledge Base ===\n` +
        manualChunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`).join('\n\n---\n\n')
      : null;

    const cmsBlock = cmsChunks.length > 0
      ? `=== Supporting CMS Content ===\n` +
        cmsChunks.map((c, i) => `[${manualChunks.length + i + 1}] ${c.title}\n${c.content}`).join('\n\n---\n\n')
      : null;

    const contextBlock = [manualBlock, cmsBlock].filter(Boolean).join('\n\n');

    const systemPrompt = `You are a helpful assistant for a website. Your job is to answer user questions ONLY using the information provided in the context below.

RULES:
- Answer ONLY based on the provided context. Do NOT use outside knowledge.
- Respond in ${langName} language regardless of the question language.
- If the answer is not found in the context, say: "I'm sorry, I don't have information about that in our knowledge base."
- Keep answers concise and helpful (2-4 sentences unless more detail is needed).
- Do NOT make up facts, URLs, dates, or names not in the context.
- PRIORITY: Prefer information from "Manual Knowledge Base" over "Supporting CMS Content" when both are present.

CONTEXT:
${contextBlock}`;

    // Step 5: Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateChatResponse(systemPrompt, message.trim());
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: `AI generation failed. Please check your ${PROVIDER_NAME} configuration.`,
        detail: err.message
      });
    }

    // Return the response + source titles for transparency
    sendSuccess(res, {
      response: aiResponse,
      sources: topChunks.map((c) => ({ title: c.title, type: c.sourceModel, score: Math.round(c.score * 100) })),
      language
    });
  } catch (err) {
    console.error('[Chat] Error:', err);
    sendError(res, err.message, 500);
  }
};

/**
 * POST /api/chat/reindex
 * Reindex all published CMS content into the KnowledgeBase.
 * Protected: admin only.
 */
exports.reindex = async (req, res) => {
  try {
    const { reindexAll } = require('../services/embeddingService');
    const Blog = require('../models/Blog');
    const News = require('../models/News');
    const Career = require('../models/Career');
    const WhitePaper = require('../models/WhitePaper');
    const Webinar = require('../models/Webinar');
    const ChatContent = require('../models/ChatContent');

    // Run in background
    res.json({ success: true, message: 'Reindex started in background. Check server logs for progress.' });

    // Fire and forget
    (async () => {
      try {
        await reindexAll(Blog, 'Blog');
        await reindexAll(News, 'News');
        await reindexAll(Career, 'Career');
        await reindexAll(WhitePaper, 'WhitePaper');
        await reindexAll(Webinar, 'Webinar');
        await reindexAll(ChatContent, 'ChatContent', { status: 'active' });
        console.log('[Chat] ✅ Full reindex complete');
      } catch (err) {
        console.error('[Chat] Reindex failed:', err);
      }
    })();
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

/**
 * GET /api/chat/health
 * Check Ollama availability and required model status.
 */
exports.health = async (req, res) => {
  try {
    const health = await checkHealth();
    const kbCount = await KnowledgeBase.countDocuments();
    const langBreakdown = await KnowledgeBase.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    sendSuccess(res, {
      ollama: health, // Kept "ollama" key for frontend compatibility, but value is from active provider
      provider: PROVIDER_NAME,
      knowledgeBase: { total: kbCount, byLanguage: langBreakdown }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

/**
 * GET /api/chat/stats
 * Detailed knowledge base stats broken down by language and source model.
 * Protected: logged-in users.
 */
exports.getStats = async (req, res) => {
  try {
    const health = await checkHealth();
    const kbTotal = await KnowledgeBase.countDocuments();

    // Breakdown by language × sourceModel
    const byLanguageAndModel = await KnowledgeBase.aggregate([
      {
        $group: {
          _id: { language: '$language', sourceModel: '$sourceModel' },
          count: { $sum: 1 },
          lastUpdated: { $max: '$embeddedAt' }
        }
      },
      { $sort: { '_id.language': 1, '_id.sourceModel': 1 } }
    ]);

    // Breakdown by language (total + lastUpdated)
    const byLanguage = await KnowledgeBase.aggregate([
      {
        $group: {
          _id: '$language',
          total: { $sum: 1 },
          lastUpdated: { $max: '$embeddedAt' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    sendSuccess(res, {
      ollama: health,
      provider: PROVIDER_NAME,
      knowledgeBase: { total: kbTotal, byLanguage, byLanguageAndModel }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

/**
 * POST /api/chat/reindex/:model
 * Reindex a specific content type (Blog | News | Career).
 * Protected: admin only.
 */
exports.reindexModel = async (req, res) => {
  try {
    const { model } = req.params;
    const validModels = ['Blog', 'News', 'Career', 'WhitePaper', 'Webinar', 'ChatContent'];

    if (!validModels.includes(model)) {
      return sendError(res, `Invalid model. Must be one of: ${validModels.join(', ')}`, 400);
    }

    const { reindexAll } = require('../services/embeddingService');
    const ModelClass = require(`../models/${model}`);
    // ChatContent uses 'active' status, others use 'published'
    const statusQuery = model === 'ChatContent' ? { status: 'active' } : { status: 'published' };

    res.json({ success: true, message: `Reindex for ${model} started in background.` });

    (async () => {
      try {
        await reindexAll(ModelClass, model, statusQuery);
        console.log(`[Chat] ✅ Reindex for ${model} complete`);
      } catch (err) {
        console.error(`[Chat] Reindex ${model} failed:`, err);
      }
    })();
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
