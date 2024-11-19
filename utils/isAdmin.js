// middleware/isAdmin.js
module.exports = function(req, res, next) {
    
    // 사용자가 로그인했는지 확인
    if (req.isAuthenticated()) {
        
        // 사용자의 역할이 'admin'인지 확인
        if (req.user.role === 'admin') {
            return next(); // 관리자일 경우 다음 미들웨어로 이동
        } else {

            console.log("❗️접근 권한이 없습니다.")

            return res.status(403).send('접근이 거부되었습니다. 관리자만 이 페이지에 접근할 수 있습니다.'); // 접근 거부 메시지
        }
    }
    // 로그인하지 않은 경우
    res.redirect('/auth/login-page'); // 로그인 페이지로 리다이렉트
};