<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS 2FA - ChangeSentinel</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        h1 {
            color: white;
            font-size: 28px;
            margin-bottom: 10px;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
        }

        .alert {
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: start;
            gap: 12px;
            font-size: 14px;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #6ee7b7;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }

        .alert-info {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #93c5fd;
        }

        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            color: white;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }

        input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        input:focus {
            outline: none;
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: none;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .method-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 12px;
        }

        .method-card:hover {
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.05);
        }

        .method-card.selected {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.2);
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }

        .method-icon {
            font-size: 32px;
            flex-shrink: 0;
        }

        .method-info {
            flex: 1;
            min-width: 0;
        }

        .method-title {
            color: white;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .method-desc {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .code-inputs {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 24px;
        }

        .code-input {
            width: 50px;
            height: 60px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            padding: 0;
        }

        .info-box {
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid rgba(59, 130, 246, 0.3);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
        }

        .info-box p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            line-height: 1.6;
        }

        .link-button {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px;
            transition: color 0.3s ease;
            cursor: pointer;
            background: none;
            border: none;
            width: 100%;
        }

        .link-button:hover {
            color: white;
        }

        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }

        .footer p {
            color: rgba(255, 255, 255, 0.4);
            font-size: 12px;
        }

        .hidden {
            display: none;
        }

        .flex-buttons {
            display: flex;
            gap: 12px;
        }

        .flex-buttons .btn {
            flex: 1;
        }

        @media (max-width: 640px) {
            .container {
                padding: 24px;
            }

            .code-inputs {
                gap: 8px;
            }

            .code-input {
                width: 40px;
                height: 50px;
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function SMS2FAApp() {
            const [step, setStep] = useState('login');
            const [verificationType, setVerificationType] = useState('email');
            const [code, setCode] = useState(['', '', '', '', '', '']);
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [phoneNumber, setPhoneNumber] = useState('');
            const [loading, setLoading] = useState(false);
            const [message, setMessage] = useState({ type: '', text: '' });
            const [resendTimer, setResendTimer] = useState(0);
            const [user2FASettings, setUser2FASettings] = useState({
                enabled: false,
                emailVerified: false,
                phoneVerified: false,
                preferredMethod: 'email'
            });

            const [twilioConfig, setTwilioConfig] = useState({
                accountSid: '',
                authToken: '',
                phoneNumber: '',
                configured: false
            });

            useEffect(() => {
                const saved = localStorage.getItem('twilioConfig');
                if (saved) {
                    setTwilioConfig(JSON.parse(saved));
                }
            }, []);

            useEffect(() => {
                if (resendTimer > 0) {
                    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
                    return () => clearTimeout(timer);
                }
            }, [resendTimer]);

            const sendVerificationCodeAPI = async (method, destination) => {
                setLoading(true);
                setMessage({ type: '', text: '' });

                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                
                try {
                    if (method === 'sms') {
                        if (!twilioConfig.configured) {
                            throw new Error('Twilio not configured. Please set up Twilio credentials.');
                        }

                        const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + twilioConfig.accountSid + '/Messages.json', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Basic ' + btoa(twilioConfig.accountSid + ':' + twilioConfig.authToken),
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                To: destination,
                                From: twilioConfig.phoneNumber,
                                Body: `Your ChangeSentinel verification code is: ${verificationCode}. This code expires in 10 minutes.`
                            })
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Failed to send SMS');
                        }

                        setMessage({ 
                            type: 'success', 
                            text: `📱 Verification code sent to ${destination}` 
                        });
                    } else {
                        console.log(`📧 Email sent to ${destination} with code: ${verificationCode}`);
                        setMessage({ 
                            type: 'success', 
                            text: `📧 Verification code sent to ${destination} (Check console for demo code)` 
                        });
                    }

                    sessionStorage.setItem('verificationCode', verificationCode);
                    sessionStorage.setItem('codeExpiry', Date.now() + 10 * 60 * 1000);
                    
                    setResendTimer(60);
                    setLoading(false);
                    return true;

                } catch (error) {
                    console.error('Error sending verification:', error);
                    setMessage({ 
                        type: 'error', 
                        text: `❌ Failed to send code: ${error.message}` 
                    });
                    setLoading(false);
                    return false;
                }
            };

            const handleLogin = async () => {
                if (!email || !password) {
                    setMessage({ type: 'error', text: '❌ Please enter both email and password' });
                    return;
                }

                setLoading(true);
                setMessage({ type: '', text: '' });

                await new Promise(resolve => setTimeout(resolve, 1000));

                const user2FA = JSON.parse(localStorage.getItem(`2fa_${email}`)) || {
                    enabled: false,
                    emailVerified: false,
                    phoneVerified: false,
                    preferredMethod: 'email',
                    phone: ''
                };

                setUser2FASettings(user2FA);

                if (user2FA.enabled) {
                    const destination = user2FA.preferredMethod === 'email' ? email : user2FA.phone;
                    const sent = await sendVerificationCodeAPI(user2FA.preferredMethod, destination);
                    if (sent) {
                        setStep('verify');
                        setVerificationType(user2FA.preferredMethod);
                    }
                } else {
                    setMessage({ 
                        type: 'info', 
                        text: '⚠️ 2FA not enabled. Setting up...' 
                    });
                    setTimeout(() => setStep('setup'), 2000);
                }

                setLoading(false);
            };

            const handleCodeChange = (index, value) => {
                if (value.length > 1) value = value[0];
                if (!/^\d*$/.test(value)) return;

                const newCode = [...code];
                newCode[index] = value;
                setCode(newCode);

                if (value && index < 5) {
                    document.getElementById(`code-${index + 1}`)?.focus();
                }
            };

            const handleKeyDown = (index, e) => {
                if (e.key === 'Backspace' && !code[index] && index > 0) {
                    document.getElementById(`code-${index - 1}`)?.focus();
                }
            };

            const verifyCode = async () => {
                setLoading(true);
                setMessage({ type: '', text: '' });

                const enteredCode = code.join('');
                const storedCode = sessionStorage.getItem('verificationCode');
                const expiry = parseInt(sessionStorage.getItem('codeExpiry'));

                await new Promise(resolve => setTimeout(resolve, 1000));

                if (Date.now() > expiry) {
                    setMessage({ type: 'error', text: '❌ Code expired. Request a new one.' });
                    setCode(['', '', '', '', '', '']);
                    setLoading(false);
                    return;
                }

                if (enteredCode === storedCode) {
                    setMessage({ type: 'success', text: '✅ Verification successful!' });
                    
                    sessionStorage.removeItem('verificationCode');
                    sessionStorage.removeItem('codeExpiry');
                    
                    setTimeout(() => {
                        alert('✅ Login successful! You would be redirected to dashboard.');
                        resetForm();
                    }, 2000);
                } else {
                    setMessage({ type: 'error', text: '❌ Invalid code. Try again.' });
                    setCode(['', '', '', '', '', '']);
                }

                setLoading(false);
            };

            const setup2FA = async () => {
                if (verificationType === 'sms' && !phoneNumber) {
                    setMessage({ type: 'error', text: '❌ Please enter a phone number' });
                    return;
                }

                setLoading(true);
                setMessage({ type: '', text: '' });

                await new Promise(resolve => setTimeout(resolve, 1000));

                const settings = {
                    enabled: true,
                    emailVerified: true,
                    phoneVerified: verificationType === 'sms',
                    preferredMethod: verificationType,
                    phone: phoneNumber,
                    setupDate: new Date().toISOString()
                };

                localStorage.setItem(`2fa_${email}`, JSON.stringify(settings));
                setUser2FASettings(settings);

                const sent = await sendVerificationCodeAPI(
                    verificationType, 
                    verificationType === 'email' ? email : phoneNumber
                );
                
                if (sent) {
                    setMessage({ 
                        type: 'success', 
                        text: '✅ 2FA enabled! Test code sent.' 
                    });
                    setTimeout(() => setStep('verify'), 2000);
                }

                setLoading(false);
            };

            const resendCode = async () => {
                if (resendTimer > 0) return;
                
                const destination = verificationType === 'email' ? email : user2FASettings.phone;
                await sendVerificationCodeAPI(verificationType, destination);
            };

            const resetForm = () => {
                setStep('login');
                setEmail('');
                setPassword('');
                setPhoneNumber('');
                setCode(['', '', '', '', '', '']);
                setMessage({ type: '', text: '' });
            };

            const saveTwilioConfig = () => {
                const { accountSid, authToken, phoneNumber } = twilioConfig;
                
                if (!accountSid || !authToken || !phoneNumber) {
                    setMessage({ type: 'error', text: '❌ Please fill in all Twilio credentials' });
                    return;
                }

                const newConfig = { accountSid, authToken, phoneNumber, configured: true };
                setTwilioConfig(newConfig);
                localStorage.setItem('twilioConfig', JSON.stringify(newConfig));
                setMessage({ type: 'success', text: '✅ Twilio configured successfully!' });
            };

            return (
                <div className="container">
                    <div className="header">
                        <div className="logo">🛡️</div>
                        <h1>
                            {step === 'login' && '🔐 Secure Login'}
                            {step === 'verify' && '🔑 Verification'}
                            {step === 'setup' && '⚙️ Setup 2FA'}
                            {step === 'config' && '📱 Twilio Setup'}
                        </h1>
                        <p className="subtitle">
                            {step === 'login' && 'Sign in to ChangeSentinel'}
                            {step === 'verify' && 'Enter verification code'}
                            {step === 'setup' && 'Enable two-factor authentication'}
                            {step === 'config' && 'Configure SMS provider'}
                        </p>
                    </div>

                    {step === 'login' && (
                        <button 
                            onClick={() => setStep('config')}
                            className="link-button"
                            style={{marginBottom: '20px'}}
                        >
                            📞 Configure Twilio for SMS
                        </button>
                    )}

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            <span>⚠️</span>
                            <span>{message.text}</span>
                        </div>
                    )}

                    {step === 'config' && (
                        <div>
                            <div className="info-box">
                                <p><strong>📱 Get your Twilio credentials:</strong><br/>
                                1. Sign up at twilio.com/try-twilio<br/>
                                2. Copy Account SID & Auth Token from dashboard<br/>
                                3. Get a phone number from Twilio Console</p>
                            </div>

                            <div className="form-group">
                                <label>Account SID</label>
                                <input
                                    type="text"
                                    value={twilioConfig.accountSid}
                                    onChange={(e) => setTwilioConfig({...twilioConfig, accountSid: e.target.value})}
                                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                            </div>

                            <div className="form-group">
                                <label>Auth Token</label>
                                <input
                                    type="password"
                                    value={twilioConfig.authToken}
                                    onChange={(e) => setTwilioConfig({...twilioConfig, authToken: e.target.value})}
                                    placeholder="Your Auth Token"
                                />
                            </div>

                            <div className="form-group">
                                <label>Twilio Phone Number</label>
                                <input
                                    type="tel"
                                    value={twilioConfig.phoneNumber}
                                    onChange={(e) => setTwilioConfig({...twilioConfig, phoneNumber: e.target.value})}
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div className="flex-buttons">
                                <button onClick={saveTwilioConfig} className="btn">
                                    Save Configuration
                                </button>
                                <button onClick={() => setStep('login')} className="btn btn-secondary">
                                    Back
                                </button>
                            </div>

                            {twilioConfig.configured && (
                                <div className="alert alert-success" style={{marginTop: '20px'}}>
                                    <span>✅</span>
                                    <span>Twilio is configured and ready!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'login' && (
                        <div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button onClick={handleLogin} disabled={loading} className="btn">
                                {loading ? 'Signing In...' : 'Sign In Securely'}
                            </button>

                            <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '16px'}}>
                                🔒 Protected by two-factor authentication
                            </p>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div>
                            <div style={{textAlign: 'center', marginBottom: '32px'}}>
                                <div style={{fontSize: '48px', marginBottom: '16px'}}>
                                    {verificationType === 'email' ? '📧' : '📱'}
                                </div>
                                <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '14px'}}>
                                    Enter the 6-digit code sent to your {verificationType}
                                </p>
                            </div>

                            <div className="code-inputs">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="code-input"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={verifyCode}
                                disabled={loading || code.some(d => !d)}
                                className="btn"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            <button
                                onClick={resendCode}
                                disabled={resendTimer > 0}
                                className="link-button"
                                style={{marginTop: '16px'}}
                            >
                                🔄 {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                            </button>
                        </div>
                    )}

                    {step === 'setup' && (
                        <div>
                            <div className="info-box">
                                <p>🛡️ <strong>Enhance your account security</strong><br/>
                                Two-factor authentication adds an extra layer of protection.</p>
                            </div>

                            <label style={{marginBottom: '12px', display: 'block'}}>Choose Verification Method</label>
                            
                            <div 
                                onClick={() => setVerificationType('email')}
                                className={`method-card ${verificationType === 'email' ? 'selected' : ''}`}
                            >
                                <span className="method-icon">📧</span>
                                <div className="method-info">
                                    <div className="method-title">Email Verification</div>
                                    <div className="method-desc">{email}</div>
                                </div>
                                {verificationType === 'email' && <span>✓</span>}
                            </div>

                            <div 
                                onClick={() => setVerificationType('sms')}
                                className={`method-card ${verificationType === 'sms' ? 'selected' : ''}`}
                            >
                                <span className="method-icon">📱</span>
                                <div className="method-info">
                                    <div className="method-title">SMS Verification</div>
                                    <div className="method-desc">
                                        {twilioConfig.configured ? 'Text message via Twilio' : '⚠️ Configure Twilio first'}
                                    </div>
                                </div>
                                {verificationType === 'sms' && <span>✓</span>}
                            </div>

                            {verificationType === 'sms' && (
                                <>
                                    {!twilioConfig.configured && (
                                        <div className="alert alert-error">
                                            <span>⚠️</span>
                                            <div>
                                                <p style={{marginBottom: '8px'}}>Please configure Twilio first.</p>
                                                <button
                                                    onClick={() => setStep('config')}
                                                    className="btn btn-secondary"
                                                    style={{marginTop: '8px'}}
                                                >
                                                    Configure Twilio Now
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                onClick={setup2FA}
                                disabled={loading || (verificationType === 'sms' && !twilioConfig.configured)}
                                className="btn"
                                style={{marginBottom: '12px'}}
                            >
                                {loading ? 'Enabling 2FA...' : 'Enable Two-Factor Auth'}
                            </button>

                            <button
                                onClick={() => setStep('login')}
                                className="btn btn-secondary"
                            >
                                Skip for Now
                            </button>
                        </div>
                    )}

                    <div className="footer">
                        <p>🛡️ ChangeSentinel • SMS powered by Twilio</p>
                    </div>
                </div>
            );
        }

        ReactDOM.render(<SMS2FAApp />, document.getElementById('root'));
    </script>
</body>
</html>