const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator'); // Import validator

const linkedinUserSchema = new Schema({
    linkedinId: {
        type: String,
        unique: true,
        required: true, // LinkedIn users must have a LinkedIn ID
    },
    linkedinEmail:  {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
          validator: validator.isEmail,
          message: 'Invalid email address'
        },
      },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    profilePictureUrl: {
        type: String,
    },
    location: {
        type: String,
    },
    accessToken: {
        type: String,
        required: false, // Token received from LinkedIn authentication
    },
    refreshToken: {
        type: String,
        required: false, // Optional, if LinkedIn provides refresh tokens
    },
    tokenExpiry: {
        type: Date, // To track token expiration time
    },
    manualUser: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference back to the manual user if applicable
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});


const LinkedInUser = mongoose.model('LinkedInUser', linkedinUserSchema);

module.exports = LinkedInUser;
