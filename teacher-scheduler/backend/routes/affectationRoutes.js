const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    createAffectation,
    getAffectations,
    getAffectation,
    updateAffectation,
    deleteAffectation,
    getTeacherAffectations
} = require('../controllers/affectationController');

// Protect all routes
router.use(authMiddleware);

// Main affectation routes
router.post('/', createAffectation);
router.get('/', getAffectations);
router.get('/:id', getAffectation);
router.put('/:id', updateAffectation);
router.delete('/:id', deleteAffectation);

// Teacher-specific affectations
router.get('/teacher/:teacherId', getTeacherAffectations);

module.exports = router; 