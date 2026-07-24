const Attendance = require('../models/Attendance');
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const LeaveRequest = require('../models/LeaveRequest');
const { getBusinessDate } = require('../utils/attendance');

router.get('/dashboard', authMiddleware, isAdmin, async (req, res) => {
  try {
    const today = getBusinessDate();

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

router.get('/attendance/export', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');

    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
    const selectedStatus = req.query.status || 'all';

    let query = { date: selectedDate };
    if (selectedStatus !== 'all') {
      query.status = selectedStatus;
    }

    const records = await Attendance.find(query)
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Punch In', key: 'punchIn', width: 15 },
      { header: 'Punch Out', key: 'punchOut', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Distance from Office (m)', key: 'distance', width: 25 }
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' } 
      };
      cell.alignment = { horizontal: 'center' };
    });

    records.forEach(record => {
      const row = sheet.addRow({
        name: record.employee.name,
        email: record.employee.email,
        date: record.date,
        punchIn: record.punchIn || '--',
        punchOut: record.punchOut || '--',
        status: record.status === 'present' ? 'On Time' : record.status.charAt(0).toUpperCase() + record.status.slice(1),
        distance: record.distance || 0
      });

      if (record.status === 'late') {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF08A' } 
          };
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${selectedDate}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.log(err);
    res.send('Something went wrong');
  }
});

router.post('/leave/:id/approve', authMiddleware, isAdmin, async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status: 'approved'
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Something went wrong');
  }
});

router.post('/leave/:id/reject', authMiddleware, isAdmin, async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status: 'rejected'
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Something went wrong');
  }
});

module.exports = router;
