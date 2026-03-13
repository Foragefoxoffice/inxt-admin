const express = require('express');
const router = express.Router();
const { getLanguages, getLanguage, createLanguage, updateLanguage, deleteLanguage } = require('../controllers/languageController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getLanguages);
router.get('/:id', protect, getLanguage);
router.post('/', protect, authorize('admin'), createLanguage);
router.put('/:id', protect, authorize('admin'), updateLanguage);
router.delete('/:id', protect, authorize('admin'), deleteLanguage);

module.exports = router;
