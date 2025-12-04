const Quiz = require('../models/quizModel');
const Course = require('../models/courseModel');
const Enrollment = require('../models/enrollmentModel');

/**
 * @desc    Check if quiz is locked for a student
 * @route   GET /api/quizzes/course/:courseId/lock-status
 * @access  Private (Student)
 */
exports.checkQuizLockStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        // Get enrollment record to check course performance
        const enrollment = await Enrollment.findOne({
            studentId,
            courseId
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Student not enrolled in this course' });
        }

        // Get quiz for the course
        const quiz = await Quiz.findOne({ course: courseId });

        if (!quiz) {
            return res.status(404).json({ message: 'No quiz found for this course' });
        }

        // Quiz is unlocked only if course performance is 100%
        const isUnlocked = enrollment.coursePerformance >= 100;
        const coursePerformance = enrollment.coursePerformance || 0;

        // Get student's quiz marks if already taken
        const studentMarks = quiz.studentMarks.find(
            m => m.student.toString() === studentId.toString()
        );

        res.json({
            quizId: quiz._id,
            isLocked: !isUnlocked,
            isUnlocked,
            coursePerformance,
            requiredPerformance: 100,
            quizTaken: !!studentMarks,
            marks: studentMarks ? studentMarks.score : null,
            percentage: studentMarks ? studentMarks.percentage : null,
            status: studentMarks ? studentMarks.status : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get quiz questions (only if unlocked)
 * @route   GET /api/quizzes/:quizId/questions
 * @access  Private (Student)
 */
exports.getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        const quiz = await Quiz.findById(quizId).populate('course');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if student is enrolled
        const enrollment = await Enrollment.findOne({
            studentId,
            courseId: quiz.course._id
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Check if quiz is unlocked (course performance >= 100%)
        if (enrollment.coursePerformance < 100) {
            return res.status(403).json({
                message: 'Quiz is locked. Complete all course lessons first.',
                requiredPerformance: 100,
                currentPerformance: enrollment.coursePerformance
            });
        }

        // Send questions (without revealing correct answers)
        const questionsForStudent = quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options.map(opt => ({ text: opt.text })), // Don't send isCorrect
            marks: q.marks
        }));

        res.json({
            quizId: quiz._id,
            title: quiz.title,
            totalMarks: quiz.totalMarks,
            duration: quiz.duration,
            passingPercentage: quiz.passingPercentage,
            questions: questionsForStudent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Submit quiz answers and store marks in database
 * @route   POST /api/quizzes/:quizId/submit
 * @access  Private (Student)
 */
exports.submitQuizAnswers = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // [{ questionIndex, selectedOption }, ...]
        const studentId = req.user._id;

        const quiz = await Quiz.findById(quizId).populate('course');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Verify enrollment and check unlock status
        const enrollment = await Enrollment.findOne({
            studentId,
            courseId: quiz.course._id
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        if (enrollment.coursePerformance < 100) {
            return res.status(403).json({ message: 'Quiz is still locked' });
        }

        // Grade the quiz
        let score = 0;
        const results = [];
        const totalMarks = quiz.totalMarks || quiz.questions.length;

        quiz.questions.forEach((question, idx) => {
            const answer = answers.find(a => a.questionIndex === idx);
            const selectedOption = answer ? answer.selectedOption : null;

            let isCorrect = false;
            if (selectedOption != null && question.options[selectedOption]) {
                isCorrect = question.options[selectedOption].isCorrect;
            }

            const marksAwarded = isCorrect ? (question.marks || 1) : 0;
            score += marksAwarded;

            results.push({
                questionIndex: idx,
                question: question.question,
                userAnswer: selectedOption != null ? question.options[selectedOption].text : null,
                correctAnswer: question.options.find(o => o.isCorrect)?.text,
                isCorrect,
                marksAwarded
            });
        });

        const percentage = totalMarks ? Math.round((score / totalMarks) * 100) : 0;
        const passed = percentage >= (quiz.passingPercentage || 60);

        // Store marks in Quiz's studentMarks array
        quiz.studentMarks.push({
            student: studentId,
            score,
            percentage,
            status: passed ? 'passed' : 'failed'
        });

        // Update enrollment with quiz marks
        enrollment.quizMarks = score;
        enrollment.quizPercentage = percentage;
        enrollment.quizTaken = true;
        enrollment.quizAttempts.push({
            quizId,
            marks: score,
            percentage,
            status: passed ? 'passed' : 'failed'
        });

        await quiz.save();
        await enrollment.save();

        res.json({
            success: true,
            score,
            totalMarks,
            percentage,
            passed,
            passingPercentage: quiz.passingPercentage,
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get student's quiz marks and history for a course
 * @route   GET /api/quizzes/course/:courseId/student-marks
 * @access  Private (Student)
 */
exports.getStudentQuizMarks = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        const enrollment = await Enrollment.findOne({
            studentId,
            courseId
        }).populate('quizAttempts.quizId', 'title');

        if (!enrollment) {
            return res.status(404).json({ message: 'Not enrolled in this course' });
        }

        res.json({
            quizTaken: enrollment.quizTaken,
            currentMarks: enrollment.quizMarks,
            currentPercentage: enrollment.quizPercentage,
            attempts: enrollment.quizAttempts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
