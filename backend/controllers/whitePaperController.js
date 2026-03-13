const WhitePaper = require('../models/WhitePaper');
const { slugify, paginate, sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

// GET /api/white-papers
exports.getWhitePapers = async (req, res) => {
  try {
    const { languageId, search, status, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];

    const total = await WhitePaper.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const whitePapers = await WhitePaper.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, whitePapers, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// GET /api/white-papers/:id
exports.getWhitePaper = async (req, res) => {
  try {
    const { id } = req.params;
    let paper;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      paper = await WhitePaper.findById(id).populate('languageId', 'name code');
    } else {
      paper = await WhitePaper.findOne({ slug: id }).populate('languageId', 'name code');
    }
    if (!paper) return sendError(res, 'White paper not found', 404);
    sendSuccess(res, paper);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// POST /api/white-papers
exports.createWhitePaper = async (req, res) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.title);
    const existing = await WhitePaper.findOne({ slug: req.body.slug });
    if (existing) req.body.slug = req.body.slug + '-' + Date.now();

    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }

    const whitePaper = await WhitePaper.create(req.body);
    sendSuccess(res, whitePaper, 201);

    // Auto-embed asynchronously (only if published)
    if (whitePaper.status === 'published') {
      const populated = await WhitePaper.findById(whitePaper._id).populate('languageId', 'code');
      embedDocument(populated, 'WhitePaper', populated.languageId?.code || 'en');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// PUT /api/white-papers/:id
exports.updateWhitePaper = async (req, res) => {
  try {
    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }
    const whitePaper = await WhitePaper.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('languageId', 'code');
    if (!whitePaper) return sendError(res, 'White Paper not found', 404);
    sendSuccess(res, whitePaper);

    // Auto-embed asynchronously
    if (whitePaper.status === 'published') {
      embedDocument(whitePaper, 'WhitePaper', whitePaper.languageId?.code || 'en');
    } else {
      deleteEmbedding(whitePaper._id, 'WhitePaper'); // Remove from KB if unpublished
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// DELETE /api/white-papers/:id
exports.deleteWhitePaper = async (req, res) => {
  try {
    const whitePaper = await WhitePaper.findByIdAndDelete(req.params.id);
    if (!whitePaper) return sendError(res, 'White Paper not found', 404);
    sendSuccess(res, { message: 'White Paper deleted' });
    deleteEmbedding(whitePaper._id, 'WhitePaper');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
