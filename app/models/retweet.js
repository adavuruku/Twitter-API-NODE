
const mongoose = require('mongoose');

const retweet = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tweetId:{type :  mongoose.Schema.Types.ObjectId, ref: 'Tweet'},
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord'
        }
    ],
    comment:{type:String, default:null},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord' },
    isActive:{type:Boolean, default:true}
},{timestamps: true});

module.exports = mongoose.model('ReTweet',retweet);