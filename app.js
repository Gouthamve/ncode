var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');

var mongoose = require('mongoose');

var config = require('./oauth.js')
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('./models/user');

mongoose.connect('mongodb://localhost/ncode')

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// config
passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne({
      'facebook.id': profile.id
    }, function(err, user) {
      if (err)
        return done(err);
      if (user) {
        return done(null, user)
      } else {
        User.find().count(function(err, count) {
          if (err)
            return console.log(err)
          var newUser = new User();
          newUser.nvisionId = "nvision15" + (count + 300).pad(
            4)
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.displayName = profile.displayName;
          newUser.facebook.name.familyName = profile.name.familyName;
          newUser.facebook.name.givenName = profile.name.givenName;
          newUser.facebook.gender = profile.gender;
          newUser.facebook.profileUrl = profile.profileUrl;
          newUser.facebook.email = profile.emails[0].value;
          newUser.save(function(err) {
            if (err) {
              return done(err)
            } else {
              console.log(user)
              return done(null, newUser)
            }
          })
        });
      }
    })
  });
}));

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({
        'google.id': profile.id
      }, function(err, user) {
        if (err) {
          return done(err)
        } else if (user) {
          return done(null, user)
        } else {
          User.count({}, function(err, count) {
            if (err)
              return console.log(err)
            var newUser = new User();
            newUser.nvisionId = "nvision15" + (count + 300).pad(
              4)
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.displayName = profile.displayName;
            newUser.google.name.familyName = profile.name.familyName;
            newUser.google.name.givenName = profile.name.givenName;
            newUser.google.email = profile.emails[0].value;
            newUser.google.gender = profile.gender;
            newUser.google.domain = profile._json.domain;
            newUser.google.profileUrl = profile._json.url;
            newUser.save(function(err) {
              if (err) {
                return done(err)
              } else {
                return done(null, newUser)
              }
            })
          })
        }

      })
    });
  }));


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '1234567890QWERTY'
}));

// passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: 'email'
}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/',
  successRedirect: '/'
}));

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/'
}));

app.use('/', routes);

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
