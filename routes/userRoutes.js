const express = require('express');
const router = express.Router();
const cfController = require('../controllers/careerfairController');
const schoolController = require('../controllers/schoolController')
const userController = require('../controllers/userController');
const auth = require('../auth/is-auth');

// new user signup
// POST /signup
router.post('/signup', userController.signup);

// user login
// POST /login
router.post('/login', userController.login);

// get all information of the user
// GET /userinfo
router.get('/userinfo', auth, userController.getUser);

// edit the information of the user
// POST /userinfo/edit
router.post('/userinfo/edit', auth, userController.setUser);

// get all scheduled talks of the user
// GET /scheduledtalks
router.get('/scheduledtalks', auth, userController.getScheduledTalks);

// add a new talk to scheduled talks
// POST /scheduledtalks/:talkId
router.post('/scheduledtalks', auth, userController.addScheduledTalk);

// GET all schools available when creating user accounts, no auth needed
router.get('/schools', schoolController.getSchools);

module.exports = router;