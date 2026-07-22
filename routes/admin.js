const Attendance = require('../models/Attendance');
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const LeaveRequest = require('../models/LeaveRequest');

router.get('/dashboard', authMiddleware, isAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const selectedDate = req.query.date || today;
    const selectedStatus = req.query.status || 'all';

    const leaves = await LeaveRequest.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({ role: 'employee' });
    const presentToday = await Attendance.countDocuments({ date: today });
    const lateToday = await Attendance.countDocuments({ date: today, status: 'late' });
    const absentToday = totalUsers - presentToday;

    let attendanceQuery = { date: selectedDate };
    if (selectedStatus !== 'all') {
      attendanceQuery.status = selectedStatus;
    }

    const attendance = await Attendance.find(attendanceQuery)
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    res.render('admin-dashboard', {
      user: req.user,
      leaves,
      attendance,
      analytics: {
        totalPresent: presentToday,
        totalLate: lateToday,
        totalAbsent: absentToday
      },
      selectedDate,
      selectedStatus
    });
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});

module.exports = router;

