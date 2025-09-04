// Dashboard Script
class DashboardSystem {
    constructor() {
        this.init();
        this.startLiveUpdates();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    init() {
        this.updateCurrentTime();
        this.initializeCharts();
        this.loadLiveData();
        console.log('MEDONE Dashboard initialized');
    }

    checkAuthentication() {
        // Check sessionStorage first (priority), then localStorage
        let isAuthenticated = false;
        let loginTime = null;
        
        // Check sessionStorage
        const sessionAuth = sessionStorage.getItem('medone_authenticated');
        const sessionTime = sessionStorage.getItem('medone_login_time');
        
        if (sessionAuth === 'true' && sessionTime) {
            isAuthenticated = true;
            loginTime = parseInt(sessionTime);
        } else {
            // Check localStorage as fallback
            const localAuth = localStorage.getItem('medone_authenticated');
            const localTime = localStorage.getItem('medone_login_time');
            
            if (localAuth === 'true' && localTime) {
                isAuthenticated = true;
                loginTime = parseInt(localTime);
                
                // Copy to sessionStorage for consistency
                sessionStorage.setItem('medone_authenticated', 'true');
                sessionStorage.setItem('medone_login_time', localTime);
                const localSession = localStorage.getItem('medone_session');
                if (localSession) {
                    sessionStorage.setItem('medone_session', localSession);
                }
            }
        }
        
        if (!isAuthenticated || !loginTime) {
            console.log('No valid authentication found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        // Check session timeout (8 hours)
        const currentTime = new Date().getTime();
        const sessionDuration = currentTime - loginTime;
        const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        if (sessionDuration > maxDuration) {
            console.log('Session expired, clearing and redirecting');
            sessionStorage.clear();
            localStorage.removeItem('medone_authenticated');
            localStorage.removeItem('medone_login_time');
            localStorage.removeItem('medone_session');
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }
        
        // Update last activity
        sessionStorage.setItem('medone_last_activity', currentTime.toString());
    }

    updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Dhaka',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            const timeString = now.toLocaleTimeString('en-US', options) + ' BST';
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    initializeCharts() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Successful Missions',
                    data: [12, 8, 15, 23, 18, 14],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Response Time (min)',
                    data: [8.5, 9.2, 7.8, 8.1, 9.5, 8.3],
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    loadLiveData() {
        // Simulate real-time data updates
        this.updateStatistics();
        this.updateMissions();
        this.updateHospitals();
        this.updateWeather();
    }

    updateStatistics() {
        const stats = {
            todayDeliveries: this.generateRealisticValue(47, 5),
            avgResponseTime: this.generateTimeValue(8, 32),
            fleetBattery: this.generateRealisticValue(87, 10),
            successRate: this.generateSuccessRate()
        };

        document.getElementById('todayDeliveries').textContent = stats.todayDeliveries;
        document.getElementById('avgResponseTime').textContent = stats.avgResponseTime;
        document.getElementById('fleetBattery').textContent = stats.fleetBattery + '%';
        document.getElementById('successRate').textContent = stats.successRate + '%';
    }

    generateRealisticValue(base, variance) {
        return Math.floor(base + (Math.random() - 0.5) * variance);
    }

    generateTimeValue(minutes, seconds) {
        const totalSeconds = minutes * 60 + seconds + Math.floor((Math.random() - 0.5) * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    generateSuccessRate() {
        return (99.2 + (Math.random() - 0.5) * 0.5).toFixed(1);
    }

    updateMissions() {
        // Update mission progress bars
        const progressBars = document.querySelectorAll('.mission-item .progress-fill');
        progressBars.forEach(bar => {
            const currentWidth = parseInt(bar.style.width);
            if (currentWidth < 100) {
                const newWidth = Math.min(currentWidth + Math.random() * 2, 100);
                bar.style.width = newWidth + '%';
                
                // Update ETA
                const progressInfo = bar.closest('.mission-progress').querySelector('.progress-info span');
                if (progressInfo && newWidth < 100) {
                    const remainingTime = Math.ceil((100 - newWidth) * 0.1);
                    progressInfo.textContent = `ETA: ${remainingTime}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
                }
            }
        });
    }

    updateHospitals() {
        // Update hospital load bars
        const loadBars = document.querySelectorAll('.hospital-item .load-fill');
        loadBars.forEach(bar => {
            const currentWidth = parseInt(bar.style.width);
            const newWidth = Math.max(20, Math.min(95, currentWidth + (Math.random() - 0.5) * 5));
            bar.style.width = newWidth + '%';
            
            // Update load label
            const loadLabel = bar.closest('.load-info').querySelector('.load-label');
            if (loadLabel) {
                loadLabel.textContent = `Load: ${Math.round(newWidth)}%`;
            }
        });
    }

    updateWeather() {
        // Update weather conditions (simulate minor changes)
        const conditions = ['Clear Sky', 'Partly Cloudy', 'Light Haze', 'Good Visibility'];
        const temperatures = [30, 31, 32, 33, 34];
        
        // Occasionally update weather description
        if (Math.random() < 0.1) {
            const weatherDesc = document.querySelector('.weather-desc');
            if (weatherDesc) {
                weatherDesc.textContent = conditions[Math.floor(Math.random() * conditions.length)];
            }
        }
    }

    startLiveUpdates() {
        // Update statistics every 30 seconds
        setInterval(() => {
            this.updateStatistics();
        }, 30000);

        // Update mission progress every 10 seconds
        setInterval(() => {
            this.updateMissions();
        }, 10000);

        // Update hospital loads every 45 seconds
        setInterval(() => {
            this.updateHospitals();
        }, 45000);

        // Update weather every 5 minutes
        setInterval(() => {
            this.updateWeather();
        }, 300000);

        // Check authentication every minute
        setInterval(() => {
            this.checkAuthentication();
        }, 60000);
    }

    setupEventListeners() {
        // Navigation menu toggle for mobile
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-brand')) {
                // Add mobile menu toggle if needed
            }
        });

        // Auto-refresh buttons
        this.setupRefreshButtons();
        
        // Alert dismissal
        this.setupAlertHandlers();
        
        // Chart period change
        this.setupChartControls();
    }

    setupRefreshButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="refresh"]')) {
                const button = e.target.closest('button');
                const icon = button.querySelector('i');
                
                // Add spinning animation
                icon.style.animation = 'spin 1s linear infinite';
                
                // Remove animation after 1 second
                setTimeout(() => {
                    icon.style.animation = '';
                    this.loadLiveData();
                }, 1000);
            }
        });
    }

    setupAlertHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.alert-dismiss')) {
                const alertItem = e.target.closest('.alert-item');
                alertItem.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    alertItem.remove();
                    this.updateAlertCount();
                }, 300);
            }
        });
    }

    updateAlertCount() {
        const alertCount = document.querySelectorAll('.alert-item').length;
        const countElement = document.querySelector('.alert-count');
        if (countElement) {
            countElement.textContent = `${alertCount} Active`;
        }
    }

    setupChartControls() {
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateChartPeriod(e.target.value);
            });
        }
    }

    // Emergency system
    triggerEmergency() {
        const confirmation = confirm('Are you sure you want to trigger the emergency protocol?\n\nThis will:\n- Alert all connected hospitals\n- Dispatch nearest available drones\n- Notify emergency services\n- Activate emergency communication channels');
        
        if (confirmation) {
            this.activateEmergencyMode();
        }
    }

    activateEmergencyMode() {
        // Create emergency overlay
        const overlay = document.createElement('div');
        overlay.className = 'emergency-overlay';
        overlay.innerHTML = `
            <div class="emergency-modal">
                <div class="emergency-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Emergency Protocol Activated</h2>
                </div>
                <div class="emergency-content">
                    <div class="emergency-status">
                        <div class="status-item">
                            <i class="fas fa-check-circle"></i>
                            <span>All hospitals notified</span>
                        </div>
                        <div class="status-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Emergency drones dispatched</span>
                        </div>
                        <div class="status-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Communication channels active</span>
                        </div>
                        <div class="status-item">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Contacting emergency services...</span>
                        </div>
                    </div>
                    <div class="emergency-actions">
                        <button class="btn-danger" onclick="window.location.href='operations.html'">
                            Go to Mission Control
                        </button>
                        <button class="btn-secondary" onclick="this.closest('.emergency-overlay').remove()">
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add emergency styling
        document.body.style.cssText += `
            .emergency-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            .emergency-modal {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                color: white;
                box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3);
                animation: slideUp 0.3s ease;
            }
            
            .emergency-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .emergency-header i {
                font-size: 3rem;
                margin-bottom: 1rem;
                animation: pulse 1s infinite;
            }
            
            .emergency-status {
                margin-bottom: 2rem;
            }
            
            .status-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
            }
            
            .emergency-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .btn-danger {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .btn-danger:hover {
                background: white;
                color: #ef4444;
            }
            
            .btn-secondary {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.5);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        // Auto-remove after 10 seconds if not manually dismissed
        setTimeout(() => {
            if (document.contains(overlay)) {
                overlay.remove();
            }
        }, 10000);
    }

    // User menu management
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // Logout function
    logout() {
        const confirmation = confirm('Are you sure you want to logout?');
        if (confirmation) {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    }

    // Chart update function
    updateChartPeriod(period) {
        if (!this.performanceChart) return;
        
        let newData, newLabels;
        
        switch(period) {
            case '24h':
                newLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
                newData = [
                    [12, 8, 15, 23, 18, 14],
                    [8.5, 9.2, 7.8, 8.1, 9.5, 8.3]
                ];
                break;
            case '7d':
                newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                newData = [
                    [85, 92, 78, 96, 88, 45, 67],
                    [8.2, 7.9, 8.8, 7.5, 8.1, 9.2, 8.6]
                ];
                break;
            case '30d':
                newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                newData = [
                    [320, 385, 290, 410],
                    [8.1, 7.8, 8.4, 7.6]
                ];
                break;
        }
        
        this.performanceChart.data.labels = newLabels;
        this.performanceChart.data.datasets[0].data = newData[0];
        this.performanceChart.data.datasets[1].data = newData[1];
        this.performanceChart.update();
    }

    // Refresh functions
    refreshMissions() {
        console.log('Refreshing missions data...');
        this.updateMissions();
    }

    refreshHospitals() {
        console.log('Refreshing hospitals data...');
        this.updateHospitals();
    }

    // Alert dismissal
    dismissAlert(button) {
        const alertItem = button.closest('.alert-item');
        alertItem.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            alertItem.remove();
            this.updateAlertCount();
        }, 300);
    }
}

// Global functions for onclick handlers
function triggerEmergency() {
    window.dashboardSystem.triggerEmergency();
}

function toggleUserMenu() {
    window.dashboardSystem.toggleUserMenu();
}

function logout() {
    window.dashboardSystem.logout();
}

function updateChartPeriod(period) {
    window.dashboardSystem.updateChartPeriod(period);
}

function refreshMissions() {
    window.dashboardSystem.refreshMissions();
}

function refreshHospitals() {
    window.dashboardSystem.refreshHospitals();
}

function dismissAlert(button) {
    window.dashboardSystem.dismissAlert(button);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSystem = new DashboardSystem();
});

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userProfile = document.querySelector('.user-profile');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfile && userDropdown && !userProfile.contains(e.target)) {
        userDropdown.classList.remove('show');
    }
});

// Add fade-out animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Enhanced navigation with active state management
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            apiCalls: 0,
            errors: 0
        };
    }
    
    recordLoadTime() {
        this.metrics.loadTime = performance.now() - this.startTime;
        console.log(`Dashboard loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
    }
    
    recordAPICall() {
        this.metrics.apiCalls++;
    }
    
    recordError(error) {
        this.metrics.errors++;
        console.error('Dashboard error:', error);
    }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

window.addEventListener('load', () => {
    perfMonitor.recordLoadTime();
});

// Export for use in other modules
window.perfMonitor = perfMonitor;
