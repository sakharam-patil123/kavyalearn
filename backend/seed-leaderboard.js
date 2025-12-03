// Test seed file for leaderboard
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

// Models
const User = require('./models/userModel');
const Course = require('./models/courseModel');
const Enrollment = require('./models/enrollmentModel');

async function seedLeaderboardData() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing students (keep admin)
    await User.deleteMany({ role: 'student' });
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    console.log('Cleared existing data');

    // Create 5 test students with different course completion levels
    const studentData = [
      {
        fullName: 'Alice Johnson',
        email: 'alice@test.com',
        password: 'password123',
        role: 'student',
      },
      {
        fullName: 'Bob Smith',
        email: 'bob@test.com',
        password: 'password123',
        role: 'student',
      },
      {
        fullName: 'Carol Davis',
        email: 'carol@test.com',
        password: 'password123',
        role: 'student',
      },
      {
        fullName: 'David Wilson',
        email: 'david@test.com',
        password: 'password123',
        role: 'student',
      },
      {
        fullName: 'Eva Martinez',
        email: 'eva@test.com',
        password: 'password123',
        role: 'student',
      },
    ];

    const students = await User.create(studentData);
    console.log(`Created ${students.length} test students`);

    // Create test courses
    const courseData = [
      {
        title: 'JavaScript Basics',
        description: 'Learn JavaScript fundamentals',
        category: 'Programming',
        level: 'Beginner',
        duration: '4 weeks',
        durationHours: 20,
        instructor: students[0]._id,
        price: 0,
      },
      {
        title: 'React Advanced',
        description: 'Advanced React patterns',
        category: 'Frontend',
        level: 'Advanced',
        duration: '6 weeks',
        durationHours: 30,
        instructor: students[0]._id,
        price: 0,
      },
      {
        title: 'Node.js Backend',
        description: 'Build backend with Node.js',
        category: 'Backend',
        level: 'Intermediate',
        duration: '5 weeks',
        durationHours: 25,
        instructor: students[1]._id,
        price: 0,
      },
      {
        title: 'Database Design',
        description: 'Design scalable databases',
        category: 'Database',
        level: 'Intermediate',
        duration: '4 weeks',
        durationHours: 20,
        instructor: students[1]._id,
        price: 0,
      },
      {
        title: 'Web Security',
        description: 'Secure web applications',
        category: 'Security',
        level: 'Advanced',
        duration: '3 weeks',
        durationHours: 15,
        instructor: students[2]._id,
        price: 0,
      },
      {
        title: 'Mobile Development',
        description: 'Build mobile apps',
        category: 'Mobile',
        level: 'Beginner',
        duration: '4 weeks',
        durationHours: 20,
        instructor: students[2]._id,
        price: 0,
      },
      {
        title: 'Python Basics',
        description: 'Learn Python fundamentals',
        category: 'Programming',
        level: 'Beginner',
        duration: '3 weeks',
        durationHours: 15,
        instructor: students[0]._id,
        price: 0,
      },
      {
        title: 'Machine Learning',
        description: 'Introduction to ML',
        category: 'Data Science',
        level: 'Advanced',
        duration: '8 weeks',
        durationHours: 40,
        instructor: students[2]._id,
        price: 0,
      },
      {
        title: 'Cloud Computing',
        description: 'Deploy to cloud',
        category: 'DevOps',
        level: 'Intermediate',
        duration: '5 weeks',
        durationHours: 25,
        instructor: students[1]._id,
        price: 0,
      },
      {
        title: 'DevOps Essentials',
        description: 'DevOps basics',
        category: 'DevOps',
        level: 'Beginner',
        duration: '3 weeks',
        durationHours: 15,
        instructor: students[0]._id,
        price: 0,
      },
    ];

    const courses = await Course.create(courseData);
    console.log(`Created ${courses.length} test courses`);

    // Create enrollments and complete courses for each student
    // Carol (10 completed) > Alice (8 completed) > Bob (6 completed) > David (4 completed) > Eva (0 completed)

    const enrollmentData = [];

    // Carol: 10 completed courses
    for (let i = 0; i < 10; i++) {
      enrollmentData.push({
        studentId: students[2]._id, // Carol
        courseId: courses[i]._id,
        completed: true,
        progressPercentage: 100,
        completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Alice: 8 completed courses
    for (let i = 0; i < 8; i++) {
      enrollmentData.push({
        studentId: students[0]._id, // Alice
        courseId: courses[i]._id,
        completed: true,
        progressPercentage: 100,
        completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Bob: 6 completed courses
    for (let i = 0; i < 6; i++) {
      enrollmentData.push({
        studentId: students[1]._id, // Bob
        courseId: courses[i]._id,
        completed: true,
        progressPercentage: 100,
        completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // David: 4 completed courses
    for (let i = 0; i < 4; i++) {
      enrollmentData.push({
        studentId: students[3]._id, // David
        courseId: courses[i]._id,
        completed: true,
        progressPercentage: 100,
        completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Eva: 0 completed courses (new student)
    enrollmentData.push({
      studentId: students[4]._id, // Eva
      courseId: courses[0]._id,
      completed: false,
      progressPercentage: 25,
    });

    await Enrollment.create(enrollmentData);
    console.log(`Created ${enrollmentData.length} enrollments`);

    console.log('✅ Leaderboard seed data created successfully!');
    console.log('\nStudent completion counts:');
    console.log('1. Carol Davis: 10 courses (RANK 1)');
    console.log('2. Alice Johnson: 8 courses (RANK 2)');
    console.log('3. Bob Smith: 6 courses (RANK 3)');
    console.log('4. David Wilson: 4 courses');
    console.log('5. Eva Martinez: 0 courses (new student)');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedLeaderboardData();
