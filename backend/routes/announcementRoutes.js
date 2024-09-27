const express = require('express');
const router = express.Router();
const {
  getLatestAnnouncements,
  getAnnouncementsBrief,
  getAnnouncementDetails,
  likeAnnouncement,
  addCommentToAnnouncement
} = require('../controller/announcementController');

// GET latest announcements
router.get('/latest', getLatestAnnouncements);

// GET announcements brief (only title, date, and author)
router.get('/brief', getAnnouncementsBrief);

// GET detailed announcement by ID
router.get('/:id', getAnnouncementDetails);

// POST like an announcement
router.post('/:id/like', likeAnnouncement);

// POST add a comment to an announcement
router.post('/:id/comment', addCommentToAnnouncement);

module.exports = router;
