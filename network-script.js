// Network Page Script
class NetworkSystem {
    constructor() {
        this.map = null;
        this.hospitals = [];
        this.drones = [];
        this.markers = {
            hospitals: [],
            drones: []
        };
        this.filters = {
            online: true,
            maintenance: true,
            offline: true
        };
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.initializeMap();
        this.loadHospitals();
        this.loadDrones();
        this.initializeCharts();
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

        // Map filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter) {
                    this.toggleFilter(filter);
                    btn.classList.toggle('active');
                }
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterHospitals(e.target.value);
            });
        }

        // Add hospital button
        const addHospitalBtn = document.querySelector('.add-hospital-btn');
        if (addHospitalBtn) {
            addHospitalBtn.addEventListener('click', () => {
                this.showAddHospitalModal();
            });
        }
    }

    initializeMap() {
        if (typeof L === 'undefined') {
            console.warn('Leaflet library not loaded');
            return;
        }

        const mapContainer = document.getElementById('networkMap');
        if (!mapContainer) return;

        // Center on Bangladesh
        this.map = L.map('networkMap').setView([23.685, 90.3563], 7);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Add custom style
        this.map.getContainer().style.background = '#1a1a2e';
    }

    loadHospitals() {
        // Bangladesh hospital data with real locations
        this.hospitals = [
            {
                id: 1,
                name: "Dhaka Medical College Hospital",
                type: "Government",
                location: "Dhaka, Bangladesh",
                coordinates: [23.7285, 90.3968],
                status: "online",
                capabilities: ["emergency", "trauma", "blood", "icu"],
                stats: {
                    deliveries: 1247,
                    response: "4.2 min",
                    success: "98.5%"
                },
                featured: true
            },
            {
                id: 2,
                name: "BSMMU",
                type: "Medical University",
                location: "Dhaka, Bangladesh",
                coordinates: [23.7394, 90.3765],
                status: "online",
                capabilities: ["specialized", "research", "trauma", "icu"],
                stats: {
                    deliveries: 892,
                    response: "3.8 min",
                    success: "99.1%"
                },
                featured: true
            },
            {
                id: 3,
                name: "National Institute of Cardiovascular Diseases",
                type: "Specialized",
                location: "Dhaka, Bangladesh",
                coordinates: [23.7268, 90.3910],
                status: "online",
                capabilities: ["cardiac", "emergency", "icu", "specialized"],
                stats: {
                    deliveries: 567,
                    response: "3.5 min",
                    success: "99.3%"
                },
                featured: false
            },
            {
                id: 4,
                name: "Square Hospital",
                type: "Private",
                location: "Dhaka, Bangladesh",
                coordinates: [23.7515, 90.3875],
                status: "online",
                capabilities: ["emergency", "icu", "specialized"],
                stats: {
                    deliveries: 734,
                    response: "2.8 min",
                    success: "99.7%"
                },
                featured: false
            },
            {
                id: 5,
                name: "BIRDEM General Hospital",
                type: "Specialized",
                location: "Dhaka, Bangladesh",
                coordinates: [23.7394, 90.3912],
                status: "maintenance",
                capabilities: ["specialized", "research", "emergency"],
                stats: {
                    deliveries: 445,
                    response: "5.1 min",
                    success: "97.8%"
                },
                featured: false
            },
            {
                id: 6,
                name: "Apollo Hospitals Dhaka",
                type: "Private",
                location: "Dhaka, Bangladesh",
                coordinates: [23.8103, 90.4125],
                status: "online",
                capabilities: ["emergency", "icu", "specialized", "cardiac"],
                stats: {
                    deliveries: 623,
                    response: "3.2 min",
                    success: "99.2%"
                },
                featured: false
            },
            {
                id: 7,
                name: "Chittagong Medical College Hospital",
                type: "Government",
                location: "Chittagong, Bangladesh",
                coordinates: [22.3569, 91.7832],
                status: "online",
                capabilities: ["emergency", "trauma", "blood", "icu"],
                stats: {
                    deliveries: 678,
                    response: "6.2 min",
                    success: "96.5%"
                },
                featured: false
            },
            {
                id: 8,
                name: "Sylhet MAG Osmani Medical College Hospital",
                type: "Government",
                location: "Sylhet, Bangladesh",
                coordinates: [24.8949, 91.8687],
                status: "offline",
                capabilities: ["emergency", "trauma", "blood"],
                stats: {
                    deliveries: 234,
                    response: "8.5 min",
                    success: "94.2%"
                },
                featured: false
            }
        ];

        this.addHospitalMarkers();
        this.renderHospitalCards();
        this.updateNetworkStats();
    }

    loadDrones() {
        // Sample drone data for visualization
        this.drones = [
            {
                id: "DR001",
                status: "delivering",
                coordinates: [23.7285, 90.3968],
                battery: 75,
                mission: "Emergency Blood Delivery",
                destination: "DMCH"
            },
            {
                id: "DR002",
                status: "returning",
                coordinates: [23.7394, 90.3765],
                battery: 45,
                mission: "Medicine Delivery Complete",
                destination: "Base Station"
            },
            {
                id: "DR003",
                status: "standby",
                coordinates: [23.7515, 90.3875],
                battery: 100,
                mission: "Ready for Mission",
                destination: "Square Hospital"
            }
        ];

        this.addDroneMarkers();
    }

    addHospitalMarkers() {
        if (!this.map) return;

        this.hospitals.forEach(hospital => {
            let iconColor = '#10b981'; // green for online
            if (hospital.status === 'maintenance') iconColor = '#f59e0b'; // yellow
            if (hospital.status === 'offline') iconColor = '#ef4444'; // red

            const customIcon = L.divIcon({
                html: `
                    <div style="
                        background: ${iconColor};
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        border: 3px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    ">
                        <i class="fas fa-hospital" style="font-size: 12px;"></i>
                    </div>
                `,
                className: 'hospital-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker(hospital.coordinates, { icon: customIcon })
                .addTo(this.map)
                .bindPopup(`
                    <div style="color: #333; font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${hospital.name}</h4>
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.type} Hospital</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${hospital.location}</p>
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <span style="background: ${iconColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">
                                ${hospital.status}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: #666;">
                            <div>Deliveries: ${hospital.stats.deliveries}</div>
                            <div>Response: ${hospital.stats.response}</div>
                            <div>Success: ${hospital.stats.success}</div>
                        </div>
                    </div>
                `);

            this.markers.hospitals.push({ marker, hospital });
        });
    }

    addDroneMarkers() {
        if (!this.map) return;

        this.drones.forEach(drone => {
            let iconColor = '#667eea'; // blue for active
            if (drone.status === 'delivering') iconColor = '#10b981'; // green
            if (drone.status === 'returning') iconColor = '#f59e0b'; // yellow
            if (drone.status === 'maintenance') iconColor = '#ef4444'; // red

            const customIcon = L.divIcon({
                html: `
                    <div style="
                        background: ${iconColor};
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                        border: 2px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 10px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        animation: pulse 2s infinite;
                    ">
                        <i class="fas fa-helicopter" style="font-size: 10px;"></i>
                    </div>
                    <style>
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.1); opacity: 0.8; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    </style>
                `,
                className: 'drone-marker',
                iconSize: [25, 25],
                iconAnchor: [12.5, 12.5]
            });

            const marker = L.marker(drone.coordinates, { icon: customIcon })
                .addTo(this.map)
                .bindPopup(`
                    <div style="color: #333; font-family: Arial, sans-serif;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">Drone ${drone.id}</h4>
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <span style="background: ${iconColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">
                                ${drone.status}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: #666;">
                            <div>Battery: ${drone.battery}%</div>
                            <div>Mission: ${drone.mission}</div>
                            <div>Destination: ${drone.destination}</div>
                        </div>
                    </div>
                `);

            this.markers.drones.push({ marker, drone });
        });
    }

    renderHospitalCards() {
        const hospitalsGrid = document.querySelector('.hospitals-grid');
        if (!hospitalsGrid) return;

        hospitalsGrid.innerHTML = this.hospitals.map(hospital => `
            <div class="hospital-card ${hospital.featured ? 'featured' : ''}">
                <div class="hospital-status ${hospital.status}">
                    <i class="fas fa-circle"></i>
                    ${hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                </div>
                
                <div class="hospital-header">
                    <div class="hospital-icon">
                        <i class="fas fa-hospital"></i>
                    </div>
                    <div class="hospital-info">
                        <h3>${hospital.name}</h3>
                        <div class="hospital-type">${hospital.type} Hospital</div>
                        <div class="hospital-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${hospital.location}
                        </div>
                    </div>
                </div>

                <div class="hospital-stats">
                    <div class="stat">
                        <span class="label">Deliveries</span>
                        <span class="value">${hospital.stats.deliveries}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Response</span>
                        <span class="value">${hospital.stats.response}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Success</span>
                        <span class="value">${hospital.stats.success}</span>
                    </div>
                </div>

                <div class="hospital-capabilities">
                    ${hospital.capabilities.map(cap => `
                        <span class="capability ${cap}">${cap.charAt(0).toUpperCase() + cap.slice(1)}</span>
                    `).join('')}
                </div>

                <div class="hospital-actions">
                    <button class="action-btn primary" onclick="networkSystem.viewHospital(${hospital.id})">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    <button class="action-btn secondary" onclick="networkSystem.sendTestDelivery(${hospital.id})" 
                            ${hospital.status === 'offline' ? 'disabled' : ''}>
                        <i class="fas fa-paper-plane"></i>
                        Test Delivery
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateNetworkStats() {
        const onlineCount = this.hospitals.filter(h => h.status === 'online').length;
        const totalDeliveries = this.hospitals.reduce((sum, h) => sum + h.stats.deliveries, 0);
        const avgResponse = this.calculateAverageResponse();
        const activeDrones = this.drones.filter(d => d.status !== 'standby').length;

        // Update stat numbers
        document.querySelectorAll('.stat-number').forEach((el, index) => {
            const values = [onlineCount, totalDeliveries, avgResponse, activeDrones];
            if (values[index] !== undefined) {
                el.textContent = values[index];
            }
        });
    }

    calculateAverageResponse() {
        const times = this.hospitals
            .filter(h => h.status === 'online')
            .map(h => parseFloat(h.stats.response));
        
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        return avg.toFixed(1) + ' min';
    }

    toggleFilter(filter) {
        this.filters[filter] = !this.filters[filter];
        this.updateMarkerVisibility();
    }

    updateMarkerVisibility() {
        this.markers.hospitals.forEach(({ marker, hospital }) => {
            if (this.filters[hospital.status]) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    filterHospitals(searchTerm) {
        const cards = document.querySelectorAll('.hospital-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const type = card.querySelector('.hospital-type').textContent.toLowerCase();
            const location = card.querySelector('.hospital-location').textContent.toLowerCase();

            if (name.includes(term) || type.includes(term) || location.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    initializeCharts() {
        // Response time chart
        this.createResponseTimeChart();
        this.createDeliveryChart();
        this.createCoverageChart();
    }

    createResponseTimeChart() {
        const ctx = document.getElementById('responseChart');
        if (!ctx || typeof Chart === 'undefined') return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['DMCH', 'BSMMU', 'NICVD', 'Square', 'BIRDEM', 'Apollo'],
                datasets: [{
                    label: 'Response Time (minutes)',
                    data: [4.2, 3.8, 3.5, 2.8, 5.1, 3.2],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
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

    createDeliveryChart() {
        const ctx = document.getElementById('deliveryChart');
        if (!ctx || typeof Chart === 'undefined') return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Successful Deliveries',
                    data: [1200, 1350, 1180, 1420, 1380, 1500],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
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

    createCoverageChart() {
        const ctx = document.getElementById('coverageChart');
        if (!ctx || typeof Chart === 'undefined') return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Dhaka', 'Chittagong', 'Sylhet', 'Others'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
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

    viewHospital(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (hospital) {
            // Center map on hospital
            this.map.setView(hospital.coordinates, 15);
            
            // Highlight hospital marker
            const hospitalMarker = this.markers.hospitals.find(m => m.hospital.id === hospitalId);
            if (hospitalMarker) {
                hospitalMarker.marker.openPopup();
            }
        }
    }

    sendTestDelivery(hospitalId) {
        const hospital = this.hospitals.find(h => h.id === hospitalId);
        if (hospital && hospital.status === 'online') {
            alert(`Test delivery initiated to ${hospital.name}\nEstimated arrival: ${hospital.stats.response}`);
        }
    }

    showAddHospitalModal() {
        alert('Add Hospital functionality would open a modal form here');
    }

    startRealTimeUpdates() {
        // Update drone positions every 30 seconds
        setInterval(() => {
            this.updateDronePositions();
        }, 30000);

        // Update hospital stats every 5 minutes
        setInterval(() => {
            this.updateHospitalStats();
        }, 300000);
    }

    updateDronePositions() {
        // Simulate drone movement
        this.drones.forEach((drone, index) => {
            if (drone.status === 'delivering' || drone.status === 'returning') {
                // Slight random movement for demo
                const lat = drone.coordinates[0] + (Math.random() - 0.5) * 0.01;
                const lng = drone.coordinates[1] + (Math.random() - 0.5) * 0.01;
                drone.coordinates = [lat, lng];
                
                // Update marker position
                const droneMarker = this.markers.drones[index];
                if (droneMarker) {
                    droneMarker.marker.setLatLng(drone.coordinates);
                }
            }
        });
    }

    updateHospitalStats() {
        // Simulate stat updates
        this.hospitals.forEach(hospital => {
            if (hospital.status === 'online') {
                hospital.stats.deliveries += Math.floor(Math.random() * 5);
            }
        });
        
        this.updateNetworkStats();
        this.renderHospitalCards();
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
    if (window.networkSystem) {
        window.networkSystem.logout();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.networkSystem = new NetworkSystem();
});
