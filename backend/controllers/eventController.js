const Event = require('../models/eventModel');
const asyncHandler = require('express-async-handler');
// SendGrid for sending emails (API key should be set in .env as SENDGRID_API_KEY)
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Instructor/Admin)
const createEvent = asyncHandler(async (req, res) => {
    const {
        title,
        type,
        date,
        startTime,
        endTime,
        location,
        maxStudents,
        course
    } = req.body;

    const event = await Event.create({
        title,
        instructor: req.user._id, // From auth middleware
        type,
        date,
        startTime,
        endTime,
        location,
        maxStudents,
        course
    });

    if (event) {
        res.status(201).json(event);
    } else {
        res.status(400);
        throw new Error('Invalid event data');
    }
});

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
        .populate('instructor', 'name email')
        .populate('course', 'title')
        .sort({ date: 1 });
    res.json(events);
});

// @desc    Get user's events (enrolled or teaching)
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({
        $or: [
            { instructor: req.user._id },
            { enrolledStudents: req.user._id }
        ]
    })
    .populate('instructor', 'name email')
    .populate('course', 'title')
    .sort({ date: 1 });
    
    res.json(events);
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
const getUpcomingEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({
        date: { $gte: new Date() },
        status: 'Scheduled'
    })
    .populate('instructor', 'name email')
    .populate('course', 'title')
    .sort({ date: 1 })
    .limit(5);
    
    res.json(events);
});

// @desc    Enroll in event
// @route   POST /api/events/:id/enroll
// @access  Private
const enrollInEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if event is full
    if (event.enrolledStudents.length >= event.maxStudents) {
        res.status(400);
        throw new Error('Event is full');
    }

    // Check if user is already enrolled
    if (event.enrolledStudents.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already enrolled in this event');
    }

    event.enrolledStudents.push(req.user._id);
    await event.save();

    res.json({ message: 'Successfully enrolled in event' });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Instructor/Admin)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is instructor of the event or admin
    if (event.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this event');
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Instructor/Admin)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is instructor of the event or admin
    if (event.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this event');
    }

    await event.remove();
    res.json({ message: 'Event removed' });
});

// @desc    Set reminder for upcoming event
// @route   POST /api/events/reminder
// @access  Private
const setReminder = asyncHandler(async (req, res) => {
    const { eventTitle, eventDate, reminderType } = req.body;

    if (!eventTitle || !eventDate) {
        res.status(400);
        throw new Error('Event title and date are required');
    }

    // Create reminder object
    const reminder = {
        userId: req.user._id,
        userName: req.user.fullName,
        userEmail: req.user.email,
        eventTitle,
        eventDate,
        reminderType,
        createdAt: new Date(),
        reminded: false
    };

    // Log reminder to console (in production, send email/notification)
    console.log('📢 New Reminder Set:', reminder);

    // Attempt to send an email reminder immediately (simple/dummy message).
    // This uses SendGrid; if SENDGRID_API_KEY is not configured we'll skip sending.
    let emailResult = null;
    if (process.env.SENDGRID_API_KEY) {
        try {
            const fromEmail = process.env.FROM_EMAIL || 'no-reply@kavyalearn.com';
            const msg = {
                to: reminder.userEmail,
                from: fromEmail,
                subject: `Reminder: ${eventTitle}`,
                text: `Hi ${reminder.userName || ''},\n\nThis is a reminder for the upcoming event: ${eventTitle} scheduled at ${eventDate}.\n\nThanks,\nKavyaLearn Team`,
                html: `<p>Hi ${reminder.userName || ''},</p><p>This is a reminder for the upcoming event: <strong>${eventTitle}</strong> scheduled at <strong>${eventDate}</strong>.</p><p>Thanks,<br/>KavyaLearn Team</p>`
            };

            emailResult = await sgMail.send(msg);
            // mark reminded true for response
            reminder.reminded = true;
            console.log('✉️ Reminder email sent to', reminder.userEmail);
        } catch (err) {
            console.warn('Failed to send reminder email:', err?.message || err);
            // continue — we still return success for the reminder creation
        }
    } else {
        console.log('SENDGRID_API_KEY not configured — skipping email send.');
    }

    // NOTE: For production you'd persist the reminder and schedule a delayed job
    res.status(201).json({
        message: `Reminder set for ${eventTitle}`,
        reminder,
        emailResult
    });
});

module.exports = {
    createEvent,
    getEvents,
    getMyEvents,
    getUpcomingEvents,
    enrollInEvent,
    updateEvent,
    deleteEvent,
    setReminder
};