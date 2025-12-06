const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://bsakhare25bs_db_user:o94Kn5S0dPqzD8at@kavyalearn.vxdbiex.mongodb.net/kavyalearn';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    const user = await User.findOne({ email: 'admin@kavya.com' }).select('+password');
    if (!user) {
      console.log('Admin not found');
      process.exit(0);
    }
    console.log('Found admin:', user.email, 'role:', user.role);
    console.log('Stored password hash:', user.password);
    const ok = await bcrypt.compare('adminpass', user.password);
    console.log('bcrypt compare result for adminpass:', ok);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
