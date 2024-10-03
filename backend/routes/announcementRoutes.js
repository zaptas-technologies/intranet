const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const {
  getLatestAnnouncements,
  getAnnouncementsBrief,
  getAnnouncementDetails,
  editAnnouncement,
  deleteAnnouncement,
  createAnnouncement,
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

// Validation for liking/unliking an announcement
const validateAnnouncementId = [
  param('id').isMongoId().withMessage('Invalid announcement ID'),
];

// Validation for comments
const validateComment = [
  body('comment').notEmpty().withMessage('Comment cannot be empty.'),
];


const validateCreateAnnouncement = [
  body('title').notEmpty().withMessage('Title is required.').isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters.'),
  body('content').notEmpty().withMessage('Content is required.').isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters.'),
  body('author').isMongoId().withMessage('Invalid author ID.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
];


//create
router.post('/create', validateCreateAnnouncement, handleValidationErrors, createAnnouncement); // New route for creating announcements


// GET latest announcements
router.get('/latest', getLatestAnnouncements);

// GET announcements brief (only title, date, and author)
router.get('/brief', getAnnouncementsBrief);

// GET detailed announcement by ID
router.get('/:id', validateAnnouncementId, handleValidationErrors, getAnnouncementDetails);

// POST like an announcement
router.post('/:id/like', validateAnnouncementId, handleValidationErrors, likeAnnouncement);

// POST unlike an announcement
router.post('/:id/unlike', validateAnnouncementId, handleValidationErrors, unlikeAnnouncement);

// POST add a comment to an announcement
router.post('/:id/comment', validateAnnouncementId, validateComment, handleValidationErrors, addCommentToAnnouncement);

// PUT edit a comment
router.put('/:id/edit-comment', validateAnnouncementId, validateComment, handleValidationErrors, editComment);

// DELETE a comment
router.delete('/:id/comment', validateAnnouncementId, handleValidationErrors, deleteComment);

// PUT edit an announcement
router.put('/:id', validateAnnouncementId, handleValidationErrors, editAnnouncement);

// DELETE an announcement
router.delete('/:id', validateAnnouncementId, handleValidationErrors, deleteAnnouncement);

module.exports = router;