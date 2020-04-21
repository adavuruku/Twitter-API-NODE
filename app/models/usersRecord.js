
const mongoose = require('mongoose');
let validator = require('validator')

const usersRecord = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userFullName:{type : String, required:true},
    userName:{type : String, required:true, unique:true},
    userEmail:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase: true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    password:{type :String, required:true},
    userPhone:{type : String},
    userBio:{type :String},
    userLocation:{type :String},
    userWebsite:{type :String},
    dob:{type:Date},
    profileImage:{type : String},
    coverImage:{type : String},
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord'
        }
    ],

    admin:{type:Boolean, default:false},
    active:{type:Boolean, default:true}
    
},{timestamps: true});

//this will help get users tweet
usersRecord.virtual('tweets', {
    ref: 'Tweet',
    localField: 'user',
    foreignField: '_id'
});

//this will help get all users retweet
usersRecord.virtual('retweets', {
    ref: 'ReTweet',
    localField: 'user',
    foreignField: '_id'
});

module.exports = mongoose.model('UsersRecord',usersRecord);