const { validationResult } = require('express-validator');
const User = require('../model/user_model');
const passport = require('passport');
require('../config/passport_local')(passport);
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const showLoginForm = (req,res,next)=>{
    res.render('login', { layout:'./layout/auth_layout.ejs', title: 'Login'});
}
const login = (req,res,next)=>{

    const errors = validationResult(req);

    req.flash('email', req.body.email)
    req.flash('password', req.body.password)

    if(!errors.isEmpty()){
        req.flash('validation_error', errors.array())
        res.redirect('/login')
    }
    else{

        if (!fs.existsSync(path.join(__dirname,"../uploads/photos/"+req.body.email))){
            fs.mkdirSync(path.join(__dirname,"../uploads/photos/"+req.body.email));
        }

        passport.authenticate('local',{
            successRedirect:'/manage/homepage',
            failureRedirect:'/login',
            failureFlash: true
        })(req,res,next)
    }

}

const showRegisterForm = (req,res,next)=>{
    res.render('register', {layout:'./layout/auth_layout.ejs' , title: 'Register'})
}
const register = async (req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        req.flash('validation_error', errors.array())
        req.flash('email', req.body.email)
        req.flash('fullname', req.body.fullname)
        req.flash('username', req.body.username)
        req.flash('password', req.body.password)
        req.flash('repassword', req.body.repassword)
        res.redirect('/register')
    }
    else{
        try{
            const _user = await User.findOne({email: req.body.email});

            if(_user && _user.emailActive == true){
                req.flash('validation_error', [{msg:"This email is already in use"}])

                req.flash('email', req.body.email)
                req.flash('fullname', req.body.fullname)
                req.flash('username', req.body.username)
                req.flash('password', req.body.password)
                req.flash('repassword', req.body.repassword)
                res.redirect('/register')
            }
            //email is not activated or never taken before
            else if(_user && _user.emailActive == false || _user == null){

                if(_user){
                    await User.findByIdAndRemove({_id:_user._id})
                }

                //Creating new user
                const newUser = new User({
                    email: req.body.email,
                    fullname: req.body.fullname,
                    username: req.body.username,
                    password: await bcrypt.hash(req.body.password,10)
                });
                await newUser.save();
                console.log('User Created');

                //JWT process
                const jwtInfo = {
                    id: newUser.id,
                    mail: newUser.email
                };

                const jwtToken = jwt.sign(jwtInfo, process.env.CONFIRM_MAIL_JWT_SECRET, {expiresIn: '1d'});

                //Mail activate process
                const url = process.env.WEB_SITE_URL + 'verify?id='+ jwtToken;

                let transporter = nodemailer.createTransport({
                    service : 'gmail',

                    auth:{
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: `Instagram Clone <${process.env.GMAIL_USER}>`,
                    to: newUser.email,
                    subject:"Email Activation",
                    text: "Please click here to active your email: " + url
                }, (error,info)=>{
                    if(error){
                        console.log("An error occured: " +error);
                    }
                    console.log("mail has sent");
                    console.log(info);
                    transporter.close();
                })

                req.flash('success_message', [{ msg: 'Please activate from the incoming mail.'}])
                res.redirect('/login')

            }

        }
        catch (e) {
            console.log("An error occured while creating new user: " +e)
        }
    }

    console.log(req.body)
}

const showForgotPasswordForm = (req,res,next)=>{
    res.render('forgot-password', {layout:'./layout/auth_layout.ejs' , title: 'Forgot Password'})
}
const forgotPassword = async (req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash('validation_error', errors.array())
        req.flash('email', req.body.email)
        res.redirect('/forgot-password')
    }
    //User entered an activated email
    else{
        try{
            const _user = await User.findOne({ email:req.body.email, emailActive: true});

            //create jtw token
            if(_user){

                const jwtInfo = {
                    id: _user._id,
                    password: _user.email
                };

                const secret = process.env.RESET_PASSWORD_SECRET_KEY + "-" + _user.password;
                const jwtToken = jwt.sign(jwtInfo,secret,{expiresIn: '1d'});

                //send password reset mail
                const url = process.env.WEB_SITE_URL + 'reset-password/' + _user._id + '/' + jwtToken;

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth:{
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: "Instagram Clone <nodedenemejs@gmail.com>",
                    to: _user.email,
                    subject:"Password Reset",
                    text: "Click here to reset your password: " + url
                }, (error,info)=>{
                    if(error){
                        console.log("An error occured: " +error);
                    }
                    console.log("mail has sent");
                    console.log(info);
                    transporter.close();
                })

                req.flash('success_message', [{ msg: 'Please activate from the incoming mail'}])
                res.redirect('/login')

            }
            else{
                req.flash('validation_error', [{ msg: 'This mail is not registered or the user is inactive'}])
                req.flash('email', req.body.email)
                res.redirect('/forgot-password')
            }

        }
        catch (e) {
            console.log('An error occured in forgot password: '+e)
        }
    }
}

