const Language = require('../models/Language');
const { sendSuccess, sendError } = require('../utils/helpers');

// @desc    Get all languages
// @route   GET /api/languages
exports.getLanguages = async (req, res) => {
  try {
    const { search, isActive, limit } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const languages = await Language.find(query).limit(parseInt(limit) || 100).sort({ name: 1 });
    sendSuccess(res, languages);
  } catch (error) {
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Get single language
// @route   GET /api/languages/:id
exports.getLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    if (!language) return sendError(res, 'Language not found', 404);
    sendSuccess(res, language);
  } catch (error) {
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Create language
// @route   POST /api/languages
exports.createLanguage = async (req, res) => {
  try {
    const language = await Language.create(req.body);
    sendSuccess(res, language, 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, `Language ${Object.keys(error.keyValue)[0]} already exists`, 400);
    }
    sendError(res, error.message, 400);
  }
};

// @desc    Update language
// @route   PUT /api/languages/:id
exports.updateLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!language) return sendError(res, 'Language not found', 404);
    sendSuccess(res, language);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, `Language ${Object.keys(error.keyValue)[0]} already exists`, 400);
    }
    sendError(res, error.message, 400);
  }
};

// @desc    Delete language
// @route   DELETE /api/languages/:id
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);
    if (!language) return sendError(res, 'Language not found', 404);
    sendSuccess(res, {});
  } catch (error) {
    sendError(res, 'Server Error', 500);
  }
};
