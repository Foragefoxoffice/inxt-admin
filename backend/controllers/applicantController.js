const Applicant = require('../models/Applicant');
const { paginate, sendSuccess, sendError } = require('../utils/helpers');

exports.getApplicants = async (req, res) => {
  try {
    const { languageId, jobId, status, search, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await Applicant.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const applicants = await Applicant.find(filter)
      .populate('jobId', 'title department')
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, applicants, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate('jobId', 'title department')
      .populate('languageId', 'name code');
    if (!applicant) return sendError(res, 'Applicant not found', 404);
    sendSuccess(res, applicant);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!applicant) return sendError(res, 'Applicant not found', 404);
    sendSuccess(res, applicant);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) return sendError(res, 'Applicant not found', 404);
    sendSuccess(res, { message: 'Applicant deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
