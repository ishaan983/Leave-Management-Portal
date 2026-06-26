const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const {authMiddleware} = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, async function(req, res){
    try{
        const leaves = await LeaveRequest.find({employee: req.user.id}).sort({createdAt: -1});
        res.render('employee-dashboard', {user: req.user, leaves});
    }
    catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
});

router.get('/apply', authMiddleware, function(req, res){
    res.render('apply-leave', {user:req.user, error: null});
});

router.post('/apply', authMiddleware, async function(req, res){
    try{
        const{leaveType, startDate, endDate, reason} = req.body;
        if(new Date(endDate)<new Date(startDate)){
            return res.render('apply-leave', {user:req.user, error:'End date cannot be before start date'})
        }

        const leave = new LeaveRequest({
            employee: req.user.id, leaveType, startDate, endDate, reason
        });
        await leave.save();
        res.redirect('/employee/dashboard');
    }
    catch(err){
        console.log(err);
        res.render('apply-leave', {user: req.user, error: "Something went wrong"});
    }
})

module.exports = router;