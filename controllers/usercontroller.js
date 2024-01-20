const catchAsync = require('../utilities/catchasync')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator');

exports.getUserDetails = (req,res,next)=>{
    const user = req.user
    res.status(200).json({
        success:true,
        body:{
            title:'Response Success',
            user,
            msg:'User found and fetched.'
        }
    })
}
exports.updateUserDetails = catchAsync(async(req,res,next)=>{
   const body = req.body
   const {destination,filename} = req.file
   req.user.fullname = body.fullname|| req.user.fullname
   req.user.location.state = body.state || req.user.location.state
   req.user.location.city = body.city || req.user.location.city
   req.user.location.zipcode = body.zipcode || req.user.location.zipcode
   req.user.phone = body.phone || req.user.phone
   req.user.image = typeof req.file === 'undefined'?`${destination}${filename}`.slice(8):req.user.image
   const updatedUser = await req.user.save()
   res.status(200).json({success:true,body:{title:'Response Success',user:updatedUser,msg:'User details updated.'}})
})
exports.updatedPassword = catchAsync(async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success:false,body:{status:422,title:'Validation Error',data:errors}});
    }
    const {oldPassword,password} = req.body
    const doMatch = await bcrypt.compare(oldPassword,req.user.password)
    if(!doMatch){
        return res.status(401).json({success:false,body:{title:'Unauthorized Request',path:'password',value:oldPassword,location:'body'}})
    }
    const hashedPassword = await bcrypt.hash(password,12)
    req.user.password = hashedPassword
    const updatedUser = await req.user.save()
    res.status(200).json({success:true,body:{title:'Response Success',msg:'Password updated successfully.',user:updatedUser}}) 
})
