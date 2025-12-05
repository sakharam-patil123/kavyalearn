# Instructor & Student Panel - Complete LMS System

## Overview

This document describes the complete Instructor and Student Panel implementation for the KavyaLearn LMS platform. The system includes role-based access control, full CRUD operations, and comprehensive data visualization.

## System Architecture

### Roles & Authentication

- **Student**: Can enroll in courses, track progress, earn achievements, and view their activity
- **Instructor**: Can create/manage courses and lessons, monitor students, and view detailed analytics
- **Admin**: Full platform management (existing)

### Authentication Flow

1. User registers with role selection
2. JWT token generated with user ID and role
3. Protected routes check role before rendering
4. Login redirects to role-appropriate dashboard

**Login Redirects:**
- Admin → `/admin/dashboard`
- Instructor → `/instructor/dashboard`
- Student → `/student/dashboard`

## Backend API Endpoints

### Authentication (Existing)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Instructor APIs
**Base Route:** `/api/instructor` (requires `instructor` role)

#### Courses
- `GET /api/instructor/courses` - Get all instructor's courses
- `GET /api/instructor/courses/:id` - Get course details with lessons
- `POST /api/instructor/courses` - Create new course
- `PUT /api/instructor/courses/:id` - Update course
- `DELETE /api/instructor/courses/:id` - Delete course

#### Lessons
- `GET /api/instructor/courses/:courseId/lessons` - Get course lessons
- `POST /api/instructor/courses/:courseId/lessons` - Create lesson
- `PUT /api/instructor/lessons/:id` - Update lesson
- `DELETE /api/instructor/lessons/:id` - Delete lesson

#### Student Management
- `GET /api/instructor/students` - Get all students in instructor's courses
- `GET /api/instructor/students/:studentId` - Get detailed student profile
- `PUT /api/instructor/students/:studentId` - Update student status
- `GET /api/instructor/students/:studentId/progress/:courseId` - Get student's course progress

### Student APIs
**Base Route:** `/api/student` (requires `student` role)

- `GET /api/student/dashboard` - Get dashboard overview
- `GET /api/student/profile` - Get full student profile
- `PUT /api/student/profile` - Update student profile
- `GET /api/student/courses` - Get enrolled courses
- `GET /api/student/courses/:courseId` - Get course details
- `POST /api/student/enroll/:courseId` - Enroll in course
- `POST /api/student/courses/:courseId/lessons/:lessonId/complete` - Mark lesson complete
- `GET /api/student/achievements` - Get all achievements
- `GET /api/student/activity` - Get study activity data

## Frontend Components

### Instructor Panel

#### `/instructor/dashboard`
**InstructorDashboard.jsx**
- Overview stats (Total courses, students, lessons)
- Average student progress
- Quick action buttons
- Recent courses table

#### `/instructor/courses`
**InstructorCourses.jsx**
- List all instructor's courses
- Create new course form (inline)
- Edit course details
- Delete courses
- View course lessons
- Course status (Draft/Published)

#### `/instructor/students`
**InstructorStudents.jsx**
- List all students enrolled in instructor's courses
- Detailed student profile modal showing:
  - Personal information
  - Statistics (courses, progress, hours)
  - Enrolled courses with progress bars
  - Achievements earned

### Student Panel

#### `/student/dashboard`
**StudentDashboard.jsx**
- Welcome greeting with student name
- Overview cards (Courses, completed, hours, achievements)
- Overall progress summary
- Quick action buttons
- Personalized recommendations

#### `/student/courses`
**StudentCourses.jsx**
- Grid view of enrolled courses
- Course cards showing:
  - Thumbnail image
  - Course title & instructor
  - Progress bar with percentage
  - Lesson completion stats
  - Hours spent
  - Continue/Review button
- Filter tabs (All, In Progress, Completed)

#### `/student/achievements`
**StudentAchievements.jsx**
- Summary stats (Total achievements, courses completed, etc.)
- Grouped achievements by type:
  - Course Completions (📜)
  - Assessment Results (⭐)
  - Participation (🎯)
  - Special Badges (✨)
