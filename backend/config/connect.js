require('dotenv').config(); // Load environment variables from .env file

const config = {
  mongodb: {
    uri: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.dt9hl.mongodb.net/${process.env.MONGODB_DATABASENAME_without_space_without_specialchar}?retryWrites=true&w=majority`,
  },
  server: {
    port: process.env.PORT 
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
  },

};


module.exports=config; 
