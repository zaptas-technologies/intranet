const Holiday = require('../../model/HolidaySchema');
const Event = require('../../model/EventSchema');

// Create a new holiday
exports.createHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, description, department, location, isActive } = req.body;

        // Validate request body
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ message: 'Name, start date, and end date are required.' });
        }

        // Create holiday
        const holiday = new Holiday({
            name,
            startDate,
            endDate,
            description,
            department: department || 'All', // Default to 'All'
            location: location || 'India', // Default to 'India'
            isActive: isActive !== undefined ? isActive : true // Default to true
        });

        await holiday.save();
        return res.status(201).json(holiday);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new company event
exports.createEvent = async (req, res) => {
    try {
        const { title, date, description, location, department, isActive } = req.body;

        // Validate request body
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and date are required.' });
        }

        // Create event
        const event = new Event({
            title,
            date,
            description,
            location: location || 'India', // Default to 'India'
            department: department || 'All', // Default to 'All'
            isActive: isActive !== undefined ? isActive : true // Default to true
        });

        await event.save();
        return res.status(201).json(event);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all holidays
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find();
        return res.status(200).json(holidays);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        return res.status(200).json(events);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a holiday by ID
exports.updateHoliday = async (req, res) => {
    try {
        const holidayId = req.params.id;
        const updatedHoliday = await Holiday.findByIdAndUpdate(holidayId, req.body, { new: true, runValidators: true });

        if (!updatedHoliday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        return res.status(200).json(updatedHoliday);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true, runValidators: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(200).json(updatedEvent);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a holiday by ID
exports.deleteHoliday = async (req, res) => {
    try {
        const holidayId = req.params.id;
        const deletedHoliday = await Holiday.findByIdAndDelete(holidayId);

        if (!deletedHoliday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        return res.status(204).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(204).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
