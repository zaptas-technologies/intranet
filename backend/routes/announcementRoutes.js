const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const {
  getLatestAnnouncements,
  getAnnouncementsBrief,
  getAnnouncementDetails,
  editAnnouncement,
  deleteAnnouncement,
} = require('../controller/announcements/announcementController');

const {  
  likeAnnouncement,
  unlikeAnnouncement,
  addCommentToAnnouncement,
  editComment,
  deleteComment
} = require('../controller/announcements/announcementLikeComment');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};



// Validation for comments
const validateComment = [
  body('comment').notEmpty().withMessage('Comment cannot be empty.'),
];

// GET latest announcements
router.get('/latest', getLatestAnnouncements);

// GET announcements brief (only title, date, and author)
router.get('/brief', getAnnouncementsBrief);

// GET detailed announcement by ID
router.get('/:id', handleValidationErrors, getAnnouncementDetails);

// POST like an announcement
router.post('/:id/like', handleValidationErrors, likeAnnouncement);

// POST unlike an announcement
router.post('/:id/unlike', handleValidationErrors, unlikeAnnouncement);

// POST add a comment to an announcement
router.post('/:id/comment', validateComment, handleValidationErrors, addCommentToAnnouncement);

// PUT edit a comment
router.put('/:id/edit-comment', validateComment, handleValidationErrors, editComment);

// DELETE a comment
router.delete('/:id/comment', handleValidationErrors, deleteComment);

// PUT edit an announcement
router.put('/:id', handleValidationErrors, editAnnouncement);

// DELETE an announcement
router.delete('/:id', handleValidationErrors, deleteAnnouncement);

module.exports = router;
