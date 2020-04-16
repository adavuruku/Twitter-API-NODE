const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
        const userExist =  await Users.find({$or :[{userEmail:userName},{userName:userNameChange}]})

        if(userExist.length > 0){
            const hash = await bcrypt.compare(password,userExist[0].password)
            if(hash){
                const tokenValue = token(userExist[0].userEmail,userExist[0]._id)
                return res.status(200).json({
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
        return res.status(401).json({
            message:'Authentication Fail',
            error:error
        });
    }
}