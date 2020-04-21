const express = require('express');
const router = express.Router();

const checkAuth = require ('../middleware/check-auth');
const retweetController = require('../controllers/retweetController');

router.post('/create',checkAuth, retweetController.re_tweet);
router.get('/like',checkAuth, retweetController.like_retweet);
router.get('/unlike',checkAuth, retweetController.unlike_retweet);
router.delete('/delete',checkAuth, retweetController.delete_retweet);

//export the servlet to the server
module.exports = router;