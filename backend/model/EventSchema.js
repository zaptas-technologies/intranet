const mongoose = require('mongoose');
const { Schema } = mongoose;
// Event Schema
const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Event title is required'], 
    trim: true 
  },
  author: {
    type: Schema.Types.ObjectId, // Reference to a user collection
    ref: 'User',
    required: [true, 'Author is required'],
  },
  date: { 
    type: Date, 
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value >= Date.now(); // Event date should be in the future
      },
      message: 'Event date must be in the future'
    }
  },
  description: { 
    type: String,
    trim: true 
  },
  location: { 
    type: String, 
    default: 'India',  // Default location
    trim: true 
  },
  department: { 
    type: String, 
    default: 'All',  // Default department
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    required: [true, 'Active status is required'],  // Ensure isActive is required
    default: true,  // Default value is active
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export Event model
const Event = mongoose.model('Event', EventSchema);
module.exports = Event;
