const axios = require('axios');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const config = require('../../config/connect');
const { sendResponse, purifyText,apiCall } = require('../../utility/responseHelper');


const LINKEDIN_AUTH_URL = config.linkedin.LINKEDIN_AUTH_URL;
const LINKEDIN_TOKEN_URL = config.linkedin.LINKEDIN_TOKEN_URL;
const JWKS_URI = config.linkedin.JWKS_URI;
const retrive_posts = config.linkedin.retrive_posts;
const CLIENT_ID = config.linkedin.clientId;
const CLIENT_SECRET = config.linkedin.clientSecret;
const REDIRECT_URI = config.linkedin.redirectUri;
const ORGANIZATION_ID = config.linkedin.ORGANIZATION_ID;
const SCOPE = config.linkedin.REACT_APP_LINKEDIN_SCOPE;
const ZAPTAS_ORG_URN = `urn:li:organization:${ORGANIZATION_ID}`;

const LinkedInController = {
  redirectToLinkedIn: (req, res) => {
    try {
      const authorizationUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPE)}`;
      res.redirect(authorizationUrl);
    } catch (error) {
      return sendResponse(res, 500, false, 'Failed to redirect to LinkedIn for authentication', null, error.message);
    }
  },

  handleLinkedInCallback: async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return sendResponse(res, 400, false, 'No authorization code provided');
    }

    try {
      const tokenResponse = await apiCall(
        'POST',
        LINKEDIN_TOKEN_URL,
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }).toString(),
        res
      );

      const { access_token, id_token } = tokenResponse;

      if (!access_token || !id_token) {
        throw new Error('Missing access token or ID token in response');
      }

      const decodedToken = await LinkedInController.verifyIdToken(id_token);
      return sendResponse(res, 200, true, 'Authentication successful', { user: decodedToken });

    } catch (error) {
      const errorMessage = error.response?.data?.error_description || 'Error during token exchange';
      return sendResponse(res, error.response?.status || 500, false, 'Authentication failed', null, errorMessage);
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

  fetchCompanyPosts: async (req, res) => {
    try {
      const access_token = config.linkedin.access_token;
      const url = `${retrive_posts}?author=${encodeURIComponent(ZAPTAS_ORG_URN)}&q=author&count=10&sortBy=LAST_MODIFIED`;

      const headers = {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202409',
      };

      const response = await apiCall('GET', url, headers, null, res);

      let structuredPosts = [];
      for (const post of response.elements) {
        structuredPosts.push({
          id: post.id,
          commentary: purifyText(post.commentary),
          publishedAt: post.publishedAt,
          visibility: post.visibility,
          imageUrl: post.content?.media?.id
            ? await LinkedInController.fetchImageUrl(post.content.media.id, access_token)
            : null,
        });
      }

      return sendResponse(res, 200, true, 'fetched successfully', { posts: structuredPosts });

    } catch (error) {
      console.error('Failed to retrieve posts:', error.message);
      // Error handling is already done in apiCall
    }
  },

  fetchImageUrl :async (imageId, accessToken) => {
    const url = `https://api.linkedin.com/rest/images/${encodeURIComponent(imageId)}`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version':'202409'
    };

    const response = await axios.get(url, { headers });
    return response.data.value; // Adjust this based on the actual response structure
},

  likePost: async (req, res) => {
    const { access_token, postId } = req.body;
    const actor = 'urn:li:person:YOUR_PERSON_URN'; // Replace with actual person's URN

    try {
      const url = 'https://api.linkedin.com/v2/reactions';
      const headers = {
        Authorization: `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      };

      const data = {
        actor: actor,
        object: postId,
        reactionType: 'LIKE',
      };

      await apiCall('POST', url, headers, data, res);
      return sendResponse(res, 200, true, 'Post liked successfully');

    } catch (error) {
      // Error handling is already done in apiCall
    }
  },

  commentOnPost: async (req, res) => {
    const { access_token, postId, comment } = req.body;
    const actor = 'urn:li:person:YOUR_PERSON_URN'; // Replace with actual person's URN

    try {
      const url = 'https://api.linkedin.com/v2/comments';
      const headers = {
        Authorization: `Bearer ${access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      };

      const data = {
        actor: actor,
        object: postId,
        message: {
          text: comment,
        },
      };

      await apiCall('POST', url, headers, data, res);
      return sendResponse(res, 200, true, 'Comment added successfully');

    } catch (error) {
      // Error handling is already done in apiCall
    }
  },
};

module.exports = LinkedInController;
