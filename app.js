var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var uploadRouter = require('./routes/upload');

//스웨거 라이브러리
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger 설정
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API 문서',
      version: '1.0.0',
      description: 'API 문서입니다.',
    },
    servers: [
      {
        url: 'http://localhost:3434',
        description: '개발 서버',
      },
    ],
  },
  apis: ['./routes/*.js'], // API 라우트 파일 경로
};
const specs = swaggerJsdoc(options);


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   0. 인증라우터 - passport 
var authRouter = require('./routes/auth');

var app = express();

const cors = require('cors');

//mysql 커넥터
const dbConnector = require('./utils/mysql-connector');


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   0. 모듈 설정 - passport 
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');



// 스웨거 라우트 주소
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 1. 세션 및 미들웨어 설정 - passport
app.use(session({
  secret: 'your-secret-key', // 비밀 키
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 2. passport 설정 로드
require('./utils/passport')(passport, dbConnector); 


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
// CORS 미들웨어 설정 - Cross Origin Resource Sharing을 활성화하여 다른 도메인에서의 요청 허용
app.use(cors());

// request body를 JSON 형태로 파싱하는 미들웨어
//app.use(bodyParser.json());

// request body를 JSON으로 파싱하는 미들웨어
app.use(express.json());

// 개발 환경에서 로그를 출력하는 미들웨어 
app.use(logger('dev'));
// URL-encoded 데이터를 파싱하는 미들웨어 (HTML form 데이터 처리)
app.use(express.urlencoded({ extended: false }));

// 쿠키를 파싱하는 미들웨어
app.use(cookieParser());

// 정적 파일을 서비스하기 위한 미들웨어 - public 디렉토리의 파일들을 정적으로 제공
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/file', uploadRouter);


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 3. auth 라우터 설정
app.use('/auth', authRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
