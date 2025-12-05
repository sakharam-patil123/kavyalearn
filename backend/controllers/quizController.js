const Quiz = require('../models/quizModel');
const Course = require('../models/courseModel');
<<<<<<< HEAD
=======
const Enrollment = require('../models/enrollmentModel');
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896

// @desc    Create a quiz
// @route   POST /api/quiz
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res) => {
    try {
        const { courseId, title, description, questions, passingScore, timeLimit, duration } = req.body;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify user is the instructor
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to create quiz for this course' });
        }

        // Transform incoming questions to match quizModel schema
        // Expected incoming question shape: { question, options: [..strings..], correctAnswer: string, marks }
        const transformedQuestions = (questions || []).map(q => {
            const opts = (q.options || []).map(opt => ({ text: opt, isCorrect: opt === q.correctAnswer }));
            return {
                question: q.question || q.text || '',
                options: opts,
                explanation: q.explanation || '',
                marks: typeof q.marks === 'number' ? q.marks : 1
            };
        });

        const totalMarks = transformedQuestions.reduce((s, q) => s + (q.marks || 0), 0) || (transformedQuestions.length || 1);
        const quiz = await Quiz.create({
            course: courseId,
            instructor: req.user._id,
            title,
            description,
            questions: transformedQuestions,
            passingPercentage: passingScore || 60,
            timeLimit: timeLimit || 60,
            duration: typeof duration === 'number' ? duration : (timeLimit || 60),
            totalMarks
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quiz?courseId=:courseId
// @access  Public
exports.getQuizzes = async (req, res) => {
    try {
        const { courseId } = req.query;
        const query = courseId ? { course: courseId } : {};
        const quizzes = await Quiz.find(query)
            .populate('course', 'title');
        res.json(quizzes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get a single quiz
// @route   GET /api/quiz/:id
// @access  Public
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('course');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a quiz
// @route   PUT /api/quiz/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res) => {
    try {
        let quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check authorization
        if (quiz.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }

        quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Private (Instructor/Admin)
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check authorization
        if (quiz.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Submit quiz answers and get score
// @route   POST /api/quiz/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body; // answers = [{questionId, selectedOption}, ...]
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        const results = [];

        // Grade the answers using model structure
        const totalMarks = quiz.totalMarks || quiz.questions.reduce((s, q) => s + (q.marks || 0), 0) || quiz.questions.length;

        quiz.questions.forEach((question, idx) => {
            const answer = answers.find(a => String(a.questionId) === String(question._id) || a.questionId === idx || a.questionId === question.question);

            // Determine selected option index/text
            const selected = answer ? answer.selectedOption : null;
            let isCorrect = false;
            // options are {text, isCorrect}
            if (selected != null) {
                const matched = question.options.find(opt => opt.text === selected || String(question.options.indexOf(opt)) === String(selected));
                if (matched) isCorrect = !!matched.isCorrect;
            }

            const marksAwarded = isCorrect ? (question.marks || 1) : 0;
            score += marksAwarded;

            results.push({
                questionId: question._id,
                userAnswer: selected,
                correctOptions: question.options.filter(o => o.isCorrect).map(o => o.text),
                isCorrect,
                marksAwarded
            });
        });

        const percentage = totalMarks ? (score / totalMarks) * 100 : 0;
        const passed = percentage >= (quiz.passingPercentage || 60);

        res.json({
            score: score,
            percentage: Math.round(percentage),
            passed,
            passingPercentage: quiz.passingPercentage,
            results
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
<<<<<<< HEAD
=======

// @desc    Check if quiz is locked for a student
// @route   GET /api/quiz/course/:courseId/lock-status
// @access  Private (Student)
exports.checkQuizLockStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user?._id;

        // Get quiz for the course first
        const quiz = await Quiz.findOne({ course: courseId });

        if (!quiz) {
            return res.status(404).json({ message: 'No quiz found for this course' });
        }

        // Try to get enrollment record (might not exist in demo mode)
        let enrollment = null;
        if (studentId) {
            enrollment = await Enrollment.findOne({
                studentId,
                courseId
            });
        }

        // If enrollment doesn't exist, allow quiz in demo mode (coursePerformance = 100)
        if (!enrollment) {
            // Demo mode: unlock quiz automatically
            return res.json({
                quizId: quiz._id,
                isLocked: false,
                isUnlocked: true,
                coursePerformance: 100,
                requiredPerformance: 100,
                quizTaken: false,
                marks: 0,
                percentage: 0,
                status: null,
                demoMode: true
            });
        }

        // Quiz is unlocked only if course performance is 100%
        const isUnlocked = enrollment.coursePerformance >= 100;
        const coursePerformance = enrollment.coursePerformance || 0;

        res.json({
            quizId: quiz._id,
            isLocked: !isUnlocked,
            isUnlocked,
            coursePerformance,
            requiredPerformance: 100,
            quizTaken: enrollment.quizTaken,
            marks: enrollment.quizMarks,
            percentage: enrollment.quizPercentage,
            status: enrollment.quizAttempts.length > 0 ? enrollment.quizAttempts[enrollment.quizAttempts.length - 1].status : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz and store marks in database
// @route   POST /api/quiz/:quizId/submit-and-store
// @access  Private (Student)
exports.submitAndStoreQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // [{questionIndex, selectedOption}, ...]
        const studentId = req.user?._id;

        const quiz = await Quiz.findById(quizId).populate('course');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Get enrollment (if exists)
        let enrollment = null;
        if (studentId) {
            enrollment = await Enrollment.findOne({
                studentId,
                courseId: quiz.course._id
            });
        }

        // In demo mode (no enrollment), allow quiz submission but skip DB storage
        const isDemo = !enrollment;

        if (!isDemo) {
            // Check if quiz is unlocked (coursePerformance >= 100%)
            if (enrollment.coursePerformance < 100) {
                return res.status(403).json({
                    message: 'Quiz is locked. Complete all course lessons first.',
                    requiredPerformance: 100,
                    currentPerformance: enrollment.coursePerformance
                });
            }
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

        // Store marks in Enrollment model (skip in demo mode)
        if (!isDemo && enrollment) {
            enrollment.quizMarks = score;
            enrollment.quizPercentage = percentage;
            enrollment.quizTaken = true;
            enrollment.quizAttempts.push({
                quizId: quizId,
                marks: score,
                percentage: percentage,
                status: passed ? 'passed' : 'failed'
            });

            await enrollment.save();
        }

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
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
