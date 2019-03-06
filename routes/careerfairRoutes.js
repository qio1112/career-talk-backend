const express = require('express');
const router = express.Router();
const cfController = require('../controllers/careerfairController');
const auth = require('../auth/is-auth');

// GET all career fairs in the school of the user
router.get('/careerfairs', auth, cfController.getCareerfairs);

// GET detail of a career fair
router.get('/careerfairs/:careerfairId', auth, cfController.getCareerfairById);

// GET majors in the career fair
router.get('/careerfairs/:careerfairId/majors', auth, cfController.getMajorsInCareerfair);
module.exports = router;