/* Global Disclaimer JavaScript */
class DisclaimerBanner {
    constructor() {
        this.isVisible = true;
        this.init();
    }

    init() {
        // Create disclaimer banner
        this.createBanner();
        
        // Check if user has previously dismissed
        const dismissed = localStorage.getItem('medone-disclaimer-dismissed');
        if (dismissed === 'true') {
            this.hideBanner(false);
        }
        
        // Auto-show after 30 seconds if dismissed
        if (dismissed === 'true') {
            setTimeout(() => {
                this.showBanner();
                localStorage.removeItem('medone-disclaimer-dismissed');
            }, 30000);
        }
    }

    createBanner() {
        // Create banner element
        const banner = document.createElement('div');
        banner.className = 'disclaimer-banner';
        banner.id = 'medone-disclaimer';
        
        banner.innerHTML = `
            <div class="disclaimer-text">
                <i class="fas fa-info-circle disclaimer-icon"></i>
                <span>All data here is for demonstration purposes only</span>
            </div>
            <button class="disclaimer-close" onclick="disclaimerManager.closeBanner()" aria-label="Close disclaimer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Insert at the beginning of body
        document.body.insertBefore(banner, document.body.firstChild);
    }

    closeBanner() {
        this.hideBanner(true);
        localStorage.setItem('medone-disclaimer-dismissed', 'true');
        
        // Show a subtle notification that it will reappear
        this.showTemporaryNotification();
    }

    hideBanner(animate = true) {
        const banner = document.getElementById('medone-disclaimer');
        if (banner) {
            if (animate) {
                banner.classList.add('hidden');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 300);
            } else {
                banner.style.display = 'none';
            }
            document.body.classList.add('disclaimer-hidden');
            this.isVisible = false;
        }
    }

    showBanner() {
        const banner = document.getElementById('medone-disclaimer');
        if (banner) {
            banner.style.display = 'block';
            banner.classList.remove('hidden');
            document.body.classList.remove('disclaimer-hidden');
            this.isVisible = true;
        }
    }

    showTemporaryNotification() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        notification.innerHTML = `
            <i class="fas fa-clock"></i>
            Disclaimer will reappear in 30 seconds
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Method to toggle visibility (for testing)
    toggle() {
        if (this.isVisible) {
            this.hideBanner(true);
        } else {
            this.showBanner();
        }
    }
}

// Initialize disclaimer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.disclaimerManager = new DisclaimerBanner();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisclaimerBanner;
}
