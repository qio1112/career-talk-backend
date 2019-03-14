const Company  = require('../models/company');
const Careerfair = require('../models/careerfair');
const Talk = require('../models/talk');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

// get all companies in a careerfair
// GET /careerfairs/:careerfairId/companies
exports.getCompanies = (req, res, next) => {
    const careerfairId = req.params.careerfairId;
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
                            result = result && company.majors.findIndex(m => {
                                return m.toLowerCase().trim() === major;
                            }) >= 0;
                        });
                   } else {
                       result = result && company.majors.findIndex(major => {
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
            next(err);
        })
};

// GET get all existing companies
exports.getAllCompanies = (req, res, next) => {
    Company.find({})
        .then(companies => {
            res.status(200).json({
                companies: companies,
                message: 'All existing companies fetched'
            });
        })
        .catch(e => next(e));
}

// POST create new companies, create and add related talks
exports.createNewCompaniesWithTalks = (req, res, next) => {
    const careerfairId = req.body.careerfairId;
    const newCompaniesInfo = req.body.companies;
    const talksToAdd = [];
    let newTalks;
    let companiesAdded;
    const newCompanies = newCompaniesInfo.map(c => {
        const majors = c.majors.split(',').map(m => m.trim().toLowerCase());
        return {
            name: c.name,
            address: c.address,
            website: c.website,
            careerfairs: [new mongoose.Types.ObjectId(careerfairId)],
            description: c.description,
            majors: majors,
            email: c.email
        };
    });
    Company.insertMany(newCompanies)
        .then(companies => {
            companiesAdded = companies;
            newCompaniesInfo.forEach(c => {
                const _id = companies.find(company => company.name === c.name)._id;
                c.talks.forEach(talk => {
                    talk.company = new mongoose.Types.ObjectId(_id);
                    talk.careerfair = new mongoose.Types.ObjectId(careerfairId);
                    talk.startTime = new Date(talk.startTime);
                    talk.endTime = new Date(talk.endTime);
                });
                talksToAdd.push(...c.talks);
            });
            return Talk.insertMany(talksToAdd);
        })
        .then(talks => {
            newTalks = talks;
            return Careerfair.findById(careerfairId);
        })
        .then(careerfair => {
            careerfair.talks.push(...newTalks.map(talk => new mongoose.Types.ObjectId(talk._id)));
            careerfair.companies.push(...companiesAdded.map(c => new mongoose.Types.ObjectId(c._id)));
            return careerfair.save();
        })
        .then(result => {
            const addCareerfairToCompanies = async (careerfairId, companyIds) => {
                for (let companyId of companyIds) {
                    const company = await Company.findById(companyId);
                    company.careerfairs.push(new mongoose.Types.ObjectId(careerfairId));
                    await company.save();
                }
                return ;
            }
            addCareerfairToCompanies(careerfairId, companiesAdded.map(c => new mongoose.Types.ObjectId(c._id)));
        })
        .then(result => {
            res.status(201).json({message: 'Companies added, talks added.'});
        })
        .catch(e => next(e));
    
}

// POST create new talks related to existing companies
exports.addTalksWithExistingCompanies = (req, res, next) => {
    const careerfairId = req.body.careerfairId;
    const companiesWithTalks = req.body.companies;
    const talksToAdd = [];
    let newTalks;
    console.log(companiesWithTalks);
    companiesWithTalks.forEach(c => {
        c.talks.forEach(talk => {
            talk.company = new mongoose.Types.ObjectId(c._id);
            talk.careerfair = new mongoose.Types.ObjectId(careerfairId);
            talk.startTime = new Date(talk.startTime);
            talk.endTime = new Date(talk.endTime);
        });
        console.log(c);
        talksToAdd.push(...c.talks);
    });
    console.log(talksToAdd);
    Talk.insertMany(talksToAdd)
        .then(talks => {
            console.log(talks);
            newTalks = talks;
            return Careerfair.findById(careerfairId);
        })
        .then(careerfair => {
            careerfair.talks.push(...newTalks.map(talk => new mongoose.Types.ObjectId(talk._id)));
            careerfair.companies.push(...companiesWithTalks.map(c => new mongoose.Types.ObjectId(c._id)));
            return careerfair.save();
        })
        .then(result => {
            const addCareerfairToCompanies = async (careerfairId, companyIds) => {
                for (let companyId of companyIds) {
                    const company = await Company.findById(companyId);
                    company.careerfairs.push(new mongoose.Types.ObjectId(careerfairId));
                    await company.save();
                }
                return ;
            }
            addCareerfairToCompanies(careerfairId, companiesWithTalks.map(c => new mongoose.Types.ObjectId(c._id)));
        })
        .then(result => {
            res.status(201).json({message: 'All talks added'});
        })
        .catch(e => next(e));
}