const express = require('express');
const router = express.Router();
const { getCareers, getCareer, createCareer, updateCareer, deleteCareer } = require('../controllers/careerController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCareers);
router.get('/:id', protect, getCareer);
router.post('/', protect, createCareer);
router.put('/:id', protect, updateCareer);
router.delete('/:id', protect, deleteCareer);

module.exports = router;
