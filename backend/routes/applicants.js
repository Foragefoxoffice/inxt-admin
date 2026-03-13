const express = require('express');
const router = express.Router();
const { getApplicants, getApplicant, updateApplicantStatus, deleteApplicant } = require('../controllers/applicantController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getApplicants);
router.get('/:id', protect, getApplicant);
router.patch('/:id/status', protect, updateApplicantStatus);
router.delete('/:id', protect, deleteApplicant);

module.exports = router;
