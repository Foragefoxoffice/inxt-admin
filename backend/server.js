const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static folder for media uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Language-prefixed routes (/api/:lang/...)
const apiRouter = express.Router({ mergeParams: true });
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/languages', require('./routes/languages'));
apiRouter.use('/blogs', require('./routes/blogs'));
apiRouter.use('/white-papers', require('./routes/whitePapers'));
apiRouter.use('/webinars', require('./routes/webinars'));
apiRouter.use('/news', require('./routes/news'));
apiRouter.use('/careers', require('./routes/careers'));
apiRouter.use('/applicants', require('./routes/applicants'));
apiRouter.use('/newsletter', require('./routes/newsletter'));
apiRouter.use('/newsletter-issues', require('./routes/newsletterIssue'));
apiRouter.use('/media', require('./routes/media'));
apiRouter.use('/dashboard', require('./routes/dashboard'));
apiRouter.use('/chat', require('./routes/chat'));
apiRouter.use('/chat-content', require('./routes/chatContent'));

app.use('/api/:lang', apiRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
