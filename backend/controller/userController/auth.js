
const User = require('../../model/user');
const { generateToken } = require('../../Middleware/jwtAuthorization');
const {sendResponse} = require('../../utility/responseHelper');

// Signup function
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return sendResponse(res, 400, false, 'Name, email, and password are required.', null, 'error');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 409, false, 'Email already in use. Please use a different email.',null, 'error');
        }

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            password,
        });

        // Save the user to the database
        await newUser.save();

        return sendResponse(res, 201, true, 'User registered successfully.', newUser, null, 'error');
    } catch (error) {
        console.error('Error registering user:', error);
        return sendResponse(res, 500, false, 'Server error while registering user.', null, error.message);
    }
};

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return sendResponse(res, 400, false, 'Email and password are required.', null, 'error');
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return sendResponse(res, 401, false, 'Invalid email or password.', null, 'error');
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return sendResponse(res, 401, false, 'Invalid email or password.', null, 'error');
        }

        // Create and send a JWT token
        const token = generateToken(user._id);

        return sendResponse(res, 200, true, 'Login successful.', { token });
    } catch (error) {
        console.error('Error logging in:', error);
        return sendResponse(res, 500, false, 'Server error while logging in.', null, error.message);
    }
};

module.exports = { signup, login };
