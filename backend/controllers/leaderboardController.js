const User = require('../models/userModel');
const Enrollment = require('../models/enrollmentModel');
const Quiz = require('../models/quizModel');

// Get leaderboard with rankings based on completed courses and quiz performance
exports.getLeaderboard = async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' }).select('_id fullName email avatar').lean();

    if (!students || students.length === 0) {
      return res.json({
        topPerformers: [],
        fullRankings: [],
        userRanking: null
      });
    }

    // Calculate performance for each student
    const studentPerformance = await Promise.all(
      students.map(async (student) => {
        // Count completed courses
        const completedCourses = await Enrollment.countDocuments({
          studentId: student._id,
          completed: true
        });

        // Get total enrollments
        const totalEnrollments = await Enrollment.countDocuments({
          studentId: student._id
        });

        // Calculate completion percentage
        const completionPercentage = totalEnrollments > 0 
          ? Math.round((completedCourses / totalEnrollments) * 100)
          : 0;

        // Get quiz performance
        let avgQuizScore = 0;
        const quizAttempts = await Quiz.aggregate([
          {
            $match: {
              'attempts.student': student._id
            }
          },
          {
            $unwind: '$attempts'
          },
          {
            $match: {
              'attempts.student': student._id
            }
          },
          {
            $group: {
              _id: null,
              avgScore: { $avg: '$attempts.score' },
              totalMarks: { $first: '$totalMarks' },
              attemptCount: { $sum: 1 }
            }
          }
        ]);

        if (quizAttempts.length > 0) {
          const attempt = quizAttempts[0];
          avgQuizScore = attempt.totalMarks > 0 
            ? Math.round((attempt.avgScore / attempt.totalMarks) * 100)
            : 0;
        }

        // Performance score: weighted by completed courses and quiz performance
        // Weight: 60% courses completed, 40% quiz performance
        const performanceScore = Math.round(
          (completedCourses * 10) + (avgQuizScore * 0.4)
        );

        return {
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          avatar: student.avatar,
          completedCourses,
          totalEnrollments,
          completionPercentage,
          avgQuizScore,
          performanceScore
        };
      })
    );

    // Sort by performance score (descending)
    studentPerformance.sort((a, b) => b.performanceScore - a.performanceScore);

    // Add rank
    const fullRankings = studentPerformance.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    // Get top 3 performers
    const topPerformers = fullRankings.slice(0, 3);

    // Get current user's ranking (if logged in)
    const userId = req.user?._id;
    const userRanking = userId 
      ? fullRankings.find(r => r._id.toString() === userId.toString())
      : null;

    res.json({
      topPerformers,
      fullRankings,
      userRanking: userRanking || { rank: null, completedCourses: 0, completionPercentage: 0, avgQuizScore: 0 }
    });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get specific student's leaderboard position and stats
exports.getStudentLeaderboardPosition = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('_id fullName email avatar').lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const completedCourses = await Enrollment.countDocuments({
      studentId,
      completed: true
    });

    const totalEnrollments = await Enrollment.countDocuments({
      studentId
    });

    const completionPercentage = totalEnrollments > 0 
      ? Math.round((completedCourses / totalEnrollments) * 100)
      : 0;

    // Get all students for ranking
    const allStudents = await User.find({ role: 'student' }).select('_id').lean();
    let rank = 1;

    for (const otherStudent of allStudents) {
      const otherCompleted = await Enrollment.countDocuments({
        studentId: otherStudent._id,
        completed: true
      });

      if (otherCompleted > completedCourses) {
        rank++;
      }
    }

    res.json({
      rank,
      completedCourses,
      totalEnrollments,
      completionPercentage,
      student
    });

  } catch (err) {
    console.error('Error getting student position:', err);
    res.status(500).json({ message: err.message });
  }
};