- Each achievement shows:
  - Title
  - Related course
  - Date earned
  - Points earned

#### `/student/activity`
**StudentActivity.jsx**
- Total study hours
- Day streak counter
- Last active date
- Study hours breakdown by course
- Visual charts showing hours per course
- Activity summary stats
- Motivational messages based on progress

## Data Models

### User Model (Updated)
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'sub-admin',
  phone: String,
  bio: String,
  avatar: String,
  status: 'active' | 'inactive',
  
  // Learning & Progress
  totalHoursLearned: Number,
  streakDays: Number,
  lastLoginDate: Date,
  
  // Relationships
  enrolledCourses: [{
    course: ObjectId (ref: Course),
    completedLessons: [ObjectId],
    hoursSpent: Number,
    completionPercentage: Number,
    enrollmentDate: Date,
    certificateDownloadedAt: Date
  }],
  achievements: [ObjectId (ref: Achievement)],
  assignedCourses: [ObjectId] // For instructors
}
```

### Course Model (Updated)
```javascript
{
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  thumbnail: String,
  lessons: [ObjectId (ref: Lesson)],
  enrolledStudents: [ObjectId (ref: User)],
  price: Number,
  duration: String,
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  category: String,
  isPublished: Boolean,
  rating: Number,
  reviews: [{
    user: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }]
}
```

### Lesson Model
```javascript
{
  title: String,
  course: ObjectId (ref: Course),
  description: String,
  content: String,
  videoUrl: String,
  duration: Number,
  resources: [{
    title: String,
    fileUrl: String,
    type: String
  }],
  quiz: ObjectId (ref: Quiz),
  order: Number,
  isPublished: Boolean
}
```

### Achievement Model
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  type: 'Course Completion' | 'Assessment Score' | 'Participation' | 'Special',
  points: Number,
  course: ObjectId (ref: Course),
  icon: String,
  dateEarned: Date
}
```

## Feature Implementation Details

### 1. Course Management (Instructor)

**Create Course:**
- Instructor submits form with course details
- Backend creates course with instructor set to current user
- Course initially in "Draft" status

**Read Courses:**
- Instructor can view all their courses
- Each course shows: title, category, level, enrolled students count, lessons count
- Can filter by status (Draft/Published)

**Update Course:**
- Instructor can edit course details (title, description, price, etc.)
- Changes reflected immediately

**Delete Course:**
- Soft delete recommended (set isPublished to false)
- Or hard delete with cascade delete of lessons
- System confirms before deletion

### 2. Lesson Management

**Create Lesson:**
- Instructor can add lessons to their courses
- Lessons include: title, description, video, content, resources
- Order can be set for lesson sequence
- Resources (PDFs, documents) can be attached

**Complete Lesson (Student):**
- Student marks lesson as complete
- System tracks:
  - Hours spent on lesson
  - Completion timestamp
  - Lesson added to `completedLessons` array
- Progress percentage calculated automatically
- On course completion (100%), achievement created

### 3. Student Progress Tracking

**Completion Percentage:**
```
completionPercentage = (completedLessons.length / totalLessons.length) * 100
```

**Study Hours:**
- Tracked per lesson completion
- Aggregated in `enrolledCourse.hoursSpent`
- Also aggregated in user's `totalHoursLearned`

**Achievements:**
- Auto-created when course reaches 100%
- Title format: `"{CourseName} Completed"`
- Points: 100 per course completion
- Can be supplemented by assessment scores

### 4. Student Dashboard Overview

**Calculated Stats:**
```javascript
totalCoursesEnrolled: enrolledCourses.length
completedCourses: enrolledCourses.filter(c => c.completionPercentage === 100).length
inProgressCourses: enrolledCourses.length - completedCourses
averageProgress: Math.round(
  enrolledCourses.reduce((sum, c) => sum + c.completionPercentage, 0) / 
  enrolledCourses.length
)
```

### 5. Instructor Student Analytics

