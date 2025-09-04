// Compliance Page Script
class ComplianceSystem {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        const authData = sessionStorage.getItem('authData') || localStorage.getItem('authData');
        if (!authData) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const auth = JSON.parse(authData);
            if (!auth.isAuthenticated) {
                window.location.href = 'login.html';
            }
        } catch (error) {
            window.location.href = 'login.html';
        }
    }

    setupEventListeners() {
        // User dropdown
        const userProfile = document.querySelector('.user-profile');
        const userDropdown = document.querySelector('.user-dropdown');
        if (userProfile && userDropdown) {
            userProfile.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // Logout functionality
        const logoutBtn = document.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    logout() {
        sessionStorage.removeItem('authData');
        localStorage.removeItem('authData');
        sessionStorage.removeItem('medone_authenticated');
        localStorage.removeItem('medone_authenticated');
        window.location.href = 'login.html';
    }
}

// Global functions for HTML onclick events
function triggerEmergency() {
    alert('Emergency protocol activated! All available drones are being redirected to emergency services.');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logout() {
    if (window.complianceSystem) {
        window.complianceSystem.logout();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.complianceSystem = new ComplianceSystem();
});
