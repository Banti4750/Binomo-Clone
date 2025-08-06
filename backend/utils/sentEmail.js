import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendOtpToEmail(otp, email, userName = 'User') {
    try {
        // Create a transporter object using SMTP
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });

        // Modern HTML template for OTP email
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Binomo OTP Code</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                }

                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }

                .logo {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: -1px;
                }

                .header-subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                    font-weight: 300;
                }

                .content {
                    padding: 40px 30px;
                }

                .greeting {
                    font-size: 24px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 20px;
                }

                .message {
                    font-size: 16px;
                    color: #4a5568;
                    margin-bottom: 30px;
                    line-height: 1.7;
                }

                .otp-container {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                }

                .otp-label {
                    font-size: 14px;
                    color: #718096;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 500;
                }

                .otp-code {
                    font-size: 36px;
                    font-weight: 700;
                    color: #2d3748;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 8px;
                    margin: 10px 0;
                    padding: 15px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    display: inline-block;
                    border: 1px solid #cbd5e0;
                }

                .expires {
                    background-color: #fed7d7;
                    border: 1px solid #feb2b2;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 25px 0;
                    text-align: center;
                }

                .expires-icon {
                    color: #e53e3e;
                    margin-right: 8px;
                }

                .expires-text {
                    color: #c53030;
                    font-size: 14px;
                    font-weight: 500;
                }

                .security-notice {
                    background-color: #ebf8ff;
                    border: 1px solid #90cdf4;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                }

                .security-title {
                    color: #2b6cb0;
                    font-weight: 600;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }

                .security-icon {
                    margin-right: 8px;
                }

                .security-text {
                    color: #2c5282;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .footer {
                    background-color: #f7fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }

                .footer-text {
                    color: #718096;
                    font-size: 14px;
                    margin-bottom: 15px;
                }

                .support-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }

                .support-link:hover {
                    text-decoration: underline;
                }

                @media (max-width: 600px) {
                    .email-container {
                        margin: 0;
                        border-radius: 0;
                    }

                    .content,
                    .header,
                    .footer {
                        padding: 25px 20px;
                    }

                    .otp-code {
                        font-size: 28px;
                        letter-spacing: 4px;
                    }

                    .greeting {
                        font-size: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">Binomo</div>
                    <div class="header-subtitle">Secure Trading Platform</div>
                </div>

                <div class="content">
                    <h1 class="greeting">Hello, ${userName}!</h1>

                    <p class="message">
                        We received a request to reset your password. Use the verification code below to complete your password reset process.
                    </p>

                    <div class="otp-container">
                        <div class="otp-label">Your Verification Code</div>
                        <div class="otp-code">${otp}</div>
                    </div>

                    <div class="expires">
                        <span class="expires-icon">⏰</span>
                        <span class="expires-text">This code will expire in ${process.env.OTP_VALID_TIME} minutes</span>
                    </div>

                    <div class="security-notice">
                        <div class="security-title">
                            <span class="security-icon">🔒</span>
                            Security Notice
                        </div>
                        <div class="security-text">
                            Never share this code with anyone. Binomo will never ask for your verification code via phone or email.
                            If you didn't request this code, please ignore this email or contact our support team immediately.
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-text">
                        Need help? Contact our support team at
                        <a href="mailto:support@binomo.com" class="support-link">support@binomo.com</a>
                    </div>
                    <div class="footer-text">
                        © ${new Date().getFullYear()} Binomo. All rights reserved.
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Plain text fallback
        const textTemplate = `
Hello ${userName}!

We received a request to reset your password for your Binomo account.

Your verification code is: ${otp}

This code will expire in 10 minutes.

SECURITY NOTICE:
- Never share this code with anyone
- Binomo will never ask for your verification code via phone or email
- If you didn't request this code, please ignore this email

Need help? Contact us at support@binomo.com

© ${new Date().getFullYear()} Binomo. All rights reserved.
        `;

        // Email options
        const mailOptions = {
            from: {
                name: 'Binomo Security',
                address: process.env.USER
            },
            to: email,
            subject: '🔐 Your Binomo Password Reset Code',
            text: textTemplate,
            html: htmlTemplate,
            // Add some email headers for better deliverability
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        // Send email with the OTP
        console.log(`Sending OTP ${otp} to ${email}`);
        const info = await transporter.sendMail(mailOptions);

        console.log(`OTP email sent successfully to ${email}`);
        // console.log(`Message ID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            email: email
        };

    } catch (error) {
        console.error(`Error sending OTP email: ${error.message}`);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
}

export default sendOtpToEmail;