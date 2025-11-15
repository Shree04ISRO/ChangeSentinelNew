// Shared verification codes storage
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
    const { email, code } = JSON.parse(event.body);

    console.log('Verifying code for:', email);

    // Validate inputs
    if (!email || !code) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Email and code are required' 
        })
      };
    }

    // Get stored verification data
    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'No verification code found. Please request a new code.'
        })
      };
    }

    // Check if code expired
    const now = Date.now();
    if (now - storedData.timestamp > storedData.expiresIn) {
      verificationCodes.delete(email);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Verification code expired. Please request a new code.'
        })
      };
    }

    // Verify the code
    if (storedData.code === code) {
      verificationCodes.delete(email);
      
      console.log('Verification successful for:', email);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: true,
          message: 'Verification successful'
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid verification code'
        })
      };
    }

  } catch (error) {
    console.error('Error verifying code:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Verification failed',
        details: error.message
      })
    };
  }
};
