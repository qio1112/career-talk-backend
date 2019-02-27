const express = require('express');
const router = express.Router();
const cfController = require('../controllers/careerfairController');
const schoolController = require('../controllers/schoolController')
const userController = require('../controllers/userController');
const auth = require('../auth/is-auth');
const multer = require('multer');

// set multer for file upload
const MIME_TYPE_MAP = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};
// set storage for resume
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = null;
        if (!isValid) {
            error = new Error('Invalid mime type')
        }
        if(file.mimetype === 'application/pdf') {
            cb(error, "storage/resumes");
        } else {
            cb(error, "storage/avatars")
        }
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('_')
        const extension = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '_' + Date.now() + '.' + extension);
    }
})


// new user signup
// POST /signup
router.post('/signup', userController.signup);

// user login
// POST /login
router.post('/login', userController.login);

// get all information of the user
// GET /user
router.get('/user', auth, userController.getUser);

// edit the information of the user
// PATCH /user/edit
router.patch('/user/edit', auth, userController.setUser);

// get all scheduled talks of the user
// GET /scheduledtalks
router.get('/scheduledtalks', auth, userController.getScheduledTalks);

// add a new talk to scheduled talks
// POST /scheduletalk
router.post('/scheduletalk', auth, userController.addScheduledTalk);

// unschedule a talk 
router.post('/unscheduletalk', auth, userController.removeScheduledTalk);

// GET all schools available when creating user accounts, no auth needed
router.get('/schools', schoolController.getSchools);

// POST upload user resume
router.post('/user/upload/resume', 
    auth,
    multer({storage}).single("resume"),
    userController.addResume);

// GET download user resume
router.get('/user/download/resume',
    auth,
    userController.downloadResume);

// PATCH update user avatar(photo)
router.patch('/user/upload/avatar', 
    auth,
    multer({storage}).single('avatar'),
    userController.uploadAvatar);

module.exports = router;