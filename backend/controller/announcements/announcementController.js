const Announcement = require('../../model/Announcement'); // Assuming the model file path is correct
const mongoose = require('mongoose');
const User = require('../../model/user');
const sendResponse = require('../../utility/responseHelper');

// Get latest announcements
const getLatestAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdDate: -1 }).limit(10); // Fetch the latest 10 announcements
        return sendResponse(res, 200, true, 'Latest announcements fetched successfully', { count: announcements.length, announcements });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while fetching latest announcements', null, error.message);
    }
};

// Get announcements with brief details (e.g., title and createdDate)
const getAnnouncementsBrief = async (req, res) => {
    try {
        const announcements = await Announcement.find({}, 'title createdDate author').sort({ createdDate: -1 });
        return sendResponse(res, 200, true, 'Brief announcements fetched successfully', { announcements });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while fetching announcements', null, error.message);
    }
};

// Get announcement details by ID
const getAnnouncementDetails = async (req, res) => {
    try {
        const announcementId = req.params.id;

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return sendResponse(res, 400, false, 'Invalid announcement ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        return sendResponse(res, 200, true, 'Announcement details fetched successfully', { announcement });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while fetching announcement details', null, error.message);
    }
};

// Edit an announcement
const editAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const { title, content, tags } = req.body;

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return sendResponse(res, 400, false, 'Invalid announcement ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        // Track whether any updates were made
        let isUpdated = false;

        // Update the announcement fields
        if (title && title !== announcement.title) {
            announcement.title = title;
            isUpdated = true;
        }
        if (content && content !== announcement.content) {
            announcement.content = content;
            isUpdated = true;
        }
        if (tags && JSON.stringify(tags) !== JSON.stringify(announcement.tags)) {
            announcement.tags = tags;
            isUpdated = true;
        }

        await announcement.save();

        if (!isUpdated) {
            return sendResponse(res, 400, false, 'No fields were updated');
        }

        return sendResponse(res, 200, true, 'Announcement updated successfully', { announcement });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while updating announcement', null, error.message);
    }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.userId;

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return sendResponse(res, 400, false, 'Invalid announcement ID');
        }

        // Find the announcement by ID
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        // Check if the user is the creator of the announcement
        if (announcement.author.toString() !== userId) {
            return sendResponse(res, 403, false, 'You are not authorized to delete this announcement');
        }

        // Delete the announcement
        await Announcement.findByIdAndDelete(announcementId);

        return sendResponse(res, 200, true, 'Announcement deleted successfully');
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while deleting announcement', null, error.message);
    }
};

// Create an announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const author = req.userId;

        // Validate required fields
        if (!title || !content || !author) {
            return sendResponse(res, 400, false, 'Title, content, and author are required.');
        }

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(author)) {
            return sendResponse(res, 400, false, 'Invalid author ID');
        }

        // Check if the author exists in the database
        const existingUser = await User.findById(author);
        if (!existingUser) {
            return sendResponse(res, 404, false, 'Author not found.');
        }

        // Check if an announcement with the same title and author already exists
        const existingAnnouncement = await Announcement.findOne({ title, author: author });
        if (existingAnnouncement) {
            return sendResponse(res, 409, false, 'An announcement with the same title by this author already exists.');
        }

        // Create a new announcement instance
        const newAnnouncement = new Announcement({
            title,
            content,
            author, // Ensure author is an ObjectId
            tags: tags || [], // Use provided tags or default to an empty array
        });

        // Save the announcement to the database
        await newAnnouncement.save();

        return sendResponse(res, 201, true, 'Announcement created successfully.', { newAnnouncement });
    } catch (error) {
        console.error('Error creating announcement:', error);
        return sendResponse(res, 500, false, 'Server error while creating announcement.', null, error.message);
    }
};

module.exports = {
    createAnnouncement,
    getLatestAnnouncements,
    getAnnouncementsBrief,
    getAnnouncementDetails,
    editAnnouncement,
    deleteAnnouncement,
};
