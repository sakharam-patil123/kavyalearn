const express = require('express');
const {
    createCourse,
    getCourses,
    getCourseById,
<<<<<<< HEAD
    getCourseStats,
=======
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
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

<<<<<<< HEAD
// course stats (enrollment count, rating, total duration, lesson count)
router.get('/:id/stats', getCourseStats);

=======
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, reviewCourse);

module.exports = router;