var express = require('express');
var router = express.Router();
var session = require('express-session');

var mysql_odbc = require('../config/db_conn')();
var conn = mysql_odbc.init();

// session
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/board/list/1')
});

router.get('/list/:page', function(req, res, next){
    var page = req.params.page;
    var sql = "select idx, name, title, date_format(modidate,'%Y-%m-%d %H:%i') modidate, " +
    "date_format(regdate,'%Y-%m-%d %H:%i') regdate from board order by regdate desc";
    conn.query(sql, function(err, rows){
        if(err) console.error("err: "+err);
        res.render('list',{title: "게시판", rows:rows});
    });
});

router.get('/list', function(req, res, next){
    res.redirect('/board/list/1');
})

router.get('/page/:page',function(req,res,next)
{
    var page = req.params.page;
    var sql = "select idx, name, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, " +
        "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate,hit from board";
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        res.render('page', {title: ' 게시판 리스트', rows: rows, page:page, length:rows.length-1, page_num:10, pass:true});
    });
});

module.exports = router;
