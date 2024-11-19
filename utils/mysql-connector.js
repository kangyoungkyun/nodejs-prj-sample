const mysql = require('mysql2');
const dotenv = require('dotenv');
var logger = require('./log'); 

// 환경 변수 설정 파일 로드
require('dotenv').config();

// 환경에 따른 연결 설정
const isProduction = process.env.NODE_ENV === 'pro';

// MySQL 데이터베이스 연결 풀 설정
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,                      // 최대 연결 수 (필요에 맞게 설정)
  queueLimit: 0,                            // 연결 요청 대기열 제한 (0은 제한 없음)
  multipleStatements: true                  // 여러 쿼리 실행 허용 (보안에 주의)
});

// MySQL 연결 상태 확인 함수
function testConnection() {

  db.getConnection((err, connection) => {

    if (err) {

      logger.error('MySQL 연결 실패:', err);

      if (isProduction) {
        // 운영 환경일 경우, 에러 모니터링 로직 추가 가능 (예: Sentry, Slack 알림 등)
      }

    } else {
      logger.info('MySQL 연결 성공');
      connection.release();             // 연결 해제
    }
  });
}

// 에러 발생 시 로깅 및 처리
db.on('error', (err) => {
  
  logger.error('MySQL 연결 에러 발생:', err);

  // 에러 핸들링 로직 추가 가능 (예: 재연결 시도 또는 알림 발송)
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {

    logger.info('연결이 끊어졌습니다. 재연결을 시도합니다.');

    testConnection(); // 연결 재시도
  }
});

// 초기 연결 테스트 호출
testConnection();

module.exports = db;