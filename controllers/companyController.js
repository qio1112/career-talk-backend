const Company  = require('../models/company');
const Careerfair = require('../models/careerfair');
const { validationResult } = require('express-validator/check');

// get all companies in a careerfair
// GET /careerfairs/:careerfairId/companies
exports.getCompanies = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    Careerfair.findById(careerfairId)
        .populate('companies.company')
        .then(careerfair => {
            if(!careerfair) {
                const err = new Error('No such careerfair found.');
                err.statusCode = 402;
                throw err;
            }
            const companies = careerfair.companies;
            res.status(200).json({
                message: 'Companies found.',
                companies: companies
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// get the info of a company
// GET /careerfairs/:careerfairId/companies/:companyId
exports.getCompanyById = (req, res, next) => {
    const companyId = req.params.companyId;
    Company.findById(companyId)
        .then(company => {
            if(!company) {
                const err = new Error('Company not found');
                err.statusCode = 404;
                throw(err);
            }
            res.status(200).json({
                message: 'Company fetched',
                company: company
            });
        });
};

// get all talks of a company in a certain careerfair
// GET /careerfairs/:careerfairId/companies/:companyId/talks
exports.getTalks = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    const companyId = req.params.companyId;
    Careerfair.findById(careerfairId)
        .populate('talks.talk')
        .execPopulate()
        .then(careerfair => {
            if(!careerfair) {
                const err = new Error('Career fair not found');
                err.statusCode = 404;
                throw err;
            }
            res.status(200).json({
                message: 'Talks fetched',
                talks: careerfair.talks.filter(talk => talk.company._id.toString() === companyId)
            });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
};

// get companies using the filter
// GET /careerfairs/:careerfairId/
exports.getCompaniesByFilter = (req, res, next) => {

};

