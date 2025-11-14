// netlify/functions/send-sms.js
// This function handles sending SMS verification codes

const twilio = require('twilio');

// In-memory storage for verification codes (use Redis in production)
const verificationCodes = new Map();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (now > value.expiry) {
      verificationCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { phoneNumber } = JSON.parse(event.body);

    if (!phoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Phone number is required' })
      };
    }

    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Phone number must include country code (e.g., +1234567890)' 
        })
      };
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Twilio not configured. Please set environment variables.' 
        })
      };
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code with expiry
    verificationCodes.set(phoneNumber, { code, expiry });

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send SMS
    const message = await client.messages.create({
      body: `Your ChangeSentinel verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`,
      from: twilioPhone,
      to: phoneNumber
    });

    console.log('✅ SMS sent successfully:', message.sid);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        messageSid: message.sid,
        expiresIn: '10 minutes'
      })
    };

  } catch (error) {
    console.error('❌ SMS Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send SMS',
        details: error.message
      })
    };
  }
};