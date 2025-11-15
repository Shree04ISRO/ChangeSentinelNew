const axios = require('axios');

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
    const { phoneNumber, code } = JSON.parse(event.body);

    // Validate inputs
    if (!phoneNumber || !code) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Phone number and code are required' 
        })
      };
    }

    // Get MSG91 credentials
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;

    if (!msg91AuthKey) {
      throw new Error('MSG91_AUTH_KEY not configured');
    }

    // Format mobile number (10 digits without +91)
    const mobileNumber = phoneNumber.replace('+91', '');
    
    console.log('Verifying OTP for mobile:', mobileNumber);
    console.log('OTP entered:', code);

    // Verify OTP via MSG91
    const url = `https://control.msg91.com/api/v5/otp/verify?authkey=${msg91AuthKey}&mobile=91${mobileNumber}&otp=${code}`;
    
    console.log('Verify URL:', url);
    
    const response = await axios.get(url);

    console.log('MSG91 Verify Response:', response.data);

    // MSG91 verify returns success differently  
    if (response.data.type === 'success' || response.data.message === 'OTP verified success') {
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
          error: 'Invalid or expired verification code'
        })
      };
    }

  } catch (error) {
    console.error('Error verifying code:', error.response?.data || error.message);

    // Handle specific MSG91 errors
    if (error.response?.data?.type === 'error') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: error.response.data.message || 'Invalid verification code'
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Verification failed',
        details: error.response?.data?.message || error.message
      })
    };
  }
};
