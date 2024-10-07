const Announcement = require('../../model/Announcement'); // Assuming the model file path is correct
const mongoose = require('mongoose');
const {sendResponse} = require('../../utility/responseHelper');

// Unlike an announcement
const likeAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.userId;

        // Check if userId is provided
        if (!userId) {
            return sendResponse(res, 400, false, 'User ID is required');
        }

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'Invalid announcement or user ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        // Check if user has already liked the announcement
        if (announcement.likes.includes(userId)) {
            return sendResponse(res, 400, false, 'You have already liked this announcement');
        }

        // Add the user's like to the announcement
        announcement.likes.push(userId);
        await announcement.save();

        return sendResponse(res, 200, true, 'Announcement liked successfully', { likes: announcement.likes.length });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while liking the announcement',false, error.message);
    }
};

// Add a comment to an announcement
const addCommentToAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const { comment } = req.body;
        const userId = req.userId;

        // Check if userId is provided
        if (!userId) {
            return sendResponse(res, 400, false, 'User ID is required');
        }

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'Invalid announcement or user ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        // Add the comment to the announcement
        const newComment = {
            user: userId,
            comment,
            createdDate: new Date(),
        };

        announcement.comments.push(newComment);
        await announcement.save();

        return sendResponse(res, 200, true, 'Comment added successfully', { comments: announcement.comments });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while adding comment',false, error.message);
    }
};

// Unlike an announcement
const unlikeAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.userId;

        // Check if userId is provided
        if (!userId) {
            return sendResponse(res, 400, false, 'User ID is required');
        }

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return sendResponse(res, 400, false, 'Invalid announcement or user ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        // Check if user has not liked the announcement
        if (!announcement.likes.includes(userId)) {
            return sendResponse(res, 400, false, 'You have not liked this announcement');
        }

        // Remove the user's like from the announcement
        announcement.likes = announcement.likes.filter(id => id.toString() !== userId);
        await announcement.save();

        return sendResponse(res, 200, true, 'Announcement unliked successfully', { likes: announcement.likes.length });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while unliking the announcement',false, error.message);
    }
};

// Edit a comment
const editComment = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const { commentId, comment } = req.body;
        const userId = req.userId;

        // Check if IDs are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(commentId)) {
            return sendResponse(res, 400, false, 'Invalid ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        const commentToEdit = announcement.comments.id(commentId);

        if (!commentToEdit) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check if the comment belongs to the user
        if (commentToEdit.user.toString() !== userId) {
            return sendResponse(res, 403, false, 'You are not authorized to edit this comment');
        }

        // Update the comment
        commentToEdit.comment = comment;
        await announcement.save();

        return sendResponse(res, 200, true, 'Comment edited successfully', { comments: announcement.comments });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while editing comment',false, error.message);
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const { commentId } = req.body;
        const userId = req.userId;

        // Check if IDs are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(commentId)) {
            return sendResponse(res, 400, false, 'Invalid ID');
        }

        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return sendResponse(res, 404, false, 'Announcement not found');
        }

        const commentToDelete = announcement.comments.id(commentId);

        if (!commentToDelete) {
            return sendResponse(res, 404, false, 'Comment not found');
        }

        // Check if the comment belongs to the user
        if (commentToDelete.user.toString() !== userId) {
            return sendResponse(res, 403, false, 'You are not authorized to delete this comment');
        }

        // Store the deleted comment before removing
        const deletedComment = commentToDelete.toObject(); // Convert to plain object before removing

        // Remove the comment
        announcement.comments.pull(commentId);
        await announcement.save();

        return sendResponse(res, 200, true, 'Comment deleted successfully', { deletedComment });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, 'Server error while deleting comment',false, error.message);
    }
};

module.exports = {
    likeAnnouncement,
    unlikeAnnouncement,
    addCommentToAnnouncement,
    editComment,
    deleteComment,
};
