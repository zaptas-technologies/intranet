const mongoose = require('mongoose');

// Holiday Schema
const HolidaySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Holiday name is required'], 
    trim: true 
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value <= this.endDate;  // Start date must be before or equal to end date
      },
      message: 'Start date must be before or equal to the end date'
    }
  },
  endDate: { 
    type: Date, 
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;  // End date must be after or equal to start date
      },
      message: 'End date must be after or equal to the start date'
    }
  },
  description: { 
    type: String,
    trim: true 
  },
  department: { 
    type: String, 
    default: 'All',  // Default department
    trim: true 
  },
  location: { 
    type: String, 
    default: 'India',  // Default location
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

// Export Holiday model
const Holiday = mongoose.model('Holiday', HolidaySchema);
module.exports = Holiday;
