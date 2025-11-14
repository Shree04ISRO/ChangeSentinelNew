const twilio = require('twilio');

// Store verification codes temporarily (in production, use a database)
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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { phoneNumber } = JSON.parse(event.body);

    if (!phoneNumber) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Phone number is required' })
      };
    }

    // Validate Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'SMS service not configured',
          details: 'Missing Twilio environment variables'
        })
      };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 5-minute expiration
    verificationCodes.set(phoneNumber, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send SMS
    const message = await client.messages.create({
      body: `Your ChangeSentinel verification code is: ${code}. Valid for 5 minutes.`,
      from: fromNumber,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', message.sid);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        messageSid: message.sid,
        message: 'SMS sent successfully'
      })
    };

  } catch (error) {
    console.error('SMS Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to send SMS',
        details: error.message
      })
    };
  }
};