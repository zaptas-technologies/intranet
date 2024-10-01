const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator'); // For sanitization

const announcementSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    // Optionally, add a maximum length
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters long'],
    maxlength: [1000, 'Content cannot exceed 1000 characters'],
  },
  author: {
    type: Schema.Types.ObjectId, // Reference to a user collection
    ref: 'User',
    required: [true, 'Author is required'],
  },
  tags: {
    type: [String], // Optional array of tags for categorization
  },
  likes: {
    type: [Schema.Types.ObjectId], // Array of user IDs who liked the announcement
    ref: 'User',
    default: [],
  },
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId, // Reference to a user collection
        ref: 'User',
        required: [true, 'User is required for commenting'],
      },
      comment: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        minlength: [1, 'Comment must be at least 1 character long'],
      },
      createdDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to sanitize inputs and handle errors
announcementSchema.pre('save', async function (next) {
  try {
    // Sanitize title and content
    if (this.isModified('title')) {
      this.title = validator.escape(this.title.trim());
    }
    if (this.isModified('content')) {
      this.content = validator.escape(this.content.trim());
    }

    // Check for duplicate announcements
    const existingAnnouncement = await this.constructor.findOne({
      title: this.title,
      author: this.author,
    });

    if (existingAnnouncement) {
      return next(new Error('An announcement with the same title by this author already exists.'));
    }

    next();
  } catch (error) {
    // Pass any errors to the next middleware
    next(error);
  }
});

// Virtual field to get the total number of comments
announcementSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
