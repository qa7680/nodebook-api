const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');
const cors = require('cors');
require('./config/auth');
require('dotenv').config();

// set up app and PORT
const app = express();
const PORT = 8000 || process.env.PORT;

// set up mongoose and mongo
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Set up middleware 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// set up authentification middleware
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// current user session
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    next();
});

// set up main routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

