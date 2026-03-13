const Newsletter = require('../models/Newsletter');
const { paginate, sendSuccess, sendError } = require('../utils/helpers');

exports.getSubscribers = async (req, res) => {
  try {
    const { languageId, status, search, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];

    const total = await Newsletter.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const subscribers = await Newsletter.find(filter)
      .populate('languageId', 'name code')
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, subscribers, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'unsubscribed') update.unsubscribedAt = new Date();
    const sub = await Newsletter.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!sub) return sendError(res, 'Subscriber not found', 404);
    sendSuccess(res, sub);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const sub = await Newsletter.findByIdAndDelete(req.params.id);
    if (!sub) return sendError(res, 'Subscriber not found', 404);
    sendSuccess(res, { message: 'Subscriber deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Export subscribers to CSV
exports.exportCSV = async (req, res) => {
  try {
    const { languageId, status } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;

    const subscribers = await Newsletter.find(filter).populate('languageId', 'name code');

    const header = 'Name,Email,Status,Language,Subscribed At\n';
    const rows = subscribers
      .map(s =>
        `"${s.name || ''}","${s.email}","${s.status}","${s.languageId?.name || ''}","${s.subscribedAt?.toISOString() || ''}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscribers.csv');
    res.send(header + rows);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
// Subscribe to newsletter from public website
exports.subscribe = async (req, res) => {
  try {
    const { email, name, designation, companyName, languageId } = req.body;
    
    // Find a language if not provided
    let langId = languageId;
    if (!langId) {
      const Language = require('../models/Language');
      const lang = await Language.findOne({ code: 'EN' });
      langId = lang ? lang._id : null;
    }

    if (!langId) return sendError(res, 'Language not found', 404);

    // Upsert subscriber
    const subscriber = await Newsletter.findOneAndUpdate(
      { email, languageId: langId },
      { name, designation, companyName, status: 'active', subscribedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    // In a real scenario, you would trigger an email here
    console.log(`[EMAIL SENT] To: ${email}, Action: Newsletter Access`);

    sendSuccess(res, subscriber, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
