const express = require('express');
const router = express.Router();

const checkAuth = require ('../middleware/check-auth');
const usersControlllers = require('../controllers/usersControllers');

//all users
// router.post('/create',checkAuth, channelListControllers.create_new_channel);
// router.get('/:channelid',checkAuth,channelListControllers.find_channel)
// router.get('/users/:userid',checkAuth,channelListControllers.find_all_user_channel)
// router.get('/',checkAuth, channelListControllers.list_all_channel);
// router.delete('/:channelid',checkAuth, channelListControllers.delete_channel);
// router.patch('/:channelid',checkAuth, channelListControllers.update_channel);

router.post('/create', usersControlllers.create_new_user);
router.post('/login', usersControlllers.login_user);


//export the servlet to the server
module.exports = router;