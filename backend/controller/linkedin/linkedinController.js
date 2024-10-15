const axios = require('axios');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const config = require('../../config/connect');
const { sendResponse, purifyText, apiCall } = require('../../utility/responseHelper');
const LinkedInUser = require('../../model/linkedinUserSchema');
const { generateToken } = require('../../Middleware/jwtAuthorization');
const User = require('../../model/user');


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
      // Exchange authorization code for access token and refresh token
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

      const { access_token, refresh_token, expires_in, id_token } = tokenResponse;

      if (!access_token) {
        throw new Error('Missing access token in response');
      }

      // Verify and decode the ID token (LinkedIn user information)
      const decodedToken = await LinkedInController.verifyIdToken(id_token);
      const { email, name, sub: linkedinId } = decodedToken;

      // Check if a manual user already exists with the same email
      let manualUser = await User.findOne({ email });

      // If manual user exists, link LinkedIn account
      if (manualUser) {
        let linkedinUser = await LinkedInUser.findOne({ linkedinId });

        // If LinkedIn user doesn't exist, create and link it
        if (!linkedinUser) {
          linkedinUser = new LinkedInUser({
            linkedinId,
            linkedinEmail: email,
            name,
            accessToken: generateToken(access_token), // Save the raw access token, it will be hashed on save
            refreshToken: generateToken(refresh_token), // Save the refresh token
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
            manualUser: manualUser._id, // Link LinkedIn to manual user
          });

          await linkedinUser.save(); // The access token will be hashed in the pre-save hook

          // Update manual user to reference LinkedIn account
          manualUser.linkedinAccount = linkedinUser._id;
          await manualUser.save();

          return sendResponse(res, 200, true, 'LinkedIn account linked successfully', { userId: manualUser._id });
        }

        // If LinkedIn user exists, update the access and refresh tokens
        linkedinUser.accessToken = generateToken(access_token); // Update access token
        linkedinUser.refreshToken = generateToken(refresh_token); // Update refresh token
        linkedinUser.tokenExpiry = new Date(Date.now() + expires_in * 1000); // Update token expiry

        await linkedinUser.save(); // Save updated tokens

        // Link to manual user if not already linked
        manualUser.linkedinAccount = linkedinUser._id;
        await manualUser.save();

        return sendResponse(res, 200, true, 'LinkedIn account linked successfully and tokens updated', { userId: manualUser._id });

      } else {
        // Create a new manual user if not exists
        manualUser = new User({
          name,
          email,
          password: 'linkedin', // Generate a random password or prompt for one later
          role: 'user', // Default role as 'user', adjust if needed
        });
        await manualUser.save();

        let linkedinUser = await LinkedInUser.findOne({ linkedinId });

        // If LinkedIn user doesn't exist, create and link it
        if (!linkedinUser) {
          linkedinUser = new LinkedInUser({
            linkedinId,
            linkedinEmail: email,
            name,
            accessToken: generateToken(access_token), // Save the raw access token, it will be hashed on save
            refreshToken: generateToken(refresh_token), // Save the refresh token
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
            manualUser: manualUser._id, // Link LinkedIn to manual user
          });

          await linkedinUser.save();
          manualUser.linkedinAccount = linkedinUser._id;
          await manualUser.save();

          return sendResponse(res, 201, true, 'User registered and LinkedIn account linked successfully', { userId: manualUser._id });
        } else {
          // If LinkedIn user exists, update the access and refresh tokens
          linkedinUser.accessToken = generateToken(access_token); // Update access token
          linkedinUser.refreshToken = generateToken(refresh_token); // Update refresh token
          linkedinUser.tokenExpiry = new Date(Date.now() + expires_in * 1000); // Update token expiry

          await linkedinUser.save(); // Save updated tokens

          manualUser.linkedinAccount = linkedinUser._id;
          await manualUser.save();

          return sendResponse(res, 201, true, 'User registered and LinkedIn account linked successfully, tokens updated', { userId: manualUser._id });
        }
      }


      // Redirect to the frontend with a success message or token if needed
      res.redirect(`http://localhost:3060/fetch`);

    } catch (error) {
      const errorMessage = error.response?.data?.error_description || 'Error during token exchange';
      return sendResponse(res, error.response?.status || 500, false, 'Authentication failed', null, errorMessage);
    }
  },


  userInfo: async (req, res) => {
    try {
      const accessToken = req?.accessToken
      // Define the LinkedIn user profile API endpoint
      const url = 'https://api.linkedin.com/v2/userinfo';
      // console.log(accessToken)

      // Make a request to LinkedIn API to fetch user details
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          // 'LinkedIn-Version': '202409', // Adjust as per LinkedIn's API versioning
        },
      });

      return sendResponse(res, 200, true, 'User information fetched successfully', response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error.message);
      return sendResponse(res, 500, false, 'Failed to fetch user information', null);
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
      const access_token = req.accessToken
      const url = `${retrive_posts}?author=${encodeURIComponent(ZAPTAS_ORG_URN)}&q=author&count=10&sortBy=LAST_MODIFIED`;
      console.log(access_token)
      const headers = {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202409',
      };

      const response = await apiCall('GET', url, headers, null, res);

      let structuredPosts = [];
      console.log(response.elements[0])
      for (const post of response.elements) {
        const likeCount = await LinkedInController.fetchLikesCount(post.id, access_token);
        const comments = await LinkedInController.fetchComments(post.id, access_token);

        structuredPosts.push({
          id: post.id,
          commentary: purifyText(post.commentary),
          author: post.author,
          publishedAt: post.publishedAt,
          visibility: post.visibility,
          imageUrl: post.content?.media?.id
            ? await LinkedInController.fetchImageUrl(post.content.media.id, access_token)
            : null,
          likeCount,
          comments
        });
      }

      return sendResponse(res, 200, true, 'fetched successfully', { posts: structuredPosts });

    } catch (error) {
      console.error('Failed to retrieve posts:', error.message);
      // Error handling is already done in apiCall
    }
  },
  fetchLikesCount: async (postId, access_token) => {
    const likesUrl = `https://api.linkedin.com/v2/socialActions/${postId}/likes`;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await apiCall('GET', likesUrl, headers, null, null);
      const totalLikes = response.paging.total; // Total likes count
      const likers = response.elements.map(like => like.actor); // List of user URNs who liked the post

      return {
        totalLikes,
        likers,
      };
    } catch (error) {
      console.error('Failed to retrieve likes:', error.message);
      return 0; // Return 0 if there was an error
    }
  },

  // Function to fetch comments for a specific post
  fetchComments: async (postId, access_token) => {
    const commentsUrl = `https://api.linkedin.com/v2/socialActions/${postId}/comments`;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await apiCall('GET', commentsUrl, headers, null, null);
      const comments = response.elements.map(comment => ({
        id: comment.id,
        actor: comment.actor,
        message: comment.message.text,
        createdAt: new Date(comment.created.time).toISOString(),
        lastModifiedAt: new Date(comment.lastModified.time).toISOString(),
      }));

      return comments; // Return structured comments
    } catch (error) {
      console.error('Failed to retrieve comments:', error.message);
      return []; // Return an empty array if there was an error
    }
  },

  fetchImageUrl: async (imageId, accessToken) => {
    const url = `https://api.linkedin.com/rest/images/${encodeURIComponent(imageId)}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202409'
    };

    const response = await axios.get(url, { headers });
    return response.data.downloadUrl; // Adjust this based on the actual response structure
  },

  likePost: async (req, res) => {
    const postId = 'urn:li:share:7250408800510222337';

    const access_token = req.accessToken


    try {
      const response = await axios.get(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postId)}/likes`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
      console.log(response?.data)
      return response.data;

      await apiCall('POST', url, headers, data, res);
      return sendResponse(res, 200, true, 'Post liked successfully');

    } catch (error) {
      // Error handling is already done in apiCall
      return sendResponse(res, error.response?.status || 500, false, 'Like failed', null, error.response ? error.response.data : error.message);
    }
  },

  commentOnPost: async (req, res) => {
    const { postId, comment } = req.body;
    const access_token = req.accessToken
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
