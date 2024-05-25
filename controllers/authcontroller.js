const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const {jwt_secret,jwt_expires} = require('../config')
const crypto = require('crypto')

exports.signup = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success:false,code:422,status:'error',data:errors.array()[0]});
    }
    const {email,password,role} = req.body
    bcrypt.hash(password,12)
    .then(hashedPassword=>{
      return User.create({
        email:email,
        password:hashedPassword,
        role,
        status:'verified_user'
      })
    })
    .then(createdUser=>{
       const token = jwt.sign({_id:createdUser._id},jwt_secret,{expiresIn:jwt_expires})
       //Email function call should be here
       res.status(200).json({success:true,code:200,status:'success',data:{...createdUser['_doc'],accessToken:token,msg:'Registration was successful'}})
    })
    .catch(error=>{
        next(error)
    })
}
exports.signin = (req,res,next)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(422).json({success:false,code:422,status:'error',data:errors.array()[0]})
  }
  const {email,password} = req.body
  User.findOne({email:email})
  .then(user=>{
   if(!user){
    return res.status(400).json({success:false,code:401,status:'error',data:{path:'email',msg:'Incorrect email address',value:email,location:'body',type:'field'}})
   }
   return bcrypt.compare(password,user.password)
   .then(doMatch=>{
    if(!doMatch){
    return res.status(400).json({success:false,code:401,status:'error',data:{path:'password',msg:'Incorrect paswsord',value:password,location:'body',type:'field'}})  
    }
    const token = jwt.sign({_id:user._id},jwt_secret,{expiresIn:jwt_expires})
    //Email function call should be here
    res.status(200).json({success:true,code:200,status:'success',data:{...user['_doc'],accessToken:token,msg:'User Logged in successfully'}})
   })
  })
  .catch(err=>{
    next(err)
  })
}
exports.forgotPassword = (req,res,next)=>{
const errors = validationResult(req)
if(!errors.isEmpty()){
  return res.status(422).json({success:false,code:422,status:'error',data:errors.array()[0]})
}
const {email} = req.body
const resetToken = crypto.randomBytes(32).toString('hex')
const resetTokenExpires = Date.now() + 3600000
User.findOne({email:email})
.then(user=>{
  if(!user){
    return res.status(401).json({success:false,code:401,status:'Unauthorized Request',data:{path:'email',msg:'Email is not linked to any account',value:email,location:'body',type:'field'}}) 
  }
  user.resetToken = resetToken
  user.resetTokenExpires = resetTokenExpires
  return user.save()
  .then(saved=>{
    //Email function call should be here
    res.status(200).json({success:true,code:200,status:'success',data:{...saved['_doc'],msg:'Reset link has been successfully sent'}}) 
  })
})
.catch(err=>{
  next(err)
})
}
exports.resetPassword = (req,res,next)=>{
  const errors = validationResult(req)
if(!errors.isEmpty()){
  return res.status(422).json({success:false,code:422,status:'error',data:errors.array()[0]})
}
  const {resetToken,password} = req.body
  User.findOne({resetToken:resetToken,resetTokenExpires:{$gt:Date.now()}})
  .then(user=>{
    if(!user){
      return res.status(400).json({success:false,code:401,status:'error',data:{path:'resetToken',msg:'Invalid token session',value:resetToken,location:'body',type:'field'}})  
    }
    return bcrypt.hash(password,12)
    .then(hashedPassword=>{
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    return user.save()
    })
    .then(saved=>{
    //Email function call should be here
    res.status(200).json({success:true,code:200,status:'success',data:{...saved['_doc'],msg:'Password reset was successful'}}) 
    })
  })
  .then(err=>{
    next(err)
  })
}
exports.addWaitlist = (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({success:false,code:422,status:'error',data:errors.array()[0]})
  }
  const body = req.body
  bcrypt.hash(body.password,12)
  .then(hashedPassword=>{
    return User.create({
      email:body.email,
      password:hashedPassword,
      username:body.fullname,
      role:'user',
      status:'waitlist_user',
      registeredAs:body.registeredAs
    })
  })
  .then(createdUser=>{
    const token = jwt.sign({_id:createdUser._id},jwt_secret,{expiresIn:jwt_expires})
    //Email function call should be here
    res.status(200).json({success:true,code:201,status:'success',data:{...createdUser,accessToken:token,msg:'Registration was successful'}})
 })
 .catch(error=>{
     next(error)
 })

}
exports.updateWaitlistDetails = (req,res,next)=>{
const {id,merchantCategory,category} = req.body
User.findById(id)
.then(user=>{
  if(!user){
    return res.status(401).json({success:false,body:{status:'Unauthorized Request', status:401,data:[{value:id,path:'id',location:'body',type:'field',msg:'No user found!'}]}})
  }
  user.merchantCategory = merchantCategory
  user.category = category
  return user.save()
  .then(user=>{
    res.status(200).json({success:true,body:{status:'success',status:200,data:user}})
  })
})
.catch(error=>next(error))
}