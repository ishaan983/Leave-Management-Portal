const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { finalizeTodayAbsences } = require('./utils/attendance');
require('dotenv').config();
const path = require('path');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/auth'));
app.use('/employee', require('./routes/leave'));
app.use('/admin', require('./routes/admin'));
app.use('/attendance', require('./routes/attendance'));

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log("mongodb connected");
  try {
    const marked = await finalizeTodayAbsences();
    if (marked) console.log(`Marked ${marked} employee(s) absent`);
  } catch (err) {
    console.error('Unable to finalize absences:', err);
  }
})
.catch((err)=>console.log("db error: ", err));

setInterval(async () => {
  try {
    const marked = await finalizeTodayAbsences();
    if (marked) console.log(`Marked ${marked} employee(s) absent`);
  } catch (err) {
    console.error('Unable to finalize absences:', err);
  }
}, 5 * 60 * 1000);

app.listen(3000);
