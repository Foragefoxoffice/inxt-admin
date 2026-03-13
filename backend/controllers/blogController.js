const Blog = require('../models/Blog');
const { slugify, paginate, sendSuccess, sendError } = require('../utils/helpers');
const { embedDocument, deleteEmbedding } = require('../services/embeddingService');

// GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { languageId, search, status, page, limit } = req.query;
    const filter = {};
    if (languageId) filter.languageId = languageId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];

    const total = await Blog.countDocuments(filter);
    const { skip, limit: lim, page: pg } = paginate(null, page, limit);
    const blogs = await Blog.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim);

    sendSuccess(res, blogs, 200, {
      pagination: { total, page: pg, pages: Math.ceil(total / lim), limit: lim }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// GET /api/blogs/:id (supports ID or slug)
exports.getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id).populate('languageId', 'name code');
    } else {
      blog = await Blog.findOne({ slug: id }).populate('languageId', 'name code');
    }

    if (!blog) return sendError(res, 'Blog not found', 404);
    sendSuccess(res, blog);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.title);
    const existing = await Blog.findOne({ slug: req.body.slug });
    if (existing) req.body.slug = req.body.slug + '-' + Date.now();

    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }

    const blog = await Blog.create(req.body);
    sendSuccess(res, blog, 201);

    // Auto-embed asynchronously (only if published)
    if (blog.status === 'published') {
      const populated = await Blog.findById(blog._id).populate('languageId', 'code');
      embedDocument(populated, 'Blog', populated.languageId?.code || 'en');
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    if (req.body.blocks) {
      req.body.content = req.body.blocks
        .filter(b => ['richText', 'heading', 'quote'].includes(b.type))
        .map(b => b.data?.content || b.data?.text || '')
        .join(' ')
        .replace(/<[^>]*>/g, '');
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('languageId', 'code');
    if (!blog) return sendError(res, 'Blog not found', 404);
    sendSuccess(res, blog);

    // Auto-embed asynchronously
    if (blog.status === 'published') {
      embedDocument(blog, 'Blog', blog.languageId?.code || 'en');
    } else {
      deleteEmbedding(blog._id, 'Blog'); // Remove from KB if unpublished
    }
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return sendError(res, 'Blog not found', 404);
    sendSuccess(res, { message: 'Blog deleted' });
    deleteEmbedding(blog._id, 'Blog');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
