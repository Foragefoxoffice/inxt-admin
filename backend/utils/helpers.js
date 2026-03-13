// Convert string to URL-friendly slug
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Build pagination metadata
const paginate = (query, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

// Standard success response
const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  res.status(statusCode).json({ success: true, data, ...meta });
};

// Standard error response
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message });
};

module.exports = { slugify, paginate, sendSuccess, sendError };
