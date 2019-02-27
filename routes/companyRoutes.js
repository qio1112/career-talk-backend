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

module.exports = router;