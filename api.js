// api.js - Frontend API Helper for ChangeSentinel
// Include this in your HTML files: <script src="api.js"></script>

const API_BASE_URL = 'http://localhost:3000/api';

class ChangeSentinelAPI {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // ==================== SMS API ====================
    
    async sendSMS(phoneNumber) {
        try {
            const response = await fetch(`${this.baseURL}/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send SMS');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('SMS API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== VERIFY CODE API ====================
    
    async verifyCode(identifier, code) {
        try {
            const response = await fetch(`${this.baseURL}/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier, code })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('Verify API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== EMAIL APIs ====================
    
    async sendSuggestionReply(email, name, suggestion, reply) {
        try {
            const response = await fetch(`${this.baseURL}/email/suggestion-reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name, suggestion, reply })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('Email API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendReportDownload(email, name, reportName, reportType) {
        try {
            const response = await fetch(`${this.baseURL}/email/report-download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name, reportName, reportType })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('Email API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendAlert(email, name, alertTitle, alertDescription, alertLevel, aoiName) {
        try {
            const response = await fetch(`${this.baseURL}/email/alert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    name,
                    alertTitle,
                    alertDescription,
                    alertLevel,
                    aoiName
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('Email API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendWeeklySummary(email, name, stats) {
        try {
            const response = await fetch(`${this.baseURL}/email/weekly-summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name, stats })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('Email API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== HEALTH CHECK ====================
    
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health Check Error:', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}

// Create global instance
const api = new ChangeSentinelAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChangeSentinelAPI;
}

// ==================== USAGE EXAMPLES ====================

/*

// Example 1: Send SMS
const result = await api.sendSMS('+1234567890');
if (result.success) {
    console.log('SMS sent!');
} else {
    console.error(result.error);
}

// Example 2: Verify Code
const verified = await api.verifyCode('+1234567890', '123456');
if (verified.success) {
    console.log('Code verified!');
}

// Example 3: Send Suggestion Reply
await api.sendSuggestionReply(
    'user@email.com',
    'John Doe',
    'Add dark mode',
    'Great idea! Coming soon.'
);

// Example 4: Send Report Download Email
await api.sendReportDownload(
    'user@email.com',
    'John Doe',
    'Monthly Report',
    'Environmental Analysis'
);

// Example 5: Send Alert
await api.sendAlert(
    'user@email.com',
    'John Doe',
    'Deforestation Detected',
    'Tree cover loss in Zone A',
    'high',
    'Amazon Rainforest'
);

// Example 6: Send Weekly Summary
await api.sendWeeklySummary(
    'user@email.com',
    'John Doe',
    {
        totalAreas: 5,
        detections: 12,
        alerts: 3,
        reports: 8
    }
);

// Example 7: Check Backend Health
const health = await api.healthCheck();
console.log(health);

*/