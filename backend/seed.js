const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

// Prefer .env but fallback to hardcoded URI
require('dotenv').config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://bsakhare25bs_db_user:o94Kn5S0dPqzD8at@kavyalearn.vxdbiex.mongodb.net/kavyalearn';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB for seeding');

    // Clear users collection (BE CAREFUL IN PRODUCTION)
    await User.deleteMany({});
    console.log('Cleared User collection');

    // Create sample students
    const studentsData = [
      { fullName: 'Rushi Patel', email: 'rushi@gmail.com', password: 'password123', role: 'student' },
      { fullName: 'Anita Sharma', email: 'anita@gmail.com', password: 'password123', role: 'student' },
      { fullName: 'Mohit Kumar', email: 'mohit@gmail.com', password: 'password123', role: 'student' }
    ];

    const studentDocs = [];
    for (const s of studentsData) {
      const hashed = await bcrypt.hash(s.password, 10);
      const doc = new User({ fullName: s.fullName, email: s.email.toLowerCase(), password: hashed, role: 'student' });
      await doc.save();
      studentDocs.push(doc);
      console.log('Created student:', doc.email);
    }

    // Create sample parents and link children
    const parentsData = [
      { fullName: 'Priya Patel', email: 'priya.parent@gmail.com', password: 'parentpass', children: [studentDocs[0]._id] },
      { fullName: 'Rahul Sharma', email: 'rahul.parent@gmail.com', password: 'parentpass', children: [studentDocs[1]._id, studentDocs[2]._id] }
    ];

    for (const p of parentsData) {
      const hashed = await bcrypt.hash(p.password, 10);
      const parentDoc = new User({ fullName: p.fullName, email: p.email.toLowerCase(), password: hashed, role: 'parent', children: p.children });
      await parentDoc.save();
      console.log('Created parent:', parentDoc.email, 'children:', parentDoc.children.length);
    }

    console.log('\nSeeding complete');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
