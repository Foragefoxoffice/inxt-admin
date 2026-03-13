const ChatContent = require('../models/ChatContent');
const Language = require('../models/Language');
const { sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

exports.getAll = async (req, res) => {
  try {
    const { languageId, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (languageId) query.languageId = languageId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await ChatContent.countDocuments(query);
    const items = await ChatContent.find(query)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    sendSuccess(res, items, 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await ChatContent.findById(req.params.id).populate('languageId', 'name code');
    if (!item) return sendError(res, 'Content not found', 404);
    sendSuccess(res, item);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, category, languageId, status } = req.body;

    if (!title || !content || !languageId) {
      return sendError(res, 'Title, content and language are required', 400);
    }

    const language = await Language.findById(languageId);
    if (!language) return sendError(res, 'Language not found', 400);

    const item = await ChatContent.create({
      title,
      content,
      category: category || '',
      languageId,
      language: language.code,
      status: status || 'active'
    });

    const populated = await item.populate('languageId', 'name code');
    sendSuccess(res, populated, 201);

    // Auto-embed into knowledge base (non-blocking)
    embedDocument({ ...item.toObject() }, 'ChatContent', language.code);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { title, content, category, status } = req.body;

    const item = await ChatContent.findByIdAndUpdate(
      req.params.id,
      { title, content, category, status },
      { new: true, runValidators: true }
    ).populate('languageId', 'name code');

    if (!item) return sendError(res, 'Content not found', 404);
    sendSuccess(res, item);

    // Re-embed (non-blocking)
    embedDocument({ ...item.toObject() }, 'ChatContent', item.language);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await ChatContent.findByIdAndDelete(req.params.id);
    if (!item) return sendError(res, 'Content not found', 404);
    await deleteEmbedding(item._id, 'ChatContent');
    sendSuccess(res, { message: 'Content deleted successfully' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
