// passport.js 
// sudo npm install express-session passport passport-local bcrypt connect-flash
// https://dev-dain.tistory.com/73
// https://loosie.tistory.com/115
// https://velog.io/@qpqp010920/node.js-passport-kakao

var LocalStrategy = require('passport-local').Strategy; // Passport의 로컬 전략 모듈을 가져옵니다.
var bcrypt = require('bcrypt');                         // 비밀번호 해싱 및 확인을 위한 bcrypt 모듈을 가져옵니다.


// app.js에서 passport 설정을 넣어주었음
// Passport 설정을 위한 함수로, passport 객체와 데이터베이스 연결 객체(db)를 매개변수로 받습니다.
module.exports = function(passport, db) {
    
    // [1] serializeUser
    // 사용자가 로그인할 때 호출되며, 사용자 정보를 세션에 저장하기 위한 메소드입니다.
    passport.serializeUser(function(user, done) {

        console.log("✅>>>> serializeUser 호출 : user = " + user);

        done(null, user.username); // 세션에 사용자 ID(username)를 저장합니다.
    });
    

    // [2] deserializeUser
    // 사용자가 Rest API 를요청할 때마다 호출되며, 세션에서 사용자 정보를 복원하는 메소드입니다.
    passport.deserializeUser(function(username, done) {

        console.log("✅>>>> deserializeUser 호출 username = " + username);

        // 데이터베이스에서 username으로 사용자를 조회합니다.
        db.query('SELECT * FROM user_tbl WHERE username = ?', [username], function(err, results) {

            if (err) return done(err);                          // 데이터베이스 오류 발생 시 done(err) 호출

            if (results.length === 0) return done(null, false); // 사용자가 존재하지 않으면 done(null, false) 호출

            // 사용자가 존재하면, 그 정보를 done으로 전달합니다.
            // 첫 번째 결과(사용자 정보)를 done으로 전달
            done(null, results[0]); 
        });
    });


    // [3] 로컬 전략 설정
    // 사용자가 로그인할 때 호출되는 로컬 전략입니다.
    // username과 password를 사용하여 사용자를 인증합니다.
    passport.use(new LocalStrategy(

        function(username, password, done) {

            console.log(">>>> passport.use(new LocalStrategy) 진입 <<<<")
            console.log("username : " , username , "password: " , password);

            // 데이터베이스에서 username으로 사용자를 조회합니다.
            db.query('SELECT * FROM user_tbl WHERE username = ?', [username], function(err, results) {

                if (err) return done(err);                                          // 데이터베이스 오류 발생 시 done(err) 호출

                if (results.length === 0) {
                    console.error("❗️사용자가 존재하지 않습니다.");
                    // 사용자가 존재하지 않는 경우
                    return done(null, false, { message: 'Incorrect username.' });   // done 호출 시 오류 메시지 포함
                }

                // 조회된 사용자 정보를 변수에 저장
                var user = results[0]; 

                // 비밀번호 확인
                bcrypt.compare(password, user.password, function(err, isValidPassword) {

                    if (err) return done(err);                                        // 비밀번호 비교 중 오류 발생 시 done(err) 호출
                    
                    // 비밀번호가 일치하지 않는 경우
                    if (!isValidPassword) {
                        console.error("❗️비밀번호가 일치 하지 않습니다.");
                        return done(null, false, { message: 'Incorrect password.' }); // done 호출 시 오류 메시지 포함
                    }

                    console.log("✅ 로그인이 성공적으로 처리 ✅");
                    console.log("user : " , user);

                    // 로그인이 성공적으로 처리된 경우
                    // 사용자 정보를 done으로 전달
                    return done(null, user); 
                });
            });
        }
    ));
};
