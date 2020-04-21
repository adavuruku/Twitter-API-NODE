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


//user Create
const Users = require('../models/usersRecord');

exports.create_new_user = async (req,res,next)=>{
    // console.log(req)
    try {
        let userEmail = req.body.userEmail.trim().toLowerCase()
        let userName = req.body.userName.trim().toLowerCase()

        userName = userName[0]=="@"? userName: "@".concat(userName)

        //check if email or username already choosen
        const userExist =  await Users.find({$or :[{userEmail:userEmail},{userName:userName}]})
        if(userExist.length > 0){
            return res.status(406).json({
                message:'User Already Exist !!',
                user:userExist
            });
        }
         
        //generate a hash password for user
        const hash = await bcrypt.hash(req.body.password.trim(),10)
        if(hash){
            const user = new Users({
                _id : mongoose.Types.ObjectId(),
                userName :userName,
                password : hash,
                userEmail : userEmail,
                userFullName : req.body.userFullName.trim()
            });
            const doc = await user.save()

            if(doc){
                const tokenVal = token(doc.userEmail,doc._id)
                return res.status(201).json({
                    message:'User Created !!',
                    user:doc,
                    token : tokenVal
                });
            }
            
        }
        
        return res.status(406).json({
            message:'User Already Exist !!'
        });

    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

// johny 1122 sherif 1122
exports.login_user = async (req,res,next)=>{
    try {
        let password = req.body.password.trim().toLowerCase()
        let userName = req.body.userName.trim().toLowerCase()

        let userNameChange = userName[0]=="@"? userName: "@".concat(userName)
        // const userExist =  await Users.find({$or :[{userEmail:userName},{userName:userNameChange}]})

        const userExist =  await Users.find(
            {
                $and:[
                    {
                        $or :[{userEmail:userName},{userName:userNameChange}]
                    },
                    {
                        active:true
                    }
                ]
            })
        if(userExist.length > 0){
            const hash = await bcrypt.compare(password,userExist[0].password)
            if(hash){
                const tokenValue = token(userExist[0].userEmail,userExist[0]._id)
                return res.status(302).json({
                    message:'success',
                    user:userExist,
                    token:tokenValue
                });
            }
        }

        return res.status(401).json({
            message:'Authentication Fail'
        });

    } catch (error) {
        return res.status(500
            ).json({
            message:'Authentication Fail',
            error:error
        });
    }
}


exports.create_following = async (req,res,next)=>{
    try {
        let followingId = req.body.followingId.trim().toLowerCase()
        // req.userData.userId
        const userExist =  await Users.find({$and:[{_id:followingId},{followers:req.userData.userId}]})
        if(userExist.length <= 0){
            //update - following field
            const updateRecord = await Users.findOneAndUpdate({_id:followingId},{$addToSet:{"followers": req.userData.userId}})

            return res.status(200).json({message:"success",followers:updateRecord});
        }
        
        return res.status(401).json({
            message:'Already following'
        });

    } catch (error) {
        return res.status(500
            ).json({
            message:'Authentication Fail',
            error:error
        });
    }
}

//the people you are following
exports.list_following = async (req,res,next)=>{
    try {
        // req.userData.userId

        //Ohter way to searchan Array Mongoose
        // Users.find({ followers : { $all : ["sushi", "bananas"] }, ...}) AND
        // Users.find({ followers : { $in : ["sushi", "bananas"] }, ...}) OR
        const userExist =  await Users.find({followers:req.userData.userId})
        
        return res.status(200).json({message:"success",following:userExist.length});
    } catch (error) {
        return res.status(500
            ).json({
            message:'Authentication Fail',
            error:error
        });
    }
}

//the people following you
exports.list_followers = async (req,res,next)=>{
    try {
        // req.userData.userId
        /**from the model we have ref each ellement in followers to the model itself
         * you can populate it to get information of the followers
        */
        // const userExist =  await Users.find({_id:req.userData.userId}).populate('followers')

        //to get the araays alone you can do this
        const userExist =  await Users.find({_id:req.userData.userId})
        return res.status(200).json({message:"success",followers:userExist[0].followers.length});
    } catch (error) {
        return res.status(500).json({
            message:'Authentication Fail',
            error:error
        });
    }
}

exports.unfollow_user = async (req,res,next)=>{
    try {

        //TO Unfollow Someone
        let followingId = req.body.followingId.trim().toLowerCase()
        const userExist =  await Users.findByIdAndUpdate(followingId,
               {
                    $pullAll: {
                        followers:[req.userData.userId]
                    }
               }
        )
        return res.status(200).json({message:"Unfollowed"});
    } catch (error) {
        return res.status(500).json({
            message:'Authentication Fail',
            error:error
        });
    }
}




//update user information profile image cover photo
exports.users_update_information = async (req,res,next)=>{
// upload.single('avatar')
    try {
        const ueserExist = await Users.find({_id:req.userData.userId})
        if(ueserExist.length>0){
            let userFullName = !req.body.userFullName ? doc[0].userFullName :req.body.userFullName;
            let userWebsite = !req.body.userWebsite ? doc[0].userWebsite :req.body.userWebsite;
            let userEmail = !req.body.userEmail ? doc[0].userEmail :req.body.userEmail;
            let userPhone = !req.body.userPhone ? doc[0].userPhone :req.body.userPhone;
            let userLocation = !req.body.userLocation ? doc[0].userLocation :req.body.userLocation;
            let userBio = !req.body.userBio ? doc[0].userBio :req.body.userBio;
            let dob = !req.body.dob ? doc[0].dob :req.body.dob;
            //findByIdAndUpdate - cannot add new fields to document but updateOne, updateMany, bulkWrite add new field from update
            const updatedUser = await Users.updateOne({_id:req.userData.userId},
            {
                $set:{
                    userFullName:userFullName.trim(), 
                    userWebsite:userWebsite.trim(),
                    userEmail:userEmail.trim(),
                    userPhone:userPhone.trim(),
                    userLocation:userLocation.trim(),
                    userBio:userBio.trim(),
                    dob:dob.trim()
                }
            })

            return res.status(200).json({
                message:"updated"
            });
        }

        return res.status(500).json({
            message:"fail"
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './fileServer');
    },
    filename: function (req, file, callback) {
      callback(null, Date.now() + '-' + file.originalname.toLowerCase().split(' ').join('-'));
    }
});

var upload = multer({ storage : storage,
    fileFilter: function (req, file, callback){
        if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'  || file.mimetype==='image/jpg'){
            callback(null, true)
        }else{
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
        }
    },limits: function (req, file, callback) {
        fileSize: 1024*1024*5 //limit of 5MB
    }
 }).single('profileImage');

//update user information profile image
exports.users_update_profileImage = async (req,res,next)=>{
    try {
        await upload(req,res, async function(err) {
            if(err) {
                return res.status(201).json({
                    message:"fail",
                    error:err
                });
            }
            //update - add more to images
            const updateRecord = await Users.updateOne({_id:req.userData.userId},{$set:{"profileImage": req.file.path}})
            return res.status(200).json({message:"success"});
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}

//uplaod Cover Image
exports.users_update_coverImage = async (req,res,next)=>{
    try {
        await upload(req,res, async function(err) {
            if(err) {
                return res.status(201).json({
                    message:"fail",
                    error:err
                });
            }
            //update - add more to images
            const updateRecord = await Users.updateOne({_id:req.userData.userId},{$set:{"coverImage": req.file.path}})
            return res.status(200).json({message:"success"});
        });
    } catch (error) {
        return res.status(500).json({
            message:'Fail',
            error:error
        });
    }
}