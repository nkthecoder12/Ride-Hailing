const User=require('../models/user.model');
const bcrypt=require('bcrypt');


const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(400).json({message:'All fields are required'});
    }
    try{
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:'User already exists'});
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const user=await User.create({name,email,password:hashedPassword});
    await user.save();
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
    res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'strict',
        maxAge:3*24*60*60*1000,
    })
    res.status(201).json({message:'User created successfully',user});
}catch(error){
    res.status(500).json({message:'Internal server error'});
}
 }

  const login=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:'All fields are required'});
    }
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'User not found'});
        }
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:'Invalid password'});
        }
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:3*24*60*60*1000,
        })
        res.status(201).json({message:'User created successfully',user});
    }
  catch(error){
    res.status(500).json({message:'Internal server error'});
  }}
module.exports={register,login};

