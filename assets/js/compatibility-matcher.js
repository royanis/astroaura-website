/**
 * Compatibility Matcher
 * Implements dual input system and compatibility analysis
 */

class CompatibilityMatcher {
  constructor() {
    this.currentStep = 1;
    this.person1Data = {};
    this.person2Data = {};
    this.person1Chart = null;
    this.person2Chart = null;
    this.compatibilityAnalysis = null;
    this.locationCache = new Map();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFormValidation();
    this.setupLocationSearch();
  }

  setupEventListeners() {
    // Form navigation
    document.querySelectorAll('.next-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nextStep = parseInt(e.target.dataset.next);
        this.validateAndProceed(nextStep);
      });
    });

    document.querySelectorAll('.prev-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prevStep = parseInt(e.target.dataset.prev);
        this.goToStep(prevStep);
      });
    });

    // Calculate compatibility
    document.getElementById('calculateCompatibility').addEventListener('click', () => {
      this.calculateCompatibility();
    });

    // View results
    document.getElementById('viewCompatibility').addEventListener('click', () => {
      this.showCompatibilityResults();
    });

    // Actions
    document.getElementById('downloadCompatibility').addEventListener('click', () => {
      this.downloadReport();
    });

    document.getElementById('shareCompatibility').addEventListener('click', () => {
      this.shareReport();
    });

    document.getElementById('newCompatibility').addEventListener('click', () => {
      this.resetForm();
    });
  }

  setupFormValidation() {
    // Person 1 validation
    document.getElementById('person1Date').addEventListener('change', () => this.validateDate('person1'));
    document.getElementById('person1Time').addEventListener('change', () => this.validateTime('person1'));
    document.getElementById('person1Location').addEventListener('input', () => this.searchLocations('person1'));

    // Person 2 validation
    document.getElementById('person2Date').addEventListener('change', () => this.validateDate('person2'));
    document.getElementById('person2Time').addEventListener('change', () => this.validateTime('person2'));
    document.getElementById('person2Location').addEventListener('input', () => this.searchLocations('person2'));
  }

  setupLocationSearch() {
    // Use the same location data as birth chart calculator
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

  validateDate(person) {
    const dateInput = document.getElementById(`${person}Date`);
    const error = document.getElementById(`${person}DateError`);
    
    if (!dateInput.value) {
      this.showError(error, 'Please enter birth date');
      return false;
    }

    const date = new Date(dateInput.value);
    const now = new Date();
    
    if (date > now) {
      this.showError(error, 'Birth date cannot be in the future');
      return false;
    }

    if (date.getFullYear() < 1900) {
      this.showError(error, 'Please enter a date after 1900');
      return false;
    }

    this.clearError(error);
    
    if (person === 'person1') {
      this.person1Data.date = dateInput.value;
    } else {
      this.person2Data.date = dateInput.value;
    }
    
    return true;
  }

  validateTime(person) {
    const timeInput = document.getElementById(`${person}Time`);
    
    // Time is optional, default to 12:00 if not provided
    if (!timeInput.value) {
      timeInput.value = '12:00';
    }

    if (person === 'person1') {
      this.person1Data.time = timeInput.value;
    } else {
      this.person2Data.time = timeInput.value;
    }
    
    return true;
  }

  searchLocations(person) {
    const input = document.getElementById(`${person}Location`);
    const suggestions = document.getElementById(`${person}LocationSuggestions`);
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
        `<div class="location-suggestion" data-person="${person}" data-location='${JSON.stringify(location)}'>
          ${location.name}
        </div>`
      ).join('');
      
      suggestions.style.display = 'block';

      // Add click handlers
      suggestions.querySelectorAll('.location-suggestion').forEach(item => {
        item.addEventListener('click', (e) => {
          const location = JSON.parse(e.target.dataset.location);
          const personId = e.target.dataset.person;
          this.selectLocation(personId, location);
        });
      });
    } else {
      suggestions.style.display = 'none';
    }
  }

  selectLocation(person, location) {
    const input = document.getElementById(`${person}Location`);
    const suggestions = document.getElementById(`${person}LocationSuggestions`);
    const coordinates = document.getElementById(`${person}CoordinatesDisplay`);
    const coordText = document.getElementById(`${person}SelectedCoordinates`);

    input.value = location.name;
    suggestions.style.display = 'none';
    
    if (person === 'person1') {
      this.person1Data.location = location;
    } else {
      this.person2Data.location = location;
    }
    
    coordText.textContent = `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`;
    coordinates.style.display = 'block';

    this.clearError(document.getElementById(`${person}LocationError`));
  }

  validateLocation(person) {
    const error = document.getElementById(`${person}LocationError`);
    const personData = person === 'person1' ? this.person1Data : this.person2Data;
    
    if (!personData.location) {
      this.showError(error, 'Please select a location from the suggestions');
      return false;
    }

    this.clearError(error);
    return true;
  }

  validateAndProceed(nextStep) {
    let isValid = true;

    if (this.currentStep === 1) {
      // Validate person 1 data
      isValid = this.validateDate('person1') && 
                this.validateTime('person1') && 
                this.validateLocation('person1');
      
      // Store name
      this.person1Data.name = document.getElementById('person1Name').value || 'Person 1';
    } else if (this.currentStep === 2) {
      // Validate person 2 data
      isValid = this.validateDate('person2') && 
                this.validateTime('person2') && 
                this.validateLocation('person2');
      
      // Store name
      this.person2Data.name = document.getElementById('person2Name').value || 'Person 2';
    }

    if (isValid) {
      this.goToStep(nextStep);
    }
  }

  goToStep(step) {
    // Hide current step
    document.querySelector(`#step${this.currentStep}`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${this.currentStep}"]`).classList.remove('active');

    // Show new step
    document.querySelector(`#step${step}`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');

    this.currentStep = step;
  }

  async calculateCompatibility() {
    this.goToStep(3);
    
    try {
      // Show loading
      document.getElementById('compatibilityLoading').style.display = 'block';
      document.getElementById('compatibilityComplete').style.display = 'none';

      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Calculate both birth charts
      this.person1Chart = await this.calculateBirthChart(this.person1Data);
      this.person2Chart = await this.calculateBirthChart(this.person2Data);

      // Perform compatibility analysis
      this.compatibilityAnalysis = this.performCompatibilityAnalysis();
      
      // Track compatibility usage
      if (window.userProfile) {
        window.userProfile.updateProfile({
          engagement: {
            ...window.userProfile.getProfile().engagement,
            compatibilityChecked: true
          }
        });
      }

      // Show completion
      document.getElementById('compatibilityLoading').style.display = 'none';
      document.getElementById('compatibilityComplete').style.display = 'block';

    } catch (error) {
      console.error('Compatibility calculation error:', error);
      this.showCalculationError();
    }
  }

  async calculateBirthChart(personData) {
    // Reuse the birth chart calculation logic
    const { date, time, location } = personData;
    const birthDateTime = new Date(`${date}T${time}`);
    
    // Calculate Julian Day Number
    const julianDay = this.calculateJulianDay(birthDateTime);
    
    // Calculate planetary positions (simplified)
    const planets = await this.calculatePlanetaryPositions(julianDay);
    
    // Calculate house cusps
    const houses = this.calculateHouseCusps(julianDay, location.lat, location.lng);
    
    // Calculate aspects
    const aspects = this.calculateAspects(planets);

    return {
      birthInfo: {
        name: personData.name,
        date: date,
        time: time,
        location: location.name,
        coordinates: { lat: location.lat, lng: location.lng },
        julianDay: julianDay
      },
      planets: planets,
      houses: houses,
      aspects: aspects
    };
  }

  performCompatibilityAnalysis() {
    const analysis = {
      overallScore: this.calculateOverallCompatibility(),
      emotionalConnection: this.analyzeEmotionalConnection(),
      communication: this.analyzeCommunication(),
      physicalAttraction: this.analyzePhysicalAttraction(),
      longTermPotential: this.analyzeLongTermPotential(),
      strengths: this.identifyRelationshipStrengths(),
      challenges: this.identifyRelationshipChallenges(),
      advice: this.generateRelationshipAdvice(),
      synastryAspects: this.calculateSynastryAspects()
    };

    return analysis;
  }

  calculateOverallCompatibility() {
    // Calculate overall compatibility based on multiple factors
    const sunCompatibility = this.calculateSignCompatibility(
      this.getPlanetSign(this.person1Chart.planets, 'Sun'),
      this.getPlanetSign(this.person2Chart.planets, 'Sun')
    );
    
    const moonCompatibility = this.calculateSignCompatibility(
      this.getPlanetSign(this.person1Chart.planets, 'Moon'),
      this.getPlanetSign(this.person2Chart.planets, 'Moon')
    );
    
    const venusCompatibility = this.calculateSignCompatibility(
      this.getPlanetSign(this.person1Chart.planets, 'Venus'),
      this.getPlanetSign(this.person2Chart.planets, 'Venus')
    );
    
    const marsCompatibility = this.calculateSignCompatibility(
      this.getPlanetSign(this.person1Chart.planets, 'Mars'),
      this.getPlanetSign(this.person2Chart.planets, 'Mars')
    );

    // Weight different factors
    const overall = Math.round(
      (sunCompatibility * 0.3 + 
       moonCompatibility * 0.25 + 
       venusCompatibility * 0.25 + 
       marsCompatibility * 0.2) * 100
    );

    return {
      score: Math.max(20, Math.min(95, overall)), // Keep between 20-95%
      title: this.getCompatibilityTitle(overall),
      description: this.getCompatibilityDescription(overall)
    };
  }

  analyzeEmotionalConnection() {
    const person1Moon = this.getPlanetSign(this.person1Chart.planets, 'Moon');
    const person2Moon = this.getPlanetSign(this.person2Chart.planets, 'Moon');
    
    const score = this.calculateSignCompatibility(person1Moon, person2Moon) * 100;
    
    return {
      score: Math.round(score),
      explanation: this.getEmotionalConnectionExplanation(person1Moon, person2Moon, score)
    };
  }

  analyzeCommunication() {
    const person1Mercury = this.getPlanetSign(this.person1Chart.planets, 'Mercury');
    const person2Mercury = this.getPlanetSign(this.person2Chart.planets, 'Mercury');
    
    const score = this.calculateSignCompatibility(person1Mercury, person2Mercury) * 100;
    
    return {
      score: Math.round(score),
      explanation: this.getCommunicationExplanation(person1Mercury, person2Mercury, score)
    };
  }

  analyzePhysicalAttraction() {
    const person1Venus = this.getPlanetSign(this.person1Chart.planets, 'Venus');
    const person1Mars = this.getPlanetSign(this.person1Chart.planets, 'Mars');
    const person2Venus = this.getPlanetSign(this.person2Chart.planets, 'Venus');
    const person2Mars = this.getPlanetSign(this.person2Chart.planets, 'Mars');
    
    // Cross-aspect analysis (Venus-Mars connections)
    const venusMarsCross1 = this.calculateSignCompatibility(person1Venus, person2Mars);
    const venusMarsCross2 = this.calculateSignCompatibility(person2Venus, person1Mars);
    
    const score = Math.round(((venusMarsCross1 + venusMarsCross2) / 2) * 100);
    
    return {
      score: score,
      explanation: this.getAttractionExplanation(person1Venus, person1Mars, person2Venus, person2Mars, score)
    };
  }

  analyzeLongTermPotential() {
    const person1Saturn = this.getPlanetSign(this.person1Chart.planets, 'Saturn');
    const person2Saturn = this.getPlanetSign(this.person2Chart.planets, 'Saturn');
    
    const person1Jupiter = this.getPlanetSign(this.person1Chart.planets, 'Jupiter');
    const person2Jupiter = this.getPlanetSign(this.person2Chart.planets, 'Jupiter');
    
    const saturnCompatibility = this.calculateSignCompatibility(person1Saturn, person2Saturn);
    const jupiterCompatibility = this.calculateSignCompatibility(person1Jupiter, person2Jupiter);
    
    const score = Math.round(((saturnCompatibility + jupiterCompatibility) / 2) * 100);
    
    return {
      score: score,
      explanation: this.getLongTermExplanation(person1Saturn, person2Saturn, person1Jupiter, person2Jupiter, score)
    };
  }

  calculateSignCompatibility(sign1, sign2) {
    // Compatibility matrix based on traditional astrological compatibility
    const compatibilityMatrix = {
      'Aries': { 'Aries': 0.7, 'Taurus': 0.4, 'Gemini': 0.8, 'Cancer': 0.5, 'Leo': 0.9, 'Virgo': 0.4, 'Libra': 0.6, 'Scorpio': 0.6, 'Sagittarius': 0.8, 'Capricorn': 0.5, 'Aquarius': 0.7, 'Pisces': 0.5 },
      'Taurus': { 'Aries': 0.4, 'Taurus': 0.8, 'Gemini': 0.5, 'Cancer': 0.9, 'Leo': 0.6, 'Virgo': 0.9, 'Libra': 0.7, 'Scorpio': 0.8, 'Sagittarius': 0.4, 'Capricorn': 0.9, 'Aquarius': 0.4, 'Pisces': 0.8 },
      'Gemini': { 'Aries': 0.8, 'Taurus': 0.5, 'Gemini': 0.7, 'Cancer': 0.5, 'Leo': 0.8, 'Virgo': 0.6, 'Libra': 0.9, 'Scorpio': 0.5, 'Sagittarius': 0.9, 'Capricorn': 0.4, 'Aquarius': 0.9, 'Pisces': 0.5 },
      'Cancer': { 'Aries': 0.5, 'Taurus': 0.9, 'Gemini': 0.5, 'Cancer': 0.8, 'Leo': 0.6, 'Virgo': 0.8, 'Libra': 0.6, 'Scorpio': 0.9, 'Sagittarius': 0.4, 'Capricorn': 0.7, 'Aquarius': 0.4, 'Pisces': 0.9 },
      'Leo': { 'Aries': 0.9, 'Taurus': 0.6, 'Gemini': 0.8, 'Cancer': 0.6, 'Leo': 0.7, 'Virgo': 0.5, 'Libra': 0.8, 'Scorpio': 0.6, 'Sagittarius': 0.9, 'Capricorn': 0.5, 'Aquarius': 0.7, 'Pisces': 0.6 },
      'Virgo': { 'Aries': 0.4, 'Taurus': 0.9, 'Gemini': 0.6, 'Cancer': 0.8, 'Leo': 0.5, 'Virgo': 0.8, 'Libra': 0.6, 'Scorpio': 0.8, 'Sagittarius': 0.5, 'Capricorn': 0.9, 'Aquarius': 0.5, 'Pisces': 0.7 },
      'Libra': { 'Aries': 0.6, 'Taurus': 0.7, 'Gemini': 0.9, 'Cancer': 0.6, 'Leo': 0.8, 'Virgo': 0.6, 'Libra': 0.7, 'Scorpio': 0.6, 'Sagittarius': 0.8, 'Capricorn': 0.6, 'Aquarius': 0.9, 'Pisces': 0.6 },
      'Scorpio': { 'Aries': 0.6, 'Taurus': 0.8, 'Gemini': 0.5, 'Cancer': 0.9, 'Leo': 0.6, 'Virgo': 0.8, 'Libra': 0.6, 'Scorpio': 0.8, 'Sagittarius': 0.5, 'Capricorn': 0.7, 'Aquarius': 0.5, 'Pisces': 0.9 },
      'Sagittarius': { 'Aries': 0.8, 'Taurus': 0.4, 'Gemini': 0.9, 'Cancer': 0.4, 'Leo': 0.9, 'Virgo': 0.5, 'Libra': 0.8, 'Scorpio': 0.5, 'Sagittarius': 0.7, 'Capricorn': 0.5, 'Aquarius': 0.8, 'Pisces': 0.6 },
      'Capricorn': { 'Aries': 0.5, 'Taurus': 0.9, 'Gemini': 0.4, 'Cancer': 0.7, 'Leo': 0.5, 'Virgo': 0.9, 'Libra': 0.6, 'Scorpio': 0.7, 'Sagittarius': 0.5, 'Capricorn': 0.8, 'Aquarius': 0.6, 'Pisces': 0.7 },
      'Aquarius': { 'Aries': 0.7, 'Taurus': 0.4, 'Gemini': 0.9, 'Cancer': 0.4, 'Leo': 0.7, 'Virgo': 0.5, 'Libra': 0.9, 'Scorpio': 0.5, 'Sagittarius': 0.8, 'Capricorn': 0.6, 'Aquarius': 0.7, 'Pisces': 0.6 },
      'Pisces': { 'Aries': 0.5, 'Taurus': 0.8, 'Gemini': 0.5, 'Cancer': 0.9, 'Leo': 0.6, 'Virgo': 0.7, 'Libra': 0.6, 'Scorpio': 0.9, 'Sagittarius': 0.6, 'Capricorn': 0.7, 'Aquarius': 0.6, 'Pisces': 0.8 }
    };

    return compatibilityMatrix[sign1]?.[sign2] || 0.5;
  }

  getCompatibilityTitle(score) {
    if (score >= 80) return 'Cosmic Soulmates';
    if (score >= 70) return 'Harmonious Connection';
    if (score >= 60) return 'Good Compatibility';
    if (score >= 50) return 'Moderate Compatibility';
    if (score >= 40) return 'Challenging but Workable';
    return 'Growth Through Differences';
  }

  getCompatibilityDescription(score) {
    if (score >= 80) return 'You share a deep cosmic connection with natural harmony and understanding.';
    if (score >= 70) return 'Your energies blend well together, creating a supportive and loving relationship.';
    if (score >= 60) return 'You have good compatibility with some areas requiring attention and compromise.';
    if (score >= 50) return 'Your relationship has potential but will require effort and understanding from both sides.';
    if (score >= 40) return 'While challenging, your differences can lead to growth and deeper understanding.';
    return 'Your relationship offers opportunities for significant personal growth through navigating differences.';
  }

  identifyRelationshipStrengths() {
    const strengths = [];
    
    // Analyze major planetary connections
    const sunSigns = [
      this.getPlanetSign(this.person1Chart.planets, 'Sun'),
      this.getPlanetSign(this.person2Chart.planets, 'Sun')
    ];
    
    const moonSigns = [
      this.getPlanetSign(this.person1Chart.planets, 'Moon'),
      this.getPlanetSign(this.person2Chart.planets, 'Moon')
    ];

    // Add strengths based on compatible elements
    const sunElements = sunSigns.map(sign => this.getSignElement(sign));
    const moonElements = moonSigns.map(sign => this.getSignElement(sign));

    if (this.areElementsCompatible(sunElements[0], sunElements[1])) {
      strengths.push(`Your core personalities (${sunSigns[0]} & ${sunSigns[1]}) complement each other beautifully`);
    }

    if (this.areElementsCompatible(moonElements[0], moonElements[1])) {
      strengths.push(`You share emotional understanding (${moonSigns[0]} & ${moonSigns[1]} Moons)`);
    }

    // Add more specific strengths
    strengths.push('Natural ability to support each other\'s growth');
    strengths.push('Shared values and life direction');

    return strengths;
  }

  identifyRelationshipChallenges() {
    const challenges = [];
    
    // Analyze potential friction points
    const person1Mars = this.getPlanetSign(this.person1Chart.planets, 'Mars');
    const person2Mars = this.getPlanetSign(this.person2Chart.planets, 'Mars');
    
    if (this.calculateSignCompatibility(person1Mars, person2Mars) < 0.6) {
      challenges.push(`Different approaches to action and conflict (${person1Mars} vs ${person2Mars} Mars)`);
    }

    challenges.push('Learning to balance individual needs with partnership goals');
    challenges.push('Developing patience during disagreements');

    return challenges;
  }

  generateRelationshipAdvice() {
    const advice = [];
    
    advice.push('Focus on your shared values and common goals to strengthen your bond.');
    advice.push('Practice active listening and express appreciation for each other regularly.');
    advice.push('Give each other space to grow individually while growing together as a couple.');
    advice.push('Use your differences as opportunities to learn and expand your perspectives.');

    return advice;
  }

  calculateSynastryAspects() {
    const synastryAspects = [];
    
    // Calculate aspects between person1's planets and person2's planets
    const importantPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    
    importantPlanets.forEach(planet1 => {
      importantPlanets.forEach(planet2 => {
        if (planet1 !== planet2) {
          const person1Planet = this.findPlanet(this.person1Chart.planets, planet1);
          const person2Planet = this.findPlanet(this.person2Chart.planets, planet2);
          
          if (person1Planet && person2Planet) {
            const aspect = this.calculateAspectBetweenPlanets(person1Planet, person2Planet);
            if (aspect) {
              synastryAspects.push({
                person1Planet: planet1,
                person2Planet: planet2,
                aspect: aspect.name,
                interpretation: this.interpretSynastryAspect(planet1, planet2, aspect.name)
              });
            }
          }
        }
      });
    });

    return synastryAspects.slice(0, 8); // Return top 8 aspects
  }

  showCompatibilityResults() {
    document.getElementById('compatibilityResults').style.display = 'block';
    
    // Update header info
    document.getElementById('person1Info').textContent = this.person1Chart.birthInfo.name;
    document.getElementById('person2Info').textContent = this.person2Chart.birthInfo.name;
    
    // Update overall score
    this.updateOverallScore();
    
    // Update detailed scores
    this.updateDetailedScores();
    
    // Update insights
    this.updateRelationshipInsights();
    
    // Update synastry aspects
    this.updateSynastryAspects();
    
    // Scroll to results
    document.getElementById('compatibilityResults').scrollIntoView({ behavior: 'smooth' });
  }

  updateOverallScore() {
    const overall = this.compatibilityAnalysis.overallScore;
    
    document.getElementById('overallScoreNumber').textContent = overall.score;
    document.getElementById('compatibilityTitle').textContent = overall.title;
    document.getElementById('compatibilityDescription').textContent = overall.description;
    
    // Animate score circle
    const circle = document.getElementById('overallScoreCircle');
    circle.style.background = `conic-gradient(#ffd700 0deg, #ffd700 ${overall.score * 3.6}deg, rgba(255, 255, 255, 0.1) ${overall.score * 3.6}deg)`;
  }

  updateDetailedScores() {
    const scores = [
      { id: 'emotional', data: this.compatibilityAnalysis.emotionalConnection },
      { id: 'communication', data: this.compatibilityAnalysis.communication },
      { id: 'attraction', data: this.compatibilityAnalysis.physicalAttraction },
      { id: 'longterm', data: this.compatibilityAnalysis.longTermPotential }
    ];

    scores.forEach(({ id, data }) => {
      const fill = document.getElementById(`${id}Score`);
      const text = document.getElementById(`${id}ScoreText`);
      const explanation = document.getElementById(`${id}Explanation`);
      
      // Animate score bar
      setTimeout(() => {
        fill.style.width = `${data.score}%`;
        fill.style.background = this.getScoreColor(data.score);
      }, 500);
      
      text.textContent = `${data.score}%`;
      explanation.textContent = data.explanation;
    });
  }

  updateRelationshipInsights() {
    // Strengths
    const strengthsList = document.getElementById('relationshipStrengths');
    strengthsList.innerHTML = this.compatibilityAnalysis.strengths.map(strength => 
      `<div class="strength-item">💫 ${strength}</div>`
    ).join('');

    // Challenges
    const challengesList = document.getElementById('relationshipChallenges');
    challengesList.innerHTML = this.compatibilityAnalysis.challenges.map(challenge => 
      `<div class="challenge-item">🎯 ${challenge}</div>`
    ).join('');

    // Advice
    const adviceContent = document.getElementById('relationshipAdvice');
    adviceContent.innerHTML = this.compatibilityAnalysis.advice.map(advice => 
      `<div class="advice-item">💡 ${advice}</div>`
    ).join('');
  }

  updateSynastryAspects() {
    const aspectsContainer = document.getElementById('synastryAspects');
    aspectsContainer.innerHTML = this.compatibilityAnalysis.synastryAspects.map(aspect => 
      `<div class="synastry-aspect">
        <h4>${this.person1Chart.birthInfo.name}'s ${aspect.person1Planet} ${this.getAspectSymbol(aspect.aspect)} ${this.person2Chart.birthInfo.name}'s ${aspect.person2Planet}</h4>
        <p>${aspect.interpretation}</p>
      </div>`
    ).join('');
  }

  // Utility methods (reuse from birth chart calculator)
  calculateJulianDay(date) {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    
    let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const timeDecimal = (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
    jd += timeDecimal - 0.5;
    
    return jd;
  }

  async calculatePlanetaryPositions(julianDay) {
    const planets = [
      { name: 'Sun', symbol: '☉', color: '#FFD700' },
      { name: 'Moon', symbol: '☽', color: '#C0C0C0' },
      { name: 'Mercury', symbol: '☿', color: '#FFA500' },
      { name: 'Venus', symbol: '♀', color: '#FF69B4' },
      { name: 'Mars', symbol: '♂', color: '#FF4500' },
      { name: 'Jupiter', symbol: '♃', color: '#4169E1' },
      { name: 'Saturn', symbol: '♄', color: '#8B4513' },
      { name: 'Uranus', symbol: '♅', color: '#00CED1' },
      { name: 'Neptune', symbol: '♆', color: '#4B0082' },
      { name: 'Pluto', symbol: '♇', color: '#800080' }
    ];

    return planets.map((planet, index) => {
      const basePosition = (julianDay * (index + 1) * 0.1) % 360;
      const position = (basePosition + index * 30) % 360;
      
      return {
        ...planet,
        longitude: position,
        sign: this.getZodiacSign(position),
        house: this.getHousePosition(position),
        degree: Math.floor(position % 30),
        minute: Math.floor((position % 1) * 60)
      };
    });
  }

  calculateHouseCusps(julianDay, latitude, longitude) {
    const houses = [];
    
    for (let i = 1; i <= 12; i++) {
      const cuspPosition = ((i - 1) * 30 + longitude * 0.1) % 360;
      houses.push({
        house: i,
        cusp: cuspPosition,
        sign: this.getZodiacSign(cuspPosition),
        degree: Math.floor(cuspPosition % 30),
        minute: Math.floor((cuspPosition % 1) * 60)
      });
    }
    
    return houses;
  }

  calculateAspects(planets) {
    const aspects = [];
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌' },
      { name: 'Opposition', angle: 180, orb: 8, symbol: '☍' },
      { name: 'Trine', angle: 120, orb: 6, symbol: '△' },
      { name: 'Square', angle: 90, orb: 6, symbol: '□' },
      { name: 'Sextile', angle: 60, orb: 4, symbol: '⚹' }
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;

        for (const aspectType of aspectTypes) {
          if (Math.abs(normalizedAngle - aspectType.angle) <= aspectType.orb) {
            aspects.push({
              planet1: planet1.name,
              planet2: planet2.name,
              aspect: aspectType.name,
              symbol: aspectType.symbol,
              angle: normalizedAngle,
              orb: Math.abs(normalizedAngle - aspectType.angle)
            });
            break;
          }
        }
      }
    }

    return aspects;
  }

  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
  }

  getHousePosition(longitude) {
    return Math.floor(longitude / 30) + 1;
  }

  findPlanet(planets, name) {
    return planets.find(planet => planet.name === name);
  }

  getPlanetSign(planets, planetName) {
    const planet = this.findPlanet(planets, planetName);
    return planet ? planet.sign : 'Unknown';
  }

  getSignElement(sign) {
    const elements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elements[sign] || 'Unknown';
  }

  areElementsCompatible(element1, element2) {
    const compatible = {
      'Fire': ['Fire', 'Air'],
      'Earth': ['Earth', 'Water'],
      'Air': ['Air', 'Fire'],
      'Water': ['Water', 'Earth']
    };
    return compatible[element1]?.includes(element2) || false;
  }

  getScoreColor(score) {
    if (score >= 80) return 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    if (score >= 60) return 'linear-gradient(45deg, #ffd700, #ffb347)';
    if (score >= 40) return 'linear-gradient(45deg, #ff6b6b, #ffa500)';
    return 'linear-gradient(45deg, #ff6b6b, #ff4757)';
  }

  getAspectSymbol(aspectName) {
    const symbols = {
      'Conjunction': '☌',
      'Opposition': '☍',
      'Trine': '△',
      'Square': '□',
      'Sextile': '⚹'
    };
    return symbols[aspectName] || '○';
  }

  // Additional helper methods for explanations
  getEmotionalConnectionExplanation(moon1, moon2, score) {
    if (score >= 80) return `Your ${moon1} and ${moon2} Moons create deep emotional understanding and intuitive connection.`;
    if (score >= 60) return `Your emotional natures (${moon1} & ${moon2}) complement each other well with some adjustments needed.`;
    return `Your different emotional styles (${moon1} vs ${moon2}) require patience and understanding to harmonize.`;
  }

  getCommunicationExplanation(mercury1, mercury2, score) {
    if (score >= 80) return `Your ${mercury1} and ${mercury2} Mercury signs create excellent mental rapport and easy communication.`;
    if (score >= 60) return `You communicate well together (${mercury1} & ${mercury2}) with occasional misunderstandings to work through.`;
    return `Your different communication styles (${mercury1} vs ${mercury2}) need conscious effort to bridge gaps.`;
  }

  getAttractionExplanation(venus1, mars1, venus2, mars2, score) {
    if (score >= 80) return `Strong magnetic attraction with your Venus-Mars combinations creating passionate chemistry.`;
    if (score >= 60) return `Good physical chemistry with your love and passion styles complementing each other well.`;
    return `Your attraction patterns may require understanding and compromise to maintain spark.`;
  }

  getLongTermExplanation(saturn1, saturn2, jupiter1, jupiter2, score) {
    if (score >= 80) return `Excellent long-term potential with aligned values and shared vision for the future.`;
    if (score >= 60) return `Good foundation for lasting relationship with some areas requiring ongoing attention.`;
    return `Long-term success will depend on commitment to working through fundamental differences.`;
  }

  calculateAspectBetweenPlanets(planet1, planet2) {
    const angle = Math.abs(planet1.longitude - planet2.longitude);
    const normalizedAngle = angle > 180 ? 360 - angle : angle;
    
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8 },
      { name: 'Sextile', angle: 60, orb: 6 },
      { name: 'Square', angle: 90, orb: 6 },
      { name: 'Trine', angle: 120, orb: 6 },
      { name: 'Opposition', angle: 180, orb: 8 }
    ];

    for (const aspectType of aspectTypes) {
      if (Math.abs(normalizedAngle - aspectType.angle) <= aspectType.orb) {
        return aspectType;
      }
    }
    
    return null;
  }

  interpretSynastryAspect(planet1, planet2, aspect) {
    const interpretations = {
      'Sun-Moon': {
        'Conjunction': 'Perfect harmony between conscious and unconscious minds - soulmate connection.',
        'Trine': 'Natural understanding and emotional support between partners.',
        'Square': 'Tension between ego and emotions that can lead to growth.',
        'Opposition': 'Complementary energies that balance each other when integrated.',
        'Sextile': 'Easy flow of energy creating mutual support and understanding.'
      },
      'Venus-Mars': {
        'Conjunction': 'Intense romantic and sexual attraction - magnetic chemistry.',
        'Trine': 'Perfect balance of love and passion - harmonious romance.',
        'Square': 'Passionate but potentially volatile attraction.',
        'Opposition': 'Strong attraction with need to balance different approaches to love.',
        'Sextile': 'Pleasant romantic chemistry with mutual appreciation.'
      }
    };

    const key = `${planet1}-${planet2}`;
    const reverseKey = `${planet2}-${planet1}`;
    
    if (interpretations[key]?.[aspect]) {
      return interpretations[key][aspect];
    } else if (interpretations[reverseKey]?.[aspect]) {
      return interpretations[reverseKey][aspect];
    }
    
    return `The ${aspect} between ${planet1} and ${planet2} creates a significant dynamic in your relationship.`;
  }

  // Form utility methods
  showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  clearError(errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  downloadReport() {
    // Create a simple text report
    const report = this.generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `compatibility-report-${this.person1Chart.birthInfo.name}-${this.person2Chart.birthInfo.name}.txt`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }

  generateTextReport() {
    const analysis = this.compatibilityAnalysis;
    return `
COMPATIBILITY REPORT
${this.person1Chart.birthInfo.name} & ${this.person2Chart.birthInfo.name}

OVERALL COMPATIBILITY: ${analysis.overallScore.score}% - ${analysis.overallScore.title}
${analysis.overallScore.description}

DETAILED SCORES:
- Emotional Connection: ${analysis.emotionalConnection.score}%
- Communication: ${analysis.communication.score}%
- Physical Attraction: ${analysis.physicalAttraction.score}%
- Long-term Potential: ${analysis.longTermPotential.score}%

RELATIONSHIP STRENGTHS:
${analysis.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR GROWTH:
${analysis.challenges.map(challenge => `• ${challenge}`).join('\n')}

RELATIONSHIP ADVICE:
${analysis.advice.map(advice => `• ${advice}`).join('\n')}

Generated by AstroAura Compatibility Matcher
    `.trim();
  }

  shareReport() {
    if (navigator.share) {
      navigator.share({
        title: 'Compatibility Report - AstroAura',
        text: `${this.person1Chart.birthInfo.name} & ${this.person2Chart.birthInfo.name} have ${this.compatibilityAnalysis.overallScore.score}% compatibility!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Report link copied to clipboard!');
      });
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.person1Data = {};
    this.person2Data = {};
    this.person1Chart = null;
    this.person2Chart = null;
    this.compatibilityAnalysis = null;
    
    // Reset form
    document.querySelectorAll('input').forEach(input => input.value = '');
    
    // Hide results
    document.getElementById('compatibilityResults').style.display = 'none';
    
    // Reset steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
    
    document.getElementById('step1').classList.add('active');
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
    
    // Clear errors
    document.querySelectorAll('.field-error').forEach(error => error.textContent = '');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showCalculationError() {
    document.getElementById('compatibilityLoading').style.display = 'none';
    document.getElementById('compatibilityComplete').innerHTML = `
      <h3>Calculation Error</h3>
      <p>We encountered an error calculating your compatibility. Please try again.</p>
      <button type="button" class="btn-cosmic" onclick="location.reload()">Try Again</button>
    `;
    document.getElementById('compatibilityComplete').style.display = 'block';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CompatibilityMatcher();
});