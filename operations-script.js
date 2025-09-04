// MEDONE Operations Center Script
class OperationsSystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.checkAuthentication();
        this.initializeMap();
        this.startLiveUpdates();
    }

    init() {
        this.updateCurrentTime();
        this.loadOperationalData();
        console.log('MEDONE Operations Center initialized');
    }

    checkAuthentication() {
        // Check both sessionStorage and localStorage for authentication
        const sessionAuth = sessionStorage.getItem('medone_authenticated');
        const localAuth = localStorage.getItem('medone_authenticated');
        const sessionTime = sessionStorage.getItem('medone_login_time');
        const localTime = localStorage.getItem('medone_login_time');
        
        const isAuthenticated = sessionAuth || localAuth;
        const loginTime = sessionTime || localTime;
        
        if (!isAuthenticated || !loginTime) {
            window.location.href = 'login.html';
            return;
        }
        
        // Check session timeout (8 hours)
        const currentTime = new Date().getTime();
        const sessionDuration = currentTime - parseInt(loginTime);
        const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        if (sessionDuration > maxDuration) {
            sessionStorage.clear();
            localStorage.removeItem('medone_authenticated');
            localStorage.removeItem('medone_login_time');
            localStorage.removeItem('medone_session');
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }
        
        // Update last activity
        if (sessionAuth) {
            sessionStorage.setItem('medone_last_activity', currentTime.toString());
        } else {
            localStorage.setItem('medone_last_activity', currentTime.toString());
        }
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

    initializeMap() {
        // Initialize Leaflet map for mission tracking
        this.map = L.map('missionMap').setView([23.8103, 90.4125], 11); // Dhaka coordinates
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Add hospital markers
        this.addHospitalMarkers();
        
        // Add drone markers
        this.addDroneMarkers();
        
        // Add flight paths
        this.addFlightPaths();
    }

    addHospitalMarkers() {
        const hospitals = [
            { name: 'DMCH', lat: 23.7272, lng: 90.3969, status: 'online', type: 'Government' },
            { name: 'BSMMU', lat: 23.7536, lng: 90.3792, status: 'online', type: 'Medical University' },
            { name: 'NICVD', lat: 23.7588, lng: 90.3631, status: 'online', type: 'Specialized' },
            { name: 'Square Hospital', lat: 23.7516, lng: 90.3876, status: 'online', type: 'Private' },
            { name: 'BIRDEM', lat: 23.7394, lng: 90.3912, status: 'maintenance', type: 'Specialized' },
            { name: 'Apollo Hospitals', lat: 23.8103, lng: 90.4125, status: 'online', type: 'Private' }
        ];

        hospitals.forEach(hospital => {
            let iconColor = '#10b981'; // green for online
            if (hospital.status === 'maintenance') iconColor = '#f59e0b'; // yellow
            if (hospital.status === 'offline') iconColor = '#ef4444'; // red

            const marker = L.marker([hospital.lat, hospital.lng], {
                icon: L.divIcon({
                    className: 'hospital-marker',
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
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        ">
                            <i class="fas fa-hospital" style="font-size: 12px;"></i>
                        </div>
                    `,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div style="color: #333; font-family: Arial, sans-serif;">
                    <h4 style="margin: 0 0 8px 0;">${hospital.name}</h4>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.type} Hospital</p>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <span style="background: ${iconColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">
                            ${hospital.status}
                        </span>
                    </div>
                    <button onclick="contactHospital('${hospital.name}')" style="background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Contact</button>
                </div>
            `);
        });
    }

    addDroneMarkers() {
        const drones = [
            { id: 'MD-001', lat: 23.7600, lng: 90.3700, status: 'delivering', battery: 78, mission: 'Blood Delivery to DMCH' },
            { id: 'MD-002', lat: 23.7400, lng: 90.3800, status: 'returning', battery: 92, mission: 'Emergency Medicine Complete' },
            { id: 'MD-003', lat: 23.7516, lng: 90.3876, status: 'standby', battery: 100, mission: 'Ready for Mission' },
            { id: 'MD-004', lat: 23.7394, lng: 90.3912, status: 'maintenance', battery: 45, mission: 'Scheduled Maintenance' }
        ];

        drones.forEach(drone => {
            let iconColor = '#667eea'; // blue for standby
            if (drone.status === 'delivering') iconColor = '#10b981'; // green
            if (drone.status === 'returning') iconColor = '#f59e0b'; // yellow
            if (drone.status === 'maintenance') iconColor = '#ef4444'; // red

            const marker = L.marker([drone.lat, drone.lng], {
                icon: L.divIcon({
                    className: `drone-marker drone-${drone.status}`,
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
                    iconSize: [25, 25],
                    iconAnchor: [12.5, 12.5]
                })
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div style="color: #333; font-family: Arial, sans-serif;">
                    <h4 style="margin: 0 0 8px 0;">Drone ${drone.id}</h4>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <span style="background: ${iconColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">
                            ${drone.status}
                        </span>
                    </div>
                    <div style="font-size: 11px; color: #666;">
                        <div>Battery: ${drone.battery}%</div>
                        <div>Mission: ${drone.mission}</div>
                    </div>
                    <button onclick="trackDrone('${drone.id}')" style="background: #667eea; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-top: 8px;">Track</button>
                </div>
            `);
        });
    }

    addFlightPaths() {
        // Sample flight path from DMCH to Base
        const flightPath = L.polyline([
            [23.7272, 90.3969], // DMCH
            [23.7400, 90.3800], // Waypoint
            [23.8103, 90.4125]  // Base Station
        ], {
            color: '#667eea',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 10'
        }).addTo(this.map);
        
        flightPath.bindPopup('Active Flight Path: MD-001 → Base Station');
    }

    loadOperationalData() {
        this.updateFleetStatus();
        this.updateMissionQueue();
        this.updateCommunications();
        this.updateSystemMonitoring();
    }

    updateFleetStatus() {
        // Simulate real-time fleet updates
        const droneUnits = document.querySelectorAll('.drone-unit');
        droneUnits.forEach(unit => {
            const batteryElement = unit.querySelector('.info-item span');
            if (batteryElement && batteryElement.textContent.includes('Battery:')) {
                let currentBattery = parseInt(batteryElement.textContent.match(/\d+/)[0]);
                const status = unit.querySelector('.drone-status').textContent;
                
                if (status === 'CHARGING') {
                    currentBattery = Math.min(100, currentBattery + Math.random() * 2);
                } else if (status === 'EN ROUTE' || status === 'RETURNING') {
                    currentBattery = Math.max(20, currentBattery - Math.random() * 0.5);
                }
                
                batteryElement.textContent = `Battery: ${Math.round(currentBattery)}%`;
            }
        });
    }

    updateMissionQueue() {
        // Update mission times and priorities
        const queueItems = document.querySelectorAll('.queue-item');
        queueItems.forEach(item => {
            const timeElement = item.querySelector('.mission-time');
            if (timeElement) {
                const currentTime = timeElement.textContent;
                const [hours, minutes] = currentTime.split(':').map(Number);
                const now = new Date();
                const missionTime = new Date();
                missionTime.setHours(hours, minutes, 0, 0);
                
                const timeDiff = missionTime - now;
                if (timeDiff < 0) {
                    timeElement.style.color = '#ef4444';
                    timeElement.textContent = 'OVERDUE';
                } else if (timeDiff < 30 * 60 * 1000) { // 30 minutes
                    timeElement.style.color = '#fbbf24';
                }
            }
        });
    }

    updateCommunications() {
        // Simulate incoming communications
        if (Math.random() < 0.1) { // 10% chance per update
            this.addCommunicationMessage();
        }
    }

    addCommunicationMessage() {
        const messages = [
            { sender: 'MD-003', content: 'Standby at Square Hospital. Ready for deployment.', type: 'received' },
            { sender: 'NICVD Control', content: 'Emergency patient stabilized. Thank you for quick response.', type: 'received' },
            { sender: 'MD-001', content: 'Delivery complete. Returning to base station.', type: 'received' },
            { sender: 'Weather Station', content: 'Wind speeds increasing. Monitor flight conditions.', type: 'received' }
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const commLog = document.querySelector('.communication-log');
        
        if (commLog) {
            const messageElement = document.createElement('div');
            messageElement.className = `comm-message ${randomMessage.type}`;
            messageElement.innerHTML = `
                <div class="msg-header">
                    <span class="msg-sender">${randomMessage.sender}</span>
                    <span class="msg-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                </div>
                <div class="msg-content">${randomMessage.content}</div>
            `;
            
            commLog.appendChild(messageElement);
            commLog.scrollTop = commLog.scrollHeight;
            
            // Remove old messages if too many
            const messages = commLog.querySelectorAll('.comm-message');
            if (messages.length > 10) {
                messages[0].remove();
            }
        }
    }

    updateSystemMonitoring() {
        // Update system metrics
        const metrics = {
            network: Math.max(95, 100 - Math.random() * 5),
            storage: Math.min(80, 70 + Math.random() * 10),
            temperature: Math.max(65, 75 - Math.random() * 10)
        };
        
        // Update network chart if exists
        this.updateMonitoringCharts(metrics);
    }

    updateMonitoringCharts(metrics) {
        // Simple chart update for network monitoring
        const networkChart = document.getElementById('networkChart');
        if (networkChart) {
            // This would integrate with Chart.js if included
            console.log('Network uptime:', metrics.network.toFixed(1) + '%');
        }
    }

    startLiveUpdates() {
        // Update fleet status every 15 seconds
        setInterval(() => {
            this.updateFleetStatus();
        }, 15000);

        // Update mission queue every 30 seconds
        setInterval(() => {
            this.updateMissionQueue();
        }, 30000);

        // Update communications every 45 seconds
        setInterval(() => {
            this.updateCommunications();
        }, 45000);

        // Update system monitoring every 20 seconds
        setInterval(() => {
            this.updateSystemMonitoring();
        }, 20000);

        // Check authentication every minute
        setInterval(() => {
            this.checkAuthentication();
        }, 60000);
    }

    setupEventListeners() {
        // Channel selector
        document.addEventListener('click', (e) => {
            if (e.target.closest('.channel')) {
                document.querySelectorAll('.channel').forEach(ch => ch.classList.remove('active'));
                e.target.closest('.channel').classList.add('active');
            }
        });

        // Auto-refresh buttons
        this.setupRefreshButtons();
        
        // Modal handlers
        this.setupModalHandlers();
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
                    this.loadOperationalData();
                }, 1000);
            }
        });
    }

    setupModalHandlers() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });
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
                        <button class="btn-danger" onclick="this.closest('.emergency-overlay').remove()">
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
            localStorage.removeItem('medone_authenticated');
            localStorage.removeItem('medone_login_time');
            localStorage.removeItem('medone_session');
            window.location.href = 'login.html';
        }
    }

    // Mission Planner
    openMissionPlanner() {
        const modal = document.getElementById('missionPlannerModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Set default scheduled time to current time + 1 hour
            const scheduledTime = document.getElementById('scheduledTime');
            if (scheduledTime) {
                const now = new Date();
                now.setHours(now.getHours() + 1);
                scheduledTime.value = now.toISOString().slice(0, 16);
            }
        }
    }

    closeMissionPlanner() {
        const modal = document.getElementById('missionPlannerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    scheduleMission() {
        const priority = document.getElementById('missionPriority').value;
        const drone = document.getElementById('assignedDrone').value;
        const origin = document.getElementById('missionOrigin').value;
        const destination = document.getElementById('missionDestination').value;
        const scheduledTime = document.getElementById('scheduledTime').value;
        const description = document.getElementById('missionDescription').value;
        
        if (!scheduledTime || !description) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Create mission object
        const mission = {
            id: 'MD-' + new Date().getFullYear() + '-' + 
                String(new Date().getMonth() + 1).padStart(2, '0') + 
                String(new Date().getDate()).padStart(2, '0') + '-' + 
                String(Math.floor(Math.random() * 999) + 1).padStart(3, '0'),
            priority,
            drone,
            origin,
            destination,
            scheduledTime,
            description,
            status: 'queued'
        };
        
        console.log('Mission scheduled:', mission);
        
        // Add to mission queue (in a real app, this would save to database)
        this.addMissionToQueue(mission);
        
        // Close modal
        this.closeMissionPlanner();
        
        // Show success message
        alert(`Mission ${mission.id} has been scheduled successfully!`);
    }

    addMissionToQueue(mission) {
        const queueContainer = document.querySelector('.mission-queue');
        if (queueContainer) {
            const missionElement = document.createElement('div');
            missionElement.className = `queue-item priority-${mission.priority}`;
            missionElement.innerHTML = `
                <div class="queue-header">
                    <div class="mission-priority">
                        <i class="fas fa-clock"></i>
                        <span>${mission.priority.toUpperCase()}</span>
                    </div>
                    <div class="mission-time">${new Date(mission.scheduledTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="mission-details">
                    <div class="mission-title">${mission.description}</div>
                    <div class="mission-route">${mission.origin} → ${mission.destination}</div>
                    <div class="mission-weight">Drone: ${mission.drone}</div>
                </div>
                <div class="queue-actions">
                    <button class="btn-modify" onclick="modifyMission('${mission.id}')">
                        <i class="fas fa-edit"></i> Modify
                    </button>
                </div>
            `;
            
            queueContainer.appendChild(missionElement);
        }
    }

    // AutoPilot toggle
    toggleAutoPilot() {
        const button = event.target.closest('.control-btn');
        const text = document.getElementById('autopilotText');
        
        if (text.textContent === 'Enable AutoPilot') {
            text.textContent = 'Disable AutoPilot';
            button.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
            alert('AutoPilot enabled. System will automatically handle routine missions.');
        } else {
            text.textContent = 'Enable AutoPilot';
            button.style.background = '';
            alert('AutoPilot disabled. Manual control restored.');
        }
    }

    // Emergency landing
    emergencyLanding() {
        const confirmation = confirm('Are you sure you want to initiate emergency landing for all active drones?\n\nThis action cannot be undone.');
        
        if (confirmation) {
            alert('Emergency landing protocol activated. All drones returning to nearest safe landing zones.');
            
            // Update drone statuses
            document.querySelectorAll('.drone-status').forEach(status => {
                if (status.textContent !== 'CHARGING') {
                    status.textContent = 'EMERGENCY LANDING';
                    status.className = 'drone-status emergency';
                    status.style.background = 'rgba(239, 68, 68, 0.2)';
                    status.style.color = '#ef4444';
                    status.style.border = '1px solid #ef4444';
                }
            });
        }
    }

    // Communication functions
    sendMessage() {
        const target = document.getElementById('commTarget').value;
        const message = document.getElementById('commMessage').value;
        
        if (!message.trim()) {
            alert('Please enter a message.');
            return;
        }
        
        const commLog = document.querySelector('.communication-log');
        const messageElement = document.createElement('div');
        messageElement.className = 'comm-message sent';
        messageElement.innerHTML = `
            <div class="msg-header">
                <span class="msg-sender">Control</span>
                <span class="msg-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <div class="msg-content">To ${target}: ${message}</div>
        `;
        
        commLog.appendChild(messageElement);
        commLog.scrollTop = commLog.scrollHeight;
        
        // Clear input
        document.getElementById('commMessage').value = '';
    }

    sendQuickMessage(message) {
        document.getElementById('commMessage').value = message;
        this.sendMessage();
    }

    handleCommKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    // Map functions
    centerMap() {
        if (this.map) {
            this.map.setView([23.8103, 90.4125], 11);
        }
    }

    toggleLayers() {
        // Toggle map layers (placeholder)
        console.log('Toggling map layers');
    }

    toggleTraffic() {
        // Toggle traffic layer (placeholder)
        console.log('Toggling traffic layer');
    }

    changeMapView(view) {
        if (!this.map) return;
        
        // Remove existing tile layer
        this.map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });
        
        // Add new tile layer based on view
        let tileUrl;
        switch(view) {
            case 'satellite':
                tileUrl = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
                break;
            case 'terrain':
                tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
                break;
            default:
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
        
        L.tileLayer(tileUrl, {
            attribution: '© Map contributors'
        }).addTo(this.map);
    }

    // Drone functions
    trackDrone(droneId) {
        alert(`Tracking ${droneId}. Real-time location will be displayed on the map.`);
        // In a real implementation, this would center the map on the drone
        if (this.map) {
            // Example coordinates for demo
            this.map.setView([23.7600, 90.3700], 14);
        }
    }

    communicateWithDrone(droneId) {
        const message = prompt(`Enter message for ${droneId}:`);
        if (message) {
            alert(`Message sent to ${droneId}: "${message}"`);
        }
    }

    deployDrone(droneId) {
        alert(`${droneId} deployment sequence initiated. Redirecting to mission deployment page.`);
        window.location.href = 'deploy.html';
    }

    maintenanceDrone(droneId) {
        const confirmation = confirm(`Schedule maintenance for ${droneId}?`);
        if (confirmation) {
            alert(`Maintenance scheduled for ${droneId}. Drone will be unavailable for 2 hours.`);
        }
    }

    checkDroneHealth(droneId) {
        alert(`${droneId} Health Status:\n\n✓ All systems operational\n✓ GPS signal strong\n✓ Battery charging normally\n✓ Motors within normal parameters\n✓ Communication link stable`);
    }

    // Queue functions
    executeImmediate(missionId) {
        const confirmation = confirm(`Execute mission ${missionId} immediately?\n\nThis will override the current queue order.`);
        if (confirmation) {
            alert(`Mission ${missionId} executed. Drone dispatched immediately.`);
        }
    }

    modifyMission(missionId) {
        alert(`Mission ${missionId} modification panel would open here.`);
    }

    delayMission(missionId) {
        const hours = prompt('Delay mission by how many hours?', '1');
        if (hours && !isNaN(hours)) {
            alert(`Mission ${missionId} delayed by ${hours} hour(s).`);
        }
    }

    refreshQueue() {
        console.log('Refreshing mission queue...');
        this.updateMissionQueue();
    }

    // System monitoring
    toggleAlerts() {
        alert('System alerts panel would open here.');
    }

    exportLogs() {
        alert('System logs export initiated. Download will begin shortly.');
    }
}

// Global functions for onclick handlers
function triggerEmergency() {
    window.operationsSystem.triggerEmergency();
}

function toggleUserMenu() {
    window.operationsSystem.toggleUserMenu();
}

function logout() {
    window.operationsSystem.logout();
}

function openMissionPlanner() {
    window.operationsSystem.openMissionPlanner();
}

function closeMissionPlanner() {
    window.operationsSystem.closeMissionPlanner();
}

function scheduleMission() {
    window.operationsSystem.scheduleMission();
}

function toggleAutoPilot() {
    window.operationsSystem.toggleAutoPilot();
}

function emergencyLanding() {
    window.operationsSystem.emergencyLanding();
}

function sendMessage() {
    window.operationsSystem.sendMessage();
}

function sendQuickMessage(message) {
    window.operationsSystem.sendQuickMessage(message);
}

function handleCommKeyPress(event) {
    window.operationsSystem.handleCommKeyPress(event);
}

function centerMap() {
    window.operationsSystem.centerMap();
}

function toggleLayers() {
    window.operationsSystem.toggleLayers();
}

function toggleTraffic() {
    window.operationsSystem.toggleTraffic();
}

function changeMapView(view) {
    window.operationsSystem.changeMapView(view);
}

function trackDrone(droneId) {
    window.operationsSystem.trackDrone(droneId);
}

function communicateWithDrone(droneId) {
    window.operationsSystem.communicateWithDrone(droneId);
}

function deployDrone(droneId) {
    window.operationsSystem.deployDrone(droneId);
}

function maintenanceDrone(droneId) {
    window.operationsSystem.maintenanceDrone(droneId);
}

function checkDroneHealth(droneId) {
    window.operationsSystem.checkDroneHealth(droneId);
}

function executeImmediate(missionId) {
    window.operationsSystem.executeImmediate(missionId);
}

function modifyMission(missionId) {
    window.operationsSystem.modifyMission(missionId);
}

function delayMission(missionId) {
    window.operationsSystem.delayMission(missionId);
}

function refreshQueue() {
    window.operationsSystem.refreshQueue();
}

function toggleAlerts() {
    window.operationsSystem.toggleAlerts();
}

function exportLogs() {
    window.operationsSystem.exportLogs();
}

// Initialize operations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.operationsSystem = new OperationsSystem();
});

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userProfile = document.querySelector('.user-profile');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfile && userDropdown && !userProfile.contains(e.target)) {
        userDropdown.classList.remove('show');
    }
});

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
