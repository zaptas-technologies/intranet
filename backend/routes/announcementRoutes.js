const express = require('express');
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


const { protect } = require('../Middleware/jwtAuthorization');



router.use(protect);

//create
router.post('/create', createAnnouncement); // New route for creating announcements


// GET latest announcements
router.get('/latest', getLatestAnnouncements);

// GET announcements brief (only title, date, and author)
router.get('/brief', getAnnouncementsBrief);

// GET detailed announcement by ID
router.get('/:id', getAnnouncementDetails);

// POST like an announcement
router.post('/:id/like', likeAnnouncement);

// POST unlike an announcement
router.post('/:id/unlike', unlikeAnnouncement);

// POST add a comment to an announcement
router.post('/:id/comment', addCommentToAnnouncement);

// PUT edit a comment
router.put('/:id/edit-comment', editComment);

// DELETE a comment
router.delete('/:id/comment', deleteComment);

// PUT edit an announcement
router.put('/:id', editAnnouncement);

// DELETE an announcement
router.delete('/:id', deleteAnnouncement);

module.exports = router;