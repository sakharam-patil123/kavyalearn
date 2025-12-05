const Achievement = require('../models/achievementModel');
<<<<<<< HEAD
=======
const User = require('../models/userModel');
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
const asyncHandler = require('express-async-handler');

// @desc    Create new achievement
// @route   POST /api/achievements
// @access  Private (Admin)
const createAchievement = asyncHandler(async (req, res) => {
<<<<<<< HEAD
    const { user, title, description, type, points, course } = req.body;
=======
    const { user, title, description, type, points, course, badge } = req.body;

    // Validate required fields
    if (!user || !title || !description || !type) {
        res.status(400);
        throw new Error('Missing required fields: user, title, description, type');
    }
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896

    const achievement = await Achievement.create({
        user,
        title,
        description,
        type,
        points,
<<<<<<< HEAD
        course
=======
        course,
        badge: badge || 'Bronze'
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
    });

    if (achievement) {
        res.status(201).json(achievement);
    } else {
        res.status(400);
        throw new Error('Invalid achievement data');
    }
});

// @desc    Get user's achievements
// @route   GET /api/achievements/my-achievements
// @access  Private
const getMyAchievements = asyncHandler(async (req, res) => {
    const achievements = await Achievement.find({ user: req.user._id })
        .populate('course', 'title')
        .sort('-dateEarned');
    
<<<<<<< HEAD
    res.json(achievements);
=======
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    res.json({
        achievements,
        totalPoints,
        count: achievements.length
    });
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
});

// @desc    Get recent achievements
// @route   GET /api/achievements/recent
// @access  Private
const getRecentAchievements = asyncHandler(async (req, res) => {
    const achievements = await Achievement.find()
<<<<<<< HEAD
        .populate('user', 'name avatar')
        .populate('course', 'title')
        .sort('-dateEarned')
        .limit(5);
=======
        .populate('user', 'name avatar email')
        .populate('course', 'title')
        .sort('-dateEarned')
        .limit(10);
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
    
    res.json(achievements);
});

// @desc    Get user's achievement points
// @route   GET /api/achievements/points
// @access  Private
const getAchievementPoints = asyncHandler(async (req, res) => {
    const achievements = await Achievement.find({ user: req.user._id });
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
<<<<<<< HEAD
    
    res.json({ points: totalPoints });
});

// @desc    Get leaderboard
// @route   GET /api/achievements/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
=======
    const achievementCount = achievements.length;
    
    res.json({ 
        points: totalPoints,
        count: achievementCount,
        badges: {
            bronze: achievements.filter(a => a.badge === 'Bronze').length,
            silver: achievements.filter(a => a.badge === 'Silver').length,
            gold: achievements.filter(a => a.badge === 'Gold').length,
            platinum: achievements.filter(a => a.badge === 'Platinum').length
        }
    });
});

// @desc    Get leaderboard with user details
// @route   GET /api/achievements/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = req.query.limit || 20;
    
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
    const leaderboard = await Achievement.aggregate([
        {
            $group: {
                _id: '$user',
<<<<<<< HEAD
=======
                totalPoints: { $sum: '$points' },
                achievementCount: { $sum: 1 }
            }
        },
        {
            $sort: { totalPoints: -1 }
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    // Populate user details
    const populatedLeaderboard = await Achievement.populate(leaderboard, {
        path: '_id',
        select: 'name avatar email',
        model: 'User'
    });

    // Get current user's rank
    const currentUserRank = await Achievement.aggregate([
        {
            $group: {
                _id: '$user',
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
                totalPoints: { $sum: '$points' }
            }
        },
        {
            $sort: { totalPoints: -1 }
        },
        {
<<<<<<< HEAD
            $limit: 10
        }
    ]);

    // Populate user details
    await Achievement.populate(leaderboard, {
        path: '_id',
        select: 'name avatar email',
        model: 'User'
    });

    res.json(leaderboard);
=======
            $facet: {
                rank: [
                    { $match: { _id: req.user._id } },
                    { $group: { _id: null, rank: { $sum: 1 } } }
                ]
            }
        }
    ]);

    res.json({
        leaderboard: populatedLeaderboard,
        myRank: currentUserRank[0]?.rank?.[0]?.rank || null
    });
});

// @desc    Get achievement stats
// @route   GET /api/achievements/stats/:userId
// @access  Private
const getAchievementStats = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    
    const achievements = await Achievement.find({ user: userId });
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    
    const statsByType = {};
    achievements.forEach(a => {
        statsByType[a.type] = (statsByType[a.type] || 0) + 1;
    });

    res.json({
        totalPoints,
        totalAchievements: achievements.length,
        statsByType,
        recentAchievements: achievements.slice(-5)
    });
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
});

module.exports = {
    createAchievement,
    getMyAchievements,
    getRecentAchievements,
    getAchievementPoints,
<<<<<<< HEAD
    getLeaderboard
=======
    getLeaderboard,
    getAchievementStats
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
};