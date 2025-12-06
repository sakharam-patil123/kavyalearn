const mongoose = require('mongoose');
const User = require('./models/userModel');
// Use actual MongoDB URI
const MONGODB_URI = 'mongodb+srv://bsakhare25bs_db_user:o94Kn5S0dPqzD8at@kavyalearn.vxdbiex.mongodb.net/kavyalearn';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB Connected');

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\nTotal users in database: ${totalUsers}`);

    // Check students
    const studentCount = await User.countDocuments({ role: 'student' });
    console.log(`Students (role='student'): ${studentCount}`);

    // Check parents
    const parentCount = await User.countDocuments({ role: 'parent' });
    console.log(`Parents (role='parent'): ${parentCount}`);

    // List all students with email
    console.log('\n=== ALL STUDENTS ===');
    const students = await User.find({ role: 'student' }).select('fullName email avatar role');
    if (students.length === 0) {
      console.log('No students found in database!');
    } else {
      students.forEach(s => {
        console.log(`- ${s.fullName} (${s.email}) [${s.role}]`);
      });
    }

    // List all parents
    console.log('\n=== ALL PARENTS ===');
    const parents = await User.find({ role: 'parent' }).select('fullName email children');
    if (parents.length === 0) {
      console.log('No parents found in database!');
    } else {
      parents.forEach(p => {
        console.log(`- ${p.fullName} (${p.email}) - children: ${p.children?.length || 0}`);
      });
    }

    // Test search with first student email
    if (students.length > 0) {
      console.log('\n=== TESTING SEARCH ===');
      const testEmail = students[0].email;
      console.log(`Testing search for: "${testEmail}"`);
      
      const searchResults = await User.find({
        role: 'student',
        email: { $regex: testEmail, $options: 'i' }
      }).select('_id fullName email avatar role');
      
      console.log(`Search results: ${searchResults.length} found`);
      searchResults.forEach(s => {
        console.log(`  - ${s.fullName} (${s.email})`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

connectDB();
