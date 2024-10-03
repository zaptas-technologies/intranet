const jwt = require('jsonwebtoken'); // For generating tokens
const User = require('../../model/user');
const { generateToken } = require('../../Middleware/jwtAuthorization');

// Signup function
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.',
            });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already in use. Please use a different email.',
            });
        }

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            password,
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: newUser,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while registering user.',
            error: error.message,
        });
    }
};


// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Create and send a JWT token
        const token = generateToken(user._id)


        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while logging in.',
            error: error.message,
        });
    }
};

module.exports = { signup, login };
