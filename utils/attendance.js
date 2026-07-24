const Attendance = require('../models/Attendance');
const User = require('../models/User');

const BUSINESS_TIME_ZONE = 'Asia/Kolkata';
const SHIFT_END_HOUR = 18;

function getBusinessDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isShiftOver(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23'
  }).format(date));

  return hour >= SHIFT_END_HOUR;
}

async function markAbsentees(date = getBusinessDate()) {
  const [employees, recordedEmployeeIds] = await Promise.all([
    User.find({ role: 'employee' }).select('_id').lean(),
    Attendance.distinct('employee', { date })
  ]);

  const recordedIds = new Set(recordedEmployeeIds.map((id) => id.toString()));
  const absences = employees
    .filter((employee) => !recordedIds.has(employee._id.toString()))
    .map((employee) => ({ employee: employee._id, date, status: 'absent' }));

  if (absences.length === 0) return 0;

  await Attendance.bulkWrite(
    absences.map((absence) => ({
      updateOne: {
        filter: { employee: absence.employee, date: absence.date },
        update: { $setOnInsert: absence },
        upsert: true
      }
    }))
  );
  return absences.length;
}

async function finalizeTodayAbsences() {
  if (!isShiftOver()) return 0;
  return markAbsentees();
}

module.exports = { getBusinessDate, finalizeTodayAbsences };
