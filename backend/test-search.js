const axios = require('axios');

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/reports/search-students', {
      params: { email: 'rushi@gmail.com' },
      validateStatus: () => true
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Request error:', err.message);
  }
}

run();
