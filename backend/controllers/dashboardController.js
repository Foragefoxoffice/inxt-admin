const Blog = require('../models/Blog');
const News = require('../models/News');
const Career = require('../models/Career');
const Applicant = require('../models/Applicant');
const Newsletter = require('../models/Newsletter');
const Language = require('../models/Language');
const WhitePaper = require('../models/WhitePaper');
const Webinar = require('../models/Webinar');
const { sendSuccess, sendError } = require('../utils/helpers');

exports.getStats = async (req, res) => {
  try {
    const { languageId } = req.query;
    const filter = languageId ? { languageId } : {};

    const [
      totalBlogs,
      publishedBlogs,
      totalNews,
      totalJobs,
      openJobs,
      totalApplicants,
      newApplicants,
      totalSubscribers,
      activeSubscribers,
      totalLanguages,
      totalWhitePapers,
      totalWebinars
    ] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.countDocuments({ ...filter, status: 'published' }),
      News.countDocuments(filter),
      Career.countDocuments(filter),
      Career.countDocuments({ ...filter, status: 'open' }),
      Applicant.countDocuments(filter),
      Applicant.countDocuments({ ...filter, status: 'new' }),
      Newsletter.countDocuments(filter),
      Newsletter.countDocuments({ ...filter, status: 'active' }),
      Language.countDocuments({ isActive: true }),
      WhitePaper.countDocuments(filter),
      Webinar.countDocuments(filter)
    ]);

    // Recent activity: last 5 blogs + news combined
    const recentBlogs = await Blog.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt languageId');

    const recentNews = await News.find(filter)
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt languageId category');

    const recentApplicants = await Applicant.find(filter)
      .populate('jobId', 'title')
      .populate('languageId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status createdAt jobId languageId');

    sendSuccess(res, {
      stats: {
        blogs: { total: totalBlogs, published: publishedBlogs, draft: totalBlogs - publishedBlogs },
        news: { total: totalNews },
        careers: { total: totalJobs, open: openJobs },
        applicants: { total: totalApplicants, new: newApplicants },
        newsletter: { total: totalSubscribers, active: activeSubscribers },
        languages: { total: totalLanguages },
        whitePapers: { total: totalWhitePapers },
        webinars: { total: totalWebinars }
      },
      recent: {
        blogs: recentBlogs,
        news: recentNews,
        applicants: recentApplicants
      }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
