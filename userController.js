const bcrypt = require("bcryptjs");
const User = require('../blogModels/userModel');
const Token = require('../Configurations/genToken');
const Blog = require('../blogModels/blogModel');
const Comment = require('../blogModels/commentModel');

// Controller for user registration
const register = async (req, res) => {
    // Extract user details from request body
    const { username, email, password, role, fullname, address, bio } = req.body

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' })
        }

        // Hash the password for secure storage
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            fullname,
            address,
            bio
        })

        // Save user to database
        await newUser.save()

        const msg = 'User registered successfuly'
        res.status(200).json({ msg, newUser })
    } catch (error) {
        // Handle registration errors
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        })
    }
};

// Controller for user login
const login = async (req, res) => {
    const { username, password } = req.body
    try {
        // Find user by username, including password for comparison
        const user = await User.findOne({ username }).select('+password')
        if (!user) {
            return res.status(401).json({ msg: 'username or password incorrect' })
        }

        // Compare provided password with stored hashed password
        const compare = await bcrypt.compare(password, user.password)
        if (!compare) {
            return res.status(401).json({ msg: 'username or password incorrect' })
        }

        // Remove password from user object before sending
        const userObject = user.toObject()
        delete userObject.password

        // Generate authentication token
        const token = Token(user._id)

        // Send token as httpOnly cookie and user details
        const msg = 'User logged in successfuly'
        res
            .cookie('user_token', token, { httpOnly: true, sameSite: 'strict' })
            .status(200)
            .json({ msg, userObject })

    } catch (error) {
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        })
    }
};

// Controller to get current user's details
const get_A_User = async (req, res) => {
    const tokenId = req.user.id
    try {
        // Controller to get current user's details
        const user = await User.findById(tokenId)
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }

        // Send user details
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message })
    }
};

// Controller for user logout
const logout = async (req, res) => {
    try {
        // Clear authentication cookie
        res
            .clearCookie('user_token', {
                httpOnly: true,
                sameSite: 'strict'
            })
            .status(200)
            .json({ msg: 'User logged out successfully' })
    } catch (error) {
        console.error('Logout error: ', error)
        res.status(500).json({ msg: 'Failed to logout user' })
    }
};

// Controller to delete user account
const delete_User = async (req, res) => {
    const tokenId = req.user.id

    try {
        //Find the user to be deleted
        const user = await User.findById(tokenId)
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }

        //Check for valid role
        if (user.role !== 'admin' && user.role !== 'user') {
            return res.status(403).json({ msg: 'Invalid role - Access denied' })
        }

        //Get all blog posts by this user
        const userBlogs = await Blog.find({ author: tokenId })
        

        //For Each Blog Post
        for (const blog of userBlogs) {
            //Delete all comments associated with the blog post
            await Comment.deleteMany({ post: blog._id });

            //Delete the blog post
            await Blog.findByIdAndDelete(blog._id)
        }

        //Delete all comments made by this user on other blog posts 
        const userComments = await Comment.find({ author: tokenId })

        //For each comment remove the reference from the associated blog post
        for (const comment of userComments) {
            await Blog.findByIdAndUpdate(
                comment.post,
                { $pull: { comments: comment._id } }
            )
        }

        //Delete all comments by this user
        await Comment.deleteMany({ author: tokenId })

        //Finally delete the user 
        await User.findByIdAndDelete(tokenId)

        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to delete user' })
    }
};


// Export user-related controllers
module.exports = { register, login, get_A_User, logout, delete_User }