const verifyMail= async (req,res,next) =>{

    const token = req.query.id;
    if (token) {
        try {

            jwt.verify(token, process.env.CONFIRM_MAIL_JWT_SECRET, async (e, decoded) => {

                if (e) {
                    req.flash('error', 'The link is incorrect or out of date');
                    res.redirect('/login')
                } else {
                    const tokenIDValue = decoded.id;
                    const result = await User.findByIdAndUpdate(tokenIDValue, {
                        emailActive: true
                    })

                    if (result) {
                        req.flash("success_message", [{ msg: 'Email activated successfully' }])
                        res.redirect('/login')
                    } else {
                        req.flash("error", 'Please try register again');
                        res.redirect('/register')
                    }
                }

            });

        } catch (e) {
            req.flash("error", 'Invalid link');
            res.redirect('/register')
        }

    } else {
        console.log("no token here");
    }
}

const showNewPasswordForm = async (req,res,next)=>{
    const IDinLink = req.params.id;
    const tokenInLink = req.params.token;

    if (IDinLink && tokenInLink) {

        const _findedUser = await User.findById({ _id: IDinLink })

        const secretKey = process.env.RESET_PASSWORD_SECRET_KEY + "-" + _findedUser.password;

        try {

            jwt.verify(tokenInLink, secretKey, async (e, decoded) => {

                if (e) {
                    req.flash('error', 'The link is incorrect or out of date');
                    res.redirect('/forgot-password')
                } else {
                    res.render('reset_password', {id:IDinLink, token:tokenInLink, layout: './layout/auth_layout.ejs' , title: 'Reset Password' })
                }
            });

        } catch (e) {
            req.flash("error", 'Invalid Link');
            res.redirect('/register')
        }

    }
    else {
        req.flash('validation_error', [{ msg: "Please click on the link you received." }])
        res.redirect('/forgot-password');

    }
}
const saveNewPassword = async (req,res,next)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_error', errors.array())
        req.flash('password', req.body.password)
        req.flash('repassword', req.body.repassword)

        console.log(req.body)

        res.redirect('/reset-password/'+req.body.id+"/"+req.body.token)
    }
    else{
        //save new password

        const _findedUser = await User.findById({ _id: req.body.id, emailActive:true })

        const secretKey = process.env.RESET_PASSWORD_SECRET_KEY + "-" + _findedUser.password;

        try {

            jwt.verify(req.body.token, secretKey, async (e, decoded) => {


                if (e) {
                    req.flash('error', 'The link is incorrect or out of date');
                    res.redirect('/forgot-password')
                } else {

                    const hashedPassword = await bcrypt.hash(req.body.password, 10)
                    const result = await User.findByIdAndUpdate(req.body.id, {
                        password: hashedPassword
                    })

                    if (result) {
                        req.flash("success_message", [{ msg: 'Password updated successfully' }])
                        res.redirect('/login')
                    } else {
                        req.flash("error", 'Please try to reset password again');
                        res.redirect('/forgot-password')
                    }
                }

            });

        } catch (e) {
            req.flash("error", 'Invalid link');
            res.redirect('/register')
        }
    }
}

const logout = (req,res,next)=>{
    req.logout();
    req.session.destroy((error) => {
        res.clearCookie('connect.sid');
        res.render('login', { layout: './layout/auth_layout.ejs', title: 'Login', success_message: [{ msg: 'Signed out successfully' }] })
    })
}

module.exports = {
    showLoginForm,
    showRegisterForm,
    showForgotPasswordForm,
    login,
    register,
    forgotPassword,
    verifyMail,
    showNewPasswordForm,
    saveNewPassword,
    logout
}