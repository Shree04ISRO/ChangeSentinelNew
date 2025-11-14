// netlify/functions/verify-code.js
// This function handles verifying SMS codes

// Note: This shares the same Map with send-sms.js in the same Netlify function instance
// For production, use Redis or a database
const verificationCodes = new Map();

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
    const { phoneNumber, code } = JSON.parse(event.body);

    if (!phoneNumber || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Phone number and code are required' 
        })
      };
    }

    // Check if code exists
    const stored = verificationCodes.get(phoneNumber);

    if (!stored) {
      console.log('❌ No code found for:', phoneNumber);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'No verification code found. Please request a new code.' 
        })
      };
    }

    // Check if code expired
    if (Date.now() > stored.expiry) {
      verificationCodes.delete(phoneNumber);
      console.log('⏰ Code expired for:', phoneNumber);
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Code expired. Please request a new code.' 
        })
      };
    }

    // Verify code
    if (stored.code !== code) {
      console.log('❌ Invalid code for:', phoneNumber);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid code. Please try again.' 
        })
      };
    }

    // Success - delete used code
    verificationCodes.delete(phoneNumber);
    console.log('✅ Code verified successfully for:', phoneNumber);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Verification successful'
      })
    };

  } catch (error) {
    console.error('❌ Verification Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Verification failed',
        details: error.message
      })
    };
  }
};