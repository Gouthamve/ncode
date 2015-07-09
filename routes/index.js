var express = require('express');
var router = express.Router();

var User = require('../models/user')

var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Nvision | N-Code',
    user: req.user
  });
});

router.get('/reg', function(req, res, next) {
  User.find().exec(function(err, users) {
    res.render('registrations', {
      people: users
    })
  })
})

module.exports = router;
