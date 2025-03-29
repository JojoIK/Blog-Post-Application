// Import required models and dependencies
const jwt = require("jsonwebtoken");
const Blog = require("../blogModels/blogModel");
const User = require("../blogModels/userModel");

// Middleware to verify user authentication
const authenticate = async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.user_token
    const secret = process.env.JSON_SECRET

    // Check if token exists
    if (!token) {
        return res.status(401).json({ msg: 'Authentication required. No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const verifyToken = jwt.verify(token, secret)

        // Find user associated with the token, excluding password
        const user = await User.findById(verifyToken.id)

        // Validate token and user
        if (!verifyToken || !user) {
            return res.json({ msg: 'Invalid token' }).status(401)
        }

        req.user = user

        // Continue to the next middleware
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            msg: 'Authentication failed',
            details: error.message
        })    
    }
};

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
    // Get user ID from authenticated request
    const userId = req.user.id
    try {
        const user = await User.findById(userId)

        // Check if user exists and has admin role
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden! - Admin access required' })
        }

        // Continue to the next middleware     
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            msg: 'Authorization check failed',
            details: error.message
        })    
    }
};

// Middleware to check if user is an admin or the post's author
const isAdminOrAuthor = async (req, res, next) => {

    // Get user ID from authenticated request and post ID from URL parameters
    const userId = req.user.id
    const paramId = req.params.id
    try {
        const user = await User.findById(userId)
        const post = await Blog.findById(paramId)

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }

        // Allow access if user is admin or the post's author
        if (user.role === 'admin' || post.author.toString() === user._id.toString()) {
            return next()
        }

        // Deny access if user is neither admin nor author     
        res.status(403).json({ error: 'Forbidden! - You can only modify your own post' })
    } catch (error) {
        console.log(error)
        res.status(401).json({
            msg: 'Authorization check failed',
            details: error.message
        })  
    }
};

module.exports = { authenticate, isAdmin, isAdminOrAuthor }