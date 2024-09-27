const mongoose = require('mongoose');
const User = require('../model/user'); // Assuming the User model is in the models folder
const connect = require('../config/db'); // Assuming your DB config

async function createSampleUsers() {
  try {
    await connect();

    const user1 = new User({
      name: 'Umesh Tyagi',
      email: 'umesh@example.com',
      password: 'password123',
    });

    const user2 = new User({
      name: 'JK',
      email: 'jk@example.com',
      password: 'password456',
    });

    await user1.save();
    await user2.save();

    console.log('Sample users created');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample users:', error);
    mongoose.connection.close();
  }
}

createSampleUsers();
