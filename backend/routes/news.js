const express = require('express');
const router = express.Router();
const { getNews, getNewsItem, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect } = require('../middleware/auth');

router.get('/', getNews);
router.get('/:id', getNewsItem);
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

module.exports = router;
