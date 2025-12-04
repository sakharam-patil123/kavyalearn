const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingPercentage: {
        type: Number,
        required: true,
        default: 60
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        explanation: String,
        marks: Number
    }],
    attempts: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        percentage: Number,
        answers: [{
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean
        }],
        completedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['passed', 'failed'],
            required: true
        }
    }],
    studentMarks: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        score: Number,
        percentage: Number,
        status: {
            type: String,
            enum: ['passed', 'failed']
        },
        attemptedAt: { type: Date, default: Date.now }
    }],
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;