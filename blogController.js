const Blog = require('../blogModels/blogModel');
const Comment = require('../blogModels/commentModel');
const User = require('../blogModels/userModel');

// Controller to create a new blog post
const post_A_Blog = async (req, res) => {
    const { title, content, view } = req.body
    const tokenId = req.user.id
    try {
        const user = await User.findById(tokenId)
        if(!user){
            return res.status(404).json({msg: 'Register before you can publish'})
        }

        //Create a new blog post
        const Post = new Blog({
            title,
            content,
            view,
            author: tokenId
        });
        const newPost = await Post.save();

        //Add blog post to user's publications 
        user.publications.push(newPost._id)
        await user.save()

        const msg = 'Blog post created successfully: '
        res.status(200).json({ msg, newPost })

    } catch (error) {
        res.status(500).json({
            error: 'Failed to create blog post',
            details: error.message
        });
    }
};

// Controller to retrieve all blog posts
const get_All_Posts = async (req, res) => {
    try {
        // Find all posts with populated author and comment details
        const allPosts = await Blog.find()
            .populate('author', 'username fullname')
            .populate({
                path: 'comments',
                populate: {path: 'author', select: 'username fullname'}
            })
            .sort({timestamps: -1 })

        res.status(200).json(allPosts)
    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch posts', details: error.message });
    }
};

// Controller to retrieve a single blog post
const get_A_Post = async (req, res) => {
    const paramId = req.params.id
    try {
        const onePost = await Blog.findById(paramId)
            .populate('author', 'username fullname bio')//Populate author's details
            .populate({
                path: 'comments',
                populate: {path: 'author', select: 'username fullname'}
            })

        if (!onePost) {
            return res.status(404).json({ msg: 'Blog post not found' })
        }

        //Increament view count 
        onePost.view = (onePost.view || 0) + 1
        await  onePost.save(); 

        res.status(200).json(onePost)

    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch post', details: error.message });
    }
};

// Controller to update a blog post
const update_A_Post = async (req, res) => {
    const { title, content, view } = req.body
    const paramId = req.params.id
    const tokenId = req.user.id

    try {
        const post = await Blog.findById(paramId)
        if (!post) {
            return res.status(404).json({ msg: 'Blog post not found' })
        }

        // Controller to update a blog post
        const postUpdate = await Blog.findByIdAndUpdate(
            paramId,
            {
                title,
                content,
                view,
                author: tokenId
            },
            { new: true }
        ).populate('author', 'username fullname')

        const msg = 'Blog post updated successfully:'
        res.status(200).json({ msg, postUpdate })
    } catch (error) {
        res.status(500).json({ msg: 'Failed to update blog post', details: error.message });
    }
};

// Controller to delete a blog post
const delete_A_Post = async (req, res) => {
    const paramId = req.params.id
    try {
        const post = await Blog.findById(paramId)
        if (!post) {
            return res.status(404).json({ msg: 'Blog post not found' })
        }

        //Remove blog post from user's publications
        await User.findByIdAndUpdate(
            post.author,
            { $pull: { publications: paramId } }
        )

        //Delete all comments associated with this post
        await Comment.deleteMany({ post: paramId })

        //Delete the blog post
        await Blog.findByIdAndDelete(paramId)

        res.status(200).json({ msg: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to delete blog post', details: error.message });
    }
};

// Controller to get all posts by a specific user
const get_User_Posts = async (req, res) => {
    const userId = req.params.id
    try {
        // Find user and populate publication with detailed information
        const userPosts = await User.find(userId)
            .populate({
                path: 'publications',
                populate: {path: 'author', select: 'username fullname'}
            })
            .sort({ createdAt: -1 })// sort by most recent views
            .select('publications username fullname')
        
        if (!userPosts) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json(userPosts)
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch user posts', 
            details: error.message 
        })
    }
}


// Export all blog-related controllers
module.exports = { 
    post_A_Blog, 
    get_All_Posts, 
    get_A_Post, 
    update_A_Post, 
    /*get_Blogs_By_Query*/ 
    delete_A_Post, 
    get_User_Posts 
}