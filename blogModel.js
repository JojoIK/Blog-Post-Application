const mongoose = require("mongoose");

// Define schema for blog post 
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogUser',
        required: true
    },
    view: {
        type: Number,
        default: 0
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blogComment'
        }
    ]
}, {
    timestamps: true
});

// Create and export the blog post model
module.exports = mongoose.model('blogPost', blogSchema);