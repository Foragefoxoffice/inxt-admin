const Webinar = require('../models/Webinar');
const { slugify, paginate, sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

// GET /api/webinars
exports.getWebinars = async (req, res) => {
  try {
    const { languageId, search, status, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];

    const total = await Webinar.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const webinars = await Webinar.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, webinars, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// GET /api/webinars/:id
exports.getWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    let webinar;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      webinar = await Webinar.findById(id).populate('languageId', 'name code');
    } else {
      webinar = await Webinar.findOne({ slug: id }).populate('languageId', 'name code');
    }
    if (!webinar) return sendError(res, 'Webinar not found', 404);
    sendSuccess(res, webinar);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// POST /api/webinars
exports.createWebinar = async (req, res) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.title);
    const existing = await Webinar.findOne({ slug: req.body.slug });
    if (existing) req.body.slug = req.body.slug + '-' + Date.now();

    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }

    const webinar = await Webinar.create(req.body);
    sendSuccess(res, webinar, 201);

    // Auto-embed asynchronously (only if published)
    if (webinar.status === 'published') {
      const populated = await Webinar.findById(webinar._id).populate('languageId', 'code');
      embedDocument(populated, 'Webinar', populated.languageId?.code || 'en');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// PUT /api/webinars/:id
exports.updateWebinar = async (req, res) => {
  try {
    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }
    const webinar = await Webinar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('languageId', 'code');
    if (!webinar) return sendError(res, 'Webinar not found', 404);
    sendSuccess(res, webinar);

    // Auto-embed asynchronously
    if (webinar.status === 'published') {
      embedDocument(webinar, 'Webinar', webinar.languageId?.code || 'en');
    } else {
      deleteEmbedding(webinar._id, 'Webinar'); // Remove from KB if unpublished
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// DELETE /api/webinars/:id
exports.deleteWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndDelete(req.params.id);
    if (!webinar) return sendError(res, 'Webinar not found', 404);
    sendSuccess(res, { message: 'Webinar deleted' });
    deleteEmbedding(webinar._id, 'Webinar');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
