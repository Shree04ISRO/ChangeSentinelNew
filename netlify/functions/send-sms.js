const sgMail = require('@sendgrid/mail');

// In-memory storage for verification codes
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
    const { email } = JSON.parse(event.body);

    console.log('Sending verification to:', email);

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid email address' 
        })
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (expires in 10 minutes)
    verificationCodes.set(email, {
      code: otp,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000
    });

    // Clean up old codes
    const now = Date.now();
    for (const [userEmail, data] of verificationCodes.entries()) {
      if (now - data.timestamp > data.expiresIn) {
        verificationCodes.delete(userEmail);
      }
    }

    // Get SendGrid credentials
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      throw new Error('SendGrid not configured');
    }

    // Set SendGrid API key
    sgMail.setApiKey(apiKey);

    // Email content
    const msg = {
      to: email,
      from: fromEmail,
      subject: 'Your ChangeSentinel Verification Code',
      text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">ChangeSentinel Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6B7280;">This code will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">ChangeSentinel - Change Detection Made Easy</p>
        </div>
      `
    };

    // Send email
    await sgMail.send(msg);

    console.log('Verification email sent successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Verification code sent to your email'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to send verification email',
        details: error.message
      })
    };
  }
};
