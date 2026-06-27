const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const { authMiddleware, isAdmin} = require('../Middleware/authMiddleware');

router.get('/dashboard', authMiddleware, isAdmin, async function(req, res){
    try{
        const leaves = await LeaveRequest.find().populate('employee', 'name email').sort({createdAt: -1});
        res.render("admin-dashboard", {user: req.user, leaves});
    }
    catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
});

router.post("/leave/:id/approve", authMiddleware, isAdmin, async function(req, res){
    try{
        await LeaveRequest.findByIdAndUpdate(req.params.id, {status: "approved"});
        res.redirect("/admin/dashboard");
    }
    catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
});

router.post("/leave/:id/reject", authMiddleware, isAdmin, async function(req, res){
    try{
        await LeaveRequest.findByIdAndUpdate(req.params.id, {status: "rejected"});
        res.redirect("/admin/dashboard");
    }
    catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
});

module.exports = router;

