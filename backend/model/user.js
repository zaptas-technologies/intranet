const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator'); // Import validator
const { hashValue, compareValue } = require('../utility/hashingUtils');


const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email address'
    },
  },
  linkedinAccount: {
    type: Schema.Types.ObjectId,
    ref: 'LinkedInUser', // Linking to LinkedIn user data
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await hashValue(this.password); // Use utility function
    }
    next();
  } catch (error) {
    next(new Error(`Error hashing password: ${error.message}`));
  }
});

// Method to compare user-entered password with the hashed password in the DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await compareValue(enteredPassword, this.password); // Use utility function
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};

// Handling duplicate email error with custom message
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists, please use a different email.'));
  } else {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
