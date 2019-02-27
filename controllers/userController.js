const User = require('../models/user');
const Talk = require('../models/talk');
const School = require('../models/school');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

const HASH_TIMES = 10; // times of hashing the passwords

// POST /signup
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, HASH_TIMES)
        .then(hashedPassword => {
            // still need validation
            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                major: req.body.major,
                phone: req.body.phone,
                school: new mongoose.Types.ObjectId(req.body.schoolId),
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

// GET /user
exports.getUser = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .populate('school')
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
                    firstName: user.firstName,
                    lastName: user.lastName,
                    major: user.major,
                    phone: user.phone,
                    schoolId: user.school._id,
                    school: user.school.name,
                    type: user.type,
                    resumePath: user.resumePath,
                    avatarPath: user.avatarPath
                }
            });
        })
        .catch(err => {
            next(err);
        })
};

// PATCH /user/edit update user information
exports.setUser = async (req, res, next) => {
    const newFirstName = req.body.firstName;
    const newLastName = req.body.lastName;
    const newMajor = req.body.major;
    const newPhone = req.body.phone;
    const newSchoolId = req.body.schoolId;

    let user = null;
    const userId = req.userId;
    User.findById(userId)
        .then(user => {
            this.user = user;
            if(!user) {
                const err = new Error('User not found');
                err.statusCode = 401;
                throw err;
            }
            this.user.firstName = newFirstName;
            this.user.lastName = newLastName;
            this.user.major = newMajor;
            this.user.phone = newPhone;
            // if school changes, all talks should be deleted, and update the talks
            if(user.school.toString() !== newSchoolId) {
                this.user.school = new mongoose.Types.ObjectId(newSchoolId);
                if(user.talks) { // user has talks, find all talks
                    return Talk.find({
                        '_id': { $in: user.talks }
                    });
                }
            }
            return null;
        })
        .then(talks => {
            // create a async function to go through the talks
            const unscheduleTalks = async (talks) => {
                try {
                    if(talks) {
                        this.user.talks = [];
                        for await (const talk of talks) {
                            talk.scheduled = false;
                            talk.scheduledBy = null;
                            await talk.save();
                        }
                    }
                } catch (e) {
                    throw(e);
                }
            };
            return unscheduleTalks(talks);
        })
        .then(result => {
            return this.user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User info updated',
                user: this.user
            });
        })
        .catch(err => next(err));
};

// GET /scheduledtalks
exports.getScheduledTalks = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .populate({
            path: 'talks',
            populate: [
                {
                    path: 'company',
                    select: 'name'
                },
                {
                    path: 'careerfair',
                    select: 'name'
                },
            ]
        })
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

// POST /scheduledtalks
exports.addScheduledTalk = (req, res, next) => {
    const userId = req.userId;
    const talkId = req.body.talkId;
    let user;
    let talk;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            this.user = user;
            return Talk.findById(talkId);
            // user.talks.push(new mongoose.Types.ObjectId(talkId));
            // return user.save();
        })
        .then(talk => {
            if(!talk) {
                const err = new Error('Talk nor found');
                err.statusCode = 401;
                throw err;
            }
            if(talk.scheduled) {
                const err = new Error('Talk has been scheduled');
                err.statusCode = 500;
                throw err;
            }
            this.talk = talk;
            talk.scheduled = true;
            talk.scheduledBy = new mongoose.Types.ObjectId(this.user._id);
            return talk.save();
        })
        .then(result => {
            this.user.talks.push(this.talk);
            return this.user.save();
        })
        .then(result => {
            res.status(201).json({message: result});
        })
        .catch(err => next(err));
};

// POST remove an scheduled talk
exports.removeScheduledTalk = (req, res, next) => {
    const userId = req.userId;
    const talkId = req.body.talkId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            user.talks.pull(talkId);
            return user.save()
        })
        .then(result => {
            return Talk.findById(talkId);
        })
        .then(talk => {
            talk.scheduled = false;
            talk.scheduledBy = null;
            return talk.save()
        })
        .then(result => {
            res.json({message: 'Talk unscheduled'});
        })
        .catch(err => next(err));
}

// POST upload resume
exports.addResume = (req, res, next) => {
    const resumePath = 'storage/resumes/' + req.file.filename;
    const userId = req.userId;
    // update user info
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            user.resumePath = resumePath;
            return user.save();
        })
        .then(result => {
            res.json({message: 'Resume saved', path: resumePath});
        })
        .catch(error => next(error));
};

// GET get resume from storage
exports.downloadResume = (req, res, next) => {
    const userId = req.userId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            const resumePath = user.resumePath;
            if(!resumePath) {
                const err = new Error('Resume not found');
                err.statusCode = 404;
                throw err;
            }
            fs.readFile(resumePath, (err, data) => {
                if(err) return next(err);
                res.send(data);
            });
        });
};

// PATCH update user avatar
exports.uploadAvatar = (req, res, next) => {
    const avatarPath = 'storage/avatars/' + req.file.filename;
    const userId = req.userId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User nor found');
                err.statusCode = 401;
                throw err;
            }
            user.avatarPath = avatarPath;
            return user.save();
        })
        .then(result => {
            res.json({message: 'Avatar saved', path: avatarPath});
        })
        .catch(error => next(error));
};