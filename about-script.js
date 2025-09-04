// About Page Script
class AboutSystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    init() {
        this.setupAnimations();
        this.setupParticles();
        console.log('MEDONE About page initialized');
    }

    checkAuthentication() {
        // Check sessionStorage first (priority), then localStorage
        let isAuthenticated = false;
        
        const sessionAuth = sessionStorage.getItem('medone_authenticated');
        const localAuth = localStorage.getItem('medone_authenticated');
        
        if (sessionAuth === 'true') {
            isAuthenticated = true;
        } else if (localAuth === 'true') {
            isAuthenticated = true;
            // Copy to sessionStorage for consistency
            const localSession = localStorage.getItem('medone_session');
            const localTime = localStorage.getItem('medone_login_time');
            if (localSession) {
                sessionStorage.setItem('medone_session', localSession);
                sessionStorage.setItem('medone_authenticated', 'true');
                sessionStorage.setItem('medone_login_time', localTime);
            }
        }
        
        if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
    }

    setupAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll('.mission-card, .feature-item, .impact-story, .compliance-card, .team-member');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    setupParticles() {
        // Create floating particles in the background
        const particleContainer = document.querySelector('.floating-particles');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(102, 126, 234, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-particle ${Math.random() * 10 + 10}s infinite linear;
            `;
            particleContainer.appendChild(particle);
        }

        // Add particle animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float-particle {
                0% { transform: translateY(100vh) scale(0); }
                10% { transform: translateY(90vh) scale(1); }
                90% { transform: translateY(-10vh) scale(1); }
                100% { transform: translateY(-100px) scale(0); }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmission(e));
        }

        // User menu toggle
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', () => this.toggleUserMenu());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const userProfile = document.querySelector('.user-profile');
            
            if (dropdown && !userProfile.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Emergency button
        const emergencyBtn = document.querySelector('.emergency-btn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => this.triggerEmergency());
        }

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Stats counter animation
        this.animateCounters();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = element.textContent;
        const isNumber = /^\d+/.test(target);
        
        if (!isNumber) return;

        const number = parseInt(target.replace(/[^\d]/g, ''));
        const suffix = target.replace(/[\d,]/g, '');
        const duration = 2000;
        const stepTime = 50;
        const steps = duration / stepTime;
        const increment = number / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            
            const formattedNumber = Math.floor(current).toLocaleString();
            element.textContent = formattedNumber + suffix;
        }, stepTime);
    }

    handleContactSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = e.target.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            this.showSuccessMessage('Thank you for your message! We will respond within 24 hours.');
            e.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);

        // Log form data (in real implementation, send to server)
        console.log('Contact form submission:', data);
    }

    showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            max-width: 400px;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.25rem;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    triggerEmergency() {
        // Show emergency confirmation
        const confirmation = confirm('Are you sure you want to trigger emergency mode? This will alert all operators and prioritize emergency protocols.');
        
        if (confirmation) {
            this.activateEmergencyMode();
        }
    }

    activateEmergencyMode() {
        // Create emergency overlay
        const emergencyOverlay = document.createElement('div');
        emergencyOverlay.innerHTML = `
            <div class="emergency-content">
                <div class="emergency-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Emergency Mode Activated</h2>
                <p>All operators have been notified. Emergency protocols are now in effect.</p>
                <div class="emergency-actions">
                    <button class="btn-emergency-ops" onclick="window.location.href='operations.html'">
                        <i class="fas fa-satellite"></i> Operations Center
                    </button>
                    <button class="btn-emergency-contact" onclick="window.open('tel:16263')">
                        <i class="fas fa-phone"></i> Call Emergency: 16263
                    </button>
                </div>
                <button class="btn-close-emergency" onclick="this.parentElement.parentElement.remove()">
                    Close
                </button>
            </div>
        `;
        
        emergencyOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(239, 68, 68, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        const style = document.createElement('style');
        style.textContent = `
            .emergency-content {
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                color: #1f2937;
            }
            .emergency-icon {
                font-size: 4rem;
                color: #ef4444;
                margin-bottom: 1rem;
                animation: pulse 1s infinite;
            }
            .emergency-content h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #ef4444;
            }
            .emergency-content p {
                margin-bottom: 2rem;
                color: #6b7280;
            }
            .emergency-actions {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn-emergency-ops, .btn-emergency-contact {
                background: #ef4444;
                color: white;
                border: none;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }
            .btn-emergency-ops:hover, .btn-emergency-contact:hover {
                background: #dc2626;
                transform: translateY(-2px);
            }
            .btn-close-emergency {
                background: #6b7280;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 12px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(emergencyOverlay);

        // Log emergency activation
        console.log('Emergency mode activated at:', new Date().toISOString());
    }

    logout() {
        // Clear all session data
        sessionStorage.clear();
        localStorage.removeItem('medone_session');
        localStorage.removeItem('medone_authenticated');
        localStorage.removeItem('medone_login_time');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Global functions for onclick events
function toggleUserMenu() {
    if (window.aboutSystem) {
        window.aboutSystem.toggleUserMenu();
    }
}

function triggerEmergency() {
    if (window.aboutSystem) {
        window.aboutSystem.triggerEmergency();
    }
}

function logout() {
    if (window.aboutSystem) {
        window.aboutSystem.logout();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aboutSystem = new AboutSystem();
});
