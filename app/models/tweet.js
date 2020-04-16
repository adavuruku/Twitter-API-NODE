
const mongoose = require('mongoose');

const tweet = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tweetInfo:{type : String, required:true},
    likes:{type : Array, 'default':[]},
    retweets:[
        {
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord'}
        }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord' },
    tweetAttach:{type : Array, "default" : [] },
    isActive:{type:Boolean, default:false}
},{timestamps: true});

module.exports = mongoose.model('Tweet',tweet);