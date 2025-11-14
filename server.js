// server.js - Complete Backend for ChangeSentinel
// This handles both SMS (Twilio) and Email (SendGrid)

const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your HTML files

// ==================== CONFIGURATION ====================
// SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Store verification codes temporarily (use Redis in production)
const verificationCodes = new Map();

// Clean up expired codes every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of verificationCodes.entries()) {
        if (now > value.expiry) {
            verificationCodes.delete(key);
        }
    }
}, 60000);

// ==================== HELPER FUNCTIONS ====================
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function logRequest(endpoint, data) {
    console.log(`\n📍 ${endpoint}`);
    console.log('📅 Time:', new Date().toISOString());
    console.log('📦 Data:', JSON.stringify(data, null, 2));
}

// ==================== SMS ENDPOINTS ====================

// Send SMS verification code
app.post('/api/send-sms', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        logRequest('POST /api/send-sms', { phoneNumber });

        if (!phoneNumber) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        const code = generateCode();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store code
        verificationCodes.set(phoneNumber, { code, expiry, type: 'sms' });

        // Send SMS
        const message = await twilioClient.messages.create({
            body: `Your ChangeSentinel verification code is: ${code}. This code expires in 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log('✅ SMS sent successfully!');
        console.log('📱 Message SID:', message.sid);
        console.log('🔐 Code:', code);

        res.json({
            success: true,
            message: 'SMS sent successfully',
            messageSid: message.sid,
            expiresIn: '10 minutes'
        });

    } catch (error) {
        console.error('❌ SMS Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send SMS',
            details: error.message
        });
    }
});

// Verify SMS/Email code
app.post('/api/verify-code', async (req, res) => {
    try {
        const { identifier, code } = req.body;
        logRequest('POST /api/verify-code', { identifier, code: '******' });

        if (!identifier || !code) {
            return res.status(400).json({ 
                success: false,
                error: 'Identifier and code are required' 
            });
        }

        const stored = verificationCodes.get(identifier);

        if (!stored) {
            console.log('❌ No code found for:', identifier);
            return res.status(404).json({ 
                success: false,
                error: 'No verification code found' 
            });
        }

        if (Date.now() > stored.expiry) {
            verificationCodes.delete(identifier);
            console.log('⏰ Code expired for:', identifier);
            return res.status(410).json({ 
                success: false,
                error: 'Code expired' 
            });
        }

        if (stored.code !== code) {
            console.log('❌ Invalid code for:', identifier);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid code' 
            });
        }

        // Success
        verificationCodes.delete(identifier);
        console.log('✅ Code verified successfully!');

        res.json({
            success: true,
            message: 'Verification successful'
        });

    } catch (error) {
        console.error('❌ Verify Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Verification failed',
            details: error.message
        });
    }
});

// ==================== EMAIL ENDPOINTS ====================

// Send suggestion reply email
app.post('/api/email/suggestion-reply', async (req, res) => {
    try {
        const { email, name, suggestion, reply } = req.body;
        logRequest('POST /api/email/suggestion-reply', { email, name });

        if (!email || !name || !suggestion || !reply) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' 
            });
        }

        const msg = {
            to: email,
            from: {
                email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME || 'ChangeSentinel'
            },
            subject: '💬 Reply to Your Suggestion - ChangeSentinel',
            html: generateSuggestionReplyEmail(name, suggestion, reply)
        };

        await sgMail.send(msg);
        console.log('✅ Suggestion reply email sent!');

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// Send report download confirmation
app.post('/api/email/report-download', async (req, res) => {
    try {
        const { email, name, reportName, reportType } = req.body;
        logRequest('POST /api/email/report-download', { email, name, reportName });

        if (!email || !name || !reportName || !reportType) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' 
            });
        }

        const msg = {
            to: email,
            from: {
                email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME || 'ChangeSentinel'
            },
            subject: `📄 ${reportName} - Download Confirmation`,
            html: generateReportDownloadEmail(name, reportName, reportType)
        };

        await sgMail.send(msg);
        console.log('✅ Report download email sent!');

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// Send alert notification
app.post('/api/email/alert', async (req, res) => {
    try {
        const { email, name, alertTitle, alertDescription, alertLevel, aoiName } = req.body;
        logRequest('POST /api/email/alert', { email, name, alertTitle });

        if (!email || !name || !alertTitle || !alertDescription || !alertLevel || !aoiName) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required' 
            });
        }

        const alertIcons = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🔵'
        };

        const msg = {
            to: email,
            from: {
                email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME || 'ChangeSentinel'
            },
            subject: `${alertIcons[alertLevel]} Alert: ${alertTitle} - ChangeSentinel`,
            html: generateAlertEmail(name, alertTitle, alertDescription, alertLevel, aoiName)
        };

        await sgMail.send(msg);
        console.log('✅ Alert email sent!');

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// Send weekly summary
app.post('/api/email/weekly-summary', async (req, res) => {
    try {
        const { email, name, stats } = req.body;
        logRequest('POST /api/email/weekly-summary', { email, name });

        if (!email || !name || !stats) {
            return res.status(400).json({ 
                success: false,
                error: 'Email, name, and stats are required' 
            });
        }

        const msg = {
            to: email,
            from: {
                email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME || 'ChangeSentinel'
            },
            subject: '📊 Your Weekly Summary - ChangeSentinel',
            html: generateWeeklySummaryEmail(name, stats)
        };

        await sgMail.send(msg);
        console.log('✅ Weekly summary email sent!');

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// ==================== EMAIL TEMPLATES ====================

function generateSuggestionReplyEmail(name, suggestion, reply) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                .suggestion-box { background: #e0e7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .reply-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
                .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛰️ ChangeSentinel</h1>
                    <p style="margin: 10px 0 0 0;">Reply to Your Suggestion</p>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Thank you for your valuable suggestion. Our team has reviewed it:</p>
                    <div class="suggestion-box">
                        <h3 style="margin-top: 0; color: #667eea;">📝 Your Suggestion:</h3>
                        <p style="margin-bottom: 0;">${suggestion}</p>
                    </div>
                    <div class="reply-box">
                        <h3 style="margin-top: 0; color: #10b981;">💬 Our Response:</h3>
                        <p style="margin-bottom: 0;">${reply}</p>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>© 2025 ChangeSentinel</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateReportDownloadEmail(name, reportName, reportType) {
    const date = new Date().toLocaleDateString();
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                .report-card { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛰️ ChangeSentinel</h1>
                    <p style="margin: 10px 0 0 0;">Report Download Confirmation</p>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Your report has been successfully downloaded:</p>
                    <div class="report-card">
                        <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
                        <h3 style="color: #667eea;">${reportName}</h3>
                        <p><strong>Type:</strong> ${reportType}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Format:</strong> PDF</p>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>© 2025 ChangeSentinel</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateAlertEmail(name, title, description, level, aoiName) {
    const colors = {
        'high': { bg: '#fee2e2', border: '#ef4444', icon: '🔴' },
        'medium': { bg: '#fef3c7', border: '#f59e0b', icon: '🟡' },
        'low': { bg: '#dbeafe', border: '#3b82f6', icon: '🔵' }
    };
    const color = colors[level] || colors['low'];

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                .alert-box { background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛰️ ChangeSentinel</h1>
                    <p style="margin: 10px 0 0 0;">Alert Notification</p>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>An alert has been triggered:</p>
                    <div class="alert-box">
                        <h3 style="margin: 0 0 10px 0; color: ${color.border};">${color.icon} ${title}</h3>
                        <p><strong>Area:</strong> ${aoiName}</p>
                        <p><strong>Priority:</strong> ${level.toUpperCase()}</p>
                        <p><strong>Description:</strong> ${description}</p>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>© 2025 ChangeSentinel</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateWeeklySummaryEmail(name, stats) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 2px solid #e5e7eb; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .stat-card { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; text-align: center; }
                .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛰️ ChangeSentinel</h1>
                    <p style="margin: 10px 0 0 0;">Your Weekly Summary</p>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Here's your activity summary this week:</p>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${stats.totalAreas || 0}</div>
                            <div>Monitored Areas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.detections || 0}</div>
                            <div>Detections</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.alerts || 0}</div>
                            <div>Alerts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.reports || 0}</div>
                            <div>Reports</div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>© 2025 ChangeSentinel</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ChangeSentinel Backend API',
        timestamp: new Date().toISOString(),
        activeVerifications: verificationCodes.size,
        endpoints: {
            sms: '/api/send-sms',
            verify: '/api/verify-code',
            emails: [
                '/api/email/suggestion-reply',
                '/api/email/report-download',
                '/api/email/alert',
                '/api/email/weekly-summary'
            ]
        }
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log('\n🚀 ================================');
    console.log('🛰️  ChangeSentinel Backend API');
    console.log('🚀 ================================');
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log('\n📋 Available Endpoints:');
    console.log('  📱 POST /api/send-sms');
    console.log('  ✅ POST /api/verify-code');
    console.log('  📧 POST /api/email/suggestion-reply');
    console.log('  📄 POST /api/email/report-download');
    console.log('  🚨 POST /api/email/alert');
    console.log('  📊 POST /api/email/weekly-summary');
    console.log('\n⏰ Code cleanup running every 60 seconds');
    console.log('================================\n');
});