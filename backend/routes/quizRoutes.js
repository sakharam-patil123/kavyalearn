const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createQuiz,
    getQuizzes,
    getQuiz,
    updateQuiz,
    deleteQuiz,
<<<<<<< HEAD
    submitQuiz
=======
    submitQuiz,
    checkQuizLockStatus,
    submitAndStoreQuiz
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
} = require('../controllers/quizController');

// All quiz routes
router.route('/')
    .post(protect, authorize('instructor', 'admin'), createQuiz)
    .get(protect, getQuizzes);

<<<<<<< HEAD
=======
// NEW: Specific routes must come BEFORE generic /:id routes
router.get('/course/:courseId/lock-status', protect, checkQuizLockStatus);
router.post('/:quizId/submit-and-store', protect, submitAndStoreQuiz);

// Generic routes
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
router.route('/:id')
    .get(protect, getQuiz)
    .put(protect, authorize('instructor', 'admin'), updateQuiz)
    .delete(protect, authorize('instructor', 'admin'), deleteQuiz);

router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
<<<<<<< HEAD
=======

>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
