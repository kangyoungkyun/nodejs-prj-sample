
//파일 업로드를 위한 라이브러리
var express = require('express');
var router = express.Router();
var path = require('path');

//mysql 커넥터
var dbConnector = require('../utils/mysql-connector');

// 페이징 헬퍼 함수
var { paginate } = require('../utils/page-helper');

// 메일 헬퍼 함수
var { sendMail } = require('../utils/mail-helper');


// 엑셀 파일 다운 라이브러리
const xlsx = require('xlsx');
const fs = require('fs');

/**
 * @swagger
 * /users/sendMail:
 *   get:
 *     summary: 이메일 발송 API
 *     description: 지정된 이메일 주소로 환영 메시지를 발송합니다.
 *     responses:
 *       302:
 *         description: 이메일 발송 결과에 따라 성공/실패 페이지로 리다이렉트
 */
router.get('/sendMail', async (req, res) => {
  
  const emailOptions = {
    to: 'jooboplus@gmail.com',
    subject: 'Welcome to Our Service',
    message: '<p>Thank you for joining our service! We are excited to have you. Thank you for joining our service! We are excited to have you. Thank you for joining our service! We are excited to have you. Thank you for joining our service! We are excited to have you.</p>'
  };

  const result = await sendMail(emailOptions);

  if (result.success) {
      console.log('✅이메일이 성공적으로 발송되었습니다:', result.info);
      res.redirect('/users/mail-page'); 
  } else {
      console.error('❗️이메일 발송에 실패했습니다:', result.error);
      res.redirect('/users/mail-error-page'); 
  }

});

/**
 * @swagger
 * /users/mail-page:
 *   get:
 *     summary: 메일 발송 성공 페이지
 *     description: 메일 발송 성공 시 보여지는 페이지입니다.
 *     responses:
 *       200:
 *         description: 성공 페이지 렌더링
 */
router.get('/mail-page', function(req, res) {
    res.render('index', { title: 'sendMail - success - page' });
});

/**
 * @swagger
 * /users/mail-error-page:
 *   get:
 *     summary: 메일 발송 실패 페이지
 *     description: 메일 발송 실패 시 보여지는 페이지입니다.
 *     responses:
 *       200:
 *         description: 에러 페이지 렌더링
 */
router.get('/mail-error-page', function(req, res) {
  res.render('index', { title: 'sendMail - error - page' });
});


/**
 * @swagger
 * /users/downExcel:
 *   get:
 *     summary: 도서 목록 엑셀 다운로드
 *     description: 도서 테이블의 모든 데이터를 엑셀 파일로 다운로드합니다.
 *     responses:
 *       200:
 *         description: 엑셀 파일 다운로드 성공
 *       500:
 *         description: 서버 에러 발생
 */
router.get('/downExcel', function(req, res, next) {
  console.log("엑셀 다운");

  const query = 'SELECT * FROM book_table';

  dbConnector.query(query, (err, results) => {

      if (err) {
          return res.status(500).send('Error retrieving data from database.');
      }

      // 원하는 제목과 필드명을 매핑
      const formattedResults = results.map(item => ({
        '책 ID': item.id,          // 필드명 대신 원하는 제목 사용
        '책 이름': item.name,
        '저자': item.author,
        '가격': item.price
      }));

      // 엑셀 파일 생성
      const ws = xlsx.utils.json_to_sheet(formattedResults);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Books');

      // 엑셀 파일을 저장할 경로 설정
      const fileName = 'books.xlsx';
      const filePath = `${__dirname}/${fileName}`;
      xlsx.writeFile(wb, filePath);

      // 엑셀 파일 다운로드
      res.download(filePath, (err) => {
          if (err) {
              console.error('❗️Error downloading file:', err);
              return res.status(500).send('Error downloading file.');
          }
          // 파일 다운로드 후 삭제
          fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                  console.error('❗️Error deleting file:', unlinkErr);
              } else {
                  console.log('✅File deleted successfully.');
              }
          });
      });
  });
});


/**
 * @swagger
 * /users:
 *   get:
 *     summary: 도서 목록 페이징 조회
 *     description: 도서 목록을 페이징하여 조회합니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *     responses:
 *       200:
 *         description: 도서 목록 페이지 렌더링 성공
 *       500:
 *         description: 서버 에러 발생
 */
router.get('/', (req, res) => {

  // 출력 결과 : [{"total":300}]
  const totalQuery = 'SELECT COUNT(*) AS total FROM book_table';

  dbConnector.query(totalQuery, (err, results) => {

    if (err) { return res.status(500).json({ error: err.message }); }

    // 총 게시물 수
    const total = results[0].total;

    // 현재 페이지
    const cur_page = (req.query.page && !isNaN(req.query.page)) ? parseInt(req.query.page) : 1;

    // 페이징 정보 계산
    // 페이지당 항목 수 : 10
    // 한번에 표시할 페이지 수 : 5
    const { currentPage, totalPages, startIndex, startPage, endPage, prevPage, nextPage } = paginate(total, cur_page, 10, 5);

    // 책 정보를 조회하는 쿼리
    const pagingQuery = `SELECT * FROM book_table LIMIT ${startIndex} , 10`;

    dbConnector.query(pagingQuery, (err, books) => {
      if (err) { return res.status(500).json({ error: err.message }); }

      res.render('users', {
        books,
        cur_page: currentPage,
        total_page: totalPages,
        start_page: startPage,
        end_page: endPage,
        prev_page: prevPage,
        next_page: nextPage
      });
    });
  });
});


module.exports = router;
