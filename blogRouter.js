const { Router } = require("express");
const {
    post_A_Blog,
    get_All_Posts,
    get_A_Post,
    update_A_Post,
    delete_A_Post,
    /*get_Blogs_By_Query,*/
    get_User_Posts
} = require("../blogController/blogController");
const {
    authenticate,
    isAdminOrAuthor
} = require("../Middleware/authMiddleware");


const blogRouter = Router()

blogRouter
    .post('/blog/new', authenticate, post_A_Blog)
    .get('/blog/all', get_All_Posts)
    .get('/blog/:id', get_A_Post)
    .get('/blog/user/:id', get_User_Posts)
    .put('/blog/edit/:id', authenticate, isAdminOrAuthor, update_A_Post)
    .delete('/blog/remove/:id', authenticate, isAdminOrAuthor, delete_A_Post)

module.exports = blogRouter;
