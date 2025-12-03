const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://bsakhare25bs_db_user:o94Kn5S0dPqzD8at@kavyalearn.vxdbiex.mongodb.net/kavyalearn';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');
    const existing = await User.findOne({ email: 'admin@kavya.com' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash('adminpass', 10);
    const admin = new User({ fullName: 'Super Admin', email: 'admin@kavya.com', password: hashed, role: 'admin' });
    await admin.save();
    console.log('Created admin:', admin.email);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
