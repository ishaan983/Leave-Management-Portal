const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
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

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log("db error: ", err));

app.listen(3000);