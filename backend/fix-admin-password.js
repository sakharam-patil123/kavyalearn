const mongoose = require('mongoose');
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
    user.password = 'adminpass';
    await user.save();
    console.log('Admin password reset to adminpass (hashed during save)');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
