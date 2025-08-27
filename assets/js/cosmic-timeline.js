/**
 * Cosmic Timeline
 * Tracks user's astrological journey and personal growth patterns
 */

class CosmicTimeline {
  constructor() {
    this.userProfile = window.userProfile;
    this.currentView = 'timeline';
    this.timeRange = 'all';
    this.eventType = 'all';
    this.events = [];
    this.insights = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTimelineData();
    this.generateInsights();
  }

  setupEventListeners() {
    // View switching
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Filter controls
    document.getElementById('timeRange').addEventListener('change', (e) => {
      this.timeRange = e.target.value;
      this.filterAndDisplayEvents();
    });

    document.getElementById('eventType').addEventListener('change', (e) => {
      this.eventType = e.target.value;
      this.filterAndDisplayEvents();
    });

    // Add event functionality
    document.getElementById('addEventBtn').addEventListener('click', () => {
      this.showAddEventForm();
    });

    document.getElementById('saveEvent').addEventListener('click', () => {
      this.savePersonalEvent();
    });

    document.getElementById('cancelEvent').addEventListener('click', () => {
      this.hideAddEventForm();
    });
  }

  // View Management
  switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.timeline-view').forEach(view => {
      view.classList.remove('active');
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewName}View`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    this.currentView = viewName;

    // Load view-specific data
    this.loadViewData(viewName);
  }

  loadViewData(viewName) {
    switch (viewName) {
      case 'timeline':
        this.displayTimeline();
        break;
      case 'insights':
        this.displayInsights();
        break;
      case 'patterns':
        this.displayPatterns();
        break;
      case 'progress':
        this.displayProgress();
        break;
    }
  }

  // Data Loading
  loadTimelineData() {
    this.events = this.generateTimelineEvents();
    this.updateTimelineStats();
    this.displayTimeline();
  }

  generateTimelineEvents() {
    const events = [];
    const profile = this.userProfile.getProfile();
    
    // Add profile creation event
    events.push({
      id: 'profile-created',
      type: 'system',
      title: 'Started Cosmic Journey',
      description: 'Began exploring astrology with AstroAura',
      date: profile.createdAt,
      mood: 'curious',
      category: 'personal',
      icon: '🌟'
    });

    // Add birth chart generation event
    if (profile.birthChart.calculated) {
      events.push({
        id: 'birth-chart',
        type: 'tools',
        title: 'Generated Birth Chart',
        description: `Discovered ${profile.astrologicalProfile.sunSign} Sun, ${profile.astrologicalProfile.moonSign} Moon, ${profile.astrologicalProfile.risingSign} Rising`,
        date: profile.birthChart.lastUpdated || profile.lastUpdated,
        mood: 'excited',
        category: 'personal',
        icon: '🎯'
      });
    }

    // Add tool usage events
    profile.journey.toolsUsed.forEach(tool => {
      events.push({
        id: `tool-${tool}`,
        type: 'tools',
        title: `Used ${this.formatToolName(tool)}`,
        description: `Explored ${tool.replace('-', ' ')} functionality`,
        date: profile.journey.lastActivity,
        mood: 'curious',
        category: 'personal',
        icon: this.getToolIcon(tool)
      });
    });

    // Add cosmic events (sample data)
    events.push(...this.generateCosmicEvents());

    // Add personal insights from storage
    const personalEvents = this.loadPersonalEvents();
    events.push(...personalEvents);

    // Sort by date
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  generateCosmicEvents() {
    const cosmicEvents = [];
    const now = new Date();
    
    // Generate sample cosmic events for the past few months
    for (let i = 0; i < 12; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() - (i * 15));
      
      const events = [
        {
          type: 'cosmic',
          title: 'Full Moon in Leo',
          description: 'A powerful time for creative expression and self-confidence',
          mood: 'inspired',
          category: 'spiritual',
          icon: '🌕'
        },
        {
          type: 'cosmic',
          title: 'Mercury Retrograde',
          description: 'Time for reflection and reviewing communication patterns',
          mood: 'reflective',
          category: 'personal',
          icon: '☿'
        },
        {
          type: 'cosmic',
          title: 'Venus enters Libra',
          description: 'Harmonious energy for relationships and partnerships',
          mood: 'peaceful',
          category: 'relationship',
          icon: '♀'
        }
      ];
      
      const event = events[i % events.length];
      cosmicEvents.push({
        id: `cosmic-${i}`,
        ...event,
        date: eventDate.toISOString()
      });
    }
    
    return cosmicEvents;
  }

  loadPersonalEvents() {
    try {
      const stored = localStorage.getItem('astroaura_personal_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading personal events:', error);
      return [];
    }
  }

  savePersonalEvents(events) {
    try {
      localStorage.setItem('astroaura_personal_events', JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Error saving personal events:', error);
      return false;
    }
  }

  // Timeline Display
  displayTimeline() {
    const filteredEvents = this.filterEvents();
    const container = document.getElementById('timelineEvents');
    
    if (filteredEvents.length === 0) {
      container.innerHTML = '<div class="no-events">No events found for the selected filters</div>';
      return;
    }

    container.innerHTML = filteredEvents.map((event, index) => {
      const eventDate = new Date(event.date);
      const isRecent = (Date.now() - eventDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
      
      return `
        <div class="timeline-event ${event.type} ${isRecent ? 'recent' : ''}" data-event-id="${event.id}">
          <div class="event-marker">
            <span class="event-icon">${event.icon}</span>
          </div>
          <div class="event-content">
            <div class="event-header">
              <h4 class="event-title">${event.title}</h4>
              <span class="event-date">${this.formatEventDate(eventDate)}</span>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-meta">
              <span class="event-category">${this.formatCategory(event.category)}</span>
              ${event.mood ? `<span class="event-mood">${this.getMoodEmoji(event.mood)} ${event.mood}</span>` : ''}
              <span class="event-type">${event.type}</span>
            </div>
            ${event.tags ? `<div class="event-tags">${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers for personal events
    container.querySelectorAll('.timeline-event[data-event-id^="personal-"]').forEach(eventEl => {
      eventEl.addEventListener('click', () => {
        this.showEventDetails(eventEl.dataset.eventId);
      });
    });
  }

  filterEvents() {
    let filtered = [...this.events];

    // Filter by time range
    if (this.timeRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (this.timeRange) {
        case 'month':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case '3months':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6months':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case 'year':
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      filtered = filtered.filter(event => new Date(event.date) >= cutoffDate);
    }

    // Filter by event type
    if (this.eventType !== 'all') {
      if (this.eventType === 'personal') {
        filtered = filtered.filter(event => event.type === 'personal' || event.type === 'system');
      } else if (this.eventType === 'mood') {
        filtered = filtered.filter(event => event.mood);
      } else {
        filtered = filtered.filter(event => event.type === this.eventType);
      }
    }

    return filtered;
  }

  filterAndDisplayEvents() {
    this.displayTimeline();
    this.updateTimelineStats();
  }

  updateTimelineStats() {
    const filteredEvents = this.filterEvents();
    const personalEvents = filteredEvents.filter(e => e.type === 'personal');
    const profile = this.userProfile.getProfile();
    
    const journeyStart = new Date(profile.createdAt);
    const journeyDays = Math.floor((Date.now() - journeyStart.getTime()) / (1000 * 60 * 60 * 24));
    
    document.getElementById('totalEvents').textContent = filteredEvents.length;
    document.getElementById('journeyDays').textContent = journeyDays;
    document.getElementById('insightsCount').textContent = personalEvents.length;
  }

  // Personal Event Management
  showAddEventForm() {
    document.getElementById('addEventForm').style.display = 'block';
    document.getElementById('addEventBtn').style.display = 'none';
  }

  hideAddEventForm() {
    document.getElementById('addEventForm').style.display = 'none';
    document.getElementById('addEventBtn').style.display = 'block';
    this.clearEventForm();
  }

  clearEventForm() {
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventMood').value = '';
    document.getElementById('eventCategory').value = 'personal';
    document.getElementById('eventTags').value = '';
  }

  savePersonalEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const mood = document.getElementById('eventMood').value;
    const category = document.getElementById('eventCategory').value;
    const tagsInput = document.getElementById('eventTags').value.trim();
    
    if (!title || !description) {
      alert('Please fill in both title and description');
      return;
    }

    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const newEvent = {
      id: `personal-${Date.now()}`,
      type: 'personal',
      title: title,
      description: description,
      date: new Date().toISOString(),
      mood: mood,
      category: category,
      tags: tags,
      icon: this.getCategoryIcon(category)
    };

    // Add to events array
    this.events.unshift(newEvent);
    
    // Save to localStorage
    const personalEvents = this.loadPersonalEvents();
    personalEvents.unshift(newEvent);
    this.savePersonalEvents(personalEvents);

    // Update display
    this.displayTimeline();
    this.updateTimelineStats();
    this.hideAddEventForm();

    // Show success message
    this.showNotification('Personal insight saved successfully!');
  }

  // Insights Generation
  generateInsights() {
    this.insights = {
      moodPatterns: this.analyzeMoodPatterns(),
      growthAreas: this.identifyGrowthAreas(),
      cosmicCorrelations: this.findCosmicCorrelations(),
      breakthroughs: this.identifyBreakthroughs()
    };
  }

  displayInsights() {
    this.displayMoodChart();
    this.displayGrowthAreas();
    this.displayCosmicCorrelations();
    this.displayBreakthroughs();
  }

  analyzeMoodPatterns() {
    const moodEvents = this.events.filter(event => event.mood);
    const moodCounts = {};
    
    moodEvents.forEach(event => {
      moodCounts[event.mood] = (moodCounts[event.mood] || 0) + 1;
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'balanced'
    );

    return {
      counts: moodCounts,
      dominant: dominantMood,
      total: moodEvents.length,
      trend: this.calculateMoodTrend(moodEvents)
    };
  }

  displayMoodChart() {
    const canvas = document.getElementById('moodCanvas');
    const ctx = canvas.getContext('2d');
    const moodData = this.insights.moodPatterns;
    
    // Simple bar chart for mood patterns
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const moods = Object.keys(moodData.counts);
    const maxCount = Math.max(...Object.values(moodData.counts));
    const barWidth = canvas.width / moods.length;
    
    moods.forEach((mood, index) => {
      const count = moodData.counts[mood];
      const barHeight = (count / maxCount) * (canvas.height - 40);
      const x = index * barWidth;
      const y = canvas.height - barHeight - 20;
      
      // Draw bar
      ctx.fillStyle = this.getMoodColor(mood);
      ctx.fillRect(x + 10, y, barWidth - 20, barHeight);
      
      // Draw label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(mood, x + barWidth / 2, canvas.height - 5);
      ctx.fillText(count, x + barWidth / 2, y - 5);
    });

    // Update insight text
    document.getElementById('moodInsight').textContent = 
      `Your most common mood is ${moodData.dominant}. You've recorded ${moodData.total} mood entries, showing ${moodData.trend} emotional patterns.`;
  }

  identifyGrowthAreas() {
    const categories = {};
    this.events.forEach(event => {
      if (event.category) {
        categories[event.category] = (categories[event.category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({
        area: category,
        count: count,
        progress: this.calculateCategoryProgress(category)
      }));
  }

  displayGrowthAreas() {
    const container = document.getElementById('growthAreas');
    const growthAreas = this.insights.growthAreas;
    
    container.innerHTML = growthAreas.map(area => `
      <div class="growth-area-item">
        <div class="area-header">
          <span class="area-icon">${this.getCategoryIcon(area.area)}</span>
          <span class="area-name">${this.formatCategory(area.area)}</span>
        </div>
        <div class="area-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${area.progress}%"></div>
          </div>
          <span class="progress-text">${area.progress}%</span>
        </div>
        <div class="area-stats">${area.count} insights recorded</div>
      </div>
    `).join('');
  }

  findCosmicCorrelations() {
    // Simplified correlation analysis
    const correlations = [];
    
    // Find events that coincide with cosmic events
    const cosmicEvents = this.events.filter(e => e.type === 'cosmic');
    const personalEvents = this.events.filter(e => e.type === 'personal');
    
    cosmicEvents.forEach(cosmic => {
      const cosmicDate = new Date(cosmic.date);
      const nearbyPersonal = personalEvents.filter(personal => {
        const personalDate = new Date(personal.date);
        const daysDiff = Math.abs((cosmicDate - personalDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= 3; // Within 3 days
      });
      
      if (nearbyPersonal.length > 0) {
        correlations.push({
          cosmicEvent: cosmic.title,
          personalEvents: nearbyPersonal.map(p => p.title),
          strength: nearbyPersonal.length > 1 ? 'strong' : 'moderate'
        });
      }
    });

    return correlations.slice(0, 3); // Top 3 correlations
  }

  displayCosmicCorrelations() {
    const container = document.getElementById('cosmicCorrelations');
    const correlations = this.insights.cosmicCorrelations;
    
    if (correlations.length === 0) {
      container.innerHTML = '<p class="no-correlations">No significant correlations found yet. Keep tracking your insights!</p>';
      return;
    }

    container.innerHTML = correlations.map(correlation => `
      <div class="correlation-item">
        <div class="correlation-header">
          <span class="cosmic-event">${correlation.cosmicEvent}</span>
          <span class="correlation-strength ${correlation.strength}">${correlation.strength}</span>
        </div>
        <div class="personal-events">
          ${correlation.personalEvents.map(event => `<span class="personal-event">${event}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  identifyBreakthroughs() {
    const personalEvents = this.events.filter(e => e.type === 'personal');
    const recentEvents = personalEvents.filter(event => {
      const eventDate = new Date(event.date);
      const daysSince = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30; // Last 30 days
    });

    // Look for positive moods and growth-related keywords
    const breakthroughs = recentEvents.filter(event => {
      const positiveWords = ['breakthrough', 'realization', 'clarity', 'understanding', 'growth', 'insight'];
      const positiveMoods = ['excited', 'inspired', 'grateful', 'peaceful'];
      
      const hasPositiveWords = positiveWords.some(word => 
        event.title.toLowerCase().includes(word) || 
        event.description.toLowerCase().includes(word)
      );
      
      const hasPositiveMood = positiveMoods.includes(event.mood);
      
      return hasPositiveWords || hasPositiveMood;
    });

    return breakthroughs.slice(0, 3); // Most recent 3
  }

  displayBreakthroughs() {
    const container = document.getElementById('recentBreakthroughs');
    const breakthroughs = this.insights.breakthroughs;
    
    if (breakthroughs.length === 0) {
      container.innerHTML = '<p class="no-breakthroughs">Record your insights to discover breakthrough moments!</p>';
      return;
    }

    container.innerHTML = breakthroughs.map(breakthrough => `
      <div class="breakthrough-item">
        <div class="breakthrough-header">
          <span class="breakthrough-icon">💡</span>
          <span class="breakthrough-title">${breakthrough.title}</span>
        </div>
        <p class="breakthrough-description">${breakthrough.description}</p>
        <div class="breakthrough-meta">
          <span class="breakthrough-date">${this.formatEventDate(new Date(breakthrough.date))}</span>
          ${breakthrough.mood ? `<span class="breakthrough-mood">${this.getMoodEmoji(breakthrough.mood)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Patterns Analysis
  displayPatterns() {
    this.displayLunarPatterns();
    this.displaySeasonalPatterns();
    this.displayPersonalCycles();
  }

  displayLunarPatterns() {
    // Simplified lunar pattern analysis
    const lunarInsights = document.getElementById('lunarInsights');
    lunarInsights.innerHTML = `
      <div class="lunar-insight">
        <h4>New Moon Patterns</h4>
        <p>You tend to set intentions and start new projects during new moon phases.</p>
      </div>
      <div class="lunar-insight">
        <h4>Full Moon Patterns</h4>
        <p>Your emotional insights and breakthroughs often occur around full moons.</p>
      </div>
    `;
  }

  displaySeasonalPatterns() {
    const container = document.getElementById('seasonalPatterns');
    container.innerHTML = `
      <div class="seasonal-pattern">
        <h4>Spring Energy</h4>
        <p>You show increased activity in personal growth and new beginnings.</p>
      </div>
      <div class="seasonal-pattern">
        <h4>Summer Insights</h4>
        <p>Creative and relationship-focused insights are more common.</p>
      </div>
      <div class="seasonal-pattern">
        <h4>Autumn Reflection</h4>
        <p>You tend to focus on spiritual and introspective themes.</p>
      </div>
      <div class="seasonal-pattern">
        <h4>Winter Contemplation</h4>
        <p>Career and life purpose insights emerge during winter months.</p>
      </div>
    `;
  }

  displayPersonalCycles() {
    const container = document.getElementById('personalCycles');
    container.innerHTML = `
      <div class="personal-cycle">
        <h4>Weekly Rhythm</h4>
        <p>You're most reflective on Sundays and most active on Wednesdays.</p>
      </div>
      <div class="personal-cycle">
        <h4>Monthly Flow</h4>
        <p>Mid-month periods show increased insight and breakthrough activity.</p>
      </div>
    `;
  }

  // Progress Tracking
  displayProgress() {
    this.displayMilestones();
    this.updateProgressBars();
  }

  displayMilestones() {
    const container = document.getElementById('milestonesGrid');
    const profile = this.userProfile.getProfile();
    
    const milestones = [
      {
        id: 'first-chart',
        title: 'First Birth Chart',
        description: 'Generated your first birth chart',
        achieved: profile.birthChart.calculated,
        date: profile.birthChart.calculated ? profile.lastUpdated : null,
        icon: '🎯'
      },
      {
        id: 'compatibility-check',
        title: 'Relationship Explorer',
        description: 'Checked compatibility with someone',
        achieved: profile.engagement.compatibilityChecked,
        date: profile.engagement.compatibilityChecked ? profile.lastUpdated : null,
        icon: '💕'
      },
      {
        id: 'dashboard-user',
        title: 'Daily Tracker',
        description: 'Used the cosmic dashboard',
        achieved: profile.engagement.dashboardUsed,
        date: profile.engagement.dashboardUsed ? profile.lastUpdated : null,
        icon: '📊'
      },
      {
        id: 'insight-recorder',
        title: 'Insight Keeper',
        description: 'Recorded 5 personal insights',
        achieved: this.events.filter(e => e.type === 'personal').length >= 5,
        date: this.events.filter(e => e.type === 'personal').length >= 5 ? new Date().toISOString() : null,
        icon: '📝'
      },
      {
        id: 'journey-veteran',
        title: 'Cosmic Veteran',
        description: '30 days on your astrological journey',
        achieved: this.calculateJourneyDays() >= 30,
        date: this.calculateJourneyDays() >= 30 ? new Date().toISOString() : null,
        icon: '🌟'
      }
    ];

    container.innerHTML = milestones.map(milestone => `
      <div class="milestone-item ${milestone.achieved ? 'achieved' : 'pending'}">
        <div class="milestone-icon">${milestone.icon}</div>
        <div class="milestone-content">
          <h4 class="milestone-title">${milestone.title}</h4>
          <p class="milestone-description">${milestone.description}</p>
          ${milestone.achieved ? 
            `<div class="milestone-date">Achieved ${this.formatEventDate(new Date(milestone.date))}</div>` :
            `<div class="milestone-progress">Not yet achieved</div>`
          }
        </div>
        <div class="milestone-status">
          ${milestone.achieved ? '✅' : '⏳'}
        </div>
      </div>
    `).join('');
  }

  updateProgressBars() {
    // Animate progress bars
    setTimeout(() => {
      document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.width = width;
        }, 100);
      });
    }, 500);
  }

  // Utility Methods
  formatToolName(tool) {
    return tool.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getToolIcon(tool) {
    const icons = {
      'birth-chart': '🎯',
      'compatibility': '💕',
      'cosmic-dashboard': '📊'
    };
    return icons[tool] || '🔧';
  }

  getCategoryIcon(category) {
    const icons = {
      'personal': '🌱',
      'relationship': '💕',
      'career': '💼',
      'spiritual': '🧘',
      'health': '🌿',
      'creative': '🎨',
      'other': '✨'
    };
    return icons[category] || '✨';
  }

  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  getMoodEmoji(mood) {
    const emojis = {
      'excited': '😄',
      'peaceful': '😌',
      'curious': '🤔',
      'inspired': '✨',
      'reflective': '🧘',
      'grateful': '🙏',
      'confused': '😕',
      'anxious': '😰',
      'sad': '😢'
    };
    return emojis[mood] || '😊';
  }

  getMoodColor(mood) {
    const colors = {
      'excited': '#FFD700',
      'peaceful': '#4ECDC4',
      'curious': '#FF6B6B',
      'inspired': '#9B59B6',
      'reflective': '#3498DB',
      'grateful': '#2ECC71',
      'confused': '#F39C12',
      'anxious': '#E74C3C',
      'sad': '#95A5A6'
    };
    return colors[mood] || '#BDC3C7';
  }

  formatEventDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
  }

  calculateJourneyDays() {
    const profile = this.userProfile.getProfile();
    const journeyStart = new Date(profile.createdAt);
    return Math.floor((Date.now() - journeyStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  calculateMoodTrend(moodEvents) {
    if (moodEvents.length < 2) return 'stable';
    
    const recentMoods = moodEvents.slice(0, 5);
    const positiveMoods = ['excited', 'peaceful', 'inspired', 'grateful'];
    const positiveCount = recentMoods.filter(event => 
      positiveMoods.includes(event.mood)
    ).length;
    
    if (positiveCount >= 3) return 'improving';
    if (positiveCount <= 1) return 'challenging';
    return 'stable';
  }

  calculateCategoryProgress(category) {
    const categoryEvents = this.events.filter(e => e.category === category);
    const baseProgress = Math.min(categoryEvents.length * 10, 100);
    return Math.max(baseProgress, 20); // Minimum 20% for any category with events
  }

  showEventDetails(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Simple modal-like display (could be enhanced with a proper modal)
    alert(`${event.title}\n\n${event.description}\n\nDate: ${this.formatEventDate(new Date(event.date))}\nMood: ${event.mood || 'Not specified'}\nCategory: ${this.formatCategory(event.category)}`);
  }

  showNotification(message) {
    // Simple notification (could be enhanced with a proper notification system)
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4ECDC4;
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for user profile system to be ready
  if (window.userProfile) {
    new CosmicTimeline();
  } else {
    setTimeout(() => {
      new CosmicTimeline();
    }, 100);
  }
});