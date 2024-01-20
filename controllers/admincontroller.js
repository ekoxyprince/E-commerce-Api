const Category = require('../models/category')
const User = require()
const {validationResult} = require('express-validator')
const catchAsync = require('../utilities/catchasync')
const fs = require('fs')

exports.getAllCategories = (req,res,next)=>{
    Category.find()
    .then(categories=>{
        res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{categories,msg:'Categories fetched successfully'}}}) 
    })
    .catch(error=>{
        next(error)
    })
}
exports.getCategory = (req,res,next)=>{
    const {id} = req.params
    Category.findById(id)
    .then(category=>{
        if(!category){
            return res.status(400).json({success:false,body:{status:400,title:'Bad Request',data:[{path:'id',msg:`No category found with id=${id} please verify id.`,value:id,location:'params',type:'route parameter'}]}})    
        }
        return res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{category,msg:'Single Category fetched successfully'}}}) 
    })
    .catch(error=>{
        next(error)
    })
}
exports.addNewCategory = (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({success:false,body:{status:422,title:'Validation Error',data:errors}})
    }
    const {category_type,category_name} = req.body
    Category.create({
        categoryName:category_name,
        categoryType:category_type,
        createdAt:new Date(Date.now()),
        updatedAt:new Date(Date.now()),
        image:typeof req.file !== 'undefined'?`${req.file.destination}${req.file.filename}`.slice(8):null
    })
    .then(category=>{
        return res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{category,msg:'Single Category added successfully'}}}) 
    })
    .catch(error=>{
        next(error)
    })
}
exports.updateCategory = (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({success:false,body:{status:422,title:'Validation Error',data:errors}})
    }
    const {category_type,category_name} = req.body
    const {id} = req.params
    Category.findById(id)
    .then(category=>{
        category.categoryName = category_name
        category.categoryType = category_type
        category.updatedAt = new Date(Date.now())
        category.image = typeof req.file !== 'undefined'?`${req.file.destination}${req.file.filename}`.slice(8):category.image
        return category.save()
    })
    .then(category=>{
        return res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{category,msg:'Single Category updated successfully'}}})   
    })
}
exports.deleteCategory = (req,res,next)=>{
    const {id} = req.params
    Category.findOneAndDelete({_id:id})
    .then(category=>{
        fs.unlinkSync(`./public${category.image}`)
        res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{category,msg:'Single Category deleted successfully'}}})   
    })
    .catch(error=>{
        next(error)
    })
}
exports.getAllUser = (req,res,next)=>{
  User.find({role:'user'})
  .then(users=>{
    res.status(200).json({success:true,body:{status:200,title:'Response Success',data:{users,msg:'Users fetched successfully.'}}})  
  })
  .catch(error=>{
    next(error)
  })  
}
exports.updatedPassword = catchAsync(async(req,res,next)=>{
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