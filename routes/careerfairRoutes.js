const express = require('express');
const router = express.Router();
const cfController = require('../controllers/careerfairController');
const auth = require('../auth/is-auth');

router.get('/careerfairs', auth, cfController.getCareerfairs);

router.get('/careerfairs/:careerfairId', auth, cfController.getCareerfairById);

module.exports = router;