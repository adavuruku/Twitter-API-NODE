const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var multer = require('multer');

//generating webtoken
const token = (email, id) =>{
    return jwt.sign({
        email:email,
        userId: id
    },
    process.env.MY_HASH_SECRET);
}


const Tweets = require('../models/tweet');


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './tweetFiles');
    },
    filename: function (req, file, callback) {
      callback(null, Date.now() + '-' + file.originalname.toLowerCase().split(' ').join('-'));
    }
});

var upload = multer({ storage : storage,
    fileFilter: function (req, file, callback){

        let fileTypes = ['image/jpeg','image/png','image/jpg', 'video/3gpp', 'video/mp4', 
        'application/x-mpegURL', 'video/x-flv','video/quicktime','video/x-msvideo', 'video/x-ms-wmv','video/MP2T'];

        if(fileTypes.indexOf(file.mimetype) >= 0){
            callback(null, true)
        }else{
            return callback(new Error('File format Not allowed!'), false);
        }
    },
    limits: function (req, file, callback) {
        let fileSize = 1024*1024*5 //limit of 5MB
        if (file.size <= fileSize){
            callback(null, true)
        }else{
            return callback(new Error('File Size Not More Than 5MB !'), false);
        }
    }
 }).array('tweetAttachments');

exports.create_new_tweet =  async(req,res,next)=>{
    try {
        await upload(req,res, async function(err) {
            if(err) {
                return res.status(500).json({
                    message:"fail",
                    error:err
                });
            }

            if(req.files){
                let filePaths = [];
                req.files.forEach(el=>{
                    filePaths.push(el.path);
                })
                let newTweet = Tweets({
                    _id : mongoose.Types.ObjectId(),
                    tweetInfo:req.body.tweetBody.trim(),
                    user:req.userData.userId,
                    tweetAttach:filePaths
                })
                var tweet = await newTweet.save();
            }else{
                console.log(req.body,"at thee")
                let newTweet = Tweets({
                    _id : mongoose.Types.ObjectId(),
                    tweetInfo:req.body.tweetBody.trim(),
                    user:req.userData.userId
                })
                tweet = newTweet.save();
                
            }
            return res.status(201).json({
                message:'success',
                tweet:tweet
            });
            
            
        });
        // let newTweet = 

    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}




exports.like_tweet = async (req,res,next)=>{
    try {
        let tweetId = req.body.tweetId.trim()
        // req.userData.userId
        const likeExist =  await Tweets.find({$and:[{_id:tweetId},{likes:req.userData.userId},{isActive:true}]})
        if(likeExist.length <= 0){
            //update - following field
            const updateRecord = await Tweets.findOneAndUpdate({_id:tweetId},{$addToSet:{"likes": req.userData.userId}})

            //recount the number of likes
            const likeCount =  await Tweets.findOne({_id:tweetId})
            return res.status(200).json({message:"success",likes:likeCount.likes.length});
        }
        return res.status(401).json({
            message:'Already Liked',
            likes:likeExist[0].likes.length
        });
    } catch (error) {
        return res.status(500
            ).json({
            message:'Fail',
            error:error
        });
    }
}

exports.unlike_tweet = async (req,res,next)=>{
    try {
        let tweetId = req.body.tweetId.trim()

        const likeExist =  await Tweets.find({$and:[{_id:tweetId},{likes:req.userData.userId},{isActive:true}]})
        if(likeExist.length > 0){
            //update - following field
            const updateRecord = await Tweets.findOneAndUpdate({_id:tweetId},{$pullAll: {likes:[req.userData.userId]}})
        }
        //recount the number of likes
        const likeCount =  await Tweets.findOne({_id:tweetId})
        return res.status(200).json({message:"success",likes:likeCount.likes.length});
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

const ReTweets = require('../models/retweet');
exports.delete_tweet = async (req,res,next)=>{
    try {
        let tweetId = req.body.tweetId.trim()
        const likeExist =  await Tweets.find({$and:[{_id:tweetId},{isActive:true}]})
        if(likeExist.length > 0){
            const updateRecord = await Tweets.findOneAndUpdate({_id:tweetId},{$set: {isActive:false}})
            //delete all the retweets as well
            const updateRetweets = await ReTweets.updateMany({tweetId:tweetId},{$set: {isActive:false}})
            // const updateRetweets = await ReTweets.update({tweetId:tweetId},{$set: {isActive:false}}, {multi: true})
        }
        return res.status(200).json({message:"Deleted"});

    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}



