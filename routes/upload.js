
//https://inpa.tistory.com/entry/EXPRESS-%F0%9F%93%9A-multer-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4

var express = require('express');
var router = express.Router();

// 파일 저장 헬퍼
const { createUploader } = require('../utils/file-helper'); 


// 업로드 설정 (폴더 경로와 파일 크기 제한을 설정)
// createUploader 함수: file-helper.js 파일에서 파일 경로(uploadDir)와 파일 크기 제한(fileSizeLimit)을 매개변수로 받아 multer 설정을 반환합니다.
// 'single_file'라는 이름은 html의 <input type="file" name="single_file"> 에서 폼데이터 이름으로 온 것이다.
//  <input type='file' name='images' multiple/>
const uploadSingle = createUploader('public/uploads', 5 * 1024 * 1024).single('single_file');
const uploadArray = createUploader('public/uploads', 5 * 1024 * 1024).array('images', 10); // 최대 10개의 파일


/* GET listing. */
router.get('/', function(req, res, next) {
  res.render('upload');
});

// 단일 파일 업로드 라우트
router.post('/upload', (req, res) => {
  uploadSingle(req, res, (err) => {
      if (err) {
          console.error("파일 업로드 실패:", err);
          return res.status(500).send('파일 업로드 실패');
      }
      console.log("파일 한 건 업로드", req.file);
      res.send('ok');
  });
});


// 여러 파일 업로드 라우트
router.post('/upload_arry', (req, res) => {
  uploadArray(req, res, (err) => {
      if (err) {
          console.error("여러 파일 업로드 실패:", err);
          return res.status(500).send('여러 파일 업로드 실패');
      }
      console.log("파일 여러 건 업로드", req.files);
      res.send('ok');
  });
});


module.exports = router;
