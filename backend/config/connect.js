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
    access_token: process.env.LINKEDIN_ACCESS_TOKEN,
    ORGANIZATION_ID: process.env.LINKEDIN_ORGANIZATION_ID,
    retrive_posts: "https://api.linkedin.com/rest/posts",
    redirectUri: "http://localhost:3060/v1/auth/linkedin/callback",
    LINKEDIN_AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
    LINKEDIN_TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
    JWKS_URI: 'https://www.linkedin.com/oauth/openid/jwks',
    REACT_APP_LINKEDIN_SCOPE: 'openid profile r_ads_reporting r_organization_social rw_organization_admin w_member_social r_ads w_organization_social rw_ads r_basicprofile r_organization_admin email r_1st_connections_size'
  },

  corsOptions: {
    origin: 'http://162.241.149.204:3000',    // Allow your frontend's URL
    credentials: true,                       // Allow cookies and other credentials
    optionsSuccessStatus: 200               // Some browsers (legacy) require success responses to be 200
  }

};


module.exports = config; 
