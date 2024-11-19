// auth.js
var express = require('express');

var router = express.Router();
var bcrypt = require('bcrypt');


//로거
var logger = require('../utils/log'); 

//mysql 커넥터
var dbConnector = require('../utils/mysql-connector');

// 관리자 체크 미들웨어
// 관리자 확인 미들웨어 가져오기
var isAdmin = require('../utils/isAdmin'); 

// 인증 유틸
var passport = require('passport');

// admin 페이지 라우트
router.get('/admin', isAdmin, function(req, res) {

    // admin 페이지 내용
    res.send('환영합니다! 관리 페이지입니다.'); 
});

// 로그인 라우트
router.post('/login', function(req, res, next) {
    
    console.log("로그인 라우터 진입");
    logger.info("로그인 라우터 진입");

    //passport.js 의 passport.use(new LocalStrategy()... 호출됨.
    passport.authenticate('local', function(err, user, info) {

        // 서버 에러가 발생한 경우
        if (err) {
            console.error(err);

            // 에러를 다음 미들웨어로 전달
            return next(err); 
        }

        // 사용자가 존재하지 않는 경우 (로그인 실패)
        if (!user) {
                                                         // info.message를 통해 플래시 메시지를 설정할 수 있습니다.
            req.flash('error', info.message);            // 에러 메시지를 플래시 메시지로 설정
            console.error(info.message);
            return res.redirect('/auth/err-page');       // 로그인 페이지로 리다이렉트
        }

        // passport의 모듈 사용 logIn
        // 로그인 성공 시
        req.logIn(user, function(err) {

            if (err) {
                return next(err); // 로그인 중 에러 발생 시 다음 미들웨어로 전달
            }
            // 로그인 성공 후 리다이렉트
            return res.redirect('/auth/welcome');
        });
    })(req, res, next); // req, res, next를 추가하여 호출
});

// err-page
router.get('/err-page', function(req, res) {
    res.render('index', { title: 'err-page' });
});

// login-page
router.get('/login-page', function(req, res) {
    res.render('index', { title: 'login-page' });
});

// welcome
router.get('/welcome', function(req, res) {

    logger.info("welcome");

    // mySql db에 저장할 정보
    var user = {
        username: "aaaa",
        password: 1234,
        email: "adve",
        role: true                      // 역할 추가
    };
    
    var message = JSON.stringify(user , null, 2);

    logger.info("회원가입 정보 1 : ", { message })

    logger.info({user})
    logger.error("!!!!!");

    res.render('index', { title: 'welcome' });
});

// 로그아웃 라우트
router.get('/logout', function(req, res, next) {
    console.log("로그아웃")
    logger.info("로그아웃");

    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/auth/login-page'); // 로그아웃 후 리다이렉트
      });
});

// 회원가입 라우트
router.post('/register', function(req, res) {

    // 회원가입 로직은 여기에서 처리 (비밀번호 해싱 및 DB 저장)
    bcrypt.hash(req.body.password, 10, function(err, hashedPassword) {

        if (err) throw err;

        // 기본 역할을 'user'로 설정하고, 필요시 'admin'으로 설정
        var role = req.body.role || 'user'; // 요청에서 역할을 받거나 기본값 설정

        // mySql db에 저장할 정보
        var user = {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            role: role                      // 역할 추가
        };

        var message = JSON.stringify(user);

        console.log(">> 회원가입 정보 : " , message)

        logger.info("회원가입 정보 : " , { user })

        //console.log("회원가입 정보 : " , user);

        dbConnector.query('INSERT INTO user_tbl (username, password, email, role) VALUES (?, ?, ?, ?)', 
                 [user.username, user.password, user.email, user.role], function(err, result) {

            if (err) {
                console.error(err);
                return res.redirect('/auth/register');  // 에러 발생 시 리다이렉트
            }

            res.redirect('/auth/welcome');              // 회원가입 후 로그인 페이지로 리다이렉트
        });
    });
});

module.exports = router;
