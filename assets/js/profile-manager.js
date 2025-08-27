/**
 * Profile Manager
 * Handles the profile management interface and user interactions
 */

class ProfileManager {
  constructor() {
    this.userProfile = window.userProfile;
    this.currentTab = 'overview';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadProfileData();
    this.setupLocationSearch();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Profile form handlers
    document.getElementById('updateBirthChart').addEventListener('click', () => {
      this.updateBirthChart();
    });

    document.getElementById('clearBirthChart').addEventListener('click', () => {
      this.clearBirthChart();
    });

    // Preferences handlers
    document.getElementById('savePreferences').addEventListener('click', () => {
      this.savePreferences();
    });

    document.getElementById('resetPreferences').addEventListener('click', () => {
      this.resetPreferences();
    });

    // Privacy handlers
    document.getElementById('giveConsent').addEventListener('click', () => {
      this.giveConsent();
    });

    document.getElementById('revokeConsent').addEventListener('click', () => {
      this.revokeConsent();
    });

    document.getElementById('savePrivacySettings').addEventListener('click', () => {
      this.savePrivacySettings();
    });

    // Data management handlers
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('selectImportFile').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.handleFileSelect(e);
    });

    document.getElementById('importData').addEventListener('click', () => {
      this.importData();
    });

    document.getElementById('clearAllData').addEventListener('click', () => {
      this.clearAllData();
    });

    // Avatar change
    document.getElementById('changeAvatar').addEventListener('click', () => {
      this.changeAvatar();
    });

    // Real-time preference updates
    this.setupPreferenceListeners();
  }

  setupPreferenceListeners() {
    // Theme change
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    // Font size change
    document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
      this.applyFontSize(e.target.value);
    });

    // Accessibility options
    document.getElementById('reducedMotion').addEventListener('change', (e) => {
      this.applyReducedMotion(e.target.checked);
    });

    document.getElementById('highContrast').addEventListener('change', (e) => {
      this.applyHighContrast(e.target.checked);
    });
  }

  setupLocationSearch() {
    const locationInput = document.getElementById('profileBirthLocation');
    const suggestions = document.getElementById('profileLocationSuggestions');

    locationInput.addEventListener('input', () => {
      this.searchLocations(locationInput.value, suggestions);
    });
  }

  // Tab Management
  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    this.currentTab = tabName;

    // Load tab-specific data
    this.loadTabData(tabName);
  }

  loadTabData(tabName) {
    switch (tabName) {
      case 'overview':
        this.loadOverviewData();
        break;
      case 'birth-chart':
        this.loadBirthChartData();
        break;
      case 'preferences':
        this.loadPreferencesData();
        break;
      case 'privacy':
        this.loadPrivacyData();
        break;
      case 'data':
        this.loadDataManagementData();
        break;
    }
  }

  // Profile Data Loading
  loadProfileData() {
    this.loadOverviewData();
  }

  loadOverviewData() {
    const profile = this.userProfile.getProfile();
    const preferences = this.userProfile.getPreferences();

    // Update profile header
    document.getElementById('profileName').textContent = 
      profile.name || 'Welcome, Cosmic Explorer!';
    
    document.getElementById('profileDescription').textContent = 
      profile.isComplete ? 
      `${profile.astrologicalProfile.sunSign} Sun • ${profile.astrologicalProfile.moonSign} Moon • ${profile.astrologicalProfile.risingSign} Rising` :
      'Complete your profile to unlock personalized insights';

    // Update profile initials
    const initials = profile.name ? 
      profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    document.getElementById('profileInitials').textContent = initials;

    // Update stats
    document.getElementById('totalVisits').textContent = profile.journey.totalVisits;
    document.getElementById('toolsUsed').textContent = profile.journey.toolsUsed.length;
    document.getElementById('timeSpent').textContent = Math.round(profile.journey.timeSpent / 3600);

    // Update completion
    this.updateProfileCompletion(profile);

    // Update astrological summary
    this.updateAstrologicalSummary(profile);

    // Update recent activity
    this.updateRecentActivity(profile);
  }

  updateProfileCompletion(profile) {
    const tasks = [
      { id: 'name', label: 'Add your name', completed: !!profile.name },
      { id: 'birthChart', label: 'Create birth chart', completed: profile.birthChart.calculated },
      { id: 'preferences', label: 'Set preferences', completed: profile.journey.toolsUsed.length > 0 },
      { id: 'privacy', label: 'Review privacy settings', completed: this.userProfile.hasConsent() }
    ];

    const completedTasks = tasks.filter(task => task.completed).length;
    const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

    // Update completion bar
    document.getElementById('completionFill').style.width = `${completionPercentage}%`;
    document.getElementById('completionText').textContent = `${completionPercentage}% Complete`;

    // Update task list
    const tasksContainer = document.getElementById('completionTasks');
    tasksContainer.innerHTML = tasks.map(task => `
      <div class="completion-task ${task.completed ? 'completed' : ''}">
        <span class="task-icon">${task.completed ? '✅' : '⭕'}</span>
        <span class="task-label">${task.label}</span>
      </div>
    `).join('');
  }

  updateAstrologicalSummary(profile) {
    const astroSection = document.getElementById('astrologicalSummary');
    
    if (profile.birthChart.calculated) {
      astroSection.style.display = 'block';
      
      // Update signs
      document.getElementById('sunSignName').textContent = profile.astrologicalProfile.sunSign || '-';
      document.getElementById('moonSignName').textContent = profile.astrologicalProfile.moonSign || '-';
      document.getElementById('risingSignName').textContent = profile.astrologicalProfile.risingSign || '-';
      document.getElementById('elementName').textContent = profile.astrologicalProfile.dominantElement || '-';
      
      // Update element symbol
      const elementSymbols = {
        fire: '🔥',
        earth: '🌍',
        air: '💨',
        water: '💧'
      };
      document.getElementById('elementSymbol').textContent = 
        elementSymbols[profile.astrologicalProfile.dominantElement] || '✨';
    } else {
      astroSection.style.display = 'none';
    }
  }

  updateRecentActivity(profile) {
    const activityList = document.getElementById('activityList');
    const activities = [];

    // Generate activity items based on profile data
    if (profile.birthChart.calculated) {
      activities.push({
        type: 'birth-chart',
        description: 'Generated birth chart',
        time: profile.birthChart.lastUpdated || profile.lastUpdated
      });
    }

    if (profile.engagement.compatibilityChecked) {
      activities.push({
        type: 'compatibility',
        description: 'Checked compatibility',
        time: profile.lastUpdated
      });
    }

    if (profile.engagement.dashboardUsed) {
      activities.push({
        type: 'dashboard',
        description: 'Used cosmic dashboard',
        time: profile.journey.lastActivity
      });
    }

    if (activities.length === 0) {
      activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
    } else {
      activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
          <span class="activity-icon">${this.getActivityIcon(activity.type)}</span>
          <div class="activity-content">
            <span class="activity-description">${activity.description}</span>
            <span class="activity-time">${this.formatRelativeTime(activity.time)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  getActivityIcon(type) {
    const icons = {
      'birth-chart': '🌟',
      'compatibility': '💕',
      'dashboard': '📊',
      'journal': '📝',
      'bookmark': '🔖'
    };
    return icons[type] || '✨';
  }

  formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  // Birth Chart Management
  loadBirthChartData() {
    const profile = this.userProfile.getProfile();
    const birthChart = profile.birthChart;

    // Populate form fields
    document.getElementById('profileBirthDate').value = birthChart.date || '';
    document.getElementById('profileBirthTime').value = birthChart.time || '';
    document.getElementById('profileBirthLocation').value = birthChart.location.name || '';

    // Show/hide chart display
    if (birthChart.calculated) {
      document.getElementById('chartDisplay').style.display = 'block';
      this.displayChartSummary(birthChart);
    } else {
      document.getElementById('chartDisplay').style.display = 'none';
    }
  }

  displayChartSummary(birthChart) {
    const summary = document.getElementById('chartSummary');
    const profile = this.userProfile.getProfile();
    
    summary.innerHTML = `
      <div class="chart-summary-grid">
        <div class="summary-item">
          <h4>Birth Information</h4>
          <p><strong>Date:</strong> ${new Date(birthChart.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${birthChart.time || 'Unknown'}</p>
          <p><strong>Location:</strong> ${birthChart.location.name}</p>
        </div>
        
        <div class="summary-item">
          <h4>Astrological Profile</h4>
          <p><strong>Sun:</strong> ${profile.astrologicalProfile.sunSign}</p>
          <p><strong>Moon:</strong> ${profile.astrologicalProfile.moonSign}</p>
          <p><strong>Rising:</strong> ${profile.astrologicalProfile.risingSign}</p>
        </div>
        
        <div class="summary-item">
          <h4>Chart Pattern</h4>
          <p><strong>Dominant Element:</strong> ${profile.astrologicalProfile.dominantElement}</p>
          <p><strong>Chart Type:</strong> ${profile.astrologicalProfile.chartPattern}</p>
        </div>
      </div>
    `;
  }

  async updateBirthChart() {
    const date = document.getElementById('profileBirthDate').value;
    const time = document.getElementById('profileBirthTime').value;
    const locationName = document.getElementById('profileBirthLocation').value;

    if (!date || !locationName) {
      alert('Please fill in at least birth date and location');
      return;
    }

    // Find location (simplified - in real app would use geocoding API)
    const location = this.findLocationByName(locationName) || {
      name: locationName,
      lat: 0,
      lng: 0,
      timezone: 'UTC'
    };

    // Update birth chart data
    const chartData = {
      date: date,
      time: time || '12:00',
      location: location,
      calculated: true,
      // In real app, would calculate actual planetary positions
      planets: this.generateSamplePlanets(date),
      houses: this.generateSampleHouses(),
      aspects: []
    };

    // Update profile
    this.userProfile.updateBirthChart(chartData);

    // Refresh display
    this.loadBirthChartData();
    this.loadOverviewData();

    alert('Birth chart updated successfully!');
  }

  clearBirthChart() {
    if (confirm('Are you sure you want to clear your birth chart data?')) {
      const emptyChart = {
        date: '',
        time: '',
        location: { name: '', lat: null, lng: null, timezone: '' },
        calculated: false,
        planets: [],
        houses: [],
        aspects: []
      };

      this.userProfile.updateBirthChart(emptyChart);
      this.loadBirthChartData();
      this.loadOverviewData();

      alert('Birth chart data cleared');
    }
  }

  // Preferences Management
  loadPreferencesData() {
    const preferences = this.userProfile.getPreferences();

    // Display preferences
    document.getElementById('themeSelect').value = preferences.theme;
    document.getElementById('fontSizeSelect').value = preferences.fontSize;
    document.getElementById('reducedMotion').checked = preferences.reducedMotion;
    document.getElementById('highContrast').checked = preferences.highContrast;

    // Content preferences
    document.getElementById('beginnerContent').checked = preferences.contentTypes.beginner;
    document.getElementById('intermediateContent').checked = preferences.contentTypes.intermediate;
    document.getElementById('advancedContent').checked = preferences.contentTypes.advanced;

    // Topic preferences
    Object.keys(preferences.topics).forEach(topic => {
      const checkbox = document.getElementById(topic);
      if (checkbox) {
        checkbox.checked = preferences.topics[topic];
      }
    });

    // App preferences
    document.getElementById('defaultView').value = preferences.defaultView;
    document.getElementById('autoSave').checked = preferences.autoSave;
  }

  savePreferences() {
    const preferences = {
      // Display preferences
      theme: document.getElementById('themeSelect').value,
      fontSize: document.getElementById('fontSizeSelect').value,
      reducedMotion: document.getElementById('reducedMotion').checked,
      highContrast: document.getElementById('highContrast').checked,

      // Content preferences
      contentTypes: {
        beginner: document.getElementById('beginnerContent').checked,
        intermediate: document.getElementById('intermediateContent').checked,
        advanced: document.getElementById('advancedContent').checked
      },

      topics: {
        dailyHoroscopes: document.getElementById('dailyHoroscopes').checked,
        birthCharts: document.getElementById('birthCharts').checked,
        compatibility: document.getElementById('compatibility').checked,
        transits: document.getElementById('transits').checked,
        moonPhases: document.getElementById('moonPhases').checked,
        spirituality: document.getElementById('spirituality').checked,
        relationships: document.getElementById('relationships').checked,
        career: document.getElementById('career').checked
      },

      // App preferences
      defaultView: document.getElementById('defaultView').value,
      autoSave: document.getElementById('autoSave').checked
    };

    this.userProfile.updatePreferences(preferences);
    alert('Preferences saved successfully!');
  }

  resetPreferences() {
    if (confirm('Reset all preferences to default values?')) {
      const defaultPrefs = this.userProfile.getDefaultPreferences();
      this.userProfile.updatePreferences(defaultPrefs);
      this.loadPreferencesData();
      alert('Preferences reset to defaults');
    }
  }

  // Privacy Management
  loadPrivacyData() {
    const privacy = this.userProfile.getPrivacySettings();

    // Update consent status
    this.updateConsentStatus(privacy);

    // Data collection settings
    document.getElementById('allowAnalytics').checked = privacy.allowAnalytics;
    document.getElementById('allowPersonalization').checked = privacy.allowPersonalization;
    document.getElementById('allowRecommendations').checked = privacy.allowRecommendations;

    // Profile visibility
    document.getElementById('profileVisibility').value = privacy.profileVisibility;
    document.getElementById('showBirthChart').checked = privacy.showBirthChart;
    document.getElementById('showLocation').checked = privacy.showLocation;

    // Data retention
    document.getElementById('autoDeleteAfter').value = privacy.autoDeleteAfter;
  }

  updateConsentStatus(privacy) {
    const indicator = document.getElementById('consentIndicator');
    const icon = document.getElementById('consentIcon');
    const text = document.getElementById('consentText');
    const giveBtn = document.getElementById('giveConsent');
    const revokeBtn = document.getElementById('revokeConsent');

    if (privacy.consentGiven) {
      icon.textContent = '✅';
      text.textContent = `Consent given on ${new Date(privacy.consentDate).toLocaleDateString()}`;
      giveBtn.style.display = 'none';
      revokeBtn.style.display = 'inline-block';
      indicator.classList.add('consent-given');
    } else {
      icon.textContent = '❌';
      text.textContent = 'Consent not given';
      giveBtn.style.display = 'inline-block';
      revokeBtn.style.display = 'none';
      indicator.classList.remove('consent-given');
    }
  }

  giveConsent() {
    if (confirm('Do you consent to data collection and processing as described in our Privacy Policy?')) {
      this.userProfile.giveConsent();
      this.loadPrivacyData();
      alert('Consent recorded. Thank you!');
    }
  }

  revokeConsent() {
    if (confirm('Are you sure you want to revoke consent? This may limit functionality.')) {
      this.userProfile.revokeConsent();
      this.loadPrivacyData();
    }
  }

  savePrivacySettings() {
    const privacy = {
      allowAnalytics: document.getElementById('allowAnalytics').checked,
      allowPersonalization: document.getElementById('allowPersonalization').checked,
      allowRecommendations: document.getElementById('allowRecommendations').checked,
      profileVisibility: document.getElementById('profileVisibility').value,
      showBirthChart: document.getElementById('showBirthChart').checked,
      showLocation: document.getElementById('showLocation').checked,
      autoDeleteAfter: document.getElementById('autoDeleteAfter').value
    };

    this.userProfile.updatePrivacySettings(privacy);
    alert('Privacy settings saved successfully!');
  }

  // Data Management
  loadDataManagementData() {
    const profile = this.userProfile.getProfile();
    
    // Calculate data sizes (approximate)
    const profileSize = JSON.stringify(profile).length;
    const bookmarks = this.userProfile.loadBookmarks();
    const journalEntries = this.userProfile.loadJournalEntries();

    document.getElementById('profileDataSize').textContent = `${Math.round(profileSize / 1024)} KB`;
    document.getElementById('bookmarksCount').textContent = bookmarks.length;
    document.getElementById('journalEntriesCount').textContent = journalEntries.length;
  }

  exportData() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    this.userProfile.exportUserData();
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      document.getElementById('importFileName').textContent = file.name;
      document.getElementById('importData').disabled = false;
    }
  }

  importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (confirm('This will replace all your current data. Continue?')) {
          // Import data (simplified)
          if (data.profile) {
            this.userProfile.updateProfile(data.profile);
          }
          if (data.preferences) {
            this.userProfile.updatePreferences(data.preferences);
          }
          if (data.privacySettings) {
            this.userProfile.updatePrivacySettings(data.privacySettings);
          }
          
          alert('Data imported successfully!');
          location.reload(); // Refresh to show imported data
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  }

  clearAllData() {
    const confirmation = prompt('Type "DELETE" to confirm permanent deletion of all data:');
    
    if (confirmation === 'DELETE') {
      this.userProfile.clearAllData();
      alert('All data has been deleted.');
      location.reload();
    }
  }

  // Utility Methods
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  applyFontSize(fontSize) {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }

  applyReducedMotion(enabled) {
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  applyHighContrast(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  searchLocations(query, suggestionsContainer) {
    // Simplified location search
    const commonLocations = [
      { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437 },
      { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
      { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 }
    ];

    if (query.length < 2) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.style.display = 'none';
      return;
    }

    const matches = commonLocations.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length > 0) {
      suggestionsContainer.innerHTML = matches.map(location => 
        `<div class="location-suggestion" data-location='${JSON.stringify(location)}'>
          ${location.name}
        </div>`
      ).join('');
      
      suggestionsContainer.style.display = 'block';

      suggestionsContainer.querySelectorAll('.location-suggestion').forEach(item => {
        item.addEventListener('click', (e) => {
          const location = JSON.parse(e.target.dataset.location);
          document.getElementById('profileBirthLocation').value = location.name;
          suggestionsContainer.style.display = 'none';
        });
      });
    } else {
      suggestionsContainer.style.display = 'none';
    }
  }

  findLocationByName(name) {
    const commonLocations = [
      { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
      { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
      { name: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
      { name: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' }
    ];

    return commonLocations.find(location => 
      location.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  generateSamplePlanets(birthDate) {
    // Simplified planet generation for demo
    const planets = [
      { name: 'Sun', sign: 'Leo', longitude: 135 },
      { name: 'Moon', sign: 'Cancer', longitude: 105 },
      { name: 'Mercury', sign: 'Virgo', longitude: 165 },
      { name: 'Venus', sign: 'Libra', longitude: 195 },
      { name: 'Mars', sign: 'Aries', longitude: 15 }
    ];

    return planets;
  }

  generateSampleHouses() {
    // Simplified house generation for demo
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      houses.push({
        house: i,
        cusp: (i - 1) * 30,
        sign: this.getZodiacSign((i - 1) * 30)
      });
    }
    return houses;
  }

  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
  }

  changeAvatar() {
    // Simple avatar change - cycle through different cosmic symbols
    const symbols = ['🌟', '🌙', '☀️', '✨', '🔮', '🌌', '⭐', '🪐'];
    const current = document.getElementById('profileInitials').textContent;
    const currentIndex = symbols.indexOf(current);
    const nextIndex = (currentIndex + 1) % symbols.length;
    
    document.getElementById('profileInitials').textContent = symbols[nextIndex];
    
    // Save to profile
    this.userProfile.updateProfile({ avatar: symbols[nextIndex] });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for user profile system to be ready
  if (window.userProfile) {
    new ProfileManager();
  } else {
    // Wait a bit for the user profile system to initialize
    setTimeout(() => {
      new ProfileManager();
    }, 100);
  }
});