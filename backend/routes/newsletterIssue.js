const express = require('express');
const router = express.Router();
const {
  getIssues, getIssue, createIssue, updateIssue, deleteIssue, uploadDocs
} = require('../controllers/newsletterIssueController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getIssues);
router.get('/public', getIssues); // Public access for website
router.get('/:id', protect, getIssue);
router.post('/', protect, uploadDocs, createIssue);
router.put('/:id', protect, uploadDocs, updateIssue);
router.delete('/:id', protect, deleteIssue);

module.exports = router;
