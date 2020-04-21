const express = require('express');
const router = express.Router();

const checkAuth = require ('../middleware/check-auth');
const tweetControllers = require('../controllers/tweetController');

router.post('/create',checkAuth, tweetControllers.create_new_tweet);
router.get('/like',checkAuth, tweetControllers.like_tweet);
router.get('/unlike',checkAuth, tweetControllers.unlike_tweet);
router.delete('/delete',checkAuth, tweetControllers.delete_tweet);

//export the servlet to the server
module.exports = router;