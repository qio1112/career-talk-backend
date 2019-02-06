const School = require('../models/school');
const User = require('../models/user');
const { validationResult } = require('express-validator/check');

// get a school by name
// GET /school/?schoolName=somename
exports.getSchoolByName = (req, res, next) => {
    const schoolName = req.query.schoolName;
    School.find(school => school.name === schoolName)
        .then(school => {
            if(!school) {
                const err = new Error('School ' + schoolName + ' not found.');
                err.statusCode = 402;
                throw err;
            }
            res.status(200).json({
                message: 'School fetched.',
                school: school
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode(500);
            }
            next(err);
        });
};

// get a school by id
// GET /school/?schoolId = someId
exports.getSchoolById = (req, res, next) => {
    const schoolId = req.query.schoolId;
    School.findById(schoolId)
        .then(school => {
            if(!school) {
                const err = new Error('School id ' + schoolId + ' not found.');
                err.statusCode = 402;
                throw err;
            }
            res.status(200).json({
                message: 'School fetched.',
                school: school
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode(500);
            }
            next(err);
        });
};

// get all schools
// GET /schools
exports.getSchools = (req, res, next) => {
    School.find()
        .then(schools => {
            res.json({
                message: 'All schools fetched',
                schools: schools
            });
        })
        .catch(err => next(err));
}