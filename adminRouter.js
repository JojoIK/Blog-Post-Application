const { Router } = require("express");
const {
    get_All_Users,
    change_User_Role,
    delete_A_User
} = require("../blogController/adminController");
const {
    authenticate,
    isAdmin
} = require("../Middleware/authMiddleware");


const adminRouter = Router()

adminRouter
    .get('/admin/users', authenticate, isAdmin, get_All_Users)
    .put('/admin/userrole/:id', authenticate, isAdmin, change_User_Role)
    .delete('/admin/removeuser/:id', authenticate, isAdmin, delete_A_User)

module.exports = adminRouter;