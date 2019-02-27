const Company  = require('../models/company');
const Careerfair = require('../models/careerfair');
const Talk = require('../models/talk');
const { validationResult } = require('express-validator/check');

// get all companies in a careerfair
// GET /careerfairs/:careerfairId/companies
exports.getCompanies = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    console.log(req.query);
    Careerfair.findById(careerfairId)
        .populate('companies')
        .then(careerfair => {
            if(!careerfair) {
                const err = new Error('No such careerfair found.');
                err.statusCode = 402;
                throw err;
            }
            const companies = careerfair.companies.filter(company => {
                let result = true;
                // sponsor
                result = result && (req.query.sponsor === 'true' ? company.sponsor : true);
                // fulltime and intern
                result = result && (req.query.fulltime === 'true' ? company.fulltime : true);
                result = result && (req.query.intern === 'true' ? company.intern : true);
                // years
                result = result && (req.query.freshman === 'true' ? company.freshman : true);
                result = result && (req.query.juniorOrSenior === 'true' ? company.juniorOrSenior : true);
                result = result && (req.query.graduate === 'true' ? company.graduate : true);
                result = result && (req.query.doctoral === 'true' ? company.doctoral : true);
                // majors
                if (result && req.query.major) {
                   if (Array.isArray(req.query.major)) { // more than 1 majors
                        req.query.major.forEach(major => {
                            result = result && company.major.findIndex(m => {
                                return m.toLowerCase().trim() === major;
                            }) >= 0;
                        });
                   } else {
                       result = result && company.major.findIndex(major => {
                           return req.query.major == major.toLowerCase().trim();
                       }) >= 0;
                   }
                }
                return result;
            });
            // console.log(companies);
            res.status(200).json({
                message: 'Companies found.',
                companies: companies.sort(company => company.name[0]),
                careerfair: careerfair,
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
    const sponsor = req.query.sponsor;
    console.log("sponsor" + sponsor);
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

// get componies which satisfies the filter options
// GET /careerfairs/:careerfairId/companies/:companyId
exports.getCompaniesByFilter = (req, res, next) => {

}

// get all talks of a company in a certain careerfair
// GET /careerfairs/:careerfairId/companies/:companyId/talks
exports.getTalks = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
    const companyId = req.params.companyId;
    Careerfair.findById(careerfairId)
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
        .then(careerfair => {
            if(!careerfair) {
                const err = new Error('Career fair not found');
                err.statusCode = 404;
                throw err;
            }
            const talks = careerfair.talks.filter(talk => talk.company._id.toString() === companyId)
            res.status(200).json({
                message: 'Talks fetched',
                talks: talks,
            });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
};

