const Careerfair = require('../models/careerfair');
const School = require('../models/school');
const User = require('../models/user');
const googleMaps = require('@google/maps');
const apiKeys = require('../apiKeys');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

// set google maps api to get location of career fairs
const googleMapsClient = googleMaps.createClient({
    key: apiKeys.googleMapsApiKey,
    Promise: Promise
});

// get all careerfairs by school id from db
// GET /careerfairs
exports.getCareerfairs = (req, res, next) => {
    const userId = req.userId;
    let schoolId;
    let careerfairsFound;
    User.findById(userId)
        .then(user => {
            if(!user) {
                const err = new Error('User needs log in');
                err.statusCode = 401;
                throw err;
            }
            schoolId = user.school;
            return School.findById(schoolId).populate('careerfairs');
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
            const setCoordinates = async (careerfairs) => {
                try {
                    for await (let careerfair of careerfairs) {
                        if(!careerfair.latitude || !careerfair.longitude) {
                            await googleMapsClient.geocode({address: careerfair.address}).asPromise()
                            .then(response => {
                                if(response.json.results.length !== 0) {
                                    careerfair.latitude = response.json.results[0].geometry.location.lat;
                                    careerfair.longitude = response.json.results[0].geometry.location.lng;
                                } else {
                                    careerfair.latitude = null;
                                    careerfair.longitude = null;
                                }
                            });
                            await careerfair.save();
                        }
                    }
                    careerfairsFound = careerfairs;
                } catch(e) {
                    throw(e);
                }
            }
            return setCoordinates(careerfairs);
        })
        .then(result => {
            res.status(200).json({
                message: 'All career fairs fetched',
                careerfairs: careerfairsFound
            });
        })
        .catch(err => {
            next(err);
        });
};

// GET majors in the career fair by checking all companies 
exports.getMajorsInCareerfair = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    Careerfair.findById(careerfairId) 
        .populate({
            path: 'companies',
            select: 'majors'
        })
        .then(cf => {
            if(!cf) {
                const err = new Error('Could not find the career fair');
                err.statusCode = 404;
                throw err;
            }
            const set = new Set();
            cf.companies.forEach(company => {
                company.majors.forEach(major => {
                    set.add(major.trim().toLowerCase());
                })
            })
            const majorsArray = Array.from(set);
            res.status(200).json({message: "Majors fetched.", majors: majorsArray});
        })
}

// get the careerfair with certain id
// GET /careerfair/:careerfairId
exports.getCareerfairById = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    Careerfair.findById(careerfairId)
        .populate('companies.company')
        .then(cf => {
            if(!cf) {
                const err = new Error('Could not find the career fair.');
                err.statusCode = 404;
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

// create a new career fair
// POST /careerfair
exports.createCareerfair = (req, res, next) => {
    // need validation
    const userId = req.userId;
    const name = req.body.name;
    // const date = new Date(req.body.date);
    const address = req.body.location;
    const description = req.body.description;
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    let schoolId;
    let newCareerfair;
    User.findById(userId)
        .then(user => {
            const schoolId = user.school;
            this.schoolId = schoolId;
            return Careerfair.create({
                name: name,
                school: new mongoose.Types.ObjectId(schoolId),
                startTime: startTime,
                endTime: endTime,
                address: address,
                description: description
            });
        })
        .then(newCareerfair => {
            this.newCareerfair = newCareerfair;
            return School.findById(this.schoolId)
        })
        .then(school => {
            school.careerfairs.push(new mongoose.Types.ObjectId(this.newCareerfair._id));
            return school.save();
        })
        .then(result => {
            res.status(201).json({
                careerfair: this.newCareerfair,
                message: 'New career fair created.'
            });
        })
        .catch(e => next(e));
}