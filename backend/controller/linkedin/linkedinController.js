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
      const authorizationUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
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
      console.log(tokenResponse.data,"Dddddddddddddassc")

      if (!access_token || !id_token) {
        throw new Error('Missing access token or ID token in response');
      }

      // Verify the ID token
      const decodedToken = await LinkedInController.verifyIdToken(id_token);
      console.log(decodedToken,"D")


      const searchOrganizations = async (accessToken, vanityName) => {
        try {
            const response = await axios.get(`https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${vanityName}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
    
            console.log('Search Response:', response.data);
    
            // Extract organization details
            const organizations = response.data.elements || [];
            if (organizations.length > 0) {
                organizations.forEach(org => {
                    console.log('Organization URN:', org.id); // This is the organization URN
                    console.log('Vanity Name:', org.vanityName); // This is the vanity name
                });
            } else {
                console.log('No organizations found for the given vanity name.');
            }
        } catch (error) {
            console.error('Error fetching organization data:', error.response ? error.response.data : error.message);
        }
    };
    searchOrganizations(access_token,'zaptas-technologies-pvt.-ltd.')
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

  getOrganizationURN:async (access_token) => {
    try {
        // Call the organizations endpoint to find Zaptas Pvt Ltd
        const response = await axios.get('https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=zaptas', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
        });

        // Log the organization data
        const organizations = response.data;
        console.log('Organizations:', organizations);

        // Assuming the URN is in the response, extract it
        if (organizations.elements && organizations.elements.length > 0) {
            const urn = organizations.elements[0].urn; // Get the URN of the first result
            console.log('Zaptas Pvt Ltd URN:', urn);
            return urn;
        } else {
            console.log('No organizations found with the name Zaptas.');
        }
    } catch (error) {
        console.error('Error fetching organization data:', error.response ? error.response.data : error.message);
    }
  },

  // Fetch Zaptas Technology posts (using organization's URN)
  fetchCompanyPosts: async (access_token) => {
    try {
      const organizationURN = await LinkedInController.getOrganizationURN(access_token);
      // console.log(organizationURN,"Dddddddddd")

      const response = await axios.get(`https://api.linkedin.com/v2/shares?q=owners&owners=${organizationURN}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return response.data.elements;
    } catch (error) {
      // console.error('Error fetching company posts:', error);
      throw new Error('Failed to fetch company posts');
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
