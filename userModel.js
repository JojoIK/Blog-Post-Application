const mongoose = require("mongoose");

// Define schema for blog user 
const User = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    fullname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 400
    },
    publications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blogPost'
        }
    ]

}, {
    timestamps: true
});


// Create and export the blog user model
module.exports = mongoose.model('blogUser', User);