const mongoose = require("mongoose");

// Define schema for posting comments
const Comment = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogUser',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogPost',
        required: true
    }
}, {
    timestamps: true
});


// Create and export the ECUser model
module.exports = mongoose.model('blogComment', Comment);