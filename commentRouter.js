const { Router } = require("express");
const {
    create_A_Comment,
    get_All_Blog_Comments,
    delete_My_Comment
} = require("../blogController/commentController");
const {
    authenticate
} = require("../Middleware/authMiddleware");


const commentRouter = Router();

commentRouter
    .post('/comment/:id/new', authenticate, create_A_Comment)
    .get('/comment/blog/:id', get_All_Blog_Comments)
    .delete('/comment/remove/:id', authenticate, delete_My_Comment)

module.exports = commentRouter;