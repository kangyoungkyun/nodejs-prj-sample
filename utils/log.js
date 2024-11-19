// npm i winston winston-daily-rotate-file

//log.js

//[*] 설치 모듈
var winston = require('winston');                         //로그 모듈
var winstonDaily = require('winston-daily-rotate-file');  //로그 파일 관리 모듈
var process = require('process');                         //루트 경로 얻기 위한 모듈
require('dotenv').config();

// * 필요한 메소드와 파라미터들을 저장
var combine = winston.format.combine;
var timestamp = winston.format.timestamp;
var label = winston.format.label;
var printf = winston.format.printf;

// * 로그 파일 저장경로 - 루트경로/logs 폴더
var logDirPath = process.cwd() + '/logs';

// * log 출력 포멧 정의 
// * 날짜 [시스템이름] 로그레벨: 메세지
var logFormat = printf(function(info){
    return `${info.timestamp} [${info.level}] ${info.label}: ${info.message}`;
});

// * winston 로거 생성
var logger = winston.createLogger({

    // * [1] 로그 출력 형식 정의 - format
    // format: combine() 에서 정의한 timestamp와 label 형식값이 logFormat에 들어가서 정의되게 된다. 
    // level이나 message는 콘솔에서 자동 정의
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),     //시간 포멧
        label({label: 'MyApp'}),                        //앱이름
        logFormat                                       //로그 포멧
    ),

    // * [2] 실제 로그를 어떻게 기록할지 정의 - transports
    // new winstonDaily 를 정의해 어떤 레벨의 로그를 저장할때 어떤 형식으로 몇일 동안 보관할지를 상세히 설정
    transports : [
        new winstonDaily({
            level: 'info',                              //로그레벨
            datePattern: 'YYYY-MM-DD',                  //파일 날짜 형식
            dirname: logDirPath,                        //파일 경로
            filename: '%DATE%.log',                     //파일 이름
            maxFiles: 30,                               //최근 30일치 로그 파일 남김
            zippedArchive: true                         //gzip으로 압축여부
        })
        ,
        //* error 레벨 로그를 저장할 파일 설정 
        // info에 자동 포함되지만 일부러 따로 빼서 설정
        new winstonDaily({
            level: 'error',                             // error 레벨에선
            datePattern: 'YYYY-MM-DD',
            dirname: logDirPath + '/error',             // /logs/error 하위에 저장
            filename: '%DATE%.error.log',               // 에러 로그는 2020-05-28.error.log 형식으로 저장
            maxFiles: 30,
            zippedArchive: true
        })
    ]
    ,

    // * [3] 익셉션발생시 파일설정 - exceptionHandlers
    // * uncaughtException 발생시 파일 설정
    exceptionHandlers: [
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDirPath,
            filename: '%DATE%.exception.log',
            maxFiles: 30,
            zippedArchive: true
        })
    ]
});

//* Production 환경이 아닌, 개발 환경일 경우 파일 들어가서 일일히 로그 확인하기 번거로우니까 
//  화면에서 바로 찍게 설정 (로그 파일은 여전히 생성됨)
if (process.env.NODE_ENV !== 'pro') {    //pro //dev

    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // colorize는 로그의 색상입니다.
                winston.format.simple()
            ),
        })
    );
}

/*

사용예)

const logger = require("./logger");

logger.info("hello world");
logger.error("hello world");
logger.warn("hello world");
logger.debug("hello world");
logger.verbose("hello world");
logger.silly("hello world");


만일 메세지를 여러번 써야할 경우에는 다음과 같이 구성해준다.

// console.log('naver profile : ', profile);
logger.info('naver profile : ', { message: profile }); // console.log와 달리 뒤에 message 객체로 써주어야 한다.

출처: https://inpa.tistory.com/entry/NODE-📚-Winston-모듈-사용법-서버-로그-관리 [Inpa Dev 👨‍💻:티스토리]

*/

module.exports = logger;