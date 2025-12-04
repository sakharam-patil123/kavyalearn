const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    checkQuizLockStatus,
    getQuizQuestions,
    submitQuizAnswers,
    getStudentQuizMarks
} = require('../controllers/quizControllerV2');

// Check if quiz is locked/unlocked for a student
router.get('/course/:courseId/lock-status', protect, checkQuizLockStatus);

// Get student's quiz marks history
router.get('/course/:courseId/student-marks', protect, getStudentQuizMarks);

// Get quiz questions (only if unlocked)
router.get('/:quizId/questions', protect, getQuizQuestions);

// Submit quiz answers
router.post('/:quizId/submit', protect, submitQuizAnswers);

module.exports = router;
