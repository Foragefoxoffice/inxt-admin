const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const { paginate, sendSuccess, sendError } = require('../utils/helpers');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id
    });

    sendSuccess(res, media, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getMedia = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const filter = {};
    if (search) filter.originalName = { $regex: search, $options: 'i' };

    const total = await Media.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit || 20);
    const media = await Media.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, media, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return sendError(res, 'Media not found', 404);

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await media.deleteOne();
    sendSuccess(res, { message: 'Media deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
