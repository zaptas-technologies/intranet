const jwt = require('jsonwebtoken');
const config = require("../config/connect");
const User = require('../model/user');
const LinkedInUser = require('../model/linkedinUserSchema');
const protect = async (req, res, next) => {

    try {
        let token;

        // Check if the authorization header is present and contains a Bearer token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token is found, return an unauthorized response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided',
            });
        }

        // Verify the token

        const decoded = jwt.verify(token, config.jwt.secret);

        // Find the user in the database
        const user = await User.findById(decoded.id).populate('linkedinAccount');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        req.userId = decoded.id; // Attach user ID to request

        // Check if the linked LinkedIn user has an access token
        if (user.linkedinAccount) {
            const linkedInUser = await LinkedInUser.findById(user.linkedinAccount);
            // If the LinkedIn user has an access token, attach it to the request
            if (linkedInUser && linkedInUser.accessToken) {
                const decoded = jwt.verify(linkedInUser.accessToken, config.jwt.secret);
                req.accessToken = decoded.id; // Attach access token
            }
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle specific error cases
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token has expired',
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, invalid token',
            });
        } else {
            // Log unexpected errors for debugging (optional)
            console.error('Token verification error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while verifying token',
                error: error.message,
            });
        }
    }
};




const generateToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn, // Use dynamic expiration time
    });
};





module.exports = { protect, generateToken };
