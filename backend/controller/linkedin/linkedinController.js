const axios = require('axios');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const config = require('../../config/connect');
require('dotenv').config();

const LINKEDIN_AUTH_URL = config.linkedin.LINKEDIN_AUTH_URL;
const LINKEDIN_TOKEN_URL = config.linkedin.LINKEDIN_TOKEN_URL;
const LINKEDIN_USERINFO_URL = config.linkedin.LINKEDIN_USERINFO_URL;
const JWKS_URI = config.linkedin.JWKS_URI;

const CLIENT_ID = config.linkedin.clientId;
const CLIENT_SECRET = config.linkedin.clientSecret;
const REDIRECT_URI = config.linkedin.redirectUri;

const ZAPTAS_ORG_URN = 'urn:li:organization:YOUR_ORG_URN'; // Replace with actual organization URN

const LinkedInController = {
  redirectToLinkedIn: (req, res) => {
    try {
      // Redirect user to LinkedIn for authentication
      const authorizationUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email%20w_member_social%20r_organization_social%20w_organization_social`;
      res.redirect(authorizationUrl);
    } catch (error) {
      // console.error('Error during LinkedIn authorization redirection:', error);
      res.status(500).json({ error: 'Failed to redirect to LinkedIn for authentication' });
    }
  },

  handleLinkedInCallback: async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
      // Exchange authorization code for access token and ID token
      const tokenResponse = await axios.post(LINKEDIN_TOKEN_URL, new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, id_token } = tokenResponse.data;


      if (!access_token || !id_token) {
        throw new Error('Missing access token or ID token in response');
      }

      // Verify the ID token
      const decodedToken = await LinkedInController.verifyIdToken(id_token);




      // Fetch Zaptas Technology posts
      const posts = await LinkedInController.fetchCompanyPosts(access_token);

      // Return posts as JSON
      res.json({ user: decodedToken, posts });

    } catch (error) {
      // console.error('Error during LinkedIn OAuth callback flow:', error);

      if (error.response) {
        res.status(error.response.status).json({
          error: error.response.data.error_description || 'Error during token exchange',
        });
      } else {
        res.status(500).json({ error: 'Authentication failed' });
      }
    }
  },

  verifyIdToken: async (idToken) => {
    const client = jwksClient({
      jwksUri: JWKS_URI,
    });

    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    };

    return new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          reject(new Error('Invalid ID token'));
        } else {
          resolve(decoded);
        }
      });
    });
  },

  getOrganizationURN: async (access_token) => {
    try {
      // Call the userinfo endpoint to get the user (person) URN
      const response = await axios.get(LINKEDIN_USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Check if the response has data and the `sub` field exists
      if (response.data && response.data.sub) {
        return response.data.sub; // Person URN
      } else {
        throw new Error('Unexpected response structure: "sub" field missing');
      }
  
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code outside of the 2xx range
        console.error('Error response from API:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from LinkedIn API:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
      }
  
      // Provide a more user-friendly message for the consumer of the function
      throw new Error('Failed to retrieve the Person URN from LinkedIn');
    }
  },

  // Fetch Zaptas Technology posts (using organization's URN)
  fetchCompanyPosts: async (req,res) => {
    try {
      // You don't need to redefine access_token if it's already provided
      const access_token = config.linkedin.access_token;
      console.log(access_token);
  
      // Ensure you prepend the correct prefix
      const organizationId = `urn:li:organization:7936008`; // No need for separate variable if it's constant
  
      const viewContext = 'AUTHOR'; // Specify the view context
  
      // Make the API call to get the posts by organization URN
      const response = await axios.get(`https://api.linkedin.com/rest/posts?author=${encodeURIComponent(organizationId)}&q=author&count=10&sortBy=LAST_MODIFIED`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202409'  // Ensure you are using a valid version
        }
      });
  
      // console.log(response.data);
  
      return res.send(response.data); 
    } catch (error) {
      console.error('Failed to retrieve posts:', error.response?.data || error.message);
      throw new Error('Error retrieving posts');
    }
  },
  

  
  likePost: async (req, res) => {
    const { access_token, postId } = req.body;
    const actor = 'urn:li:person:YOUR_PERSON_URN'; // Replace with actual person's URN
    try {
      await axios.post('https://api.linkedin.com/v2/reactions', {
        actor: actor,
        object: postId,
        reactionType: 'LIKE'
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      });

      res.json({ success: true, message: 'Post liked successfully' });
    } catch (error) {
      // console.error('Error liking post:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  },

  commentOnPost: async (req, res) => {
    const { access_token, postId, comment } = req.body;
    const actor = 'urn:li:person:YOUR_PERSON_URN'; // Replace with actual person's URN
    try {
      await axios.post('https://api.linkedin.com/v2/comments', {
        actor: actor,
        object: postId,
        message: {
          text: comment
        }
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      });

      res.json({ success: true, message: 'Comment added successfully' });
    } catch (error) {
      // console.error('Error commenting on post:', error);
      res.status(500).json({ error: 'Failed to comment on post' });
    }
  }
};

module.exports = LinkedInController;
