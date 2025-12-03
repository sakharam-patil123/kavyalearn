const axios = require('axios');

async function run() {
  try {
    // Login as seeded parent
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'priya.parent@gmail.com',
      password: 'parentpass'
    }, { validateStatus: () => true });

    console.log('Login status:', loginRes.status);
    console.log('Login data:', loginRes.data);

    if (!loginRes.data || !loginRes.data.token) {
      console.error('Login failed; cannot test search.');
      return;
    }

    const token = loginRes.data.token;

    const res = await axios.get('http://localhost:5000/api/reports/search-students', {
      params: { email: 'rushi@gmail.com' },
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    console.log('Search status:', res.status);
    console.log('Search data:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
