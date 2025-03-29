// Import required models
const Comment = require('../blogModels/commentModel');
const User = require('../blogModels/userModel');
const Blog = require('../blogModels/blogModel');


const get_All_Users = async (req, res) => {
    try {
        const allUsers = await User.find()

        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch users' });
    }
};

const change_User_Role = async (req, res) => {
    const { role } = req.body
    const paramId = req.params.id
    try {
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role - Access denied' })
        }

        const user = await User.findByIdAndUpdate(
            paramId,
            { role },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }

        const msg = 'User role updated successfully'
        res.status(200).json({ msg, user });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to update user role' })
    }
};

const delete_A_User = async (req, res) => {
    const paramId = req.params.id

    try {
        //Find the user to be deleted
        const user = await User.findById(paramId)
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }

        //Check for valid role
        if (user.role !== 'admin' && user.role !== 'user') {
            return res.status(403).json({ msg: 'Invalid role - Access denied' })
        }

        //Get all blog posts by this user
        const userBlogs = await Blog.find({ author: paramId })

        //For Each Blog Post
        for (const blog of userBlogs) {
            //Delete all comments associated with the blog post
            await Comment.deleteMany({ post: blog._id });

            //Delete the blog post
            await Blog.findByIdAndDelete(blog._id)
        }

        //Delete all comments made by thiis user on other blog posts 
        const userComments = await Comment.find({ author: paramId })

        //For each comment remove the reference from the associated blog post
        for (const comment of userComments) {
            await Blog.findByIdAndUpdate(
                comment.post,
                { $pull: { comments: comment._id } }
            )
        }

        //Delete all comments by this user
        await Comment.deleteMany({ author: paramId })

        //Finally delete the user 
        await User.deleteOne({ _id: paramId });

        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to delte user' })
    }
};

module.exports = { get_All_Users, change_User_Role, delete_A_User }