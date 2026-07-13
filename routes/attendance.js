const express=require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const {authMiddleware} = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const existingRecord = await Attendance.findOne({
      employee: req.user.id,
      date: today
    });

    res.render('attendance', {
      user: req.user,
      record: existingRecord,
      shiftStart: '10:00 AM',
      shiftEnd: '06:00 PM'
    });
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});

router.post('/punchin', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { lat, lng, address } = req.body;

    const existing = await Attendance.findOne({
      employee: req.user.id,
      date: today
    });

    if (existing) {
      return res.redirect('/attendance');
    }

    const now = new Date();
    const punchInTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const hour = now.getHours();
    const status = hour >= 10 ? 'late' : 'present';

    const attendance = new Attendance({
      employee: req.user.id,
      date: today,
      punchIn: punchInTime,
      location: { lat, lng },
      address,
      status
    });

    await attendance.save();
    res.redirect('/attendance');
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});

router.post('/punchout', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const now = new Date();
    const punchOutTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    await Attendance.findOneAndUpdate(
      { employee: req.user.id, date: today },
      { punchOut: punchOutTime }
    );

    res.redirect('/attendance');
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});

module.exports = router;

