const express = require('express');
const router = express.Router();
const { getSubscribers, updateStatus, deleteSubscriber, exportCSV, subscribe } = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

router.post('/subscribe', subscribe); // Public subscribe
router.get('/', protect, getSubscribers);
router.get('/export', protect, exportCSV);
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteSubscriber);

module.exports = router;
