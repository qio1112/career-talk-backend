const User = require('../models/user');
const School = require('../models/school');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

const HASH_TIMES = 10; // times of hashing the passwords

// PUT /signup
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, HASH_TIMES)
        .then(hashedPassword => {
            // still need validation
            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                school: req.body.school,
                scheduledTalks: [],
                type: req.body.type
            });
            return newUser.save();
        })
        .then(result => {
            res.status(201).json({
                message: "User created!",
                result: result
            });
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);
        });
};

// POST /login
exports.login = (req, res, next) => {
    let user;
    User.findOne({email: req.body.email})
        .then(user => {
            this.user = user;
            if(!user) {
                return res.status(401).json({
                    message: "No such user was found"
                });
            }
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if(!result) {
                return res.status(401).json({
                    message: "Password not match"
                });
            }
            // password correct, create jwt
            const token = jwt.sign(
                {email: this.user.email, userId: this.user._id}, 
                'jwt_encode_secret_private_q2*d3-=314;3mffgi3reqwe355',
                { expiresIn: '3600s' }
            );
            res.status(200).json({
                message: 'Log in succeeded',
                token: token,
                expiresIn: "3600", // 3600 seconds
                userId: this.user._id.toString()
            });
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);
        });
};

// GET /userinfo
exports.getUser = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .populate('school')
        .execPopulate()
        .then(user => {
            if(!user) {
                const err = new Error('User not found');
                err.statusCode = 401;
                throw 401;
            }
            res.status(200).json({
                message: 'User fetched',
                user: {
                    userId: user._id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    phone: user.phone,
                    schoolId: user.school._id,
                    school: user.school.name,
                    type: user.type
                }
            });
        })
        .catch(err => {
            next(err);
        })
};

// POST /userinfo/edit
exports.setUser = (req, res, next) => {
    const username = req.body.username;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const birthday = new Date(req.body.birthday); //"1990-01-12"

    const userId = req.userId;
    User.findById(usereId)
        .then(user => {
            if(!user) {
                const err = new Error('User not found');
                err.statusCode = 401;
                throw err;
            }
            user.username = username;
            user.firstname = firstname;
            user.lastname = lastname;
            user.birthday = birthday;
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User info updated',
                result: result
            });
        })
        .catch(err => next(err));
};

// GET /scheduledtalks
exports.getScheduledTalks = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .populate('talks.talk')
        .execPopulate()
        .then(user => {
            if(!user) {
                const err = new Error('User not found');
                err.statusCode = 401;
                throw err;
            }
            const talks = user.talks;
            res.status(200).json({
                message: 'Talks found',
                talks: talks
            });
        })
        .catch(err => next(err));
};

// POST /scheduledtalks/:talkId
exports.addScheduledTalk = (req, res, next) => {
    const userId = req.usuerId;
    const talkId = req.params.talkId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            user.talks.push(new mongoose.Types.ObjectId(talkId));
            return user.save();
        })
        .then(result => {
            res.status(201).json({message: 'Talk scheduled', result: result});
        })
        .catch(err => next(err));
};
