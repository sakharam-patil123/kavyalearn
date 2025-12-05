# Quick Start Guide - Instructor & Student Panel

## What Was Built

### Backend
✅ **New Controllers:**
- `instructorController.js` - Full CRUD for courses, lessons, and student management
- `studentController.js` - Student data access and progress tracking

✅ **New Routes:**
- `/api/instructor/*` - All instructor endpoints (protected)
- `/api/student/*` - All student endpoints (protected)

✅ **Features:**
- Role-based access control (middleware)
- Student progress calculation
- Achievement creation on course completion
- Study hours tracking
- Course and lesson management

### Frontend
✅ **Instructor Panel:**
- `/instructor/dashboard` - Overview with stats
- `/instructor/courses` - Full course management (CRUD)
- `/instructor/students` - Student list with detailed profiles

✅ **Student Panel:**
- `/student/dashboard` - Learning overview
- `/student/courses` - Enrolled courses with progress
- `/student/achievements` - Achievements by category
- `/student/activity` - Study hours and streaks

✅ **Components:**
- Role-based route protection
- Login redirect based on role
- Beautiful UI with responsive design
- CSS styling for all pages

## How to Test

### Test Account Setup

#### Create Instructor Account
```
Email: instructor@test.com
Password: password123
Role: instructor
```

#### Create Student Account
```
Email: student@test.com
Password: password123
Role: student
```

### Instructor Test Flow

1. **Login as Instructor**
   - Go to `http://localhost:5173`
   - Login with instructor credentials
   - Should redirect to `/instructor/dashboard`

2. **Create a Course**
   - Click "Manage Courses" or go to `/instructor/courses`
   - Click "+ Add Course"
   - Fill form:
     - Title: "React Basics"
     - Category: "Programming"
     - Level: "Beginner"
     - Price: 299
     - Duration: "4 weeks"
   - Click "Create Course"

3. **Add Lessons to Course**
   - Click "Lessons" button on the course
   - Add lesson details
   - Each lesson should have:
     - Title: "Introduction to React"
     - Duration: "30 minutes"
     - Content: Description
     - Video URL: (optional)

4. **View Students**
   - Click "View Students" quick action
   - See list of enrolled students
   - Click "View Details" to see:
     - Student profile
     - Enrolled courses
     - Progress percentages
     - Achievements

### Student Test Flow

1. **Login as Student**
   - Go to `http://localhost:5173`
   - Login with student credentials
   - Should redirect to `/student/dashboard`

2. **Dashboard Overview**
   - See stats: 0 courses, 0 completed, 0 hours
   - See quick action buttons
   - See recommendations

3. **Enroll in Course**
   - Go to `/student/courses`
   - (First need to create a course as instructor)
   - If courses exist, click "Continue Learning"

4. **Complete Lessons**
   - Open course details
   - Mark lessons as complete
   - Progress bar updates
   - Study hours are tracked

5. **View Achievements**
   - Go to `/student/achievements`
   - When course is 100% complete, achievement is created
   - Shows course completion badge

6. **Check Activity**
   - Go to `/student/activity`
   - See total study hours
   - See hours breakdown by course
   - View streak and activity stats

## File Locations

### Backend Files
```
backend/
├── controllers/
│   ├── instructorController.js (NEW)
│   └── studentController.js (NEW)
├── routes/
│   ├── instructorRoutes.js (NEW)
│   └── studentRoutes.js (NEW)
└── server.js (UPDATED - added new routes)
```

### Frontend Files
```
frontend/src/
├── pages/
│   ├── Instructor/
│   │   ├── InstructorDashboard.jsx (NEW)
│   │   ├── InstructorCourses.jsx (NEW)
│   │   ├── InstructorStudents.jsx (NEW)
│   │   ├── InstructorDashboard.css (NEW)
│   │   └── InstructorCourses.css (NEW)
│   └── Student/
│       ├── StudentDashboard.jsx (NEW)
│       ├── StudentCourses.jsx (NEW)
│       ├── StudentAchievements.jsx (NEW)
│       ├── StudentActivity.jsx (NEW)
│       ├── StudentDashboard.css (NEW)
│       ├── StudentCourses.css (NEW)
│       ├── StudentAchievements.css (NEW)
│       └── StudentActivity.css (NEW)
├── components/
│   └── ProtectedRoute.jsx (UPDATED - added requireRole prop)
├── pages/
│   └── Login.jsx (UPDATED - role-based redirection)
└── App.jsx (UPDATED - added new routes)
```

## API Testing with cURL

### Login as Instructor
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@test.com","password":"password123"}'
```

### Get Instructor Courses
```bash
curl -X GET http://localhost:5000/api/instructor/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create a Course
```bash
curl -X POST http://localhost:5000/api/instructor/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"React Basics",
    "description":"Learn React from scratch",
    "category":"Programming",
    "level":"Beginner",
    "price":299,
    "duration":"4 weeks",
    "thumbnail":"https://example.com/image.jpg"
  }'
```

### Get Student Dashboard
```bash
curl -X GET http://localhost:5000/api/student/dashboard \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Get Student Courses
```bash
curl -X GET http://localhost:5000/api/student/courses \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Enroll Student in Course
```bash
curl -X POST http://localhost:5000/api/student/enroll/COURSE_ID \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

### Mark Lesson Complete
```bash
curl -X POST http://localhost:5000/api/student/courses/COURSE_ID/lessons/LESSON_ID/complete \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hoursSpent":0.5}'
```

## Important Notes

### Registration with Role
When registering, include the role parameter:

Frontend Registration Example:
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    fullName: 'John Instructor',
    email: 'instructor@test.com',
    password: 'password123',
    role: 'instructor' // IMPORTANT: 'student' or 'instructor'
  })
});
```

### Database Initialization
Make sure you have MongoDB running and connected. The models are already defined in:
- User (with enrolledCourses, achievements, roles)
- Course (with instructor, lessons, enrolledStudents)
- Lesson (with course, quiz references)
- Achievement (with user, course, type)

## Troubleshooting

### Issue: Login not redirecting to instructor/student dashboard
**Solution:**
1. Check Network tab in browser DevTools
2. Verify response includes `role` field
3. Clear localStorage and try again
4. Check browser console for errors

### Issue: "Not authorized" errors
**Solution:**
1. Verify role matches required role in protected route
2. Ensure token is properly attached in Authorization header
3. Check token hasn't expired (30 days expiry)

### Issue: Student not appearing in instructor's student list
**Solution:**
1. Ensure student is enrolled in a course created by that instructor
2. Check student's `enrolledCourses` array in database
3. Verify course's `enrolledStudents` array includes the student

### Issue: Progress not updating
**Solution:**
1. Ensure lessons are being marked complete with POST request
2. Check hoursSpent is being sent in request body
3. Verify course has lessons created
4. Check total lessons calculation

## Next Steps / Enhancements

1. **Add Lesson Management UI**
   - Create `/instructor/courses/:courseId/lessons` page

2. **Add Course Enrollment UI for Students**
   - Create course marketplace/store page
   - Add enrollment functionality

3. **Add Quiz Management**
   - Instructor can create/manage quizzes
   - Student quiz taking functionality

4. **Add File Upload**
   - Upload course thumbnails
   - Upload lesson resources

5. **Add Notifications**
   - Email notifications for enrollments
   - Achievement notifications

6. **Add Analytics Dashboard**
   - Charts and graphs for instructors
   - Student cohort analysis

## Documentation
Complete documentation available in: `INSTRUCTOR_STUDENT_PANEL_GUIDE.md`

## Support
For issues or questions, check the backend console logs and browser DevTools Network tab for API errors.
