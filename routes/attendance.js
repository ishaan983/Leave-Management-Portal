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
      shiftEnd: '06:00 PM',
      error: null
    });
  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});


function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

const OFFICE_LAT = 28.644238322636294;
const OFFICE_LNG = 77.17725025368892;
const MAX_DISTANCE = 200; 

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

    const distance = getDistance(
      parseFloat(lat),
      parseFloat(lng),
      OFFICE_LAT,
      OFFICE_LNG
    );

    if (distance > MAX_DISTANCE) {
      return res.render('attendance', {
        user: req.user,
        record: null,
        shiftStart: '10:00 AM',
        shiftEnd: '06:00 PM',
        error: `You are outside the allowed office boundary, (${Math.round(distance)}m away)`
      });
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
      status,
      distance: Math.round(distance)
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

