const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getMyEvents,
    getUpcomingEvents,
    enrollInEvent,
    updateEvent,
<<<<<<< HEAD
    deleteEvent,
    setReminder
=======
    deleteEvent
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('instructor', 'admin'), createEvent)
    .get(protect, getEvents);

router.get('/my-events', protect, getMyEvents);
router.get('/upcoming', protect, getUpcomingEvents);
<<<<<<< HEAD
router.post('/reminder', protect, setReminder); // ✅ Add reminder endpoint
=======
>>>>>>> 19dc9f140fa0fd2e9caea30caaaf5389cd158896
router.post('/:id/enroll', protect, enrollInEvent);

router.route('/:id')
    .put(protect, authorize('instructor', 'admin'), updateEvent)
    .delete(protect, authorize('instructor', 'admin'), deleteEvent);

module.exports = router;