const express = require('express');
const router = express.Router();
const { getLeaderboard, getStudentLeaderboardPosition } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

// Get full leaderboard with rankings
router.get('/', protect, getLeaderboard);

// Get specific student's position
router.get('/student/:studentId', protect, getStudentLeaderboardPosition);

module.exports = router;
