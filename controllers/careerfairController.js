const Careerfair = require('../models/careerfair');
const School = require('../models/school');
const User = require('../models/user');
const googleMaps = require('@google/maps');
const { validationResult } = require('express-validator/check');

// set google maps api to get location of career fairs
const googleMapsClient = googleMaps.createClient({
    key: 'AIzaSyCp_wy-tKCFcQ2Oy-qyoL5NU-woiJdQzsw',
    Promise: Promise
});

// get all careerfairs by school id from db
// GET /careerfairs
exports.getCareerfairs = (req, res, next) => {
    const userId = req.userId;
    let schoolId;
    let careerfairs;
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
            const setCoordinates = async (careerfairs) => {
                try {
                    for await (let careerfair of careerfairs) {
                        if(!careerfair.latitude || !careerfair.longitude) {
                            await googleMapsClient.geocode({address: careerfair.address}).asPromise()
                            .then(response => {
                                careerfair.latitude = response.json.results[0].geometry.location.lat;
                                careerfair.longitude = response.json.results[0].geometry.location.lng;
                            });
                            await careerfair.save();
                        }
                    }
                    console.log(careerfairs);
                    this.careerfairs = careerfairs;
                } catch(e) {
                    throw(e);
                }
            }
            return setCoordinates(careerfairs);
        })
        .then(result => {
            console.log(this.careerfairs);
            res.status(200).json({
                message: 'All career fairs fetched',
                careerfairs: this.careerfairs
            });
        })
        .catch(err => {
            next(err);
        });
};

// GET majors in the career fair by checking all aompanies 
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