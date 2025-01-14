const express = require("express");
const router =  express.Router();
const {body,validationResult}=  require("express-validator");
const userModel = require('../models/user.model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const indexRouter = require("./index.route")
// const files = getUploadedFiles() || [];
// res.render('home', { files: files });

router.get("/register",(req,res)=>{
    res.render("register");
})              

router.post("/register",
    body("email").trim().isEmail().isLength({min:13}),
    body("password").trim().isLength({min:5}),
    body("username").trim().isLength({min:3}),
    async (req,res)=>{
        const errors= validationResult(req);        
        
        const {username,email,password}= req.body;
        const hashPassword = await bcrypt.hash(password,10);
        const newUser = await userModel.create({
            username:username,
            password:hashPassword,
            email:email,    
        })

        if(!errors.isEmpty()){
            return res.status(422).json({errors:errors.array(),message:'Invalid'});
        }
        else res.render("login");
    })


    
router.get("/login",(req,res)=>{
        res.render("login");
})


router.post("/login",
    body("username").trim().isLength({min:3}),
    body("password").trim().isLength({min:5}),

    async(req,res)=>{
        const errors = validationResult(req);
        const {username,password}= req.body;

        const user = await userModel.findOne({username:username});
        if(!user){
            return res.status(404).json({message:'Invalid username or password'});
        }

        const isValidPassword = await bcrypt.compare(password,user.password);
        if(!isValidPassword){
            return res.status(401).json({message:'Invalid username or password'});
        }

        /*   jsonwentoken  */
        
        const token = jwt.sign({
            userId:user._id,
            email:user.email,
            username:user.username
        },process.env.JWT_SECRET)

        res.cookie("token",token);

        if(!errors.isEmpty()){
            return res.status(422).json({errors:errors.array(),message:'Invalid'});
        }
        else res.redirect('/home');
})




module.exports = router;