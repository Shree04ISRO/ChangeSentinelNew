const twilio = require('twilio');

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
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
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

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send verification code using Twilio Verify
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });

    console.log('Verification sent:', verification.sid, 'Status:', verification.status);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        verificationSid: verification.sid,
        status: verification.status,
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
