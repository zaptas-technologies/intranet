const Holiday = require('../../model/HolidaySchema');
const Event = require('../../model/EventSchema');
const sendResponse = require('../../utility/responseHelper');

// Create a new holiday
exports.createHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, description, department, location, isActive } = req.body;

        // Validate request body
        if (!name || !startDate || !endDate) {
            return sendResponse(res, 400, false, 'Validation Error: Name, start date, and end date are required.', null);
        }

        // Create holiday
        const holiday = new Holiday({
            name,
            startDate,
            endDate,
            description,
            department: department || 'All',
            location: location || 'India',
            isActive: isActive !== undefined ? isActive : true
        });

        await holiday.save();
        return sendResponse(res, 201, true, 'Holiday created successfully', holiday);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to create holiday.', null, error.message);
    }
};

// Create a new company event
exports.createEvent = async (req, res) => {
    try {
        const { title, date, description, location, department, isActive } = req.body;

        // Validate request body
        if (!title || !date) {
            return sendResponse(res, 400, false, 'Validation Error: Title and date are required.', null);
        }

        // Create event
        const event = new Event({
            title,
            date,
            description,
            location: location || 'India',
            department: department || 'All',
            isActive: isActive !== undefined ? isActive : true
        });

        await event.save();
        return sendResponse(res, 201, true, 'Event created successfully', event);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to create event.', null, error.message);
    }
};

// Get all holidays
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find();
        return sendResponse(res, 200, true, 'Holidays retrieved successfully', holidays);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to retrieve holidays.', null, error.message);
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        return sendResponse(res, 200, true, 'Events retrieved successfully', events);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to retrieve events.', null, error.message);
    }
};

// Update a holiday by ID
exports.updateHoliday = async (req, res) => {
    try {
        const holidayId = req.params.id;
        const updatedHoliday = await Holiday.findByIdAndUpdate(holidayId, req.body, { new: true, runValidators: true });

        if (!updatedHoliday) {
            return sendResponse(res, 404, false, 'Not Found: Holiday not found.', null);
        }

        return sendResponse(res, 200, true, 'Holiday updated successfully', updatedHoliday);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to update holiday.', null, error.message);
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true, runValidators: true });

        if (!updatedEvent) {
            return sendResponse(res, 404, false, 'Not Found: Event not found.', null);
        }

        return sendResponse(res, 200, true, 'Event updated successfully', updatedEvent);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to update event.', null, error.message);
    }
};

// Delete a holiday by ID
exports.deleteHoliday = async (req, res) => {
    try {
        const holidayId = req.params.id;
        const deletedHoliday = await Holiday.findByIdAndDelete(holidayId);

        if (!deletedHoliday) {
            return sendResponse(res, 404, false, 'Not Found: Holiday not found.', null);
        }

        return sendResponse(res, 200, true, 'Holiday deleted successfully.', null);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to delete holiday.', null, error.message);
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return sendResponse(res, 404, false, 'Not Found: Event not found.', null);
        }

        return sendResponse(res, 200, true, 'Event deleted successfully.', null);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Internal Server Error: Unable to delete event.', null, error.message);
    }
};
