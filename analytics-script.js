// Analytics Page Script
class AnalyticsSystem {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadAnalyticsData();
        this.startRealTimeUpdates();
    }

    checkAuth() {
        // Check both sessionStorage and localStorage for authentication
        const sessionAuth = sessionStorage.getItem('medone_authenticated');
        const localAuth = localStorage.getItem('medone_authenticated');
        const authData = sessionStorage.getItem('authData') || localStorage.getItem('authData');
        
        const isAuthenticated = sessionAuth || localAuth || authData;
        
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            if (authData) {
                const auth = JSON.parse(authData);
                if (!auth.isAuthenticated) {
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            // If there's an error parsing authData but other auth exists, continue
            if (!sessionAuth && !localAuth) {
                window.location.href = 'login.html';
            }
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

        // Chart control buttons
        const chartControlBtns = document.querySelectorAll('.chart-control-btn');
        chartControlBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.dataset.chart;
                const timeType = btn.dataset.type;
                
                // Update active state
                const siblingBtns = btn.parentElement.querySelectorAll('.chart-control-btn');
                siblingBtns.forEach(siblingBtn => siblingBtn.classList.remove('active'));
                btn.classList.add('active');
                
                // Update chart
                this.updateChart(chartType, timeType);
            });
        });

        // Export buttons
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Time range selectors
        const timeSelectors = document.querySelectorAll('.time-selector');
        timeSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => {
                this.updateTimeRange(e.target.value);
            });
        });
    }

    initializeCharts() {
        this.createMissionsChart();
        this.createResponseTimeChart();
        this.createSuccessRateChart();
        this.createHospitalDistributionChart();
        this.createPayloadChart();
    }

    createMissionsChart() {
        const ctx = document.getElementById('missionsChart');
        if (!ctx || typeof Chart === 'undefined') return;

        this.charts.missions = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Successful Missions',
                    data: [65, 78, 90, 81, 95, 102, 88],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Total Missions',
                    data: [70, 82, 95, 85, 98, 105, 92],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a0a0a0',
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
    }

    createResponseTimeChart() {
        const ctx = document.getElementById('responseTimeChart');
        if (!ctx || typeof Chart === 'undefined') return;

        this.charts.responseTime = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['DMCH', 'BSMMU', 'NICVD', 'Square', 'BIRDEM', 'Apollo'],
                datasets: [{
                    label: 'Average Response Time (minutes)',
                    data: [4.2, 3.8, 3.5, 2.8, 5.1, 3.2],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
    }

    createSuccessRateChart() {
        const ctx = document.getElementById('successRateChart');
        if (!ctx || typeof Chart === 'undefined') return;

        this.charts.successRate = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Successful', 'Failed', 'Cancelled'],
                datasets: [{
                    data: [95.2, 3.1, 1.7],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(156, 163, 175, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0a0a0',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createHospitalDistributionChart() {
        const ctx = document.getElementById('hospitalDistributionChart');
        if (!ctx || typeof Chart === 'undefined') return;

        this.charts.hospitalDistribution = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['DMCH', 'BSMMU', 'NICVD', 'Square', 'BIRDEM', 'Apollo'],
                datasets: [{
                    label: 'Mission Volume',
                    data: [85, 72, 68, 90, 55, 78],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a0a0a0'
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        grid: {
                            color: 'rgba(102, 126, 234, 0.1)'
                        },
                        pointLabels: {
                            color: '#a0a0a0'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    }

    createPayloadChart() {
        const ctx = document.getElementById('payloadChart');
        if (!ctx || typeof Chart === 'undefined') return;

        this.charts.payload = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Medical Supplies', 'Blood Products', 'Organs', 'Vaccines', 'Emergency Meds'],
                datasets: [{
                    data: [35, 25, 15, 15, 10],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0a0a0',
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    loadAnalyticsData() {
        // Update metrics overview
        this.updateMetricsOverview();
        
        // Update performance cards
        this.updatePerformanceCards();
        
        // Update activity log
        this.updateActivityLog();
        
        // Update alerts
        this.updateAlerts();
    }

    updateMetricsOverview() {
        // Update the metric values directly by ID
        const totalMissionsEl = document.getElementById('totalMissions');
        const avgResponseTimeEl = document.getElementById('avgResponseTime');
        const successRateEl = document.getElementById('successRate');
        const livesImpactedEl = document.getElementById('livesImpacted');

        if (totalMissionsEl) totalMissionsEl.textContent = '2,547';
        if (avgResponseTimeEl) avgResponseTimeEl.textContent = '4.2';
        if (successRateEl) successRateEl.textContent = '98.7';
        if (livesImpactedEl) livesImpactedEl.textContent = '50,284';

        // Simulate live updates with slight variations
        setInterval(() => {
            if (totalMissionsEl) {
                const current = parseInt(totalMissionsEl.textContent.replace(',', ''));
                totalMissionsEl.textContent = (current + Math.floor(Math.random() * 3)).toLocaleString();
            }
            if (livesImpactedEl) {
                const current = parseInt(livesImpactedEl.textContent.replace(',', ''));
                livesImpactedEl.textContent = (current + Math.floor(Math.random() * 5)).toLocaleString();
            }
        }, 10000);
    }

    updatePerformanceCards() {
        // Update battery performance
        const batteryData = [
            { drone: 'MD-001', battery: 87, status: 'Good' },
            { drone: 'MD-002', battery: 92, status: 'Excellent' },
            { drone: 'MD-003', battery: 78, status: 'Good' },
            { drone: 'MD-004', battery: 65, status: 'Fair' }
        ];

        // Update flight hours
        const flightHours = [
            { drone: 'MD-001', hours: 156.5, status: 'Active' },
            { drone: 'MD-002', hours: 142.3, status: 'Active' },
            { drone: 'MD-003', hours: 187.8, status: 'Maintenance' },
            { drone: 'MD-004', hours: 203.2, status: 'Active' }
        ];

        // Populate data (placeholder implementation)
        console.log('Performance data updated:', { batteryData, flightHours });
    }

    updateActivityLog() {
        const activities = [
            {
                time: '14:23',
                action: 'Mission Completed',
                details: 'Blood delivery to DMCH - MD-001',
                status: 'success'
            },
            {
                time: '14:15',
                action: 'Drone Launched',
                details: 'Emergency medicine to BSMMU - MD-002',
                status: 'info'
            },
            {
                time: '14:08',
                action: 'Mission Assigned',
                details: 'Organ transport to NICVD - MD-003',
                status: 'warning'
            },
            {
                time: '13:45',
                action: 'Maintenance Complete',
                details: 'MD-004 battery replacement finished',
                status: 'success'
            }
        ];

        const activityContainer = document.querySelector('.activity-log');
        if (activityContainer) {
            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item ${activity.status}">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-content">
                        <div class="activity-action">${activity.action}</div>
                        <div class="activity-details">${activity.details}</div>
                    </div>
                    <div class="activity-status">
                        <i class="fas fa-${activity.status === 'success' ? 'check-circle' : 
                                           activity.status === 'warning' ? 'exclamation-triangle' : 
                                           'info-circle'}"></i>
                    </div>
                </div>
            `).join('');
        }
    }

    updateAlerts() {
        const alerts = [
            {
                type: 'warning',
                title: 'Low Battery Warning',
                message: 'MD-004 battery at 15% - Return to base recommended',
                time: '2 min ago'
            },
            {
                type: 'info',
                title: 'Weather Update',
                message: 'Light rain expected in 30 minutes - Plan accordingly',
                time: '5 min ago'
            },
            {
                type: 'success',
                title: 'Mission Milestone',
                message: '1000th successful delivery completed today!',
                time: '1 hour ago'
            }
        ];

        const alertsContainer = document.querySelector('.alerts-container');
        if (alertsContainer) {
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <div class="alert-icon">
                        <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 
                                           alert.type === 'success' ? 'check-circle' : 
                                           'info-circle'}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-time">${alert.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateChart(chartType, timeType) {
        if (!this.charts[chartType]) return;

        let newData;
        let newLabels;

        switch (timeType) {
            case 'daily':
                newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                newData = [65, 78, 90, 81, 95, 102, 88];
                break;
            case 'weekly':
                newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                newData = [450, 520, 480, 590];
                break;
            case 'monthly':
                newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                newData = [1800, 2100, 1950, 2300, 2150, 2400];
                break;
        }

        this.charts[chartType].data.labels = newLabels;
        this.charts[chartType].data.datasets[0].data = newData;
        this.charts[chartType].update();
    }

    updateTimeRange(range) {
        // Update all charts based on time range
        Object.keys(this.charts).forEach(chartKey => {
            // Placeholder for time range updates
            console.log(`Updating ${chartKey} for time range: ${range}`);
        });
    }

    exportData() {
        // Create a simple CSV export
        const data = [
            ['Date', 'Total Missions', 'Successful Missions', 'Success Rate'],
            ['2024-09-01', '70', '68', '97.1%'],
            ['2024-09-02', '82', '80', '97.6%'],
            ['2024-09-03', '95', '93', '97.9%'],
            ['2024-09-04', '85', '83', '97.6%']
        ];

        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medone-analytics-' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    startRealTimeUpdates() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.updateMetricsOverview();
        }, 30000);

        // Update charts every 5 minutes
        setInterval(() => {
            this.refreshChartData();
        }, 300000);

        // Update activity log every minute
        setInterval(() => {
            this.updateActivityLog();
        }, 60000);
    }

    refreshChartData() {
        // Simulate real-time data updates
        Object.keys(this.charts).forEach(chartKey => {
            const chart = this.charts[chartKey];
            if (chart && chart.data.datasets[0]) {
                chart.data.datasets[0].data = chart.data.datasets[0].data.map(value => 
                    Math.max(0, value + (Math.random() - 0.5) * 10)
                );
                chart.update();
            }
        });
    }

    logout() {
        sessionStorage.removeItem('authData');
        localStorage.removeItem('authData');
        sessionStorage.removeItem('medone_authenticated');
        localStorage.removeItem('medone_authenticated');
        sessionStorage.removeItem('medone_login_time');
        localStorage.removeItem('medone_login_time');
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
    if (window.analyticsSystem) {
        window.analyticsSystem.logout();
    }
}

function refreshAnalytics() {
    if (window.analyticsSystem) {
        window.analyticsSystem.loadAnalyticsData();
        window.analyticsSystem.refreshChartData();
    }
    
    // Show loading indicator briefly
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        }, 1500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsSystem = new AnalyticsSystem();
});
