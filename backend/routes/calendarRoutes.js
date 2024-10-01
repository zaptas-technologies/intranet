const express = require('express');
const router = express.Router();
const calendarController = require('../controller/Calender/calendarController');
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validateHoliday = [
    body('name').notEmpty().withMessage('Holiday name is required.'),
    body('startDate').isISO8601().withMessage('Valid start date is required.'),
    body('endDate').isISO8601().withMessage('Valid end date is required.'),
];

const validateEvent = [
    body('title').notEmpty().withMessage('Event title is required.'),
    body('date').isISO8601().withMessage('Valid event date is required.'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Holiday routes
router.post('/holidays', validateHoliday, handleValidationErrors, calendarController.createHoliday);
router.get('/holidays', calendarController.getHolidays);
router.put('/holidays/:id', validateHoliday, handleValidationErrors, calendarController.updateHoliday);
router.delete('/holidays/:id', param('id').isMongoId().withMessage('Invalid holiday ID'), handleValidationErrors, calendarController.deleteHoliday);

// Event routes
router.post('/events', validateEvent, handleValidationErrors, calendarController.createEvent);
router.get('/events', calendarController.getEvents);
router.put('/events/:id', validateEvent, handleValidationErrors, calendarController.updateEvent);
router.delete('/events/:id', param('id').isMongoId().withMessage('Invalid event ID'), handleValidationErrors, calendarController.deleteEvent);

module.exports = router;
