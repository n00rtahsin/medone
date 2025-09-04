// MEDONE Login System

class LoginSystem {
    constructor() {
        this.credentials = {
            username: 'admin',
            password: 'medone2025'
        };
        
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startLiveStats();
        this.checkExistingSession();
    }
    
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        // Form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Enter key handling
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        });
        
        // Input focus effects
        document.querySelectorAll('.input-container input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentNode.classList.remove('focused');
            });
        });
        
        // Auto-fill demo credentials
        this.setupDemoCredentials();
    }
    
    setupDemoCredentials() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        // Pre-fill demo credentials after a short delay
        setTimeout(() => {
            usernameInput.value = this.credentials.username;
            passwordInput.value = this.credentials.password;
            
            // Add subtle animation to indicate pre-filled
            usernameInput.style.animation = 'inputGlow 0.5s ease-out';
            passwordInput.style.animation = 'inputGlow 0.5s ease-out';
            
            setTimeout(() => {
                usernameInput.style.animation = '';
                passwordInput.style.animation = '';
            }, 500);
        }, 2000);
    }
    
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }
        
        // Show loading overlay
        this.showLoadingOverlay();
        
        // Simulate authentication delay
        setTimeout(() => {
            if (this.authenticateUser(username, password)) {
                this.loginSuccess(rememberMe);
            } else {
                this.loginFailed();
            }
        }, 2000);
    }
    
    authenticateUser(username, password) {
        return username === this.credentials.username && password === this.credentials.password;
    }
    
    loginSuccess(rememberMe) {
        // Clear any existing authentication data to prevent conflicts
        sessionStorage.clear();
        localStorage.removeItem('medone_session');
        localStorage.removeItem('medone_authenticated');
        localStorage.removeItem('medone_login_time');
        
        // Create session
        const sessionData = {
            username: this.credentials.username,
            loginTime: Date.now(),
            rememberMe: rememberMe,
            sessionId: this.generateSessionId(),
            userRole: 'Administrator'
        };
        
        // Always store in sessionStorage for immediate access
        sessionStorage.setItem('medone_session', JSON.stringify(sessionData));
        sessionStorage.setItem('medone_authenticated', 'true');
        sessionStorage.setItem('medone_login_time', sessionData.loginTime.toString());
        
        // Also store in localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('medone_session', JSON.stringify(sessionData));
            localStorage.setItem('medone_authenticated', 'true');
            localStorage.setItem('medone_login_time', sessionData.loginTime.toString());
        }
        
        // Update loading text
        document.querySelector('.loading-text').textContent = 'Login Successful!';
        document.querySelector('.loading-subtext').textContent = 'Redirecting to dashboard...';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
    
    loginFailed() {
        this.hideLoadingOverlay();
        this.showError('Invalid username or password. Please try again.');
        
        // Shake animation for form
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
        
        // Clear password field
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
    
    showLoadingOverlay() {
        const overlay = document.getElementById('loginOverlay');
        overlay.classList.remove('hidden');
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loginOverlay');
        overlay.classList.add('hidden');
    }
    
    showError(message) {
        // Remove existing error if present
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        // Insert after form
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(errorDiv, form.nextSibling);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    generateSessionId() {
        return 'medone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }
    
    checkExistingSession() {
        const sessionData = this.getStoredSession();
        
        if (sessionData) {
            const currentTime = Date.now();
            const sessionAge = currentTime - sessionData.loginTime;
            
            if (sessionAge < this.sessionTimeout) {
                // Valid session exists, redirect to dashboard
                window.location.href = 'dashboard.html';
                return;
            } else {
                // Session expired, clear it
                this.clearSession();
            }
        }
    }
    
    getStoredSession() {
        const localSession = localStorage.getItem('medone_session');
        const sessionSession = sessionStorage.getItem('medone_session');
        
        if (localSession) {
            return JSON.parse(localSession);
        } else if (sessionSession) {
            return JSON.parse(sessionSession);
        }
        
        return null;
    }
    
    clearSession() {
        localStorage.removeItem('medone_session');
        sessionStorage.removeItem('medone_session');
    }
    
    startLiveStats() {
        // Animate live statistics
        this.updateLiveStats();
        
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateLiveStats();
        }, 30000);
    }
    
    updateLiveStats() {
        const activeDrones = document.getElementById('activeDrones');
        const connectedHospitals = document.getElementById('connectedHospitals');
        const livesImpacted = document.getElementById('livesImpacted');
        
        if (activeDrones) {
            this.animateCounter(activeDrones, 8, Math.floor(Math.random() * 4) + 6);
        }
        
        if (connectedHospitals) {
            this.animateCounter(connectedHospitals, 12, Math.floor(Math.random() * 3) + 11);
        }
        
        if (livesImpacted) {
            const currentValue = parseInt(livesImpacted.textContent.replace(/,/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 10) + 1;
            this.animateCounter(livesImpacted, currentValue, newValue, true);
        }
    }
    
    animateCounter(element, startValue, endValue, useCommas = false) {
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
            
            if (useCommas) {
                element.textContent = currentValue.toLocaleString();
            } else {
                element.textContent = currentValue;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Copy credential functionality
function copyCredential(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const event = new CustomEvent('credentialCopied', { detail: text });
        document.dispatchEvent(event);
        
        // Visual feedback
        showCopyFeedback();
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function showCopyFeedback() {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    // Position and show
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 300);
    }, 2000);
}

// Add CSS for additional animations and effects
const additionalStyles = `
    @keyframes inputGlow {
        0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        color: #F44336;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        animation: slideDown 0.3s ease-out;
    }
    
    .copy-feedback {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .copy-feedback.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .input-container.focused .input-icon {
        color: #667eea;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});

// Export for global access
window.togglePassword = togglePassword;
window.copyCredential = copyCredential;
