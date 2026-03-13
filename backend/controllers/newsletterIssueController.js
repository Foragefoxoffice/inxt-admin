const NewsletterIssue = require('../models/NewsletterIssue');
const { paginate, sendSuccess, sendError } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer storage for docs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/docs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
}).array('documents', 10);

exports.uploadDocs = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return sendError(res, err.message, 400);
    next();
  });
};

exports.getIssues = async (req, res) => {
  try {
    const { languageId, status, search, page, limit } = req.query;
    console.log('GET NEWSLETTER ISSUES:', { languageId, status, search, url: req.originalUrl });
    const filter = {};
    if (languageId) {
      filter.languageId = languageId;
      filter.status = 'sent'; // Only show sent issues on public site
    } else {
      // If no languageId, it's a legacy public request
      filter.status = 'sent';
    }
    
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await NewsletterIssue.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const issues = await NewsletterIssue.find(filter)
      .populate('languageId', 'name code')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, issues, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getIssue = async (req, res) => {
  try {
    const issue = await NewsletterIssue.findById(req.params.id).populate('languageId', 'name code');
    if (!issue) return sendError(res, 'Newsletter issue not found', 404);
    sendSuccess(res, issue);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createIssue = async (req, res) => {
  try {
    const body = { ...req.body };

    // Handle uploaded docs
    if (req.files?.length) {
      body.documents = req.files.map(f => ({
        name: f.originalname,
        url: `/uploads/docs/${f.filename}`,
        size: f.size,
        mimeType: f.mimetype
      }));
    }

    // Parse existing documents JSON if sent alongside files
    if (req.body.existingDocuments) {
      const existing = JSON.parse(req.body.existingDocuments);
      body.documents = [...(body.documents || []), ...existing];
    }

    const issue = await NewsletterIssue.create(body);
    sendSuccess(res, issue, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.files?.length) {
      const newDocs = req.files.map(f => ({
        name: f.originalname,
        url: `/uploads/docs/${f.filename}`,
        size: f.size,
        mimeType: f.mimetype
      }));
      // Merge with existing docs
      const existing = req.body.existingDocuments ? JSON.parse(req.body.existingDocuments) : [];
      body.documents = [...existing, ...newDocs];
    }

    const issue = await NewsletterIssue.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!issue) return sendError(res, 'Newsletter issue not found', 404);
    sendSuccess(res, issue);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await NewsletterIssue.findByIdAndDelete(req.params.id);
    if (!issue) return sendError(res, 'Newsletter issue not found', 404);
    sendSuccess(res, { message: 'Issue deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
