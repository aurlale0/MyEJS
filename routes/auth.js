var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var MySQLStore = require('express-mysql-session');
var MySQLStoreConfig = require('../config/db_info').local;
var mysql_odbc = require('../config/db_conn')();
var conn = mysql_odbc.init();

var secretKeyConfig = require('dotenv').config();

router.use(passport.initialize());
router.use(passport.session());

var options = {
    host: MySQLStoreConfig.host,
    port: MySQLStoreConfig.port,
    user: MySQLStoreConfig.user,
    password: MySQLStoreConfig.password,
    database: MySQLStoreConfig.database
};

var sessionStore = new MySQLStore(options);

// session
router.use(session({
    secret: process.env.SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));


router.get('/', function (req, res, next) {
    res.render('Auth', { title: 'Authenticate' });
});

/* Join */

router.get('/join', function (req, res, next) {
    var message;
    var errorMessage = req.flash('error');
    if (errorMessage) message = errorMessage;
    res.render('Join', { title: 'Join', 'message': message });
});

/* Login */

router.get('/login', function (req, res, next) {
    var message;
    var errorMessage = req.flash('error');
    if (errorMessage) message = errorMessage;
    res.render('Login', { title: 'Login', 'message': message });
});

// Session save user id
passport.serializeUser(function (user, done) {
    done(null, user.username);
});

// ID get from Session store
passport.deserializeUser(function (id, done) {
    done(null, id);
});

// Join Authenticate
passport.use('local-join', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    var query = conn.query('SELECT * FROM users WHERE username = ?', [username], function (err, rows) {
        if (err) return done(err);
        if (rows.length) {
            return done(null, false, { 'message': 'Your E-mail is already used' })
        } else {
            const saltRounds = 10;
            // Using 'bcrypt' in password and Register user.
            bcrypt.hash(password, saltRounds, function (err, hash) {
                var datas = { username: username, password: hash };
                var query = conn.query('INSERT INTO users SET ?', datas, function (err, rows) {
                    if (err) throw err;
                    return done(null, { 'username': username, 'id': rows.insertId });
                })
            })

        }
    })
}
));

// Login Authenticate
passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    var query = conn.query('SELECT * FROM users WHERE username = ?', [username], function (err, rows) {
        if (err) return done(err);
        if (rows.length === 0) {
            console.log('유저없음');
            return done(null, false, { 'message': '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.', 'class':'alert alert-danger' });
        } else {
            if (!bcrypt.compareSync(password, rows[0].password)) {
                console.log('패스워드불일치');
                return done(null, false, { 'message': '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.', 'class':'alert alert-danger' });
            } else {
                console.log('로그인 성공');
                return done(null, { 'username': username, 'id': rows[0].id });
            }
        }
    })
}
));

router.post('/login',
    passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })
);

router.post('/join',
    passport.authenticate('local-join', {
        successRedirect: '/',
        failureRedirect: '/auth/join',
        failureFlash: true
    })
);

/* Logout */

router.get('/logout', function (req, res) {
    req.logout();
    res.status(200).clearCookie('connect.sid', {
      path: '/'
    });
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

module.exports = router;
