const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testQuizAPI() {
  try {
    console.log('=== TESTING QUIZ ROUTES ===\n');

    // First, register/get a test user
    console.log('1. Registering test user...');
    let token = '';
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Quiz Test Student',
        email: 'quiztest@example.com',
        password: 'password123',
        role: 'student'
      });
      token = registerRes.data.token;
      console.log('✓ User registered\n');
    } catch (e) {
      // User might already exist, try login
      if (e.response?.status === 400) {
        console.log('  User already exists, logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: 'quiztest@example.com',
          password: 'password123'
        });
        token = loginRes.data.token;
        console.log('✓ User logged in\n');
      } else {
        throw e;
      }
    }

    // Test getting quizzes
    console.log('2. Testing GET /api/quiz...');
    try {
      const quizzesRes = await axios.get(`${API_URL}/quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ Got ${quizzesRes.data.length} quizzes`);
      if (quizzesRes.data.length > 0) {
        const quiz = quizzesRes.data[0];
        console.log(`  First quiz: ${quiz.title} (ID: ${quiz._id})\n`);
      } else {
        console.log('  No quizzes found\n');
      }
    } catch (e) {
      console.error(`✗ Error: ${e.response?.data?.message || e.message}\n`);
    }

    // Test lock status endpoint
    console.log('3. Testing GET /api/quiz/course/:courseId/lock-status...');
    try {
      // Get a course first
      const coursesRes = await axios.get(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseId = coursesRes.data[0]?._id;
      
      if (courseId) {
        const lockRes = await axios.get(
          `${API_URL}/quiz/course/${courseId}/lock-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ Lock status endpoint works');
        console.log(`  Response:`, JSON.stringify(lockRes.data, null, 2));
      } else {
        console.log('  No courses found to test lock status\n');
      }
    } catch (e) {
      if (e.response?.status === 404) {
        console.log(`✓ Endpoint exists (got expected 404: ${e.response.data.message})\n`);
      } else {
        console.error(`✗ Error: ${e.response?.data?.message || e.message}\n`);
      }
    }

    console.log('=== ROUTE TEST COMPLETE ===');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQuizAPI();
