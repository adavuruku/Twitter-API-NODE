const express = require('express');
const router = express.Router();

const checkAuth = require ('../middleware/check-auth');
const usersControlllers = require('../controllers/usersController');

router.post('/create', usersControlllers.create_new_user);
router.post('/login', usersControlllers.login_user);

//follow someone
router.get('/createfollow',checkAuth, usersControlllers.create_following);
//unfollow someone
router.get('/unfollow',checkAuth, usersControlllers.unfollow_user);
//people you are following
router.get('/following',checkAuth, usersControlllers.list_following);
//people following you
router.get('/followers',checkAuth, usersControlllers.list_followers);

//updating users record
router.patch('/updateuser',checkAuth, usersControlllers.users_update_information);
router.patch('/changeprofileimage',checkAuth, usersControlllers.users_update_profileImage); 
router.patch('/changecoverimage',checkAuth, usersControlllers.users_update_coverImage);


//export the servlet to the server
module.exports = router;