**Student Profile Shows:**
- Personal information
- Statistics dashboard
- All enrolled courses with progress
- Achievements earned
- Study hours and streaks

**Instructor Can:**
- View individual student progress
- See per-course performance
- Monitor achievement progress
- Update student status (active/inactive)

## Frontend-Backend Integration

### Authentication Flow
1. Login page sends credentials to `/api/auth/login`
2. Backend returns JWT token + user role
3. Frontend stores token in localStorage
4. Token attached to all subsequent requests via axios interceptor
5. Protected routes check token and role before rendering

### Data Flow Example (Student enrolling in course)

```
1. Student clicks "Enroll" button
2. Frontend: POST /api/student/enroll/:courseId
3. Backend: Add student to course, add course to student.enrolledCourses
4. Frontend: Update local state, show success message
5. Course now appears in /student/courses
```

### Real-time Updates
- No WebSocket yet (optional enhancement)
- Frontend refetches data after mutations
- Optimistic UI updates possible

## Styling & UX

### Color Scheme
- Primary: #2b6cb0 (Blue)
- Secondary: #37afac (Teal)
- Success: #22c55e (Green)
- Danger: #dc3545 (Red)
- Background: #f5f7fa (Light)

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Card-based design for readability
- Touch-friendly buttons (min 44px)

## Security Considerations

### Backend
- JWT verification on protected routes
- Role-based access control (middleware)
- Input validation on all endpoints
- Password hashing with bcrypt
- CORS configured

### Frontend
- Protected routes redirect unauthorized users
- Token stored in localStorage
- XSS protection via React's built-in escaping
- CSRF tokens (if needed) can be added

## Testing Scenarios

### Instructor Test Flow
1. Register with role='instructor'
2. Login → redirects to `/instructor/dashboard`
3. Navigate to `/instructor/courses`
4. Create new course
5. Add lessons to course
6. View enrolled students
7. Check student progress

### Student Test Flow
1. Register with role='student'
2. Login → redirects to `/student/dashboard`
3. View dashboard stats
4. Go to `/student/courses`
5. Enroll in available course (if available)
6. Mark lessons as complete
7. View achievements on `/student/achievements`
8. Check activity on `/student/activity`

## Future Enhancements

1. **Instructor Features:**
   - Course publishing/unpublishing
   - Student assignment to specific cohorts
   - Automated grading for quizzes
   - Bulk actions on students
   - Email notifications

2. **Student Features:**
   - Course recommendations
   - Peer discussion forums
   - Downloadable certificates
   - Progress export (PDF)
   - Notifications for deadlines

3. **Analytics:**
   - Advanced charts and graphs
   - Cohort analysis
   - Course effectiveness metrics
   - Student engagement tracking

4. **Platform:**
   - Real-time notifications (WebSocket)
   - File upload integration
   - Video streaming optimization
   - Mobile app

## API Response Format

All APIs follow this response structure:

**Success (200)**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

**Error (4xx/5xx)**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Setup Instructions

### Backend Setup
1. Ensure MongoDB is running
2. Install dependencies: `npm install`
3. Create `.env` file with JWT_SECRET and MONGO_URI
4. Run server: `npm start`

### Frontend Setup
1. Install dependencies: `npm install`
2. Set VITE_API_BASE_URL in `.env`
3. Run dev server: `npm run dev`

### Testing
1. Create an instructor account with `role='instructor'`
2. Create a student account with `role='student'`
3. Test all endpoints using Postman or curl
4. Verify role-based access control

## Support & Troubleshooting

**Issue: 401 Unauthorized on protected endpoints**
- Ensure token is stored in localStorage
- Check JWT_SECRET matches between frontend and backend
- Token may have expired (30 day expiry set)

**Issue: Routes redirecting incorrectly**
- Verify localStorage contains correct userRole
- Check ProtectedRoute component logic
- Clear cache and localStorage

**Issue: Data not showing in Student Panel**
- Verify student is enrolled in courses
- Check backend API responses in Network tab
- Ensure lessons are marked complete properly
