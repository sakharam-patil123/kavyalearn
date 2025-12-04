const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createQuiz,
    getQuizzes,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    checkQuizLockStatus,
    submitAndStoreQuiz
} = require('../controllers/quizController');

// All quiz routes
router.route('/')
    .post(protect, authorize('instructor', 'admin'), createQuiz)
    .get(protect, getQuizzes);

// NEW: Specific routes must come BEFORE generic /:id routes
router.get('/course/:courseId/lock-status', protect, checkQuizLockStatus);
router.post('/:quizId/submit-and-store', protect, submitAndStoreQuiz);

// Generic routes
router.route('/:id')
    .get(protect, getQuiz)
    .put(protect, authorize('instructor', 'admin'), updateQuiz)
    .delete(protect, authorize('instructor', 'admin'), deleteQuiz);

router.post('/:id/submit', protect, submitQuiz);

module.exports = router;

