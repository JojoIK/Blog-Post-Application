const Blog = require('../blogModels/blogModel');
const Comment = require('../blogModels/commentModel');
const User = require('../blogModels/userModel');


const create_A_Comment = async (req, res) => {
    const { content } = req.body
    paramId = req.params.id
    tokenId = req.user.id
    try {
        const postToComment = await Blog.findById(paramId)
        if (!postToComment) {
            return res.status(404).json({ msg: 'Blog post not found' })
        }

        //Create the comment
        const newComment = new Comment({
            content,
            author: tokenId,
            post: paramId
        });

        await newComment.save()

        //Add comment reference to blog post 
        await Blog.findByIdAndUpdate(
            paramId,
            { $push: { comments: newComment._id } }
        )

        //Populate author info before returning
        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'username fullname')

        res.status(200).json({ msg: 'Comment added successfully:', comment: populatedComment });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to add comment' });
    }
};

const get_All_Blog_Comments = async (req, res) => {
    const paramId = req.params.id

    try {
        const commentedBlog = await Blog.findById(paramId)
        if (!commentedBlog) {
            return res.status(404).json({ msg: 'Blog not found' })
        }

        const blogComments = await Comment.find({ post: paramId })
            .populate('author', 'username fullname')
            .sort({ timestamps: -1 })

        if (blogComments.length === 0) {
            return res.status(200).json({ msg: 'No comment for this blog yet' })
        }

        res.status(200).json(blogComments);

    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch comments', details: error.message });
    }
};

const delete_My_Comment = async (req, res) => {
    const paramId = req.params.id
    const tokenId = req.user.id

    try {
        const CommentToDelete = await Comment.findById(paramId)
        if (!CommentToDelete) {
            return res.status(404).json({ msg: 'Comment not found' })
        }

        const user = await User.findById(tokenId)
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }

        //Check if user is admin or author of the comment
        if (user.role != 'admin' && CommentToDelete.author.toString() !== tokenId) {
            return res.status(403).json({ msg: 'Unauthorized!: You can only delete your own comments' })
        }

        //Remove comment reference from blog post
        await Blog.findByIdAndUpdate(
            CommentToDelete.post,
            { $pull: { comments: paramId } }
        )

        //Delete the comment
        await Comment.findByIdAndDelete(paramId);

        res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to delete comment', details: error.message })
    }
};


// Export comment-related controllers
module.exports = { create_A_Comment, get_All_Blog_Comments, delete_My_Comment }