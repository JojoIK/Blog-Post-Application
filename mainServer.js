const express = require('express');
const dbConnect = require('./Configurations/db');
const cookieParser = require('cookie-parser');
const userRouter = require('./blogRoutes/userRouter');
const blogRouter = require('./blogRoutes/blogRouter');
const commentRouter = require('./blogRoutes/commentRouter');
const adminRouter = require('./blogRoutes/adminRouter');

// Load environment variables
require('dotenv').config();

// Initialize express app
const blogapp = express();
const port = process.env.PORT || 9000 

// Connect to MongoDB
dbConnect();

// Middleware
blogapp.use(express.json());
blogapp.use(express.urlencoded({ extended: true }));
blogapp.use(cookieParser());// Always remember to invoke the middlewares with ()

// Routes
blogapp.use('/api', userRouter);
blogapp.use('/api', blogRouter);
blogapp.use('/api', commentRouter);
blogapp.use('/api', adminRouter);


blogapp.listen(port, () => { console.log(`App running on port ${port}`) });

process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server shut down gracefully.');
      process.exit(0);
    });
  });