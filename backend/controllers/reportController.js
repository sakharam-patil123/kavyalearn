const User = require('../models/userModel');
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const Quiz = require('../models/quizModel');

// Get student report for parent
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user._id;

    // Verify parent has access to this student
    const parent = await User.findById(parentId).select('children role');
    
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can access student reports' });
    }

    // Check if this student is a child of the parent
    const isChild = parent.children && parent.children.some(child => child.toString() === studentId);
    if (!isChild) {
      return res.status(403).json({ message: 'Not authorized to view this student report' });
    }

    // Get student profile
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student enrollments with course details
    const enrollments = await Enrollment.find({ studentId }).populate('courseId', 'title description category');

    // Get student quiz attempts and scores
    const quizzes = await Quiz.find({
      'attempts.student': studentId
    }).select('title course totalMarks passingPercentage attempts');

    // Process quiz data for this student
    const quizScores = [];
    quizzes.forEach(quiz => {
      const studentAttempts = quiz.attempts.filter(attempt => attempt.student?.toString() === studentId);
      studentAttempts.forEach(attempt => {
        quizScores.push({
          quizTitle: quiz.title,
          courseId: quiz.course,
          score: attempt.score,
          totalMarks: quiz.totalMarks,
          percentage: ((attempt.score / quiz.totalMarks) * 100).toFixed(2),
          status: attempt.status,
          completedAt: attempt.completedAt
        });
      });
    });

    // Calculate statistics
    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completed).length;
    const averageQuizScore = quizScores.length > 0
      ? (quizScores.reduce((sum, q) => sum + (q.score || 0), 0) / quizScores.length).toFixed(2)
      : 0;
    const passedQuizzes = quizScores.filter(q => q.status === 'passed').length;

    res.json({
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        avatar: student.avatar,
        address: student.address
      },
      enrollments: enrollments.map(e => ({
        _id: e._id,
        courseTitle: e.courseId?.title,
        courseDescription: e.courseId?.description,
        courseCategory: e.courseId?.category,
        enrolledAt: e.enrolledAt,
        progressPercentage: e.progressPercentage,
        completed: e.completed,
        watchHours: e.watchHours,
        grade: e.grade,
        lastAccessed: e.lastAccessed
      })),
      quizScores: quizScores.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
      statistics: {
        totalEnrollments,
        completedCourses,
        averageQuizScore,
        passedQuizzes,
        totalQuizzes: quizScores.length
      }
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get list of children for a parent
exports.getParentChildren = async (req, res) => {
  try {
    const parentId = req.user._id;

    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can access this' });
    }

    const parent = await User.findById(parentId).populate('children', 'fullName email avatar');
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json({
      children: parent.children || []
    });
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ message: err.message });
  }
};

// Add child to parent (useful during registration)
exports.addChildToParent = async (req, res) => {
  try {
    const { childEmail } = req.body;
    const parentId = req.user._id;

    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can add children' });
    }

    const child = await User.findOne({ email: childEmail });
    if (!child) {
      return res.status(404).json({ message: 'Student not found with this email' });
    }

    if (child.role !== 'student') {
      return res.status(400).json({ message: 'Only student accounts can be added as children' });
    }

    const parent = await User.findById(parentId);
    if (parent.children.some(id => id.toString() === child._id.toString())) {
      return res.status(400).json({ message: 'This student is already linked' });
    }

    parent.children.push(child._id);
    await parent.save();

    res.json({ 
      message: 'Child added successfully',
      child: {
        _id: child._id,
        fullName: child.fullName,
        email: child.email,
        avatar: child.avatar,
        role: child.role
      }
    });
  } catch (err) {
    console.error('Error adding child:', err);
    res.status(500).json({ message: err.message });
  }
};

// Search for students by email (for parent to link)
exports.searchStudents = async (req, res) => {
  try {
    const { email } = req.query;
    const parentId = req.user._id;

    console.log('Search request - email:', email, 'parentId:', parentId);

    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can search students' });
    }

    if (!email || email.trim().length === 0) {
      return res.json({ students: [] });
    }

    const searchEmail = email.trim().toLowerCase();
    
    // Try exact match first, then partial match
    let students = await User.find({
      role: 'student',
      email: { $regex: searchEmail, $options: 'i' }
    }).select('_id fullName email avatar role');

    console.log('Students found:', students.length, students.map(s => s.email));

    // Get current parent's children IDs
    const parent = await User.findById(parentId).select('children');
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const linkedChildIds = parent.children ? parent.children.map(id => id.toString()) : [];

    // Mark already linked students
    const result = students.map(student => ({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      avatar: student.avatar,
      role: student.role,
      isLinked: linkedChildIds.includes(student._id.toString())
    }));

    console.log('Result sent:', result);
    res.json({ students: result });
  } catch (err) {
    console.error('Error searching students:', err);
    res.status(500).json({ message: err.message });
  }
};

// Remove child from parent
exports.removeChildFromParent = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can remove children' });
    }

    const parent = await User.findById(parentId);
    parent.children = parent.children.filter(id => id.toString() !== childId);
    await parent.save();

    res.json({ message: 'Child removed successfully' });
  } catch (err) {
    console.error('Error removing child:', err);
    res.status(500).json({ message: err.message });
  }
};
