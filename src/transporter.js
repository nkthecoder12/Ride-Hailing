const nodemailer = require('nodemailer');
require('dotenv').config();

// Debug logs to verify environment variables are loaded
// Avoid printing the full password; only indicate presence
console.log('[Mail] SMTP_USER:', process.env.SMTP_USER);
console.log('[Mail] SMTP_PASS set:', Boolean(process.env.SMTP_PASS));
console.log('[Mail] SMTP_SERVICE:', process.env.SMTP_SERVICE);
console.log('[Mail] SMTP_HOST:', process.env.SMTP_HOST);
console.log('[Mail] SMTP_PORT:', process.env.SMTP_PORT);
console.log('[Mail] SMTP_SECURE:', process.env.SMTP_SECURE);

const auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
};

let transportConfig = {};

if (process.env.SMTP_SERVICE) {
    // e.g., SMTP_SERVICE=Gmail
    transportConfig = {
        service: process.env.SMTP_SERVICE,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth,
    };
    console.log('[Mail] Using service-based transport:', transportConfig.service);
} else {
    // e.g., Brevo/SendGrid/etc.
    transportConfig = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth,
    };
    console.log('[Mail] Using host-based transport:', transportConfig.host);
}

const transporter = nodemailer.createTransport(transportConfig);

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('[Mail] Transport verify failed:', error && (error.response || error.message || error));
    } else {
        console.log('[Mail] Transport is ready to send messages:', success);
    }
});

module.exports = transporter;
