const express = require('express');
const router = express.Router();
const { chat, reindex, reindexModel, health, getStats, getSettings, updateSettings } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

// Public — chatbot widget needs to call this without auth
router.post('/', chat);

// Health check — public (used by widget to test availability)
router.get('/health', health);

// Detailed stats — protected (logged-in users)
router.get('/stats', protect, getStats);

// Admin only — trigger full reindex
router.post('/reindex', protect, authorize('admin'), reindex);

// Admin only — trigger reindex for a specific model (Blog | News | Career)
router.post('/reindex/:model', protect, authorize('admin'), reindexModel);

// Chatbot settings (contact info) — public GET, protected PUT
router.get('/settings', getSettings);
router.put('/settings', protect, authorize('admin'), updateSettings);

module.exports = router;
