const { Router } = require("express");
const {
    register,
    login,
    get_A_User,
    logout,
    delete_User
} = require("../blogController/userController");
const {
    authenticate,
    isAdminOrAuthor
} = require("../Middleware/authMiddleware");

const userRouter = Router()

userRouter
    .post('/user/register', register)
    .post('/user/login', login)
    .post('/user/logout', logout)
    .get('/user/me/', authenticate, get_A_User)
    .delete('/user/removeuser', authenticate, delete_User)

module.exports = userRouter;