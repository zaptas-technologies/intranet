const Announcement = require('../../model/Announcement'); // Assuming the model file path is correct
const mongoose = require('mongoose');
const User = require('../../model/user');

// Get latest announcements
const getLatestAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdDate: -1 }).limit(10); // Fetch the latest 10 announcements
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching latest announcements',
      error: error.message,
    });
  }
};

// Get announcements with brief details (e.g., title and createdDate)
const getAnnouncementsBrief = async (req, res) => {
  try {
    const announcements = await Announcement.find({}, 'title createdDate author').sort({ createdDate: -1 });
    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements',
      error: error.message,
    });
  }
};

// Get announcement details by ID
const getAnnouncementDetails = async (req, res) => {
  try {
    const announcementId = req.params.id;

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

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement details',
      error: error.message,
    });
  }
};




const editAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { title, content, tags } = req.body;

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
      return res.status(400).json({
        success: false,
        message: 'No fields were updated',
      });
    }

   

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement',
      error: error.message,
    });
  }
};



const deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.body.userId;

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid announcement ID',
      });
    }
   
   


    // Find the announcement by ID
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }


    // Check if the user is the creator of the announcement
    if (announcement.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this announcement',
      });
    }

    // Delete the announcement
    await Announcement.findByIdAndDelete(announcementId);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement',
      error: error.message,
    });
  }
};



const createAnnouncement = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and author are required.',
      });
    }

       // Check if ID is a valid MongoDB ObjectId
       if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid announcement ID',
        });
      }
     

    // Check if the author exists in the database
    const existingUser = await User.findById(author);
  
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Author not found.',
      });
    }

    // Check if an announcement with the same title and author already exists
    const existingAnnouncement = await Announcement.findOne({ title, author: author });

    if (existingAnnouncement) {
      return res.status(409).json({
        success: false,
        message: 'An announcement with the same title by this author already exists.',
      });
    }

    // Create a new announcement instance
    const newAnnouncement = new Announcement({
      title,
      content,
      author: author, // Ensure author is an ObjectId
      tags: tags || [], // Use provided tags or default to an empty array
    });

    // Save the announcement to the database
    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully.',
      data: newAnnouncement,
    });
  } catch (error) {
    console.error('Error creating announcement:', error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement.',
      error: error.message,
    });
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
