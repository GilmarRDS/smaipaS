const appUrl = process.env.APP_URL || 'http://localhost:3000';

const emailSender = process.env.EMAIL_SENDER || 'no-reply@example.com';

const emailTransport = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
};

export default {
  appUrl,
  emailSender,
  emailTransport,
};
