// Deploy Page Script
class DeploySystem {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    init() {
        this.updateMissionSummary();
        this.initializeTemperatureGauge();
        this.setupPreflightChecks();
        console.log('MEDONE Deploy system initialized');
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

    setupEventListeners() {
        // Mission type selection
        document.querySelectorAll('.mission-type-card').forEach(card => {
            card.addEventListener('click', () => this.selectMissionType(card));
        });

        // Priority selection
        document.querySelectorAll('.priority-option').forEach(option => {
            option.addEventListener('click', () => this.selectPriority(option));
        });

        // Payload type selection
        document.querySelectorAll('.payload-type').forEach(type => {
            type.addEventListener('click', () => this.selectPayloadType(type));
        });

        // Temperature presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTemperaturePreset(btn));
        });

        // Hospital selection
        const hospitalSelect = document.getElementById('hospitalSelect');
        if (hospitalSelect) {
            hospitalSelect.addEventListener('change', () => this.updateHospitalInfo());
        }

        // Payload inputs
        document.getElementById('payloadWeight')?.addEventListener('input', () => this.updateMissionSummary());
        document.getElementById('targetTemperature')?.addEventListener('input', () => this.updateTemperatureGauge());

        // Checklist items
        document.querySelectorAll('.check-input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateChecklistProgress());
        });

        // Authorization
        document.getElementById('missionConfirm')?.addEventListener('change', () => this.updateLaunchButton());
        document.getElementById('authCode')?.addEventListener('input', () => this.updateLaunchButton());

        // Launch button
        document.getElementById('launchButton')?.addEventListener('click', () => this.launchMission());

        // User menu
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
    }

    selectMissionType(selectedCard) {
        // Remove active class from all cards
        document.querySelectorAll('.mission-type-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to selected card
        selectedCard.classList.add('active');
        
        // Update mission summary
        const missionType = selectedCard.querySelector('h4').textContent;
        document.getElementById('summaryType').textContent = missionType;
        
        this.updateMissionSummary();
    }

    selectPriority(selectedOption) {
        // Remove active class from all options
        document.querySelectorAll('.priority-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected option
        selectedOption.classList.add('active');
        
        // Update mission summary
        const priority = selectedOption.querySelector('span').textContent;
        const summaryPriority = document.getElementById('summaryPriority');
        summaryPriority.textContent = priority;
        summaryPriority.className = `value priority-${selectedOption.dataset.priority}`;
        
        this.updateMissionSummary();
    }

    selectPayloadType(selectedType) {
        // Remove active class from all types
        document.querySelectorAll('.payload-type').forEach(type => {
            type.classList.remove('active');
        });
        
        // Add active class to selected type
        selectedType.classList.add('active');
        
        // Update mission summary
        const payloadType = selectedType.querySelector('span').textContent;
        const weight = document.getElementById('payloadWeight').value;
        document.getElementById('summaryPayload').textContent = `${payloadType} (${weight}kg)`;
        
        this.updateMissionSummary();
    }

    setTemperaturePreset(selectedBtn) {
        // Remove active class from all presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected preset
        selectedBtn.classList.add('active');
        
        // Set temperature
        const temp = selectedBtn.dataset.temp;
        document.getElementById('targetTemperature').value = temp;
        
        this.updateTemperatureGauge();
    }

    updateHospitalInfo() {
        const hospitalSelect = document.getElementById('hospitalSelect');
        const selectedValue = hospitalSelect.value;
        
        // Hospital data
        const hospitalData = {
            dmch: {
                name: 'Dhaka Medical College Hospital',
                distance: '8.2 km',
                flightTime: '6.2 min',
                landingPad: 'Helipad A'
            },
            bsmmu: {
                name: 'BSMMU Hospital',
                distance: '7.5 km',
                flightTime: '5.8 min',
                landingPad: 'Rooftop Pad'
            },
            nicvd: {
                name: 'NICVD',
                distance: '9.1 km',
                flightTime: '7.2 min',
                landingPad: 'Emergency Pad'
            },
            square: {
                name: 'Square Hospital',
                distance: '6.8 km',
                flightTime: '5.2 min',
                landingPad: 'Helipad B'
            }
        };
        
        if (selectedValue && hospitalData[selectedValue]) {
            const data = hospitalData[selectedValue];
            document.getElementById('hospitalDistance').textContent = data.distance;
            document.getElementById('flightTime').textContent = data.flightTime;
            document.getElementById('landingPad').textContent = data.landingPad;
            document.getElementById('summaryDestination').textContent = data.name;
            document.getElementById('summaryFlightTime').textContent = data.flightTime;
            
            // Update estimated arrival
            const now = new Date();
            const flightMinutes = parseFloat(data.flightTime);
            const arrival = new Date(now.getTime() + flightMinutes * 60000);
            document.getElementById('summaryArrival').textContent = arrival.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    initializeTemperatureGauge() {
        this.updateTemperatureGauge();
    }

    updateTemperatureGauge() {
        const tempInput = document.getElementById('targetTemperature');
        const currentTempDisplay = document.getElementById('currentTemp');
        const tempNeedle = document.getElementById('tempNeedle');
        
        if (tempInput && currentTempDisplay) {
            const temperature = parseFloat(tempInput.value);
            currentTempDisplay.textContent = `${temperature}°C`;
            
            // Update needle position (simplified)
            if (tempNeedle) {
                const angle = ((temperature + 20) / 45) * 360; // Map -20 to 25°C to 0-360°
                tempNeedle.style.transform = `rotate(${angle}deg)`;
            }
        }
    }

    setupPreflightChecks() {
        // Auto-check some items after a delay to simulate system checks
        setTimeout(() => {
            const autoCheckItems = ['battery', 'gps', 'communication', 'sensors'];
            autoCheckItems.forEach((checkId, index) => {
                setTimeout(() => {
                    const checkbox = document.querySelector(`[data-check="${checkId}"] .check-input`);
                    if (checkbox) {
                        checkbox.checked = true;
                        this.updateChecklistProgress();
                    }
                }, index * 500);
            });
        }, 1000);
    }

    updateChecklistProgress() {
        const checkboxes = document.querySelectorAll('.check-input');
        const checkedBoxes = document.querySelectorAll('.check-input:checked');
        const progress = checkedBoxes.length;
        const total = checkboxes.length;
        
        document.getElementById('checklistProgress').textContent = progress;
        
        // Update launch button availability
        this.updateLaunchButton();
    }

    updateLaunchButton() {
        const launchButton = document.getElementById('launchButton');
        const authCode = document.getElementById('authCode').value;
        const missionConfirm = document.getElementById('missionConfirm').checked;
        const checkedBoxes = document.querySelectorAll('.check-input:checked');
        const totalBoxes = document.querySelectorAll('.check-input');
        
        const allChecksComplete = checkedBoxes.length === totalBoxes.length;
        const authValid = authCode === 'MEDONE2025';
        const confirmed = missionConfirm;
        
        if (allChecksComplete && authValid && confirmed) {
            launchButton.disabled = false;
            launchButton.style.opacity = '1';
        } else {
            launchButton.disabled = true;
            launchButton.style.opacity = '0.5';
        }
    }

    updateMissionSummary() {
        // This method is called when mission parameters change
        // Summary is updated in real-time by individual selection methods
        console.log('Mission summary updated');
    }

    launchMission() {
        // Show launch confirmation
        const confirmation = confirm('Are you sure you want to launch this mission? This action cannot be undone.');
        
        if (confirmation) {
            this.executeLaunch();
        }
    }

    executeLaunch() {
        const launchButton = document.getElementById('launchButton');
        
        // Update button to show launching state
        launchButton.innerHTML = `
            <div class="launch-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="launch-text">
                <span class="primary">Launching...</span>
                <span class="secondary">Initializing systems</span>
            </div>
        `;
        
        // Simulate launch sequence
        setTimeout(() => {
            launchButton.innerHTML = `
                <div class="launch-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="launch-text">
                    <span class="primary">Mission Launched</span>
                    <span class="secondary">Drone deployed successfully</span>
                </div>
            `;
            
            // Show success message
            this.showLaunchSuccess();
        }, 3000);
    }

    showLaunchSuccess() {
        // Create success overlay
        const successOverlay = document.createElement('div');
        successOverlay.innerHTML = `
            <div class="launch-success-content">
                <div class="success-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h2>Mission Launched Successfully!</h2>
                <p>Drone MED-07 has been deployed and is en route to the destination.</p>
                <div class="mission-tracking">
                    <div class="tracking-item">
                        <span class="label">Mission ID:</span>
                        <span class="value">MED-${Date.now().toString().slice(-6)}</span>
                    </div>
                    <div class="tracking-item">
                        <span class="label">Estimated Arrival:</span>
                        <span class="value">${document.getElementById('summaryArrival').textContent}</span>
                    </div>
                    <div class="tracking-item">
                        <span class="label">Status:</span>
                        <span class="value status-active">En Route</span>
                    </div>
                </div>
                <div class="success-actions">
                    <button class="btn-track-mission" onclick="window.location.href='operations.html'">
                        <i class="fas fa-satellite"></i> Track Mission
                    </button>
                    <button class="btn-new-mission" onclick="window.location.reload()">
                        <i class="fas fa-plus"></i> New Mission
                    </button>
                    <button class="btn-dashboard" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </button>
                </div>
            </div>
        `;
        
        successOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        const style = document.createElement('style');
        style.textContent = `
            .launch-success-content {
                background: linear-gradient(135deg, #0f0f23, #1a1a2e);
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                color: white;
                border: 1px solid #667eea;
            }
            .success-icon {
                font-size: 4rem;
                color: #10b981;
                margin-bottom: 1rem;
                animation: bounce 1s infinite;
            }
            .launch-success-content h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #10b981;
            }
            .launch-success-content p {
                margin-bottom: 2rem;
                color: #a0a0a0;
            }
            .mission-tracking {
                background: rgba(102, 126, 234, 0.1);
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            .tracking-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            .tracking-item:last-child {
                margin-bottom: 0;
            }
            .tracking-item .label {
                color: #a0a0a0;
            }
            .tracking-item .value {
                font-weight: 600;
                color: white;
            }
            .status-active {
                color: #10b981 !important;
            }
            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn-track-mission, .btn-new-mission, .btn-dashboard {
                background: #667eea;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }
            .btn-track-mission:hover, .btn-new-mission:hover, .btn-dashboard:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(successOverlay);

        // Log mission launch
        console.log('Mission launched successfully at:', new Date().toISOString());
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
            window.location.href = 'operations.html';
        }
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
    if (window.deploySystem) {
        window.deploySystem.toggleUserMenu();
    }
}

function triggerEmergency() {
    if (window.deploySystem) {
        window.deploySystem.triggerEmergency();
    }
}

function logout() {
    if (window.deploySystem) {
        window.deploySystem.logout();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.deploySystem = new DeploySystem();
});
