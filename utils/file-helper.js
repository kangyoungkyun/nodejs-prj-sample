const multer = require('multer');
const fs = require('fs');
const path = require('path');
var logger = require('./log'); 


// 파일 저장 경로와 파일 제한 크기, 파일 필드를 매개변수로 받는 함수
function createUploader(uploadDir, fileSizeLimit = 5 * 1024 * 1024) {

    // 폴더가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
        console.log(`${uploadDir} 폴더가 없습니다. 폴더를 생성합니다.`);
        fs.mkdirSync(uploadDir, { recursive: true });
    } else {
        console.log(`${uploadDir} 폴더가 존재합니다.`);
    }
    
    // Multer 업로드 설정
    const upload = multer({
        storage: multer.diskStorage({

            destination(req, file, done) {
                done(null, uploadDir);              // 지정된 디렉토리에 파일 저장
            },

            filename(req, file, done) {
                const ext = path.extname(file.originalname);
                done(null, generateFileName(ext));  // 파일 이름 생성
            }
        }),
        limits: { fileSize: fileSizeLimit }         // 파일 크기 제한
    });

    return upload;
}

// 파일명 생성 함수
function generateFileName(extension = '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    let randomAlphabets = '';

    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * alphabets.length);
        randomAlphabets += alphabets[randomIndex];
    }

    return `${year}${month}${day}_${hours}${minutes}${seconds}_${randomAlphabets}${extension}`;
}

module.exports = {
    createUploader
};