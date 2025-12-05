const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testWithExistingUser() {
  try {
    console.log('=== DIRECT QUIZ API TEST ===\n');

    // Use an existing user to get a token
    console.log('1. Getting auth token...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'priya.parent@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log(`✓ Got token\n`);

    // Test the quiz lock status endpoint
    console.log('2. Testing /api/quiz/course/:courseId/lock-status...');
    
    // First get courses
    const coursesRes = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  Got ${coursesRes.data.length} courses`);

    if (coursesRes.data.length > 0) {
      const courseId = coursesRes.data[0]._id;
      console.log(`  Testing with course ID: ${courseId}`);

      try {
        const lockRes = await axios.get(
          `${API_URL}/quiz/course/${courseId}/lock-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✓ Lock status endpoint works!');
        console.log(JSON.stringify(lockRes.data, null, 2));
      } catch (e) {
        if (e.response?.status === 404) {
          console.log(`⚠ 404: ${e.response.data.message}`);
        } else {
          console.error(`✗ Error: ${e.response?.data?.message || e.message}`);
        }
      }
    }

    console.log('\n=== TEST COMPLETE ===');
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
  }
}

testWithExistingUser();
