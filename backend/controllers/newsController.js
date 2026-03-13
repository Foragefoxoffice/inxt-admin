const News = require('../models/News');
const { slugify, paginate, sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

exports.getNews = async (req, res) => {
  try {
    const { languageId, search, status, category, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { eventLocation: { $regex: search, $options: 'i' } }
    ];

    const total = await News.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const news = await News.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, news, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getNewsItem = async (req, res) => {
  try {
    const { id } = req.params;
    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await News.findById(id).populate('languageId', 'name code');
    } else {
      item = await News.findOne({ slug: id }).populate('languageId', 'name code');
    }
    if (!item) return sendError(res, 'News item not found', 404);
    sendSuccess(res, item);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createNews = async (req, res) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.title);
    const existing = await News.findOne({ slug: req.body.slug });
    if (existing) req.body.slug = req.body.slug + '-' + Date.now();

    // Aggregate text from blocks for searchability
    if (req.body.blocks?.length) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || b.data?.quote || '')
        .join(' ');
    }

    const item = await News.create(req.body);
    sendSuccess(res, item, 201);
    if (item.status === 'published') {
      const populated = await News.findById(item._id).populate('languageId', 'code');
      embedDocument(populated, 'News', populated.languageId?.code || 'en');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateNews = async (req, res) => {
  try {
    if (req.body.blocks?.length) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || b.data?.quote || '')
        .join(' ');
    }
    const item = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('languageId', 'code');
    if (!item) return sendError(res, 'News item not found', 404);
    sendSuccess(res, item);
    if (item.status === 'published') {
      embedDocument(item, 'News', item.languageId?.code || 'en');
    } else {
      deleteEmbedding(item._id, 'News');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return sendError(res, 'News item not found', 404);
    sendSuccess(res, { message: 'News item deleted' });
    deleteEmbedding(item._id, 'News');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
