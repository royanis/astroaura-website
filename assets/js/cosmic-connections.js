/**
 * Cosmic Connections - Compatibility-based Community Matching
 * Privacy-first approach to connecting compatible souls through astrology
 */

class CosmicConnections {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.connections = this.loadConnections();
        this.groups = this.loadGroups();
        this.myConnections = this.loadMyConnections();
        this.currentTab = 'suggestions';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initTabs();
        this.renderCurrentTab();
        this.checkProfileStatus();
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('findConnectionsBtn')?.addEventListener('click', () => this.handleFindConnections());
        document.getElementById('privacySettingsBtn')?.addEventListener('click', () => this.showPrivacySettings());

        // Modal controls
        document.getElementById('closeSetupBtn')?.addEventListener('click', () => this.hideConnectionSetup());
        document.getElementById('closePrivacyBtn')?.addEventListener('click', () => this.hidePrivacySettings());
        document.getElementById('cancelSetupBtn')?.addEventListener('click', () => this.hideConnectionSetup());

        // Form submissions
        document.getElementById('connectionSetupForm')?.addEventListener('submit', (e) => this.handleSetupSubmit(e));

        // Privacy controls
        document.querySelectorAll('input[name="visibility"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleVisibilityChange(e));
        });

        // Privacy settings controls
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportUserData());
        document.getElementById('deleteProfileBtn')?.addEventListener('click', () => this.deleteUserProfile());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Filters
        document.getElementById('compatibilityFilter')?.addEventListener('change', () => this.filterSuggestions());
        document.getElementById('connectionTypeFilter')?.addEventListener('change', () => this.filterSuggestions());
    }

    checkProfileStatus() {
        if (!this.userProfile) {
            // Show setup prompt
            this.showSetupPrompt();
        } else {
            // Generate suggestions based on profile
            this.generateSuggestions();
        }
    }

    showSetupPrompt() {
        const suggestionsTab = document.getElementById('suggestionsTab');
        if (suggestionsTab) {
            suggestionsTab.innerHTML = `
                <div class="setup-prompt">
                    <div class="prompt-icon">🌟</div>
                    <h3>Create Your Cosmic Profile</h3>
                    <p>To find compatible connections, we need to understand your astrological profile and interests.</p>
                    <p>All information remains private and is used only for compatibility calculations.</p>
                    <button class="btn btn-primary" onclick="cosmicConnections.showConnectionSetup()">
                        Get Started
                    </button>
                </div>
            `;
        }
    }

    handleFindConnections() {
        if (!this.userProfile) {
            this.showConnectionSetup();
        } else {
            this.generateSuggestions();
            this.switchTab('suggestions');
        }
    }

    showConnectionSetup() {
        document.getElementById('connectionSetup').style.display = 'flex';
        document.getElementById('birthDate').focus();
    }

    hideConnectionSetup() {
        document.getElementById('connectionSetup').style.display = 'none';
        document.getElementById('connectionSetupForm').reset();
        document.getElementById('cosmicNameInput').style.display = 'none';
    }

    showPrivacySettings() {
        document.getElementById('privacySettings').style.display = 'flex';
        this.loadPrivacySettings();
    }

    hidePrivacySettings() {
        document.getElementById('privacySettings').style.display = 'none';
    }

    handleVisibilityChange(event) {
        const cosmicNameInput = document.getElementById('cosmicNameInput');
        if (event.target.value === 'cosmic-name') {
            cosmicNameInput.style.display = 'block';
            document.getElementById('cosmicName').focus();
        } else {
            cosmicNameInput.style.display = 'none';
        }
    }

    handleSetupSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const connectionTypes = Array.from(document.querySelectorAll('input[name="connectionType"]:checked')).map(cb => cb.value);
        const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
        const visibility = document.querySelector('input[name="visibility"]:checked').value;
        
        if (connectionTypes.length === 0) {
            this.showNotification('Please select at least one connection type.', 'warning');
            return;
        }
        
        if (interests.length === 0) {
            this.showNotification('Please select at least one interest.', 'warning');
            return;
        }

        const profile = {
            id: this.generateId(),
            birthDate: document.getElementById('birthDate').value,
            birthTime: document.getElementById('birthTime').value,
            birthLocation: document.getElementById('birthLocation').value,
            connectionTypes: connectionTypes,
            interests: interests,
            visibility: visibility,
            cosmicName: visibility === 'cosmic-name' ? document.getElementById('cosmicName').value : null,
            createdAt: new Date().toISOString(),
            settings: {
                allowConnections: true,
                showCompatibility: true,
                allowMessages: false
            }
        };

        // Generate birth chart data (simplified)
        profile.birthChart = this.generateBirthChart(profile.birthDate, profile.birthTime, profile.birthLocation);
        
        this.saveUserProfile(profile);
        this.hideConnectionSetup();
        this.generateSuggestions();
        this.renderCurrentTab();
        this.showNotification('Your cosmic profile has been created! Finding compatible connections...', 'success');
    }

    generateBirthChart(birthDate, birthTime, birthLocation) {
        // Simplified birth chart generation for demo purposes
        // In a real implementation, this would use astronomical calculations
        const date = new Date(birthDate);
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const elements = ['Fire', 'Earth', 'Air', 'Water'];
        const qualities = ['Cardinal', 'Fixed', 'Mutable'];
        
        return {
            sunSign: signs[Math.floor(dayOfYear / 30.4) % 12],
            moonSign: signs[(Math.floor(dayOfYear / 30.4) + 3) % 12],
            risingSign: birthTime ? signs[(Math.floor(dayOfYear / 30.4) + 6) % 12] : null,
            element: elements[Math.floor(dayOfYear / 91.25) % 4],
            quality: qualities[Math.floor(dayOfYear / 121.67) % 3],
            dominantPlanet: this.getDominantPlanet(dayOfYear),
            houses: this.generateHouses(dayOfYear)
        };
    }

    getDominantPlanet(dayOfYear) {
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        return planets[dayOfYear % planets.length];
    }

    generateHouses(dayOfYear) {
        const houses = {};
        for (let i = 1; i <= 12; i++) {
            houses[i] = {
                sign: Math.floor((dayOfYear + i * 30) / 30.4) % 12,
                planets: []
            };
        }
        return houses;
    }

    generateSuggestions() {
        if (!this.userProfile) return;

        // Generate compatible connections based on astrological compatibility
        const suggestions = this.getSampleConnections().map(connection => {
            const compatibility = this.calculateCompatibility(this.userProfile.birthChart, connection.birthChart);
            return {
                ...connection,
                compatibility: compatibility,
                compatibilityScore: compatibility.overall,
                matchingInterests: this.getMatchingInterests(this.userProfile.interests, connection.interests),
                matchingConnectionTypes: this.getMatchingConnectionTypes(this.userProfile.connectionTypes, connection.connectionTypes)
            };
        }).filter(connection => {
            // Only show connections with matching connection types and some compatibility
            return connection.matchingConnectionTypes.length > 0 && connection.compatibilityScore >= 40;
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        this.connections = suggestions;
        this.saveConnections();
    }

    calculateCompatibility(userChart, connectionChart) {
        // Simplified compatibility calculation
        let sunCompatibility = this.getSignCompatibility(userChart.sunSign, connectionChart.sunSign);
        let moonCompatibility = this.getSignCompatibility(userChart.moonSign, connectionChart.moonSign);
        let elementCompatibility = this.getElementCompatibility(userChart.element, connectionChart.element);
        let qualityCompatibility = this.getQualityCompatibility(userChart.quality, connectionChart.quality);
        
        const overall = Math.round((sunCompatibility + moonCompatibility + elementCompatibility + qualityCompatibility) / 4);
        
        return {
            overall: overall,
            sun: sunCompatibility,
            moon: moonCompatibility,
            element: elementCompatibility,
            quality: qualityCompatibility,
            aspects: this.calculateAspects(userChart, connectionChart)
        };
    }

    getSignCompatibility(sign1, sign2) {
        const compatibilityMatrix = {
            'Aries': { 'Leo': 95, 'Sagittarius': 90, 'Gemini': 85, 'Aquarius': 80, 'Aries': 75 },
            'Taurus': { 'Virgo': 95, 'Capricorn': 90, 'Cancer': 85, 'Pisces': 80, 'Taurus': 75 },
            'Gemini': { 'Libra': 95, 'Aquarius': 90, 'Aries': 85, 'Leo': 80, 'Gemini': 75 },
            'Cancer': { 'Scorpio': 95, 'Pisces': 90, 'Taurus': 85, 'Virgo': 80, 'Cancer': 75 },
            'Leo': { 'Aries': 95, 'Sagittarius': 90, 'Gemini': 85, 'Libra': 80, 'Leo': 75 },
            'Virgo': { 'Taurus': 95, 'Capricorn': 90, 'Cancer': 85, 'Scorpio': 80, 'Virgo': 75 },
            'Libra': { 'Gemini': 95, 'Aquarius': 90, 'Leo': 85, 'Sagittarius': 80, 'Libra': 75 },
            'Scorpio': { 'Cancer': 95, 'Pisces': 90, 'Virgo': 85, 'Capricorn': 80, 'Scorpio': 75 },
            'Sagittarius': { 'Aries': 95, 'Leo': 90, 'Libra': 85, 'Aquarius': 80, 'Sagittarius': 75 },
            'Capricorn': { 'Taurus': 95, 'Virgo': 90, 'Scorpio': 85, 'Pisces': 80, 'Capricorn': 75 },
            'Aquarius': { 'Gemini': 95, 'Libra': 90, 'Sagittarius': 85, 'Aries': 80, 'Aquarius': 75 },
            'Pisces': { 'Cancer': 95, 'Scorpio': 90, 'Capricorn': 85, 'Taurus': 80, 'Pisces': 75 }
        };
        
        return compatibilityMatrix[sign1]?.[sign2] || 50;
    }

    getElementCompatibility(element1, element2) {
        const elementCompatibility = {
            'Fire': { 'Fire': 80, 'Air': 90, 'Earth': 60, 'Water': 50 },
            'Earth': { 'Earth': 80, 'Water': 90, 'Fire': 60, 'Air': 50 },
            'Air': { 'Air': 80, 'Fire': 90, 'Water': 60, 'Earth': 50 },
            'Water': { 'Water': 80, 'Earth': 90, 'Air': 60, 'Fire': 50 }
        };
        
        return elementCompatibility[element1]?.[element2] || 60;
    }

    getQualityCompatibility(quality1, quality2) {
        const qualityCompatibility = {
            'Cardinal': { 'Cardinal': 70, 'Fixed': 85, 'Mutable': 75 },
            'Fixed': { 'Fixed': 70, 'Mutable': 85, 'Cardinal': 75 },
            'Mutable': { 'Mutable': 70, 'Cardinal': 85, 'Fixed': 75 }
        };
        
        return qualityCompatibility[quality1]?.[quality2] || 70;
    }

    calculateAspects(userChart, connectionChart) {
        // Simplified aspect calculation
        return {
            harmonious: Math.floor(Math.random() * 5) + 2,
            challenging: Math.floor(Math.random() * 3) + 1,
            neutral: Math.floor(Math.random() * 4) + 2
        };
    }

    getMatchingInterests(userInterests, connectionInterests) {
        return userInterests.filter(interest => connectionInterests.includes(interest));
    }

    getMatchingConnectionTypes(userTypes, connectionTypes) {
        return userTypes.filter(type => connectionTypes.includes(type));
    }

    getSampleConnections() {
        return [
            {
                id: 'conn1',
                name: 'Luna Starweaver',
                visibility: 'cosmic-name',
                connectionTypes: ['friendship', 'learning'],
                interests: ['astrology', 'moon-phases', 'meditation', 'crystals'],
                birthChart: {
                    sunSign: 'Pisces',
                    moonSign: 'Cancer',
                    risingSign: 'Scorpio',
                    element: 'Water',
                    quality: 'Mutable',
                    dominantPlanet: 'Neptune'
                },
                joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'conn2',
                name: 'Solar Phoenix',
                visibility: 'cosmic-name',
                connectionTypes: ['friendship', 'mentorship'],
                interests: ['astrology', 'tarot', 'manifestation', 'chakras'],
                birthChart: {
                    sunSign: 'Leo',
                    moonSign: 'Aries',
                    risingSign: 'Sagittarius',
                    element: 'Fire',
                    quality: 'Fixed',
                    dominantPlanet: 'Sun'
                },
                joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'conn3',
                name: 'Cosmic Wanderer',
                visibility: 'anonymous',
                connectionTypes: ['learning', 'support'],
                interests: ['numerology', 'meditation', 'moon-phases', 'manifestation'],
                birthChart: {
                    sunSign: 'Gemini',
                    moonSign: 'Aquarius',
                    risingSign: 'Libra',
                    element: 'Air',
                    quality: 'Mutable',
                    dominantPlanet: 'Mercury'
                },
                joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'suggestions':
                this.renderSuggestions();
                break;
            case 'groups':
                this.renderGroups();
                break;
            case 'my-connections':
                this.renderMyConnections();
                break;
        }
    }

    renderSuggestions() {
        const container = document.getElementById('suggestionsList');
        if (!container) return;

        if (!this.userProfile) {
            this.showSetupPrompt();
            return;
        }

        const filteredConnections = this.getFilteredSuggestions();
        
        if (filteredConnections.length === 0) {
            container.innerHTML = this.getEmptyState('suggestions');
            return;
        }

        container.innerHTML = filteredConnections.map(connection => this.renderConnection(connection)).join('');
        this.bindConnectionEvents();
    }

    renderConnection(connection) {
        const compatibilityClass = this.getCompatibilityClass(connection.compatibilityScore);
        const formattedDate = this.formatDate(new Date(connection.lastActive));
        
        return `
            <div class="connection-card" data-connection-id="${connection.id}">
                <div class="connection-header">
                    <div class="connection-info">
                        <div class="connection-name">${this.escapeHtml(connection.name)}</div>
                        <div class="connection-type">${this.getConnectionTypeLabel(connection.matchingConnectionTypes[0])}</div>
                        <div class="connection-interests">
                            ${connection.matchingInterests.map(interest => 
                                `<span class="interest-tag">${this.getInterestLabel(interest)}</span>`
                            ).join('')}
                        </div>
                        <div class="last-active">Last active: ${formattedDate}</div>
                    </div>
                    <div class="compatibility-score">
                        <div class="score-circle ${compatibilityClass}">
                            ${connection.compatibilityScore}%
                        </div>
                        <div class="score-label">Compatibility</div>
                    </div>
                </div>
                
                <div class="compatibility-details">
                    <div class="compatibility-aspects">
                        <div class="aspect-item">
                            <span class="aspect-name">Sun Signs</span>
                            <span class="aspect-score">${connection.compatibility.sun}%</span>
                        </div>
                        <div class="aspect-item">
                            <span class="aspect-name">Moon Signs</span>
                            <span class="aspect-score">${connection.compatibility.moon}%</span>
                        </div>
                        <div class="aspect-item">
                            <span class="aspect-name">Elements</span>
                            <span class="aspect-score">${connection.compatibility.element}%</span>
                        </div>
                        <div class="aspect-item">
                            <span class="aspect-name">Qualities</span>
                            <span class="aspect-score">${connection.compatibility.quality}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="connection-actions">
                    <button class="action-btn secondary" data-action="view-profile">View Profile</button>
                    <button class="action-btn primary" data-action="connect">Connect</button>
                </div>
            </div>
        `;
    }

    renderGroups() {
        const container = document.getElementById('groupsList');
        if (!container) return;

        const groups = this.getSampleGroups();
        
        container.innerHTML = groups.map(group => this.renderGroup(group)).join('');
        this.bindGroupEvents();
    }

    renderGroup(group) {
        return `
            <div class="group-card" data-group-id="${group.id}">
                <div class="group-header">
                    <div class="group-name">${this.escapeHtml(group.name)}</div>
                    <div class="group-topic">${this.getInterestLabel(group.topic)}</div>
                </div>
                
                <div class="group-stats">
                    <div class="stat">
                        <span class="stat-icon">👥</span>
                        <span class="stat-count">${group.memberCount} members</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-count">${group.averageCompatibility}% avg compatibility</span>
                    </div>
                </div>
                
                <div class="group-description">${this.escapeHtml(group.description)}</div>
                
                <div class="group-actions">
                    <button class="join-btn" data-action="join-group">Join Group</button>
                    <button class="info-btn" data-action="group-info">ℹ️</button>
                </div>
            </div>
        `;
    }

    renderMyConnections() {
        const container = document.getElementById('myConnectionsList');
        if (!container) return;

        if (this.myConnections.length === 0) {
            container.innerHTML = this.getEmptyState('my-connections');
            return;
        }

        container.innerHTML = this.myConnections.map(connection => this.renderMyConnection(connection)).join('');
    }

    renderMyConnection(connection) {
        const formattedDate = this.formatDate(new Date(connection.connectedAt));
        
        return `
            <div class="connection-card" data-connection-id="${connection.id}">
                <div class="connection-header">
                    <div class="connection-info">
                        <div class="connection-name">${this.escapeHtml(connection.name)}</div>
                        <div class="connection-type">${this.getConnectionTypeLabel(connection.connectionType)}</div>
                        <div class="connection-status">Connected ${formattedDate}</div>
                    </div>
                </div>
                
                <div class="connection-actions">
                    <button class="action-btn secondary" data-action="message">Message</button>
                    <button class="action-btn secondary" data-action="view-compatibility">View Compatibility</button>
                </div>
            </div>
        `;
    }

    getSampleGroups() {
        return [
            {
                id: 'group1',
                name: 'Moon Phase Manifesters',
                topic: 'moon-phases',
                memberCount: 24,
                averageCompatibility: 78,
                description: 'A supportive community for those who work with lunar energy for manifestation and personal growth.'
            },
            {
                id: 'group2',
                name: 'Astrology Study Circle',
                topic: 'astrology',
                memberCount: 45,
                averageCompatibility: 82,
                description: 'Learn and discuss astrological concepts with fellow enthusiasts. From beginners to advanced practitioners.'
            },
            {
                id: 'group3',
                name: 'Crystal Healing Collective',
                topic: 'crystals',
                memberCount: 18,
                averageCompatibility: 75,
                description: 'Share experiences and knowledge about crystal healing, energy work, and mineral consciousness.'
            }
        ];
    }

    bindConnectionEvents() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const connectionId = e.target.closest('.connection-card').dataset.connectionId;
                this.handleConnectionAction(action, connectionId);
            });
        });
    }

    bindGroupEvents() {
        document.querySelectorAll('.join-btn, .info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const groupId = e.target.closest('.group-card').dataset.groupId;
                this.handleGroupAction(action, groupId);
            });
        });
    }

    handleConnectionAction(action, connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (!connection) return;

        switch (action) {
            case 'connect':
                this.connectWithUser(connection);
                break;
            case 'view-profile':
                this.viewConnectionProfile(connection);
                break;
            case 'message':
                this.messageConnection(connection);
                break;
            case 'view-compatibility':
                this.viewCompatibilityDetails(connection);
                break;
        }
    }

    handleGroupAction(action, groupId) {
        switch (action) {
            case 'join-group':
                this.joinGroup(groupId);
                break;
            case 'group-info':
                this.showGroupInfo(groupId);
                break;
        }
    }

    connectWithUser(connection) {
        // Add to my connections
        const newConnection = {
            ...connection,
            connectedAt: new Date().toISOString(),
            connectionType: connection.matchingConnectionTypes[0]
        };
        
        this.myConnections.push(newConnection);
        this.saveMyConnections();
        
        // Remove from suggestions
        this.connections = this.connections.filter(c => c.id !== connection.id);
        this.saveConnections();
        
        this.showNotification(`Connected with ${connection.name}! You can now message each other.`, 'success');
        this.renderCurrentTab();
    }

    getFilteredSuggestions() {
        const compatibilityFilter = document.getElementById('compatibilityFilter')?.value;
        const connectionTypeFilter = document.getElementById('connectionTypeFilter')?.value;
        
        return this.connections.filter(connection => {
            const compatibilityMatch = this.matchesCompatibilityFilter(connection.compatibilityScore, compatibilityFilter);
            const typeMatch = !connectionTypeFilter || connection.matchingConnectionTypes.includes(connectionTypeFilter);
            return compatibilityMatch && typeMatch;
        });
    }

    matchesCompatibilityFilter(score, filter) {
        switch (filter) {
            case 'high': return score >= 80;
            case 'medium': return score >= 60 && score < 80;
            case 'low': return score >= 40 && score < 60;
            default: return true;
        }
    }

    filterSuggestions() {
        this.renderSuggestions();
    }

    // Data management
    loadUserProfile() {
        try {
            const stored = localStorage.getItem('cosmicConnectionsProfile');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading user profile:', error);
            return null;
        }
    }

    saveUserProfile(profile) {
        try {
            this.userProfile = profile;
            localStorage.setItem('cosmicConnectionsProfile', JSON.stringify(profile));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    loadConnections() {
        try {
            const stored = localStorage.getItem('cosmicConnectionsSuggestions');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading connections:', error);
            return [];
        }
    }

    saveConnections() {
        try {
            localStorage.setItem('cosmicConnectionsSuggestions', JSON.stringify(this.connections));
        } catch (error) {
            console.error('Error saving connections:', error);
        }
    }

    loadMyConnections() {
        try {
            const stored = localStorage.getItem('cosmicMyConnections');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading my connections:', error);
            return [];
        }
    }

    saveMyConnections() {
        try {
            localStorage.setItem('cosmicMyConnections', JSON.stringify(this.myConnections));
        } catch (error) {
            console.error('Error saving my connections:', error);
        }
    }

    loadGroups() {
        return this.getSampleGroups();
    }

    exportUserData() {
        const data = {
            profile: this.userProfile,
            connections: this.myConnections,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cosmic-connections-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Your data has been exported successfully.', 'success');
    }

    deleteUserProfile() {
        if (!confirm('Are you sure you want to delete your cosmic profile? This action cannot be undone.')) {
            return;
        }
        
        localStorage.removeItem('cosmicConnectionsProfile');
        localStorage.removeItem('cosmicConnectionsSuggestions');
        localStorage.removeItem('cosmicMyConnections');
        
        this.userProfile = null;
        this.connections = [];
        this.myConnections = [];
        
        this.hidePrivacySettings();
        this.showNotification('Your profile has been deleted.', 'info');
        this.checkProfileStatus();
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getCompatibilityClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    getConnectionTypeLabel(type) {
        const labels = {
            'friendship': 'Cosmic Friendship',
            'learning': 'Learning Partner',
            'mentorship': 'Mentorship',
            'support': 'Spiritual Support'
        };
        return labels[type] || type;
    }

    getInterestLabel(interest) {
        const labels = {
            'astrology': 'Astrology',
            'tarot': 'Tarot',
            'meditation': 'Meditation',
            'crystals': 'Crystals',
            'numerology': 'Numerology',
            'moon-phases': 'Moon Phases',
            'chakras': 'Chakras',
            'manifestation': 'Manifestation'
        };
        return labels[interest] || interest;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getEmptyState(type) {
        const states = {
            'suggestions': `
                <div class="empty-state">
                    <div class="empty-icon">🌟</div>
                    <div class="empty-message">No compatible connections found</div>
                    <div class="empty-subtitle">Try adjusting your filters or check back later for new members</div>
                </div>
            `,
            'my-connections': `
                <div class="empty-state">
                    <div class="empty-icon">🤝</div>
                    <div class="empty-message">No connections yet</div>
                    <div class="empty-subtitle">Start connecting with compatible cosmic souls in the Suggestions tab</div>
                </div>
            `
        };
        return states[type] || '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            warning: '#ffd700',
            info: '#4a90e2'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
let cosmicConnections;
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.cosmic-connections-container')) {
        cosmicConnections = new CosmicConnections();
    }
});