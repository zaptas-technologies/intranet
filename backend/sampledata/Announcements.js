const mongoose = require('mongoose');
const Announcement = require('../model/Announcement'); // Assuming the Announcement model is in the models folder
const User = require('../model/user'); // Assuming the User model is in the models folder
const connect = require('../config/db');

async function createSampleAnnouncements() {
  try {
    await connect();

    // Fetch sample users
    const user1 = await User.findOne({ email: 'umesh@example.com' });
    const user2 = await User.findOne({ email: 'jk@example.com' });

    if (!user1 || !user2) {
      console.error('Users not found');
      mongoose.connection.close();
      return;
    }

    // Sample Announcement Data
    const announcement1 = new Announcement({
      title: 'New Intranet Launched',
      content: 'We are excited to announce the launch of the new intranet!',
      author: user1._id,
      tags: ['announcement', 'intranet'],
      likes: [user2._id],
      comments: [
        {
          user: user2._id,
          comment: 'Great work! Looking forward to using it.',
        },
      ],
    });

    const announcement2 = new Announcement({
      title: 'Holiday Schedule Update',
      content: 'The holiday schedule for the upcoming month has been updated.',
      author: user2._id,
      tags: ['schedule', 'holidays'],
      likes: [user1._id],
      comments: [
        {
          user: user1._id,
          comment: 'Thanks for the update!',
        },
      ],
    });

    // Save announcements
    await announcement1.save();
    await announcement2.save();

    console.log('Sample announcements created');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample announcements:', error);
    mongoose.connection.close();
  }
}

createSampleAnnouncements();
