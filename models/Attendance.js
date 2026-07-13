const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    date:{
        type:String,
        required:true
    },
    punchIn:{
        type:String,
        default:null
    },
    punchOut:{
        type:String,
        default:null
    },
    location:{
        lat:{type: Number, default:null},
        lng:{type: Number, default:null}
    },
    address:{
        type:String,
        default: ""
    },
    status: {
        type:String,
        enum: ['present', 'late', 'absent'],
        default: 'present'
    }
}, {timestamps: true});

module.exports = mongoose.model('Attendance', attendanceSchema);