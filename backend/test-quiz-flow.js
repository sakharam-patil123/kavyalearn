const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  email: 'student1@example.com',
  password: 'password123'
};

let authToken = '';
let studentId = '';
let courseId = '';
let quizId = '';

async function testQuizFlow() {
  try {
    console.log('=== TESTING QUIZ FLOW ===\n');

    // Step 1: Login
    console.log('1. Logging in student...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    authToken = loginRes.data.token;
    studentId = loginRes.data.user._id;
    console.log('✓ Login successful');
    console.log(`  Token: ${authToken.substring(0, 20)}...`);
    console.log(`  Student ID: ${studentId}\n`);

    // Step 2: Get courses
    console.log('2. Fetching student courses...');
    const coursesRes = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const courses = coursesRes.data;
    courseId = courses[0]?._id;
    console.log(`✓ Found ${courses.length} courses`);
    console.log(`  Course ID: ${courseId}\n`);

    if (!courseId) {
      console.error('✗ No courses found!');
      return;
    }

    // Step 3: Get enrollment to set coursePerformance
    console.log('3. Checking enrollment...');
    const enrollmentsRes = await axios.get(`${API_URL}/users/enrollments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const enrollment = enrollmentsRes.data.find(e => e.courseId === courseId);
    console.log(`✓ Enrollment found`);
    console.log(`  Course Performance: ${enrollment?.coursePerformance || 0}%\n`);

    // Step 4: Check quiz lock status (should be locked if performance < 100%)
    console.log('4. Checking quiz lock status...');
    try {
      const lockRes = await axios.get(
        `${API_URL}/quiz/course/${courseId}/lock-status`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✓ Lock status retrieved');
      console.log(`  Quiz ID: ${lockRes.data.quizId}`);
      console.log(`  Is Locked: ${lockRes.data.isLocked}`);
      console.log(`  Course Performance: ${lockRes.data.coursePerformance}%`);
      console.log(`  Required Performance: ${lockRes.data.requiredPerformance}%`);
      console.log(`  Quiz Taken: ${lockRes.data.quizTaken}\n`);

      quizId = lockRes.data.quizId;

      // Step 5: Get quiz questions (if unlocked)
      if (!lockRes.data.isLocked) {
        console.log('5. Fetching quiz questions...');
        const quizRes = await axios.get(`${API_URL}/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✓ Quiz retrieved');
        console.log(`  Title: ${quizRes.data.title}`);
        console.log(`  Questions: ${quizRes.data.questions.length}`);
        console.log(`  Total Marks: ${quizRes.data.totalMarks}\n`);

        // Step 6: Submit quiz
        console.log('6. Submitting quiz answers...');
        const answers = quizRes.data.questions.map((q, idx) => ({
          questionIndex: idx,
          selectedOption: 0 // Select first option
        }));

        const submitRes = await axios.post(
          `${API_URL}/quiz/${quizId}/submit-and-store`,
          { answers },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('✓ Quiz submitted successfully');
        console.log(`  Score: ${submitRes.data.score}/${submitRes.data.totalMarks}`);
        console.log(`  Percentage: ${submitRes.data.percentage}%`);
        console.log(`  Passed: ${submitRes.data.passed}\n`);
      } else {
        console.log('⚠ Quiz is locked - student needs 100% course performance to unlock\n');
      }
    } catch (error) {
      console.error('✗ Error with quiz endpoint:');
      console.error(`  ${error.response?.status}: ${error.response?.data?.message || error.message}\n`);
    }

    console.log('=== TEST COMPLETE ===');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

testQuizFlow();
