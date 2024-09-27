const mongoose = require('mongoose');
const { Holiday } = require('../model/HolidayEvents'); // Adjust the path as necessary
const connect = require('../config/db');
async function seedHolidays() {
  const holidays = 
  [
    {
      "name": "Republic Day",
      "startDate": "2024-01-26",
      "endDate": "2024-01-26",
      "description": "Celebration of the adoption of the Constitution of India.",
      "isActive": true,
      "createdAt": "2024-01-26T00:00:00Z",
      "updatedAt": "2024-01-26T00:00:00Z"
    },
    {
      "name": "Maha Shivratri",
      "startDate": "2024-03-11",
      "endDate": "2024-03-11",
      "description": "A Hindu festival celebrated in honor of Lord Shiva.",
      "isActive": true,
      "createdAt": "2024-03-11T00:00:00Z",
      "updatedAt": "2024-03-11T00:00:00Z"
    },
    {
      "name": "Holi",
      "startDate": "2024-03-25",
      "endDate": "2024-03-25",
      "description": "Festival of colors celebrating the arrival of spring.",
      "isActive": true,
      "createdAt": "2024-03-25T00:00:00Z",
      "updatedAt": "2024-03-25T00:00:00Z"
    },
    {
      "name": "Good Friday",
      "startDate": "2024-03-29",
      "endDate": "2024-03-29",
      "description": "Commemoration of the crucifixion of Jesus Christ.",
      "isActive": true,
      "createdAt": "2024-03-29T00:00:00Z",
      "updatedAt": "2024-03-29T00:00:00Z"
    },
    {
      "name": "Eid al-Fitr",
      "startDate": "2024-04-10",
      "endDate": "2024-04-10",
      "description": "Celebration marking the end of Ramadan, the Islamic holy month of fasting.",
      "isActive": true,
      "createdAt": "2024-04-10T00:00:00Z",
      "updatedAt": "2024-04-10T00:00:00Z"
    },
    {
      "name": "Independence Day",
      "startDate": "2024-08-15",
      "endDate": "2024-08-15",
      "description": "Celebration of India's independence from British rule.",
      "isActive": true,
      "createdAt": "2024-08-15T00:00:00Z",
      "updatedAt": "2024-08-15T00:00:00Z"
    },
    {
      "name": "Gandhi Jayanti",
      "startDate": "2024-10-02",
      "endDate": "2024-10-02",
      "description": "Birth anniversary of Mahatma Gandhi.",
      "isActive": true,
      "createdAt": "2024-10-02T00:00:00Z",
      "updatedAt": "2024-10-02T00:00:00Z"
    },
    {
      "name": "Dussehra",
      "startDate": "2024-10-10",
      "endDate": "2024-10-10",
      "description": "Festival celebrating the victory of Lord Rama over the demon king Ravana.",
      "isActive": true,
      "createdAt": "2024-10-10T00:00:00Z",
      "updatedAt": "2024-10-10T00:00:00Z"
    },
    {
      "name": "Diwali",
      "startDate": "2024-11-01",
      "endDate": "2024-11-01",
      "description": "Festival of Lights celebrated by Hindus, Jains, and Sikhs.",
      "isActive": true,
      "createdAt": "2024-11-01T00:00:00Z",
      "updatedAt": "2024-11-01T00:00:00Z"
    },
    {
      "name": "Guru Nanak Jayanti",
      "startDate": "2024-11-15",
      "endDate": "2024-11-15",
      "description": "Celebration of the birth of Guru Nanak, the founder of Sikhism.",
      "isActive": true,
      "createdAt": "2024-11-15T00:00:00Z",
      "updatedAt": "2024-11-15T00:00:00Z"
    },
    {
      "name": "Christmas",
      "startDate": "2024-12-25",
      "endDate": "2024-12-25",
      "description": "Celebration of the birth of Jesus Christ.",
      "isActive": true,
      "createdAt": "2024-12-25T00:00:00Z",
      "updatedAt": "2024-12-25T00:00:00Z"
    },
    {
      "name": "New Year's Day",
      "startDate": "2024-01-01",
      "endDate": "2024-01-01",
      "description": "Celebration of the first day of the Gregorian calendar year.",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "name": "Makar Sankranti",
      "startDate": "2024-01-14",
      "endDate": "2024-01-14",
      "description": "Festival marking the transition of the sun into the zodiac sign of Capricorn.",
      "isActive": true,
      "createdAt": "2024-01-14T00:00:00Z",
      "updatedAt": "2024-01-14T00:00:00Z"
    },
    {
      "name": "Raksha Bandhan",
      "startDate": "2024-08-19",
      "endDate": "2024-08-19",
      "description": "Festival celebrating the bond between brothers and sisters.",
      "isActive": true,
      "createdAt": "2024-08-19T00:00:00Z",
      "updatedAt": "2024-08-19T00:00:00Z"
    },
    {
      "name": "Onam",
      "startDate": "2024-09-05",
      "endDate": "2024-09-05",
      "description": "Harvest festival celebrated in Kerala.",
      "isActive": true,
      "createdAt": "2024-09-05T00:00:00Z",
      "updatedAt": "2024-09-05T00:00:00Z"
    },
    {
      "name": "Baisakhi",
      "startDate": "2024-04-13",
      "endDate": "2024-04-13",
      "description": "Festival celebrating the harvest season in Punjab.",
      "isActive": true,
      "createdAt": "2024-04-13T00:00:00Z",
      "updatedAt": "2024-04-13T00:00:00Z"
    }
  ]
  
  

  try {
    await connect();

    await Holiday.insertMany(holidays);
    console.log('Holidays inserted successfully');
  } catch (error) {
    console.error('Error inserting holidays:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedHolidays();
