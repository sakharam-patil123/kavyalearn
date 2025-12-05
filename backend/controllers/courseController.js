const Course = require('../models/courseModel');
const Lesson = require('../models/lessonModel');
const User = require('../models/userModel');

<<<<<<< HEAD
const mongoose = require('mongoose');

=======
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor
exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            duration,
            level,
            category
        } = req.body;

        const course = await Course.create({
            title,
            description,
            instructor: req.user._id,
            institution: req.user.institution,
            price,
            duration,
            level,
            category
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? {
                $or: [
                    { title: { $regex: req.query.keyword, $options: 'i' } },
                    { description: { $regex: req.query.keyword, $options: 'i' } }
                ]
            }
            : {};

        const count = await Course.countDocuments({ ...keyword });
        const courses = await Course.find({ ...keyword })
            .populate('instructor', 'fullName email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort('-createdAt');

        res.json({
            courses,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'fullName email')
            .populate('lessons')
            .populate('reviews.user', 'fullName avatar');

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

<<<<<<< HEAD
// @desc    Get course statistics (enrollments, rating, total duration, lesson count)
// @route   GET /api/courses/:id/stats
// @access  Public
exports.getCourseStats = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId).select('enrolledStudents rating');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Aggregate lessons to compute total duration and lesson count
        const agg = await Lesson.aggregate([
            { $match: { course: mongoose.Types.ObjectId(courseId) } },
            {
                $group: {
                    _id: null,
                    totalDuration: { $sum: '$duration' },
                    lessonCount: { $sum: 1 }
                }
            }
        ]);

        const totalDuration = agg[0] ? agg[0].totalDuration : 0;
        const lessonCount = agg[0] ? agg[0].lessonCount : 0;

        const enrolledCount = Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0;
        const rating = course.rating || 0;

        res.json({ enrolledCount, rating, totalDuration, lessonCount });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

=======
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Verify instructor
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this course' });
            }

            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.price = req.body.price || course.price;
            course.duration = req.body.duration || course.duration;
            course.level = req.body.level || course.level;
            course.category = req.body.category || course.category;
            course.thumbnail = req.body.thumbnail || course.thumbnail;
            course.isPublished = req.body.isPublished ?? course.isPublished;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Verify instructor
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to delete this course' });
            }

            // Delete associated lessons
            await Lesson.deleteMany({ course: course._id });

            await course.remove();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('lessons');
        const user = await User.findById(req.user._id);

        if (course && user) {
            // Check if already enrolled
            const isEnrolled = user.enrolledCourses.find(
                (c) => c.course.toString() === course._id.toString()
            );

            if (isEnrolled) {
                return res.status(400).json({ message: 'Already enrolled in this course' });
            }

            // Add course to user's enrolled courses with initial progress
            user.enrolledCourses.push({
                course: course._id,
                completedLessons: [],
                hoursSpent: 0,
                enrollmentDate: new Date(),
                completionPercentage: 0
            });

            // Add user to course's enrolled students
            course.enrolledStudents.push(user._id);

            await user.save();
            await course.save();

            res.json({ message: 'Successfully enrolled in course' });
        } else {
            res.status(404).json({ message: 'Course or user not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Review course
// @route   POST /api/courses/:id/reviews
// @access  Private/Student
exports.reviewCourse = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check if user already reviewed
            const alreadyReviewed = course.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Course already reviewed' });
            }

            const review = {
                user: req.user._id,
                rating: Number(rating),
                comment
            };

            course.reviews.push(review);

            // Update course rating
            const totalRatings = course.reviews.reduce((acc, item) => item.rating + acc, 0);
            course.rating = totalRatings / course.reviews.length;

            await course.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};