/**
 * Daily Cosmic Dashboard
 * Provides personalized horoscopes, transit tracking, and moon phase calendar
 */

class CosmicDashboard {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.currentDate = new Date();
    this.currentMonth = new Date();
    this.transitPeriod = 'today';
    
    this.init();
  }

  init() {
    this.updateCurrentDate();
    this.setupEventListeners();
    this.setupLocationSearch();
    
    if (this.userProfile) {
      this.showDashboard();
    } else {
      this.showSetup();
    }
  }

  setupEventListeners() {
    // Setup form
    document.getElementById('setupDashboard').addEventListener('click', () => {
      this.setupUserProfile();
    });

    document.getElementById('skipSetup').addEventListener('click', () => {
      this.showDashboard();
    });

    // Transit controls
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTransitPeriod(e.target.dataset.period);
      });
    });

    // Moon calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.navigateMonth(-1);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.navigateMonth(1);
    });

    // Dashboard actions
    document.getElementById('refreshDashboard').addEventListener('click', () => {
      this.refreshDashboard();
    });

    document.getElementById('customizeSettings').addEventListener('click', () => {
      this.showCustomizeSettings();
    });

    document.getElementById('shareDashboard').addEventListener('click', () => {
      this.shareDashboard();
    });

    // Location search
    document.getElementById('setupLocation').addEventListener('input', () => {
      this.searchLocations();
    });
  }

  setupLocationSearch() {
    this.commonLocations = [
      { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
      { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
      { name: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
      { name: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
      { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
      { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
      { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
      { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
      { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' }
    ];
  }

  updateCurrentDate() {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = this.currentDate.toLocaleDateString('en-US', options);
  }

  showSetup() {
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('dashboardMain').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('dashboardMain').style.display = 'block';
    
    this.loadDashboardData();
    
    // Track dashboard usage
    if (window.userProfile) {
      window.userProfile.updateProfile({
        engagement: {
          ...window.userProfile.getProfile().engagement,
          dashboardUsed: true
        }
      });
    }
  }

  async setupUserProfile() {
    const date = document.getElementById('setupDate').value;
    const time = document.getElementById('setupTime').value || '12:00';
    const locationInput = document.getElementById('setupLocation').value;

    if (!date || !locationInput) {
      alert('Please fill in your birth date and location');
      return;
    }

    // Find location from suggestions or use default
    const location = this.findLocationByName(locationInput) || {
      name: locationInput,
      lat: 0,
      lng: 0,
      timezone: 'UTC'
    };

    this.userProfile = {
      birthDate: date,
      birthTime: time,
      location: location,
      sunSign: await this.calculateSunSign(date),
      preferences: {
        showPersonalizedContent: true,
        notificationTime: '09:00'
      }
    };

    this.saveUserProfile();
    this.showDashboard();
  }

  async loadDashboardData() {
    // Load all dashboard sections
    await Promise.all([
      this.loadCosmicWeather(),
      this.loadQuickInsights(),
      this.loadPersonalHoroscope(),
      this.loadTransitData(),
      this.loadMoonPhaseData(),
      this.loadCosmicEvents()
    ]);
  }

  async loadCosmicWeather() {
    try {
      const currentPlanets = await this.getCurrentPlanetaryPositions();
      
      const sunSign = this.getZodiacSign(currentPlanets.sun);
      const moonSign = this.getZodiacSign(currentPlanets.moon);
      
      document.getElementById('currentSunSign').textContent = sunSign;
      document.getElementById('currentMoonSign').textContent = moonSign;
      
      document.getElementById('sunDescription').textContent = this.getSunSignDescription(sunSign);
      document.getElementById('moonDescription').textContent = this.getMoonSignDescription(moonSign);
      
    } catch (error) {
      console.error('Error loading cosmic weather:', error);
      this.showCosmicWeatherError();
    }
  }

  async loadQuickInsights() {
    const insights = await this.generateQuickInsights();
    
    document.getElementById('dailyFocus').textContent = insights.dailyFocus;
    document.getElementById('luckyElement').textContent = insights.luckyElement;
    document.getElementById('cosmicAdvice').textContent = insights.cosmicAdvice;
  }

  async loadPersonalHoroscope() {
    if (!this.userProfile) {
      document.getElementById('horoscopeSection').style.display = 'none';
      return;
    }

    document.getElementById('userSign').textContent = this.userProfile.sunSign;
    document.getElementById('userLocation').textContent = this.userProfile.location.name;

    const horoscope = await this.generatePersonalHoroscope();
    
    document.getElementById('personalHoroscope').innerHTML = `<p>${horoscope.general}</p>`;
    document.getElementById('loveHoroscope').textContent = horoscope.love;
    document.getElementById('careerHoroscope').textContent = horoscope.career;
    document.getElementById('growthHoroscope').textContent = horoscope.growth;
  }

  async loadTransitData() {
    const transits = await this.calculateTransits(this.transitPeriod);
    this.displayTransits(transits);
    this.displayActiveTransits(transits);
  }

  async loadMoonPhaseData() {
    const moonData = await this.calculateMoonPhase();
    this.displayCurrentMoonPhase(moonData);
    this.generateMoonCalendar();
    this.displayLunarAdvice(moonData);
  }

  async loadCosmicEvents() {
    const events = await this.getUpcomingCosmicEvents();
    this.displayCosmicEvents(events);
  }

  // Planetary calculations
  async getCurrentPlanetaryPositions() {
    const julianDay = this.calculateJulianDay(this.currentDate);
    
    // Simplified planetary positions for current date
    return {
      sun: (julianDay * 0.98565) % 360, // Approximate sun position
      moon: (julianDay * 13.176) % 360, // Approximate moon position
      mercury: (julianDay * 4.09) % 360,
      venus: (julianDay * 1.602) % 360,
      mars: (julianDay * 0.524) % 360
    };
  }

  calculateJulianDay(date) {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
  }

  async calculateSunSign(birthDate) {
    const date = new Date(birthDate);
    const julianDay = this.calculateJulianDay(date);
    const sunPosition = (julianDay * 0.98565) % 360;
    return this.getZodiacSign(sunPosition);
  }

  // Content generation
  getSunSignDescription(sign) {
    const descriptions = {
      'Aries': 'Dynamic energy and new beginnings fill the air',
      'Taurus': 'Steady, grounding energy promotes stability and comfort',
      'Gemini': 'Communication and curiosity are highlighted today',
      'Cancer': 'Emotional depth and nurturing energy prevail',
      'Leo': 'Creative expression and confidence shine brightly',
      'Virgo': 'Attention to detail and practical matters take focus',
      'Libra': 'Balance, harmony, and relationships are emphasized',
      'Scorpio': 'Intense transformation and deep insights emerge',
      'Sagittarius': 'Adventure, wisdom, and expansion call to you',
      'Capricorn': 'Structure, ambition, and long-term goals matter',
      'Aquarius': 'Innovation, friendship, and humanitarian ideals inspire',
      'Pisces': 'Intuition, compassion, and spiritual connection flow'
    };
    return descriptions[sign] || 'Cosmic energy flows through the day';
  }

  getMoonSignDescription(sign) {
    const descriptions = {
      'Aries': 'Emotional impulses and quick reactions are heightened',
      'Taurus': 'Emotional security and comfort-seeking are strong',
      'Gemini': 'Mental stimulation and communication needs increase',
      'Cancer': 'Deep emotional sensitivity and nurturing instincts emerge',
      'Leo': 'Dramatic emotions and need for recognition surface',
      'Virgo': 'Practical emotional responses and analysis dominate',
      'Libra': 'Emotional balance and harmony-seeking are key',
      'Scorpio': 'Intense emotional depths and transformation occur',
      'Sagittarius': 'Emotional freedom and philosophical moods arise',
      'Capricorn': 'Emotional control and responsibility take precedence',
      'Aquarius': 'Detached emotions and group consciousness emerge',
      'Pisces': 'Emotional intuition and empathy flow freely'
    };
    return descriptions[sign] || 'Lunar energy influences emotions';
  }

  async generateQuickInsights() {
    const dayOfYear = Math.floor((this.currentDate - new Date(this.currentDate.getFullYear(), 0, 0)) / 86400000);
    
    const focusOptions = [
      'Communication and connection with others',
      'Creative expression and artistic pursuits',
      'Financial planning and resource management',
      'Health and wellness practices',
      'Learning and expanding knowledge',
      'Relationships and emotional bonds',
      'Career advancement and professional goals',
      'Spiritual growth and inner reflection'
    ];

    const elementOptions = [
      'Water - emotions and intuition guide you',
      'Fire - passion and energy fuel your day',
      'Earth - practical matters and stability',
      'Air - ideas and communication flow freely'
    ];

    const adviceOptions = [
      'Trust your intuition when making important decisions',
      'Take time for self-care and emotional nurturing',
      'Focus on clear communication in all interactions',
      'Embrace change as an opportunity for growth',
      'Pay attention to the details that others might miss',
      'Balance work and play for optimal well-being',
      'Connect with nature to ground your energy',
      'Practice gratitude for the abundance in your life'
    ];

    return {
      dailyFocus: focusOptions[dayOfYear % focusOptions.length],
      luckyElement: elementOptions[dayOfYear % elementOptions.length],
      cosmicAdvice: adviceOptions[dayOfYear % adviceOptions.length]
    };
  }

  async generatePersonalHoroscope() {
    if (!this.userProfile) {
      return {
        general: 'Create your profile to receive personalized insights.',
        love: 'Personal insights available after setup.',
        career: 'Professional guidance available after setup.',
        growth: 'Growth opportunities available after setup.'
      };
    }

    const sign = this.userProfile.sunSign;
    const dayOfYear = Math.floor((this.currentDate - new Date(this.currentDate.getFullYear(), 0, 0)) / 86400000);
    
    const generalHoroscopes = {
      'Aries': [
        'Your natural leadership shines today. Take initiative in projects that matter to you.',
        'Energy levels are high - channel this into productive activities and new ventures.',
        'Bold decisions made today will have positive long-term consequences.'
      ],
      'Taurus': [
        'Focus on building stability in your personal and professional life today.',
        'Your practical nature helps others find solutions to complex problems.',
        'Material security and comfort take priority - make wise financial choices.'
      ],
      'Gemini': [
        'Communication is your superpower today. Share your ideas with confidence.',
        'Curiosity leads to interesting discoveries and new connections.',
        'Variety and mental stimulation keep you energized and motivated.'
      ],
      'Cancer': [
        'Trust your emotional instincts when dealing with important matters.',
        'Home and family connections provide comfort and strength today.',
        'Your nurturing nature helps heal and support those around you.'
      ],
      'Leo': [
        'Your creative talents are highlighted - express yourself boldly.',
        'Leadership opportunities present themselves in unexpected ways.',
        'Confidence and charisma attract positive attention and opportunities.'
      ],
      'Virgo': [
        'Attention to detail helps you excel in work and personal projects.',
        'Your analytical skills solve problems that have puzzled others.',
        'Health and wellness practices bring noticeable improvements.'
      ],
      'Libra': [
        'Harmony and balance guide your decisions and relationships today.',
        'Your diplomatic skills help resolve conflicts and create peace.',
        'Beauty and aesthetics inspire your choices and surroundings.'
      ],
      'Scorpio': [
        'Deep insights and transformative experiences await you today.',
        'Your intuitive powers are especially strong - trust your instincts.',
        'Emotional depth and authenticity attract meaningful connections.'
      ],
      'Sagittarius': [
        'Adventure and learning opportunities expand your horizons today.',
        'Your optimistic outlook inspires and motivates others around you.',
        'Philosophical discussions and higher learning bring satisfaction.'
      ],
      'Capricorn': [
        'Steady progress toward your goals brings a sense of accomplishment.',
        'Your responsible nature earns respect and recognition from others.',
        'Long-term planning and practical decisions pay off handsomely.'
      ],
      'Aquarius': [
        'Innovation and original thinking set you apart from the crowd.',
        'Group activities and humanitarian causes capture your interest.',
        'Technology and progressive ideas play a significant role today.'
      ],
      'Pisces': [
        'Intuition and empathy guide you to help others in meaningful ways.',
        'Creative and spiritual pursuits bring deep satisfaction and peace.',
        'Emotional sensitivity allows you to connect deeply with others.'
      ]
    };

    const loveHoroscopes = {
      'Aries': 'Passion runs high in romantic matters. Express your feelings boldly.',
      'Taurus': 'Steady, reliable love brings comfort. Focus on building trust.',
      'Gemini': 'Communication strengthens bonds. Share your thoughts openly.',
      'Cancer': 'Emotional intimacy deepens connections. Be vulnerable and caring.',
      'Leo': 'Romance takes center stage. Show appreciation and affection.',
      'Virgo': 'Practical gestures of love speak louder than words today.',
      'Libra': 'Harmony in relationships is achievable through compromise.',
      'Scorpio': 'Intense emotional connections transform your perspective on love.',
      'Sagittarius': 'Adventure with your partner brings excitement and joy.',
      'Capricorn': 'Commitment and stability strengthen your romantic foundation.',
      'Aquarius': 'Friendship forms the basis of your strongest romantic connections.',
      'Pisces': 'Compassion and understanding deepen your emotional bonds.'
    };

    const careerHoroscopes = {
      'Aries': 'Leadership opportunities arise. Take charge of important projects.',
      'Taurus': 'Steady work and persistence lead to financial rewards.',
      'Gemini': 'Communication skills open doors to new professional opportunities.',
      'Cancer': 'Nurturing team relationships improves workplace harmony.',
      'Leo': 'Creative projects gain recognition and positive feedback.',
      'Virgo': 'Attention to detail impresses supervisors and colleagues.',
      'Libra': 'Collaborative efforts produce excellent results and recognition.',
      'Scorpio': 'Research and investigation skills prove valuable in your work.',
      'Sagittarius': 'Teaching or sharing knowledge brings professional satisfaction.',
      'Capricorn': 'Strategic planning and organization advance your career goals.',
      'Aquarius': 'Innovative ideas and technology skills set you apart professionally.',
      'Pisces': 'Helping others through your work brings deep fulfillment.'
    };

    const growthHoroscopes = {
      'Aries': 'Develop patience and consider others\' perspectives for personal growth.',
      'Taurus': 'Embrace change and flexibility to expand your comfort zone.',
      'Gemini': 'Focus and depth will enhance your natural versatility.',
      'Cancer': 'Balance emotional sensitivity with rational decision-making.',
      'Leo': 'Practice humility while maintaining your natural confidence.',
      'Virgo': 'Allow imperfection and spontaneity to enrich your experiences.',
      'Libra': 'Develop decisiveness and trust your own judgment more.',
      'Scorpio': 'Practice forgiveness and letting go for emotional freedom.',
      'Sagittarius': 'Attention to details will support your big-picture vision.',
      'Capricorn': 'Allow more spontaneity and fun into your structured life.',
      'Aquarius': 'Balance independence with deeper emotional connections.',
      'Pisces': 'Develop boundaries and practical skills to support your dreams.'
    };

    const signHoroscopes = generalHoroscopes[sign] || ['Your unique cosmic energy guides you today.'];
    
    return {
      general: signHoroscopes[dayOfYear % signHoroscopes.length],
      love: loveHoroscopes[sign] || 'Love energy flows in mysterious ways.',
      career: careerHoroscopes[sign] || 'Professional opportunities await your attention.',
      growth: growthHoroscopes[sign] || 'Personal development brings new insights.'
    };
  }

  // Transit calculations and display
  async calculateTransits(period) {
    const transits = [];
    const startDate = new Date(this.currentDate);
    let endDate = new Date(this.currentDate);

    switch (period) {
      case 'today':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    // Generate sample transits
    const transitTypes = [
      { planet: 'Mercury', aspect: 'conjunct', description: 'enhances communication and mental clarity' },
      { planet: 'Venus', aspect: 'trine', description: 'brings harmony to relationships and finances' },
      { planet: 'Mars', aspect: 'square', description: 'creates dynamic tension requiring action' },
      { planet: 'Jupiter', aspect: 'sextile', description: 'offers opportunities for growth and expansion' },
      { planet: 'Saturn', aspect: 'opposition', description: 'challenges you to find balance and responsibility' }
    ];

    for (let i = 0; i < 5; i++) {
      const transitDate = new Date(startDate);
      transitDate.setDate(transitDate.getDate() + Math.floor(Math.random() * 7));
      
      const transit = transitTypes[i % transitTypes.length];
      transits.push({
        date: transitDate,
        planet: transit.planet,
        aspect: transit.aspect,
        description: transit.description,
        intensity: Math.floor(Math.random() * 5) + 1
      });
    }

    return transits.sort((a, b) => a.date - b.date);
  }

  displayTransits(transits) {
    const container = document.getElementById('transitEvents');
    container.innerHTML = '';

    transits.forEach((transit, index) => {
      const transitElement = document.createElement('div');
      transitElement.className = 'transit-event';
      transitElement.style.left = `${(index / transits.length) * 100}%`;
      
      transitElement.innerHTML = `
        <div class="transit-marker intensity-${transit.intensity}"></div>
        <div class="transit-tooltip">
          <strong>${transit.planet} ${transit.aspect}</strong><br>
          ${transit.date.toLocaleDateString()}<br>
          ${transit.description}
        </div>
      `;
      
      container.appendChild(transitElement);
    });
  }

  displayActiveTransits(transits) {
    const container = document.getElementById('activeTransits');
    const activeTransits = transits.filter(t => 
      Math.abs(t.date - this.currentDate) < 2 * 24 * 60 * 60 * 1000 // Within 2 days
    );

    if (activeTransits.length === 0) {
      container.innerHTML = '<p>No major transits affecting you today.</p>';
      return;
    }

    container.innerHTML = activeTransits.map(transit => `
      <div class="active-transit">
        <div class="transit-header">
          <h4>${transit.planet} ${transit.aspect}</h4>
          <span class="transit-date">${transit.date.toLocaleDateString()}</span>
        </div>
        <p>${transit.description}</p>
        <div class="intensity-bar">
          <div class="intensity-fill" style="width: ${transit.intensity * 20}%"></div>
        </div>
      </div>
    `).join('');
  }

  switchTransitPeriod(period) {
    this.transitPeriod = period;
    
    // Update active button
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    // Reload transit data
    this.loadTransitData();
  }

  // Moon phase calculations
  async calculateMoonPhase() {
    const now = this.currentDate;
    const newMoon = new Date('2024-01-11'); // Reference new moon
    const lunarCycle = 29.53059; // Days in lunar cycle
    
    const daysSinceNewMoon = (now - newMoon) / (1000 * 60 * 60 * 24);
    const cyclePosition = (daysSinceNewMoon % lunarCycle) / lunarCycle;
    
    let phaseName, phaseDescription;
    const illumination = Math.abs(Math.sin(cyclePosition * Math.PI)) * 100;
    
    if (cyclePosition < 0.125) {
      phaseName = 'New Moon';
      phaseDescription = 'A time for new beginnings and setting intentions';
    } else if (cyclePosition < 0.25) {
      phaseName = 'Waxing Crescent';
      phaseDescription = 'Growth and building momentum toward your goals';
    } else if (cyclePosition < 0.375) {
      phaseName = 'First Quarter';
      phaseDescription = 'Decision time - overcome obstacles and take action';
    } else if (cyclePosition < 0.5) {
      phaseName = 'Waxing Gibbous';
      phaseDescription = 'Refinement and adjustment as you near completion';
    } else if (cyclePosition < 0.625) {
      phaseName = 'Full Moon';
      phaseDescription = 'Culmination and manifestation of your efforts';
    } else if (cyclePosition < 0.75) {
      phaseName = 'Waning Gibbous';
      phaseDescription = 'Gratitude and sharing the fruits of your labor';
    } else if (cyclePosition < 0.875) {
      phaseName = 'Last Quarter';
      phaseDescription = 'Release and forgiveness - let go of what no longer serves';
    } else {
      phaseName = 'Waning Crescent';
      phaseDescription = 'Rest and reflection before the next cycle begins';
    }

    const moonPosition = (daysSinceNewMoon * 13.176) % 360; // Approximate moon position
    const moonSign = this.getZodiacSign(moonPosition);

    return {
      phaseName,
      phaseDescription,
      illumination: Math.round(illumination),
      cyclePosition,
      moonSign
    };
  }

  displayCurrentMoonPhase(moonData) {
    document.getElementById('moonPhaseName').textContent = moonData.phaseName;
    document.getElementById('moonPhaseDescription').textContent = moonData.phaseDescription;
    document.getElementById('moonIllumination').textContent = `${moonData.illumination}%`;
    document.getElementById('moonPhaseSign').textContent = moonData.moonSign;

    // Update moon visual
    const moonShadow = document.getElementById('moonShadow');
    const shadowPosition = moonData.cyclePosition * 100;
    
    if (moonData.cyclePosition < 0.5) {
      // Waxing - shadow on left
      moonShadow.style.left = '0';
      moonShadow.style.width = `${100 - shadowPosition * 2}%`;
    } else {
      // Waning - shadow on right
      moonShadow.style.left = `${(moonData.cyclePosition - 0.5) * 200}%`;
      moonShadow.style.width = `${100 - (1 - moonData.cyclePosition) * 200}%`;
    }
  }

  generateMoonCalendar() {
    const container = document.getElementById('moonCalendarGrid');
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Update month display
    document.getElementById('currentMonth').textContent = 
      this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = '<div class="calendar-header">';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      calendarHTML += `<div class="day-header">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === this.currentDate.toDateString();
      const moonPhase = this.calculateMoonPhaseForDate(date);
      
      calendarHTML += `
        <div class="calendar-day ${isToday ? 'today' : ''}">
          <span class="day-number">${day}</span>
          <span class="moon-phase-icon">${this.getMoonPhaseIcon(moonPhase)}</span>
        </div>
      `;
    }

    calendarHTML += '</div>';
    container.innerHTML = calendarHTML;
  }

  calculateMoonPhaseForDate(date) {
    const newMoon = new Date('2024-01-11');
    const lunarCycle = 29.53059;
    const daysSinceNewMoon = (date - newMoon) / (1000 * 60 * 60 * 24);
    return (daysSinceNewMoon % lunarCycle) / lunarCycle;
  }

  getMoonPhaseIcon(cyclePosition) {
    if (cyclePosition < 0.125) return '🌑';
    if (cyclePosition < 0.25) return '🌒';
    if (cyclePosition < 0.375) return '🌓';
    if (cyclePosition < 0.5) return '🌔';
    if (cyclePosition < 0.625) return '🌕';
    if (cyclePosition < 0.75) return '🌖';
    if (cyclePosition < 0.875) return '🌗';
    return '🌘';
  }

  displayLunarAdvice(moonData) {
    const advice = this.generateLunarAdvice(moonData);
    document.getElementById('lunarAdvice').innerHTML = `<p>${advice}</p>`;
  }

  generateLunarAdvice(moonData) {
    const phaseAdvice = {
      'New Moon': 'Set clear intentions and plant seeds for future growth. This is your time to begin anew.',
      'Waxing Crescent': 'Take the first steps toward your goals. Small actions now lead to big results later.',
      'First Quarter': 'Push through challenges and make important decisions. Your determination pays off.',
      'Waxing Gibbous': 'Fine-tune your approach and stay focused on your objectives. Success is within reach.',
      'Full Moon': 'Celebrate your achievements and share your success with others. Your efforts have manifested.',
      'Waning Gibbous': 'Express gratitude and help others benefit from your experience and wisdom.',
      'Last Quarter': 'Release what no longer serves you. Forgiveness and letting go create space for new blessings.',
      'Waning Crescent': 'Rest, reflect, and prepare for the next cycle. Self-care and introspection are essential.'
    };

    const signAdvice = {
      'Aries': 'Channel lunar energy into bold new initiatives and leadership opportunities.',
      'Taurus': 'Focus on material security and sensual pleasures during this lunar phase.',
      'Gemini': 'Communication and learning are highlighted by the moon\'s current position.',
      'Cancer': 'Emotional nurturing and family connections are especially important now.',
      'Leo': 'Creative expression and recognition are favored by today\'s lunar energy.',
      'Virgo': 'Attention to health and daily routines brings the best lunar results.',
      'Libra': 'Relationships and harmony benefit from the moon\'s current influence.',
      'Scorpio': 'Deep transformation and emotional healing are supported by lunar energy.',
      'Sagittarius': 'Adventure and philosophical pursuits are blessed by the moon\'s position.',
      'Capricorn': 'Career advancement and long-term planning are lunar-supported now.',
      'Aquarius': 'Group activities and humanitarian efforts are lunar-blessed today.',
      'Pisces': 'Spiritual practices and intuitive development are enhanced by lunar energy.'
    };

    return `${phaseAdvice[moonData.phaseName]} With the Moon in ${moonData.moonSign}, ${signAdvice[moonData.moonSign].toLowerCase()}`;
  }

  navigateMonth(direction) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.generateMoonCalendar();
  }

  // Cosmic events
  async getUpcomingCosmicEvents() {
    const events = [
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        title: 'Mercury enters Gemini',
        description: 'Communication and mental agility are enhanced',
        type: 'planetary'
      },
      {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        title: 'Venus trine Jupiter',
        description: 'Love, luck, and abundance flow freely',
        type: 'aspect'
      },
      {
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        title: 'Full Moon in Leo',
        description: 'Creative expression and self-confidence peak',
        type: 'lunar'
      },
      {
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        title: 'Mars square Saturn',
        description: 'Patience and persistence overcome obstacles',
        type: 'aspect'
      }
    ];

    return events.sort((a, b) => a.date - b.date);
  }

  displayCosmicEvents(events) {
    const container = document.getElementById('cosmicEvents');
    
    container.innerHTML = events.map(event => `
      <div class="cosmic-event ${event.type}">
        <div class="event-date">
          <span class="month">${event.date.toLocaleDateString('en-US', { month: 'short' })}</span>
          <span class="day">${event.date.getDate()}</span>
        </div>
        <div class="event-content">
          <h4>${event.title}</h4>
          <p>${event.description}</p>
        </div>
        <div class="event-type-icon">
          ${this.getEventTypeIcon(event.type)}
        </div>
      </div>
    `).join('');
  }

  getEventTypeIcon(type) {
    const icons = {
      'planetary': '🪐',
      'aspect': '✨',
      'lunar': '🌙',
      'solar': '☀️'
    };
    return icons[type] || '⭐';
  }

  // Location search
  searchLocations() {
    const input = document.getElementById('setupLocation');
    const suggestions = document.getElementById('setupLocationSuggestions');
    const query = input.value.toLowerCase().trim();

    if (query.length < 2) {
      suggestions.innerHTML = '';
      suggestions.style.display = 'none';
      return;
    }

    const matches = this.commonLocations.filter(location => 
      location.name.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length > 0) {
      suggestions.innerHTML = matches.map(location => 
        `<div class="location-suggestion" data-location='${JSON.stringify(location)}'>
          ${location.name}
        </div>`
      ).join('');
      
      suggestions.style.display = 'block';

      suggestions.querySelectorAll('.location-suggestion').forEach(item => {
        item.addEventListener('click', (e) => {
          const location = JSON.parse(e.target.dataset.location);
          input.value = location.name;
          suggestions.style.display = 'none';
        });
      });
    } else {
      suggestions.style.display = 'none';
    }
  }

  findLocationByName(name) {
    return this.commonLocations.find(location => 
      location.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // User profile management
  loadUserProfile() {
    const stored = localStorage.getItem('astroaura_user_profile');
    return stored ? JSON.parse(stored) : null;
  }

  saveUserProfile() {
    localStorage.setItem('astroaura_user_profile', JSON.stringify(this.userProfile));
  }

  // Dashboard actions
  refreshDashboard() {
    this.currentDate = new Date();
    this.updateCurrentDate();
    this.loadDashboardData();
  }

  showCustomizeSettings() {
    // Show settings modal (simplified)
    alert('Customization settings coming soon! You can modify your birth details and preferences.');
  }

  shareDashboard() {
    const shareText = `Check out my cosmic insights for today! ✨ ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Daily Cosmic Dashboard - AstroAura',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Dashboard link copied to clipboard!');
      });
    }
  }

  // Error handling
  showCosmicWeatherError() {
    document.getElementById('currentSunSign').textContent = 'Loading...';
    document.getElementById('currentMoonSign').textContent = 'Loading...';
    document.getElementById('sunDescription').textContent = 'Unable to load solar energy data';
    document.getElementById('moonDescription').textContent = 'Unable to load lunar energy data';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CosmicDashboard();
});