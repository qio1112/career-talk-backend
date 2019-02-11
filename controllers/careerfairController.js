const Careerfair = require('../models/careerfair');
const School = require('../models/school');
const User = require('../models/user');
const { validationResult } = require('express-validator/check');

// get all careerfairs by school id from db
// GET /careerfairs
exports.getCareerfairs = (req, res, next) => {
    const userId = req.userId;
    let schoolId;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User needs log in');
                err.statusCode = 401;
                throw err;
            }
            this.schoolId = user.school;
            return School.findById(this.schoolId).populate('careerfairs');
        })
        .then(school => {
            if(!school) {
                const err = new Error('School not found');
                err.statusCode = 404;
                throw err;
            }
            return school.careerfairs;
        })
        .then(careerfairs => {
            res.status(200).json({
                message: 'All career fairs fetched',
                careerfairs: careerfairs
            });
        })
        .catch(err => {
            next(err);
        });
};

// get the careerfair with certain id
// GET /careerfair/:careerfairId
exports.getCareerfairById = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    Careerfair.findById(careerfairId)
        .populate('companies.company')
        .execPopulate()
        .then(cf => {
            if(!cf) {
                const err = new Error('Could not find the career fare.');
                err.statusCode = 401;
                throw err;
            }
            res.status(200).json({
                message: 'Career fair fetched.',
                careerfair: cf
            });
        })
        .catch(err => {
            next(err);
        });
};