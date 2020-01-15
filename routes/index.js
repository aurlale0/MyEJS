var express = require('express');
var router = express.Router();
var session = require('express-session');

// session
router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.user) {
    res.render('index', { title: 'Express', session: req.session.passport, name: req.session.passport.user });
  } else {
    res.redirect('/auth/login');
  }
});

module.exports = router;
