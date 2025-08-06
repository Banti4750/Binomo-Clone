

import nodemailer from 'nodemailer';


async function sendOtpToEmail(otp, email) {
    try {
        // Create a transporter object using SMTP
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });

        // Send email with the OTP
        console.log(`Sending OTP ${otp} to ${email}`);
        await transporter.sendMail({
            from: "Binomo app",
            to: email,
            subject: "Your OTP for Binomo App for forgot password",
            text: "Your OTP is: " + otp,
        });

        console.log(`OTP mail sent to ${email}`);
    } catch (error) {
        console.error(`Error sending OTP email: ${error.message}`);
        throw error; // Re-throw the error to handle it in the calling function
    }
}


export default sendOtpToEmail;
