const express = require('express');
const {
    createCourse,
    getCourses,
    getCourseById,
    getCourseStats,
    updateCourse,
    deleteCourse,
    enrollCourse,
    reviewCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

// course stats (enrollment count, rating, total duration, lesson count)
router.get('/:id/stats', getCourseStats);

router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, reviewCourse);

module.exports = router;