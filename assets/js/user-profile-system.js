/**
 * User Profile System
 * Manages local storage-based user profiles with birth chart data and preferences
 */

class UserProfileSystem {
  constructor() {
    this.storageKey = 'astroaura_user_profile';
    this.preferencesKey = 'astroaura_user_preferences';
    this.privacyKey = 'astroaura_privacy_settings';
    this.journalKey = 'astroaura_journal_entries';
    this.bookmarksKey = 'astroaura_bookmarks';
    
    this.profile = this.loadProfile();
    this.preferences = this.loadPreferences();
    this.privacySettings = this.loadPrivacySettings();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeDefaultSettings();
    this.trackUserBehavior();
  }

  setupEventListeners() {
    // Listen for profile updates across the site
    document.addEventListener('profileUpdated', (e) => {
      this.handleProfileUpdate(e.detail);
    });

    // Listen for preference changes
    document.addEventListener('preferenceChanged', (e) => {
      this.handlePreferenceChange(e.detail);
    });

    // Listen for privacy setting changes
    document.addEventListener('privacySettingChanged', (e) => {
      this.handlePrivacySettingChange(e.detail);
    });
  }

  // Profile Management
  loadProfile() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
      return this.getDefaultProfile();
    }
  }

  getDefaultProfile() {
    return {
      id: this.generateUserId(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isComplete: false,
      
      // Basic Info
      name: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Birth Chart Data
      birthChart: {
        date: '',
        time: '',
        location: {
          name: '',
          lat: null,
          lng: null,
          timezone: ''
        },
        calculated: false,
        planets: [],
        houses: [],
        aspects: []
      },
      
      // Astrological Profile
      astrologicalProfile: {
        sunSign: '',
        moonSign: '',
        risingSign: '',
        dominantElement: '',
        dominantQuality: '',
        chartPattern: ''
      },
      
      // User Journey
      journey: {
        firstVisit: new Date().toISOString(),
        totalVisits: 1,
        toolsUsed: [],
        articlesRead: [],
        timeSpent: 0,
        lastActivity: new Date().toISOString()
      },
      
      // Engagement Metrics
      engagement: {
        birthChartGenerated: false,
        compatibilityChecked: false,
        dashboardUsed: false,
        journalEntries: 0,
        bookmarksCount: 0,
        sharesCount: 0
      }
    };
  }

  saveProfile() {
    try {
      this.profile.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
      
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('profileSaved', {
        detail: { profile: this.profile }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  updateProfile(updates) {
    this.profile = { ...this.profile, ...updates };
    this.profile.lastUpdated = new Date().toISOString();
    
    // Check if profile is now complete
    this.checkProfileCompleteness();
    
    return this.saveProfile();
  }

  updateBirthChart(chartData) {
    this.profile.birthChart = {
      ...this.profile.birthChart,
      ...chartData,
      calculated: true
    };
    
    // Update astrological profile
    this.updateAstrologicalProfile(chartData);
    
    // Mark engagement
    this.profile.engagement.birthChartGenerated = true;
    
    return this.saveProfile();
  }

  updateAstrologicalProfile(chartData) {
    if (chartData.planets && chartData.planets.length > 0) {
      const sun = chartData.planets.find(p => p.name === 'Sun');
      const moon = chartData.planets.find(p => p.name === 'Moon');
      const ascendant = chartData.houses && chartData.houses[0];
      
      this.profile.astrologicalProfile = {
        sunSign: sun ? sun.sign : '',
        moonSign: moon ? moon.sign : '',
        risingSign: ascendant ? ascendant.sign : '',
        dominantElement: this.calculateDominantElement(chartData.planets),
        dominantQuality: this.calculateDominantQuality(chartData.planets),
        chartPattern: this.identifyChartPattern(chartData.planets)
      };
    }
  }

  checkProfileCompleteness() {
    const hasBasicInfo = this.profile.name && this.profile.birthChart.date;
    const hasBirthChart = this.profile.birthChart.calculated;
    
    this.profile.isComplete = hasBasicInfo && hasBirthChart;
  }

  // Preferences Management
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.preferencesKey);
      return stored ? JSON.parse(stored) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error loading preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      // Display Preferences
      theme: 'cosmic', // cosmic, light, dark
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium', // small, medium, large
      
      // Content Preferences
      contentTypes: {
        beginner: true,
        intermediate: true,
        advanced: false
      },
      
      topics: {
        dailyHoroscopes: true,
        birthCharts: true,
        compatibility: true,
        transits: true,
        moonPhases: true,
        spirituality: true,
        relationships: true,
        career: true
      },
      
      // Notification Preferences
      notifications: {
        dailyInsights: false,
        weeklyForecast: false,
        majorTransits: false,
        fullMoons: false,
        personalTransits: false
      },
      
      // Privacy Preferences
      dataCollection: {
        analytics: true,
        personalization: true,
        recommendations: true
      },
      
      // App Preferences
      defaultView: 'dashboard', // dashboard, horoscope, chart
      autoSave: true,
      offlineMode: false
    };
  }

  savePreferences() {
    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
      
      // Apply preferences immediately
      this.applyPreferences();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('preferencesSaved', {
        detail: { preferences: this.preferences }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  updatePreferences(updates) {
    this.preferences = { ...this.preferences, ...updates };
    return this.savePreferences();
  }

  applyPreferences() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.preferences.theme);
    
    // Apply accessibility preferences
    if (this.preferences.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    if (this.preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', this.preferences.fontSize);
  }

  // Privacy Settings Management
  loadPrivacySettings() {
    try {
      const stored = localStorage.getItem(this.privacyKey);
      return stored ? JSON.parse(stored) : this.getDefaultPrivacySettings();
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      return this.getDefaultPrivacySettings();
    }
  }

  getDefaultPrivacySettings() {
    return {
      // Data Storage
      allowLocalStorage: true,
      allowCookies: true,
      allowAnalytics: true,
      
      // Data Sharing
      allowPersonalization: true,
      allowRecommendations: true,
      allowSocialSharing: true,
      
      // Profile Visibility
      profileVisibility: 'private', // private, friends, public
      showBirthChart: false,
      showLocation: false,
      showRealName: false,
      
      // Communication
      allowEmails: false,
      allowNotifications: false,
      allowMarketing: false,
      
      // Data Management
      autoDeleteAfter: 'never', // never, 1year, 2years, 5years
      exportDataFormat: 'json', // json, csv
      
      // Consent
      consentGiven: false,
      consentDate: null,
      consentVersion: '1.0'
    };
  }

  savePrivacySettings() {
    try {
      localStorage.setItem(this.privacyKey, JSON.stringify(this.privacySettings));
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('privacySettingsSaved', {
        detail: { privacySettings: this.privacySettings }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      return false;
    }
  }

  updatePrivacySettings(updates) {
    this.privacySettings = { ...this.privacySettings, ...updates };
    return this.savePrivacySettings();
  }

  giveConsent(version = '1.0') {
    this.privacySettings.consentGiven = true;
    this.privacySettings.consentDate = new Date().toISOString();
    this.privacySettings.consentVersion = version;
    
    return this.savePrivacySettings();
  }

  revokeConsent() {
    this.privacySettings.consentGiven = false;
    this.privacySettings.consentDate = null;
    
    // Optionally clear all data
    if (confirm('Would you like to delete all your stored data?')) {
      this.clearAllData();
    }
    
    return this.savePrivacySettings();
  }

  // Behavior Tracking
  trackUserBehavior() {
    if (!this.privacySettings.allowAnalytics) return;
    
    // Track page views
    this.trackPageView();
    
    // Track time spent
    this.startTimeTracking();
    
    // Track interactions
    this.setupInteractionTracking();
  }

  trackPageView() {
    const currentPage = window.location.pathname;
    
    // Update journey data
    this.profile.journey.lastActivity = new Date().toISOString();
    this.profile.journey.totalVisits += 1;
    
    // Track specific tools used
    if (currentPage.includes('birth-chart')) {
      this.addToolUsed('birth-chart');
    } else if (currentPage.includes('compatibility')) {
      this.addToolUsed('compatibility');
    } else if (currentPage.includes('cosmic-dashboard')) {
      this.addToolUsed('cosmic-dashboard');
    }
    
    this.saveProfile();
  }

  addToolUsed(tool) {
    if (!this.profile.journey.toolsUsed.includes(tool)) {
      this.profile.journey.toolsUsed.push(tool);
    }
  }

  startTimeTracking() {
    this.sessionStartTime = Date.now();
    
    // Save time spent when leaving page
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - this.sessionStartTime;
      this.profile.journey.timeSpent += Math.floor(timeSpent / 1000); // Convert to seconds
      this.saveProfile();
    });
  }

  setupInteractionTracking() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-cosmic, .btn-primary, .btn-secondary')) {
        this.trackInteraction('button_click', {
          button: e.target.textContent.trim(),
          page: window.location.pathname
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackInteraction('form_submit', {
        form: e.target.id || 'unknown',
        page: window.location.pathname
      });
    });
  }

  trackInteraction(type, data) {
    if (!this.privacySettings.allowAnalytics) return;
    
    // Store interaction data (could be sent to analytics service)
    const interaction = {
      type,
      data,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };
    
    // For now, just log to console (in production, send to analytics)
    console.log('User interaction:', interaction);
  }

  // Data Management
  exportUserData() {
    const exportData = {
      profile: this.profile,
      preferences: this.preferences,
      privacySettings: this.privacySettings,
      bookmarks: this.loadBookmarks(),
      journalEntries: this.loadJournalEntries(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const format = this.privacySettings.exportDataFormat;
    
    if (format === 'json') {
      return this.exportAsJSON(exportData);
    } else if (format === 'csv') {
      return this.exportAsCSV(exportData);
    }
  }

  exportAsJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroaura-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportAsCSV(data) {
    // Simplified CSV export for profile data
    const csvData = [
      ['Field', 'Value'],
      ['Name', data.profile.name],
      ['Sun Sign', data.profile.astrologicalProfile.sunSign],
      ['Moon Sign', data.profile.astrologicalProfile.moonSign],
      ['Rising Sign', data.profile.astrologicalProfile.risingSign],
      ['Birth Date', data.profile.birthChart.date],
      ['Birth Location', data.profile.birthChart.location.name],
      ['Total Visits', data.profile.journey.totalVisits],
      ['Tools Used', data.profile.journey.toolsUsed.join(', ')],
      ['Time Spent (seconds)', data.profile.journey.timeSpent]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroaura-profile-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.preferencesKey);
      localStorage.removeItem(this.privacyKey);
      localStorage.removeItem(this.journalKey);
      localStorage.removeItem(this.bookmarksKey);
      
      // Reset to defaults
      this.profile = this.getDefaultProfile();
      this.preferences = this.getDefaultPreferences();
      this.privacySettings = this.getDefaultPrivacySettings();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('dataCleared'));
      
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Bookmarks Management
  loadBookmarks() {
    try {
      const stored = localStorage.getItem(this.bookmarksKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(this.bookmarksKey, JSON.stringify(bookmarks));
      this.profile.engagement.bookmarksCount = bookmarks.length;
      this.saveProfile();
      return true;
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      return false;
    }
  }

  addBookmark(item) {
    const bookmarks = this.loadBookmarks();
    const bookmark = {
      id: this.generateId(),
      type: item.type, // article, insight, chart, etc.
      title: item.title,
      url: item.url,
      description: item.description,
      tags: item.tags || [],
      addedAt: new Date().toISOString()
    };
    
    // Check if already bookmarked
    const exists = bookmarks.find(b => b.url === bookmark.url);
    if (exists) return false;
    
    bookmarks.push(bookmark);
    return this.saveBookmarks(bookmarks);
  }

  removeBookmark(id) {
    const bookmarks = this.loadBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    return this.saveBookmarks(filtered);
  }

  // Journal Management
  loadJournalEntries() {
    try {
      const stored = localStorage.getItem(this.journalKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  saveJournalEntries(entries) {
    try {
      localStorage.setItem(this.journalKey, JSON.stringify(entries));
      this.profile.engagement.journalEntries = entries.length;
      this.saveProfile();
      return true;
    } catch (error) {
      console.error('Error saving journal entries:', error);
      return false;
    }
  }

  addJournalEntry(entry) {
    const entries = this.loadJournalEntries();
    const journalEntry = {
      id: this.generateId(),
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    entries.unshift(journalEntry); // Add to beginning
    return this.saveJournalEntries(entries);
  }

  updateJournalEntry(id, updates) {
    const entries = this.loadJournalEntries();
    const index = entries.findIndex(e => e.id === id);
    
    if (index === -1) return false;
    
    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.saveJournalEntries(entries);
  }

  deleteJournalEntry(id) {
    const entries = this.loadJournalEntries();
    const filtered = entries.filter(e => e.id !== id);
    return this.saveJournalEntries(filtered);
  }

  // Utility Methods
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  calculateDominantElement(planets) {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    };
    
    planets.forEach(planet => {
      const element = elementMap[planet.sign];
      if (element) elements[element]++;
    });
    
    return Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b);
  }

  calculateDominantQuality(planets) {
    const qualities = { cardinal: 0, fixed: 0, mutable: 0 };
    const qualityMap = {
      'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
      'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
      'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
    };
    
    planets.forEach(planet => {
      const quality = qualityMap[planet.sign];
      if (quality) qualities[quality]++;
    });
    
    return Object.keys(qualities).reduce((a, b) => qualities[a] > qualities[b] ? a : b);
  }

  identifyChartPattern(planets) {
    if (!planets || planets.length === 0) return 'unknown';
    
    const positions = planets.map(p => p.longitude).sort((a, b) => a - b);
    const spread = positions[positions.length - 1] - positions[0];
    
    if (spread < 120) return 'bundle';
    if (spread > 240) return 'splash';
    return 'bowl';
  }

  // Event Handlers
  handleProfileUpdate(data) {
    this.updateProfile(data);
  }

  handlePreferenceChange(data) {
    this.updatePreferences(data);
  }

  handlePrivacySettingChange(data) {
    this.updatePrivacySettings(data);
  }

  initializeDefaultSettings() {
    // Apply preferences on load
    this.applyPreferences();
    
    // Check for first visit
    if (this.profile.journey.totalVisits === 1) {
      this.showWelcomeMessage();
    }
  }

  showWelcomeMessage() {
    // Could show a welcome modal or tour
    console.log('Welcome to AstroAura!');
  }

  // Public API
  getProfile() {
    return { ...this.profile };
  }

  getPreferences() {
    return { ...this.preferences };
  }

  getPrivacySettings() {
    return { ...this.privacySettings };
  }

  isProfileComplete() {
    return this.profile.isComplete;
  }

  hasConsent() {
    return this.privacySettings.consentGiven;
  }
}

// Initialize global user profile system
window.UserProfileSystem = UserProfileSystem;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.userProfile = new UserProfileSystem();
  });
} else {
  window.userProfile = new UserProfileSystem();
}