const express = require('express');
const router = express.Router();
const calendarController = require('../controller/Calender/calendarController');
const { protect } = require('../Middleware/jwtAuthorization');


router.use(protect);

// Holiday routes
router.post('/holidays', calendarController.createHoliday);
router.get('/holidays', calendarController.getHolidays);
router.put('/holidays/:id', calendarController.updateHoliday);
router.delete('/holidays/:id', calendarController.deleteHoliday);

// Event routes
router.post('/events', calendarController.createEvent);
router.get('/events', calendarController.getEvents);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

module.exports = router;
