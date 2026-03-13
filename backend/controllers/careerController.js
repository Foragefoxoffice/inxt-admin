const Career = require('../models/Career');
const { slugify, paginate, sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

exports.getCareers = async (req, res) => {
  try {
    const { languageId, search, status, department, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];

    const total = await Career.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const careers = await Career.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, careers, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id).populate('languageId', 'name code');
    if (!career) return sendError(res, 'Job not found', 404);
    sendSuccess(res, career);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createCareer = async (req, res) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.title);
    const existing = await Career.findOne({ slug: req.body.slug });
    if (existing) req.body.slug = req.body.slug + '-' + Date.now();
    const career = await Career.create(req.body);
    sendSuccess(res, career, 201);
    if (career.status === 'open') {
      const populated = await Career.findById(career._id).populate('languageId', 'code');
      embedDocument(populated, 'Career', populated.languageId?.code || 'en');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('languageId', 'code');
    if (!career) return sendError(res, 'Job not found', 404);
    sendSuccess(res, career);
    if (career.status === 'open') {
      embedDocument(career, 'Career', career.languageId?.code || 'en');
    } else {
      deleteEmbedding(career._id, 'Career');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) return sendError(res, 'Job not found', 404);
    sendSuccess(res, { message: 'Job deleted' });
    deleteEmbedding(career._id, 'Career');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
