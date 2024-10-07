require('dotenv').config(); // Load environment variables from .env file

const config = {
  mongodb: {
    uri: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.dt9hl.mongodb.net/${process.env.MONGODB_DATABASENAME_without_space_without_specialchar}?retryWrites=true&w=majority`,
  },
  server: {
    port: process.env.PORT
  },
  jwt: {
    secret: process.env.MONGODB_PASSWORD,
    expiresIn: process.env.JWT_EXPIRES_IN, // Added expiration time
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    access_token:process.env.LINKEDIN_ACCESS_TOKEN,
    ORGANIZATION_ID:process.env.LINKEDIN_ORGANIZATION_ID,
    retrive_posts:"https://api.linkedin.com/rest/posts",
    redirectUri: "http://localhost:3060/auth/linkedin/callback",
    LINKEDIN_AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
    LINKEDIN_TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
    JWKS_URI: 'https://www.linkedin.com/oauth/openid/jwks',
    REACT_APP_LINKEDIN_SCOPE:process.env.REACT_APP_LINKEDIN_SCOPE
  },

};


module.exports = config; 
