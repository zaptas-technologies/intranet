const Announcement = require('../../model/Announcement'); // Assuming the model file path is correct
const mongoose = require('mongoose');



// Like an announcement
const likeAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.body.userId;

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID',
      });
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Check if user has already liked the announcement
    if (announcement.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this announcement',
      });
    }

    // Add the user's like to the announcement
    announcement.likes.push(userId);
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement liked successfully',
      likes: announcement.likes.length, // Return the updated like count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while liking the announcement',
      error: error.message,
    });
  }
};

// Add a comment to an announcement
const addCommentToAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { userId, comment } = req.body;

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID',
      });
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Add the comment to the announcement
    const newComment = {
      user: userId,
      comment,
      createdDate: new Date(),
    };

    announcement.comments.push(newComment);
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comments: announcement.comments, // Return the updated comments list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message,
    });
  }
};

// Unlike an announcement
const unlikeAnnouncement = async (req, res) => {
    try {
      const announcementId = req.params.id;
      const userId = req.body.userId;
  
      // Check if ID is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(announcementId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid announcement ID',
        });
      }
  
      const announcement = await Announcement.findById(announcementId);
  
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
      }
  
      // Check if user has not liked the announcement
      if (!announcement.likes.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: 'You have not liked this announcement',
        });
      }
  
      // Remove the user's like from the announcement
      announcement.likes = announcement.likes.filter(id => id.toString() !== userId);
      await announcement.save();
  
      res.status(200).json({
        success: true,
        message: 'Announcement unliked successfully',
        likes: announcement.likes.length, // Return the updated like count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while unliking the announcement',
        error: error.message,
      });
    }
  };

  // Edit a comment
const editComment = async (req, res) => {
    try {
      const announcementId = req.params.id;
      const { commentId, userId, comment } = req.body;
  
      // Check if IDs are valid MongoDB ObjectIds
      if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
      }
  
      const announcement = await Announcement.findById(announcementId);
  
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
      }
  
      const commentToEdit = announcement.comments.id(commentId);
  
      if (!commentToEdit) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }
  
      // Check if the comment belongs to the user
      if (commentToEdit.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to edit this comment',
        });
      }
  
      // Update the comment
      commentToEdit.comment = comment;
      await announcement.save();
  
      res.status(200).json({
        success: true,
        message: 'Comment edited successfully',
        comments: announcement.comments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while editing comment',
        error: error.message,
      });
    }
  };
  

  // Delete a comment
const deleteComment = async (req, res) => {
    try {
      const announcementId = req.params.id;
      const { commentId, userId } = req.body;
  
      // Check if IDs are valid MongoDB ObjectIds
      if (!mongoose.Types.ObjectId.isValid(announcementId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
      }
  
      const announcement = await Announcement.findById(announcementId);
  
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
      }
  
      const commentToDelete = announcement.comments.id(commentId);
  
      if (!commentToDelete) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }
  
      // Check if the comment belongs to the user
      if (commentToDelete.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this comment',
        });
      }
  
      // Remove the comment
      commentToDelete.remove();
      await announcement.save();
  
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        comments: announcement.comments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while deleting comment',
        error: error.message,
      });
    }
  };
  
  
  module.exports = {
  
    likeAnnouncement,
    unlikeAnnouncement,  // Newly added
    addCommentToAnnouncement,
    editComment,  // Newly added
    deleteComment,  // Newly added
  };
  