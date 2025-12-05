const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
<<<<<<< HEAD
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Course Completion', 'Assessment Score', 'Participation', 'Special'],
=======
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Course Completion', 'Assessment Score', 'Participation', 'Special', 'Streak', 'Milestone'],
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
        required: true
    },
    points: {
        type: Number,
<<<<<<< HEAD
        default: 0
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
=======
        default: 0,
        min: 0
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
    },
    icon: {
        type: String,
        default: 'default-achievement.png'
    },
<<<<<<< HEAD
    dateEarned: {
        type: Date,
        default: Date.now
=======
    badge: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    unlockedBy: {
        type: Number,
        default: 1
    },
    dateEarned: {
        type: Date,
        default: Date.now,
        index: true
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
    }
}, {
    timestamps: true
});

<<<<<<< HEAD
=======
// Create compound index for user and dateEarned for faster queries
achievementSchema.index({ user: 1, dateEarned: -1 });

>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;