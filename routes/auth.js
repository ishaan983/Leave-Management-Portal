const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.get('/register', function(req, res){
    res.render('register', {error: null});
});

router.post('/register', async function(req, res){
    try{
        const {name, email, password, role} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.render('register', {error: "Email already registered"});
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({name, email, password: hashPassword, role});
        await user.save();

        res.redirect('/login');
    }
    catch(err){
        console.log(err);
        res.render('register', {error: "Something went wrong"});
    }
});

router.get('/login', function(req, res){
    res.render('login', {error: null})
});

router.post('/login', async function(req, res){
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.render('login', {error: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.render('login', {error: "Invalid email or password"});
        }

        const token = jwt.sign({id: user._id, role: user.role, name: user.name}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {httpOnly: true});

        if(user.role === 'admin'){
            return res.redirect('/admin/dashboard')
        } 
        else{
            return res.redirect('/employee/dashboard');
        }
    }
    catch(err){
        console.log(err);
        res.render('login', {error: "Something went wrong"});
    }
});

router.get('/logout', function(req, res){
    res.clearCookie('token');
    res.redirect('/login');
})

module.exports = router;