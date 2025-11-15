const axios = require('axios');

// In-memory storage for verification codes (will be replaced by MSG91's OTP service)
const verificationCodes = new Map();

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { phoneNumber } = JSON.parse(event.body);

    // Validate phone number
    if (!phoneNumber || !phoneNumber.startsWith('+91')) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid Indian phone number. Must start with +91' 
        })
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (expires in 10 minutes)
    verificationCodes.set(phoneNumber, {
      code: otp,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000 // 10 minutes
    });

    // Clean up old codes
    const now = Date.now();
    for (const [phone, data] of verificationCodes.entries()) {
      if (now - data.timestamp > data.expiresIn) {
        verificationCodes.delete(phone);
      }
    }

    // Send SMS via MSG91 OTP API (no template/sender ID required)
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;

    if (!msg91AuthKey) {
      throw new Error('MSG91_AUTH_KEY not configured');
    }

    // Remove +91 prefix for MSG91 (they expect 10-digit number with country code)
    const mobileNumber = '91' + phoneNumber.replace('+91', '');
    
    console.log('Sending OTP to mobile:', mobileNumber);
    console.log('Generated OTP:', otp);

    // MSG91 OTP API - Send OTP (let MSG91 generate and send)
    const response = await axios.post(
      `https://control.msg91.com/api/v5/otp`,
      {
        mobile: mobileNumber
      },
      {
        params: {
          authkey: msg91AuthKey
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('MSG91 Full Response:', JSON.stringify(response.data, null, 2));

    // MSG91 OTP API returns success differently
    if (response.data.type === 'success' || response.data.request_id) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully',
          phoneNumber: phoneNumber
        })
      };
    } else {
      throw new Error(response.data.message || 'Failed to send SMS');
    }

  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to send SMS',
        details: error.response?.data?.message || error.message
      })
    };
  }
};
