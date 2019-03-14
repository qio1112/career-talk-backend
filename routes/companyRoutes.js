const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../auth/is-auth');

// GET companies in a career fair
router.get('/careerfairs/:careerfairId/companies', auth, companyController.getCompanies);

// GET information of a certain company by company Id
router.get('/careerfairs/:careerfairId/companies/:companyId', auth, companyController.getCompanyById);

// GET talks of a certain company in a certain career fair
router.get('/careerfairs/:careerfairId/companies/:companyId/talks', auth, companyController.getTalks);

//GET get all existing companies
router.get('/companies', companyController.getAllCompanies);

// POST create new companies and related talks to certain career fair
router.post('/newcompanies', companyController.createNewCompaniesWithTalks);

// POST create new talks with school IDs and put into related careerfairs
router.post('/existingcompanies', companyController.addTalksWithExistingCompanies);

module.exports = router;