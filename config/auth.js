const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
require('dotenv').config();

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },  
    (username, password, done) => {
      User.findOne({ email: username }, (err, user) => {
        if (err) { 
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Email does not exist. Please enter a valid email." });
        }
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              // passwords match! log user in
              return done(null, user)
            } else {
              // passwords do not match!
              return done(null, false, { message: "Password is incorrect. Please enter the correct password." })
            }
          });
      });
    })
);

//token verification
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY
  },
  function(jwtPayload, done) {
    return done(null, jwtPayload)
  }
));