const express = require('express');
const LinkedInController = require('../controller/linkedin/linkedinController');
const router = express.Router();

router.get('/auth/linkedin', LinkedInController.redirectToLinkedIn);

// Callback route from LinkedIn after authentication
router.get('/auth/linkedin/callback', LinkedInController.handleLinkedInCallback);

// Route to like a post
router.post('/like-post', LinkedInController.likePost);

// Route to comment on a post
router.post('/comment-post', LinkedInController.commentOnPost);


module.exports = router;
