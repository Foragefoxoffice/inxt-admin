const express = require('express');
const router = express.Router();
const { getWhitePapers, getWhitePaper, createWhitePaper, updateWhitePaper, deleteWhitePaper } = require('../controllers/whitePaperController');
const { protect } = require('../middleware/auth');

router.get('/', getWhitePapers);
router.get('/:id', getWhitePaper);
router.post('/', protect, createWhitePaper);
router.put('/:id', protect, updateWhitePaper);
router.delete('/:id', protect, deleteWhitePaper);

module.exports = router;
