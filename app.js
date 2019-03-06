/**
 * main file of the Career Talk project
 * RESTful
 */
const express = require('express');
const mongoose = require('mongoose');
const careerfairRoutes = require('./routes/careerfairRoutes');
const companyRoutes = require('./routes/companyRoutes');
const userRoutes = require('./routes/userRoutes');
const apiKeys = require('./apiKeys');
const path = require('path');

// initiate app
const app = express();

// parse request bodies
app.use(express.json());

// static path for file storage, like images
app.use('/storage', express.static('storage')); // it's default

// solve CORS errors
app.use((req, res, next) => {
    // res.setHeader(header, url), * stands for all urls
    res.setHeader('Access-Control-Allow-Origin', '*');
    // set the methods allowed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    // set headers allowed
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// routes
app.use(companyRoutes, careerfairRoutes, userRoutes);

// error handling
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

// connect to database
mongoose.connect(apiKeys.mongoDBApiKey)
    .then(result => {
        const server = app.listen(3000);
        console.log('Database connected!');
    })
    .catch(err => console.log(err));