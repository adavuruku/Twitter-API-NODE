
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
    admin:{type:Boolean, default:false},
    active:{type:Boolean, default:true},
    dob:{type:Date},
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'UsersRecord'
        }
    ],
    profileImage:{type : String},
    coverImage:{type : String}
},{timestamps: true});

usersRecord.virtual('tweets', {
    ref: 'Tweet',
    localField: 'user',
    foreignField: '_id'
});

usersRecord.virtual('retweets', {
    ref: 'Tweet',
    localField: 'retweeet',
    foreignField: '_id'
});

module.exports = mongoose.model('UsersRecord',usersRecord);