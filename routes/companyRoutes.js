const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../auth/is-auth');

router.get('/careerfairs/:careerfairId/companies', auth, companyController.getCompanies);

router.get('/careerfairs/:careerfairId/companies/:companyId', auth, companyController.getCompanyById);

router.get('/careerfairs/:careerfairId/companies/:companyId/talks', companyController.getTalks);

module.exports = router;