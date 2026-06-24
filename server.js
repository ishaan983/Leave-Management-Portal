const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

mongoose.connect(process.env.MONGO_URl)
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log("db error: ", err));

app.listen(3000);