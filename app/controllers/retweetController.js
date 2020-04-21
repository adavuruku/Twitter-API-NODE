const mongoose = require('mongoose');


const ReTweets = require('../models/retweet');


exports.re_tweet = async (req,res,next)=>{
    try {
        let tweetId = req.body.tweetId.trim()
        let comment = !req.body.comment ? "": req.body.comment;
        //since retweet of a particular tweet 
        //is once for a user - always update user existing user retweet if retweet is done bfr
        const RetweetExist = await ReTweets.find({$and:[{tweetId:tweetId},{user:req.userData.userId},{isActive:true}]})
        if(RetweetExist.length > 0){
            const updatedRetweet = await ReTweets.updateOne({_id:RetweetExist[0]._id},
                {
                    $set:{
                        comment:comment.trim()
                    }
                })
        }else{
            const retweet = new ReTweets({
                _id : mongoose.Types.ObjectId(),
                comment: comment.trim(),
                user:req.userData.userId,
                tweetId:tweetId
            })
            var tweet = await retweet.save();
        }


        const retweetData =  await ReTweets.findOne({$and:[{tweetId:tweetId},{user:req.userData.userId},{isActive:true}]})
        .populate('user').populate({
            path:'tweetId',
            populate: {
                path: 'user',
                model: 'UsersRecord'
              } 
        })
        
        const report = {
                _id: retweetData._id,
                userFullName: retweetData.user.userFullName,
                profileImage: retweetData.user.profileImage,
                retweetDate:retweetData.createdAt,
                retweetComment:retweetData.comment,
            tweeetInfo:{
                tweet:retweetData.tweetId
            }
        }

        // console.log(report)
        //count all retweet
        const AllRetweet = await ReTweets.find({tweetId:tweetId})
        // return res.status(200).json({message:"retweeted", allretweet:report});
        return res.status(200).json({message:"retweeted",retweetInfo:report, allretweet:AllRetweet.length});
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

exports.like_retweet = async (req,res,next)=>{
    try {
        let retweetId = req.body.retweetId.trim()
        // req.userData.userId
        const likeExist =  await ReTweets.find({$and:[{_id:retweetId},{likes:req.userData.userId},{isActive:true}]})
        if(likeExist.length <= 0){
            //update - following field
            const updateRecord = await ReTweets.findOneAndUpdate({_id:retweetId},{$addToSet:{"likes": req.userData.userId}})

            //recount the number of likes
            const likeCount =  await ReTweets.findOne({_id:retweetId})
            return res.status(200).json({message:"success",ReTweetLike:likeCount.likes.length});
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

exports.unlike_retweet = async (req,res,next)=>{
    try {
        let retweetId = req.body.retweetId.trim()
        const likeExist =  await ReTweets.find({$and:[{_id:retweetId},{likes:req.userData.userId},{isActive:true}]})
        if(likeExist.length > 0){
            const updateRecord = await ReTweets.findOneAndUpdate({_id:retweetId},{$pullAll: {likes:[req.userData.userId]}})
        }
        
        //recount the number of likes
        const likeCount =  await ReTweets.findOne({_id:retweetId})
        return res.status(200).json({message:"Unliked",ReTweetLike:likeCount.likes.length});

    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}


exports.delete_retweet = async (req,res,next)=>{
    try {
        let retweetId = req.body.retweetId.trim()
        const likeExist =  await ReTweets.find({$and:[{_id:retweetId},{isActive:true}]})
        if(likeExist.length > 0){
            const updateRecord = await ReTweets.findOneAndUpdate({_id:retweetId},{$set: {isActive:false}})
        }
        return res.status(200).json({message:"Deleted"});

    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}


