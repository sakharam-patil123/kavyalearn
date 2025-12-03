const axios = require('axios');

async function run() {
  try {
    // Login as admin
    const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@kavya.com', password: 'adminpass' });
    console.log('Login status:', login.status);
    const token = login.data.token;
    console.log('Token obtained');

    const client = axios.create({ baseURL: 'http://localhost:5000', headers: { Authorization: `Bearer ${token}` } });

    // Create a student (unique email to avoid conflicts)
    const unique = Date.now();
    const studentEmail = `apistudent${unique}@test.com`;
    const studentRes = await client.post('/api/admin/users', { fullName: 'API Student', email: studentEmail, password: 'student123', role: 'student' });
    console.log('Create student status:', studentRes.status, studentRes.data.email || studentRes.data);

    // Create a course (provide minimal required fields; controller will default instructor/duration/price)
    const courseRes = await client.post('/api/admin/courses', { title: 'API Course ' + unique, description: 'Created by test script', category: 'Testing', durationHours: 6, price: 0 });
    console.log('Create course status:', courseRes.status, courseRes.data.title || courseRes.data);

  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

run();
