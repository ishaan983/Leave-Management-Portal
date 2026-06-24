const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    leaveType:{
        type: String,
        enum:['sick', 'casual', 'annual'],
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    reason:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {timestamps: true});