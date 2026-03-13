const express = require('express');
const router = express.Router();
const { getWebinars, getWebinar, createWebinar, updateWebinar, deleteWebinar } = require('../controllers/webinarController');
const { protect } = require('../middleware/auth');

router.get('/', getWebinars);
router.get('/:id', getWebinar);
router.post('/', protect, createWebinar);
router.put('/:id', protect, updateWebinar);
router.delete('/:id', protect, deleteWebinar);

module.exports = router;
