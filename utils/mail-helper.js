const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * 이메일 전송 함수
 * @param {string} to       - 수신자 이메일 주소
 * @param {string} subject  - 이메일 제목
 * @param {string} message  - 이메일 본문 (HTML 형식)
 * @param {string} from     - 발신자 이메일 주소 (옵션, 설정되지 않으면 기본값 사용)
 * @returns {Promise} 이메일 전송 결과
 */


async function sendMail( { to, subject, message, from } ) {

    // SMTP 설정
    const transporter = nodemailer.createTransport({
        service : process.env.SMTP_SERVICE,
        port    : process.env.SMTP_PORT || 465,
        secure  : process.env.SMTP_SECURE === 'true', // true일 경우 SSL 사용
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: from || process.env.SMTP_DEFAULT_FROM,    // 발신자 주소
        to,                                             // 수신자 주소
        subject,                                        // 메일 제목
        html: generateHtmlContent(subject, message)     // HTML 형식 본문
    };
    
    try {
        // 메일 발송 처리
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent: ${info.response}`);

        return { success: true, info };

    } catch (error) {

        console.error('Error sending email:', error);
        return { success: false, error };

    }
}

/**
 * HTML 이메일 콘텐츠 생성 함수
 * @param {string} subject - 이메일 제목
 * @param {string} message - 이메일 본문 내용
 * @returns {string} HTML 형식의 이메일 콘텐츠
 */
function generateHtmlContent(subject, message) {

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: #fff; padding: 20px; text-align: center; font-size: 24px; }
                .content { padding: 20px; line-height: 1.6; }
                .footer { padding: 20px; font-size: 12px; text-align: center; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    ${subject}
                </div>
                <div class="content">
                    ${message}
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = { sendMail };