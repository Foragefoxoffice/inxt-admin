const express = require('express');
const router = express.Router();
const { uploadMedia, getMedia, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getMedia);
router.post('/upload', protect, upload.single('file'), uploadMedia);
router.delete('/:id', protect, deleteMedia);

module.exports = router;
