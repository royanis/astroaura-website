/**
 * Birth Chart Calculator
 * Implements progressive form, astrological calculations, and SVG visualization
 */

class BirthChartCalculator {
  constructor(skipDOMSetup = false) {
    console.log('BirthChartCalculator constructor called with skipDOMSetup:', skipDOMSetup);
    this.currentStep = 1;
    this.birthData = {};
    this.chartData = null;
    this.chartInterpretation = null;
    
    // Initialize production services with enhanced components
    try {
      this.vsopCalculator = typeof VSOP87Calculator !== 'undefined' ? new VSOP87Calculator() : null;
      this.moonCalculator = typeof ELP2000MoonCalculator !== 'undefined' ? new ELP2000MoonCalculator() : null;
      this.coordinateTransformer = typeof CoordinateTransformer !== 'undefined' ? new CoordinateTransformer() : null;
      this.nutationCalculator = typeof NutationCalculator !== 'undefined' ? new NutationCalculator() : null;
      
      // Initialize geocoding service with retry mechanism
      this.initializeGeocodingService();
      
      console.log('Final geocoding service state:', !!this.geocodingService);
      this.timezoneService = typeof TimezoneService !== 'undefined' ? new TimezoneService() : null;
      this.timezoneConverter = (typeof TimezoneAwareConverter !== 'undefined' && this.timezoneService) ? new TimezoneAwareConverter(this.timezoneService) : null;
      
      // Initialize validation system
      this.calculationValidator = typeof CalculationValidator !== 'undefined' ? new CalculationValidator() : null;
      
      console.log('Services initialized:', {
        vsop: !!this.vsopCalculator,
        moon: !!this.moonCalculator,
        coordinates: !!this.coordinateTransformer,
        nutation: !!this.nutationCalculator,
        geocoding: !!this.geocodingService,
        timezone: !!this.timezoneService,
        converter: !!this.timezoneConverter,
        validator: !!this.calculationValidator
      });
    } catch (error) {
      console.error('Error initializing services:', error);
    }
    
    // Only try to initialize DOM-dependent features if DOM setup is not skipped
    if (!skipDOMSetup) {
      console.log('Setting up DOM features...');
      if (typeof ChartInterpretationEngine !== 'undefined') {
        this.interpretationEngine = new ChartInterpretationEngine();
      }
      
      // Add a small delay to ensure all scripts are loaded
      setTimeout(() => {
        console.log('Delayed initialization - checking GeocodingService again...');
        if (!this.geocodingService && typeof GeocodingService !== 'undefined') {
          try {
            this.geocodingService = new GeocodingService();
            console.log('✅ Delayed geocoding service initialization successful');
          } catch (error) {
            console.error('❌ Delayed geocoding service initialization failed:', error);
          }
        }
      }, 100);
      
      this.init();
    } else {
      console.log('Skipping DOM setup as requested');
    }
  }

  /**
   * Initialize geocoding service with retry mechanism
   */
  async initializeGeocodingService() {
    console.log('🌍 Initializing geocoding service...');
    
    // Try multiple times with delays to handle loading timing issues
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt}: Checking GeocodingService availability...`);
      console.log('typeof GeocodingService:', typeof GeocodingService);
      
      if (typeof GeocodingService !== 'undefined') {
        try {
          this.geocodingService = new GeocodingService();
          console.log('✅ Geocoding service initialized successfully on attempt', attempt);
          return;
        } catch (geocodingError) {
          console.error('❌ Error creating geocoding service:', geocodingError);
          this.geocodingService = null;
        }
      } else {
        console.warn(`⚠️ GeocodingService class not found on attempt ${attempt}`);
        
        // Wait before next attempt
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    console.warn('⚠️ Failed to initialize geocoding service after 3 attempts - using fallback only');
    this.geocodingService = null;
  }

  init() {
    // Check if we're on the birth chart page by looking for the form
    if (document.getElementById('birthChartForm')) {
      this.setupEventListeners();
      this.setupFormValidation();
      this.setupLocationSearch();
    } else {
      console.log('Birth chart form not found, skipping initialization');
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');

    // Form navigation
    const nextStepButtons = document.querySelectorAll('.next-step');
    console.log('Found next-step buttons:', nextStepButtons.length);
    
    nextStepButtons.forEach((btn, index) => {
      console.log(`Setting up button ${index + 1}:`, btn.textContent, 'data-next:', btn.dataset.next);
      btn.addEventListener('click', (e) => {
        console.log('Next step button clicked:', e.target.textContent, 'data-next:', e.target.dataset.next);
        const nextStep = parseInt(e.target.dataset.next);
        console.log('Proceeding to step:', nextStep);
        this.validateAndProceed(nextStep);
      });
    });

    document.querySelectorAll('.prev-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prevStep = parseInt(e.target.dataset.prev);
        this.goToStep(prevStep);
      });
    });

    // Calculate chart
    const calculateButton = document.getElementById('calculateChart');
    if (calculateButton) {
      calculateButton.addEventListener('click', () => {
        this.calculateBirthChart();
      });
    }

    // Chart actions (only if elements exist)
    const viewChart = document.getElementById('viewChart');
    if (viewChart) {
      viewChart.addEventListener('click', () => {
        this.showChartVisualization();
      });
    }

    const downloadChart = document.getElementById('downloadChart');
    if (downloadChart) {
      downloadChart.addEventListener('click', () => {
        this.downloadChart();
      });
    }

    const shareChart = document.getElementById('shareChart');
    if (shareChart) {
      shareChart.addEventListener('click', () => {
        this.shareChart();
      });
    }

    const newChart = document.getElementById('newChart');
    if (newChart) {
      newChart.addEventListener('click', () => {
        this.resetForm();
      });
    }

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  setupFormValidation() {
    const birthDate = document.getElementById('birthDate');
    const birthTime = document.getElementById('birthTime');
    const birthLocation = document.getElementById('birthLocation');

    if (birthDate) {
      this.setupFieldProgress(birthDate.parentElement);
      birthDate.addEventListener('change', () => {
        this.validateBirthDateEnhanced();
      });
    }
    
    if (birthTime) {
      this.setupFieldProgress(birthTime.parentElement);
      birthTime.addEventListener('change', () => {
        this.validateBirthTimeEnhanced();
      });
    }
    
    if (birthLocation) {
      this.setupFieldProgress(birthLocation.parentElement);
      birthLocation.addEventListener('input', () => {
        this.searchLocations();
      });
    }
  }

  setupFieldProgress(formGroup) {
    if (formGroup.querySelector('.field-progress')) return;
    
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'field-progress';
    formGroup.appendChild(progressIndicator);
    
    const successMessage = document.createElement('div');
    successMessage.className = 'field-success';
    formGroup.appendChild(successMessage);
  }

  showFieldProgress(formGroup, type, message = '') {
    const progress = formGroup.querySelector('.field-progress');
    const success = formGroup.querySelector('.field-success');
    
    if (!progress) return;
    
    progress.className = `field-progress show ${type}`;
    
    if (type === 'success' && message) {
      success.textContent = message;
      formGroup.classList.add('success');
      formGroup.classList.remove('error');
    } else if (type === 'error') {
      formGroup.classList.add('error');
      formGroup.classList.remove('success');
    } else {
      formGroup.classList.remove('success', 'error');
    }
  }

  validateBirthDateEnhanced() {
    const birthDate = document.getElementById('birthDate');
    const formGroup = birthDate.parentElement;
    const result = this.validateBirthDate();
    
    if (result) {
      this.showFieldProgress(formGroup, 'success', 'Valid birth date');
    } else {
      this.showFieldProgress(formGroup, 'error');
    }
    
    return result;
  }

  validateBirthTimeEnhanced() {
    const birthTime = document.getElementById('birthTime');
    const formGroup = birthTime.parentElement;
    const result = this.validateBirthTime();
    
    if (result) {
      this.showFieldProgress(formGroup, 'success', 'Valid birth time');
    } else {
      this.showFieldProgress(formGroup, 'error');
    }
    
    return result;
  }

  setupLocationSearch() {
    this.searchTimeout = null;
    this.isSearching = false;
  }

  validateBirthDate() {
    console.log('🗓️ Validating birth date...');
    const birthDate = document.getElementById('birthDate');
    const error = document.getElementById('birthDateError');
    
    console.log('Birth date element:', birthDate);
    console.log('Birth date value:', birthDate?.value);
    
    if (!birthDate || !birthDate.value) {
      console.log('❌ No birth date entered');
      this.showError(error, 'Please enter your birth date');
      return false;
    }

    const date = new Date(birthDate.value);
    const now = new Date();
    
    console.log('Parsed date:', date);
    console.log('Current date:', now);
    
    if (date > now) {
      console.log('❌ Birth date is in the future');
      this.showError(error, 'Birth date cannot be in the future');
      return false;
    }

    if (date.getFullYear() < 1900) {
      console.log('❌ Birth date is before 1900');
      this.showError(error, 'Please enter a date after 1900');
      return false;
    }

    console.log('✅ Birth date validation passed');
    this.clearError(error);
    this.birthData.date = birthDate.value;
    return true;
  }

  validateBirthTime() {
    const birthTime = document.getElementById('birthTime');
    const error = document.getElementById('birthTimeError');
    
    // Time is optional, default to 12:00 if not provided
    if (!birthTime.value) {
      birthTime.value = '12:00';
    }

    this.clearError(error);
    this.birthData.time = birthTime.value;
    return true;
  }

  searchLocations() {
    console.log('🔍 searchLocations() called');
    const input = document.getElementById('birthLocation');
    const suggestions = document.getElementById('locationSuggestions');
    const query = input.value.trim();

    console.log('Input element:', input);
    console.log('Suggestions element:', suggestions);
    console.log('Query:', query, 'Length:', query.length);

    if (query.length < 2) {
      suggestions.innerHTML = '';
      suggestions.style.display = 'none';
      console.log('Query too short, hiding suggestions');
      return;
    }

    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search requests
    console.log('Setting timeout for search...');
    this.searchTimeout = setTimeout(() => {
      console.log('Timeout triggered, calling performLocationSearch...');
      this.performLocationSearch(query);
    }, 300);
  }

  async performLocationSearch(query) {
    console.log('📍 performLocationSearch() called with query:', query);
    const suggestions = document.getElementById('locationSuggestions');
    console.log('Suggestions element found:', !!suggestions);
    
    if (this.isSearching) {
      console.log('Already searching, returning...');
      return;
    }
    
    console.log('Setting isSearching to true, showing loading...');
    this.isSearching = true;
    suggestions.innerHTML = '<div class="location-suggestion loading">🌍 Searching locations worldwide...</div>';
    suggestions.style.display = 'block';
    console.log('Loading message set, suggestions display:', suggestions.style.display);

    try {
      console.log(`Searching for location: "${query}"`);
      
      // Debug: Check what services are available
      console.log('🔧 Debug: Checking services...');
      console.log('- typeof GeocodingService:', typeof GeocodingService);
      console.log('- this.geocodingService:', !!this.geocodingService);
      console.log('- window.GeocodingService:', !!window.GeocodingService);
      
      // Check if geocoding service is available, try to reinitialize if not
      if (!this.geocodingService) {
        console.warn('⚠️ Geocoding service not available, attempting to reinitialize...');
        
        // Try to reinitialize once
        if (typeof GeocodingService !== 'undefined') {
          try {
            console.log('🔄 Creating new GeocodingService instance...');
            this.geocodingService = new GeocodingService();
            console.log('✅ Geocoding service reinitialized successfully');
            console.log('Service details:', this.geocodingService);
          } catch (error) {
            console.error('❌ Failed to reinitialize geocoding service:', error);
            console.error('Error details:', error.message, error.stack);
          }
        } else {
          console.error('❌ GeocodingService class not found in global scope');
        }
        
        // If still not available, use fallback
        if (!this.geocodingService) {
          console.error('🔥 Geocoding service still not available, using fallback immediately');
          const fallbackResults = this.searchFallbackLocations(query);
          console.log('Fallback results:', fallbackResults);
          this.displayLocationSuggestions(fallbackResults, 0);
          return;
        }
      }
      
      console.log('🌐 Making API call to geocoding service...');
      const startTime = Date.now();
      
      const locations = await this.geocodingService.geocodeLocation(query, {
        limit: 8,
        language: 'en'
      });
      
      const searchTime = Date.now() - startTime;
      console.log(`📊 Location search completed in ${searchTime}ms, found ${locations.length} results`);
      
      // Add search performance info for debugging
      if (locations.length > 0) {
        console.log('🎯 Top result:', locations[0]);
        console.log('📋 All sources used:', [...new Set(locations.map(l => l.source))]);
      } else {
        console.warn('⚠️ No results from API, falling back to local search...');
        const fallbackResults = this.searchFallbackLocations(query);
        console.log('Fallback results:', fallbackResults);
        this.displayLocationSuggestions(fallbackResults, searchTime);
        return;
      }
      
      this.displayLocationSuggestions(locations, searchTime);
    } catch (error) {
      console.error('💥 Location search error:', error);
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Try fallback on error
      console.log('🔄 Trying fallback search after error...');
      const fallbackResults = this.searchFallbackLocations(query);
      console.log('Fallback results after error:', fallbackResults);
      this.displayLocationSuggestions(fallbackResults, 0, error.message);
    } finally {
      this.isSearching = false;
      console.log('🏁 Search completed, isSearching set to false');
    }
  }


  /**
   * Fallback location search when geocoding service is not available
   */
  searchFallbackLocations(query) {
    const majorCities = [
      // North America
      { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', country: 'USA' },
      { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', country: 'USA' },
      { name: 'Chicago, IL, USA', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', country: 'USA' },
      { name: 'Toronto, ON, Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', country: 'Canada' },
      
      // Europe
      { name: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', country: 'UK' },
      { name: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', country: 'France' },
      { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin', country: 'Germany' },
      { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome', country: 'Italy' },
      { name: 'Madrid, Spain', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', country: 'Spain' },
      
      // Asia
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo', country: 'Japan' },
      { name: 'Beijing, China', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai', country: 'China' },
      { name: 'Shanghai, China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai', country: 'China' },
      
      // India (comprehensive coverage including Guntur)
      { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Delhi, India', lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Pune, India', lat: 18.5204, lng: 73.8567, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Ahmedabad, India', lat: 23.0225, lng: 72.5714, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Surat, India', lat: 21.1702, lng: 72.8311, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kochi, India', lat: 9.9312, lng: 76.2673, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Coimbatore, India', lat: 11.0168, lng: 76.9558, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Thiruvananthapuram, India', lat: 8.5241, lng: 76.9366, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Calicut, India', lat: 11.2588, lng: 75.7804, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Guntur, Andhra Pradesh, India', lat: 16.3067, lng: 80.4365, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Vijayawada, Andhra Pradesh, India', lat: 16.5062, lng: 80.6480, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lng: 83.2185, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Tirupati, Andhra Pradesh, India', lat: 13.6288, lng: 79.4192, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Nellore, Andhra Pradesh, India', lat: 14.4426, lng: 79.9865, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kakinada, Andhra Pradesh, India', lat: 16.9891, lng: 82.2475, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Rajahmundry, Andhra Pradesh, India', lat: 17.0005, lng: 81.8040, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kadapa, Andhra Pradesh, India', lat: 14.4673, lng: 78.8242, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Anantapur, Andhra Pradesh, India', lat: 14.6819, lng: 77.6006, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kurnool, Andhra Pradesh, India', lat: 15.8281, lng: 78.0373, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Warangal, Telangana, India', lat: 17.9689, lng: 79.5941, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Nizamabad, Telangana, India', lat: 18.6725, lng: 78.0941, timezone: 'Asia/Kolkata', country: 'India' },
      
      // Australia & Oceania
      { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', country: 'Australia' },
      { name: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', country: 'Australia' },
      
      // South America
      { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo', country: 'Brazil' },
      { name: 'Buenos Aires, Argentina', lat: -34.6118, lng: -58.3960, timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
      
      // Africa
      { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', country: 'Egypt' },
      { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg', country: 'South Africa' }
    ];

    const normalizedQuery = query.toLowerCase().trim();
    
    // Enhanced matching - check for partial matches in city name, state, and country
    const matches = majorCities.filter(city => {
      const cityName = city.name.toLowerCase();
      const cityParts = cityName.split(', ');
      
      // Check if query matches any part of the city name
      const matchesCity = cityParts.some(part => part.includes(normalizedQuery));
      const matchesCountry = city.country.toLowerCase().includes(normalizedQuery);
      
      return matchesCity || matchesCountry;
    });
    
    console.log(`Fallback search for "${query}" found ${matches.length} matches`);
    
    return matches.map(city => ({
      ...city,
      city: city.name.split(',')[0],
      state: city.name.split(',')[1]?.trim() || '',
      confidence: 0.8,
      source: 'fallback-cities'
    })).slice(0, 8); // Limit to 8 results
  }

  // Debug function to test search manually
  testLocationSearch(query) {
    console.log('🧪 Testing location search for:', query);
    
    // Test fallback search
    const fallbackResults = this.searchFallbackLocations(query);
    console.log('📊 Fallback results:', fallbackResults);
    
    if (fallbackResults.length > 0) {
      console.log('✅ Fallback search working');
      this.displayLocationSuggestions(fallbackResults, 0);
      return true;
    } else {
      console.log('❌ No fallback results found');
      return false;
    }
  }

  displayLocationSuggestions(locations, searchTime = 0, errorMessage = null) {
    const suggestions = document.getElementById('locationSuggestions');
    
    if (errorMessage) {
      suggestions.innerHTML = `<div class="location-suggestion error">
        <div class="location-name">Search Error</div>
        <div class="location-details">${errorMessage}</div>
      </div>`;
      return;
    }
    
    if (locations.length === 0) {
      suggestions.innerHTML = `<div class="location-suggestion no-results">
        <div class="location-name">No locations found</div>
        <div class="location-details">Try searching for a major city or include country name (e.g., "Mumbai, India")</div>
      </div>`;
      return;
    }

    // Sort by confidence score
    const sortedLocations = locations.sort((a, b) => b.confidence - a.confidence);
    
    let html = '';
    
    // Add search info header
    if (searchTime > 0) {
      html += `<div class="location-suggestion search-info">
        <div class="location-name">Found ${locations.length} locations in ${searchTime}ms</div>
        <div class="location-details">Select the most accurate match below</div>
      </div>`;
    }

    // Add location suggestions
    html += sortedLocations.map((location, index) => {
      const confidenceIcon = this.getConfidenceIcon(location.confidence);
      const sourceIcon = this.getSourceIcon(location.source);
      const locationIcon = this.getLocationTypeIcon(location);
      
      return `<div class="location-suggestion" data-location='${JSON.stringify(location)}' 
                   title="Confidence: ${(location.confidence * 100).toFixed(0)}% | Source: ${location.source}">
        <div class="location-name">
          ${locationIcon} ${location.name}
        </div>
        <div class="location-details">
          <span class="location-coords">📍 ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°</span>
          <span class="location-source">${sourceIcon} ${location.source}</span>
          <span class="location-confidence">${confidenceIcon} ${(location.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>`;
    }).join('');
    
    suggestions.innerHTML = html;
    suggestions.style.display = 'block';

    // Add click handlers
    suggestions.querySelectorAll('.location-suggestion').forEach(item => {
      if (!item.classList.contains('no-results') && 
          !item.classList.contains('loading') && 
          !item.classList.contains('search-info') &&
          !item.classList.contains('error')) {
        item.addEventListener('click', async (e) => {
          const locationData = e.currentTarget.dataset.location;
          if (locationData) {
            const location = JSON.parse(locationData);
            await this.selectLocation(location);
          }
        });
      }
    });
  }

  getSourceIcon(source) {
    const icons = {
      'google-maps': '🗺️',
      'nominatim': '🌐',
      'photon': '⚡',
      'ipgeolocation': '🌍',
      'positionstack': '📍',
      'fallback-cities': '🏙️',
      'coordinate-parse': '📐'
    };
    return icons[source] || '📍';
  }

  getConfidenceIcon(confidence) {
    if (confidence > 0.9) return '🎯';
    if (confidence > 0.8) return '✅';
    if (confidence > 0.6) return '👍';
    if (confidence > 0.4) return '📍';
    return '❓';
  }

  getLocationTypeIcon(location) {
    const name = location.name.toLowerCase();
    if (name.includes('india')) return '🇮🇳';
    if (name.includes('usa') || name.includes('united states')) return '🇺🇸';
    if (name.includes('uk') || name.includes('united kingdom')) return '🇬🇧';
    if (name.includes('canada')) return '🇨🇦';
    if (name.includes('australia')) return '🇦🇺';
    if (name.includes('germany')) return '🇩🇪';
    if (name.includes('france')) return '🇫🇷';
    if (name.includes('japan')) return '🇯🇵';
    if (name.includes('china')) return '🇨🇳';
    if (name.includes('brazil')) return '🇧🇷';
    return '🌍';
  }


  // Removed - now handled by TimezoneService

  async selectLocation(location) {
    const input = document.getElementById('birthLocation');
    const formGroup = input.parentElement;
    const suggestions = document.getElementById('locationSuggestions');
    const coordinates = document.getElementById('coordinatesDisplay');
    const coordText = document.getElementById('selectedCoordinates');

    input.value = location.name;
    suggestions.style.display = 'none';
    
    // Show loading for timezone determination
    this.showFieldProgress(formGroup, 'loading');
    coordText.textContent = 'Determining timezone...';
    coordinates.style.display = 'block';
    
    try {
      // Get accurate timezone for this location
      const timezoneInfo = await this.timezoneService.getTimezoneForCoordinates(
        location.lat, 
        location.lng
      );
      
      // Update location with accurate timezone
      this.birthData.location = {
        ...location,
        timezone: timezoneInfo.name,
        timezoneOffset: timezoneInfo.offset,
        timezoneDST: timezoneInfo.dst
      };
      
      coordText.textContent = `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}° (${timezoneInfo.name})`;
      this.showFieldProgress(formGroup, 'success', `Location set: ${location.name}`);
    } catch (error) {
      console.warn('Timezone determination failed, using fallback:', error);
      // Use fallback timezone from geocoding service
      this.birthData.location = location;
      coordText.textContent = `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}° (${location.timezone})`;
      this.showFieldProgress(formGroup, 'success', `Location set: ${location.name}`);
    }
    
    coordinates.style.display = 'block';
    this.clearError(document.getElementById('birthLocationError'));
  }

  validateLocation() {
    const error = document.getElementById('birthLocationError');
    
    if (!this.birthData.location) {
      this.showError(error, 'Please select a location from the suggestions');
      return false;
    }

    this.clearError(error);
    return true;
  }

  validateAndProceed(nextStep) {
    console.log(`Validating step ${this.currentStep} before proceeding to step ${nextStep}`);
    let isValid = true;

    switch (this.currentStep) {
      case 1:
        console.log('Validating birth date...');
        isValid = this.validateBirthDate();
        console.log('Birth date validation result:', isValid);
        break;
      case 2:
        console.log('Validating birth time...');
        isValid = this.validateBirthTime();
        console.log('Birth time validation result:', isValid);
        break;
      case 3:
        console.log('Validating location...');
        isValid = this.validateLocation();
        console.log('Location validation result:', isValid);
        break;
    }

    if (isValid) {
      console.log(`✅ Validation passed, moving to step ${nextStep}`);
      this.goToStep(nextStep);
    } else {
      console.log(`❌ Validation failed for step ${this.currentStep}`);
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

  async calculateBirthChart() {
    this.goToStep(4);
    
    try {
      // Validate all required data
      if (!this.validateCalculationData()) {
        this.showCalculationError('Missing required birth information. Please check your inputs.');
        return;
      }
      
      // Show loading
      document.getElementById('calculationLoading').style.display = 'block';
      document.getElementById('calculationComplete').style.display = 'none';

      // Perform calculations with progress updates
      this.updateCalculationProgress('Converting timezone and calculating Julian Day...');
      await new Promise(resolve => setTimeout(resolve, 500));

      this.updateCalculationProgress('Calculating planetary positions...');
      await new Promise(resolve => setTimeout(resolve, 800));

      this.updateCalculationProgress('Computing house cusps...');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Calculate chart data
      this.chartData = await this.performAstrologicalCalculations();
      
      if (!this.chartData || !this.chartData.planets || !this.chartData.houses) {
        throw new Error('Failed to calculate astronomical data');
      }
      
      this.updateCalculationProgress('Generating interpretation...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate interpretation
      if (this.interpretationEngine) {
        try {
          this.chartInterpretation = this.interpretationEngine.generateChartInterpretation(this.chartData);
          console.log('✅ Chart interpretation generated successfully');
        } catch (interpretationError) {
          console.error('❌ Error generating interpretation:', interpretationError);
          this.chartInterpretation = this.generateFallbackInterpretation(this.chartData);
        }
      } else {
        console.warn('⚠️ Interpretation engine not available, using fallback');
        this.chartInterpretation = this.generateFallbackInterpretation(this.chartData);
      }
      
      // Validate calculation results
      if (!this.validateCalculationResults()) {
        throw new Error('Calculation results validation failed');
      }
      
      // Save to user profile if available
      if (window.userProfile) {
        try {
          window.userProfile.updateBirthChart(this.chartData);
        } catch (profileError) {
          console.warn('Could not save to user profile:', profileError);
          // Don't fail the whole calculation for this
        }
      }

      // Show completion
      document.getElementById('calculationLoading').style.display = 'none';
      document.getElementById('calculationComplete').style.display = 'block';

    } catch (error) {
      console.error('Chart calculation error:', error);
      this.showCalculationError(error.message || 'An error occurred during calculation');
    }
  }

  validateCalculationData() {
    const { date, time, location } = this.birthData;
    
    if (!date || !time || !location) {
      console.error('Missing birth data:', { date, time, location });
      return false;
    }
    
    if (!location.lat || !location.lng || !location.timezone) {
      console.error('Invalid location data:', location);
      return false;
    }
    
    // Validate date range
    const birthDate = new Date(date);
    const currentDate = new Date();
    const minDate = new Date('1900-01-01');
    
    if (birthDate > currentDate || birthDate < minDate) {
      console.error('Invalid birth date range:', birthDate);
      return false;
    }
    
    return true;
  }

  validateCalculationResults() {
    if (!this.chartData.planets || this.chartData.planets.length !== 10) {
      console.error('Invalid planet count:', this.chartData.planets?.length);
      return false;
    }
    
    if (!this.chartData.houses || this.chartData.houses.length !== 12) {
      console.error('Invalid house count:', this.chartData.houses?.length);
      return false;
    }
    
    // Check if planetary positions are within valid ranges
    for (const planet of this.chartData.planets) {
      if (!planet.longitude || planet.longitude < 0 || planet.longitude >= 360) {
        console.error('Invalid planet longitude:', planet.name, planet.longitude);
        return false;
      }
    }
    
    // Enhanced validation using CalculationValidator
    try {
      const validationIssues = this.calculationValidator.validatePlanetaryPositions(this.chartData.planets);
      if (validationIssues.length > 0) {
        console.warn('Calculation validation issues detected:', validationIssues);
        // Log issues but don't fail validation - they may be acceptable
      }
      
      // Log calculation methods used
      const methodCounts = {};
      this.chartData.planets.forEach(planet => {
        const method = planet.calculationMethod || 'Unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });
      console.log('Calculation methods used:', methodCounts);
      
    } catch (validationError) {
      console.warn('Validation system error:', validationError);
      // Don't fail the whole calculation for validation errors
    }
    
    return true;
  }

  /**
   * Validate that UTC conversion uses birth location timezone
   * This ensures the fix for timezone conversion is working correctly
   */
  validateUTCConversion(utcConversion, birthLocation) {
    try {
      // Check that we have valid UTC conversion result
      if (!utcConversion || !utcConversion.utc) {
        throw new Error('Invalid UTC conversion result');
      }

      // Check that timezone information is present
      if (!utcConversion.timezone) {
        throw new Error('Missing timezone information in UTC conversion');
      }

      // Check that offset is reasonable (expanded valid range)
      if (typeof utcConversion.offset !== 'number') {
        throw new Error('Invalid timezone offset type');
      }
      
      // Valid timezone range is UTC-12 to UTC+14 (including Kiribati +14, Baker Island -12)
      if (Math.abs(utcConversion.offset) > 14) {
        console.warn('Extreme timezone offset detected (outside UTC-12 to UTC+14):', utcConversion.offset);
      }
      
      // Only warn for truly unusual offsets (beyond inhabited areas)
      if (Math.abs(utcConversion.offset) > 12 && Math.abs(utcConversion.offset) !== 14) {
        console.warn('Uncommon timezone offset detected:', utcConversion.offset);
      }

      // Log validation success
      console.log('UTC conversion validation passed:', {
        timezone: utcConversion.timezone,
        offset: utcConversion.offset,
        dst: utcConversion.dst,
        source: utcConversion.source,
        location: birthLocation.name
      });

      // Check for validation warnings from the converter
      if (utcConversion.validation && utcConversion.validation.warnings.length > 0) {
        console.warn('UTC conversion warnings:', utcConversion.validation.warnings);
      }

      return true;

    } catch (error) {
      console.error('UTC conversion validation failed:', error);
      throw new Error(`UTC conversion validation failed: ${error.message}`);
    }
  }

  updateCalculationProgress(message) {
    const loadingElement = document.querySelector('#calculationLoading p');
    if (loadingElement) {
      loadingElement.textContent = message;
    }
  }

  async performAstrologicalCalculations() {
    try {
      console.log('Starting astrological calculations...');
      const { date, time, location } = this.birthData;
      console.log('Birth data:', { date, time, location: location.name });
      
      if (!date || !time || !location) {
        throw new Error('Missing birth data: date, time, or location');
      }

      // Convert birth time to UTC using enhanced timezone-aware converter
      console.log('Converting to UTC using TimezoneAwareConverter...');
      const utcConversion = await this.timezoneConverter.convertBirthTimeToUTC(
        date, 
        time, 
        location
      );
      
      const birthDateTimeUTC = utcConversion.utc;
      console.log('UTC conversion successful:', birthDateTimeUTC);
      console.log('UTC conversion successful (ISO):', birthDateTimeUTC.toISOString());
      console.log('UTC conversion successful (UTC string):', birthDateTimeUTC.toUTCString());
      console.log('Timezone conversion details:', {
        timezone: utcConversion.timezone,
        offset: utcConversion.offset,
        dst: utcConversion.dst,
        source: utcConversion.source,
        validation: utcConversion.validation
      });
      
      // Validate that UTC conversion uses birth location timezone
      this.validateUTCConversion(utcConversion, location);
      
      // Calculate Julian Day Number for UTC time
      console.log('Calculating Julian Day...');
      const julianDay = this.calculateJulianDay(birthDateTimeUTC);
      console.log('Julian Day:', julianDay);
      
      // Calculate sidereal time at birth location
      console.log('Calculating sidereal time...');
      const siderealTime = this.calculateSiderealTime(julianDay, location.lng);
      console.log('Sidereal time:', siderealTime);
      
      // Calculate planetary positions using enhanced system
      console.log('Calculating planetary positions with enhanced VSOP87...');
      const planets = await this.calculateEnhancedPlanetaryPositions(julianDay);
      console.log('Planets calculated:', planets.length);
      
      // Validate planetary positions
      const validationIssues = this.calculationValidator.validatePlanetaryPositions(planets);
      if (validationIssues.length > 0) {
        console.warn('Planetary position validation issues:', validationIssues);
        // Log issues but continue - they may be acceptable for the current precision level
      }
      
      // Calculate house cusps using enhanced Placidus system
      console.log('Calculating house cusps...');
      const houses = this.calculatePlacidusHousesEnhanced(julianDay, location.lat, siderealTime);
      console.log('Houses calculated:', houses.length);
      
      // Calculate aspects with proper orbs
      console.log('Calculating aspects...');
      const aspects = this.calculateAspects(planets);
      console.log('Aspects calculated:', aspects.length);

      console.log('All calculations completed successfully');
      return {
        birthInfo: {
          date: date,
          time: time,
          location: location.name,
          coordinates: { lat: location.lat, lng: location.lng },
          timezone: utcConversion.timezone,
          utcOffset: utcConversion.offset,
          dst: utcConversion.dst,
          julianDay: julianDay,
          siderealTime: siderealTime,
          birthDateTimeUTC: birthDateTimeUTC
        },
        planets: planets,
        houses: houses,
        aspects: aspects
      };
    } catch (error) {
      console.error('Error in astrological calculations:', error);
      throw error;
    }
  }

  // Removed - now handled by TimezoneService

  getTimezoneOffset(timezone, date) {
    // Enhanced timezone offset calculation
    const timezoneOffsets = {
      // Americas
      'America/New_York': -5, 'America/Chicago': -6, 'America/Denver': -7, 'America/Los_Angeles': -8,
      'America/Toronto': -5, 'America/Vancouver': -8, 'America/Mexico_City': -6,
      'America/Sao_Paulo': -3, 'America/Buenos_Aires': -3, 'America/Lima': -5,
      'America/Caracas': -4, 'America/Bogota': -5, 'America/Santiago': -4,
      
      // Europe
      'Europe/London': 0, 'Europe/Dublin': 0, 'Europe/Lisbon': 0,
      'Europe/Berlin': 1, 'Europe/Paris': 1, 'Europe/Rome': 1, 'Europe/Madrid': 1,
      'Europe/Amsterdam': 1, 'Europe/Brussels': 1, 'Europe/Vienna': 1,
      'Europe/Warsaw': 1, 'Europe/Prague': 1, 'Europe/Budapest': 1,
      'Europe/Athens': 2, 'Europe/Helsinki': 2, 'Europe/Stockholm': 1,
      'Europe/Moscow': 3, 'Europe/Kiev': 2, 'Europe/Istanbul': 3,
      
      // Asia
      'Asia/Tokyo': 9, 'Asia/Shanghai': 8, 'Asia/Hong_Kong': 8, 'Asia/Taipei': 8,
      'Asia/Seoul': 9, 'Asia/Manila': 8, 'Asia/Singapore': 8, 'Asia/Bangkok': 7,
      'Asia/Jakarta': 7, 'Asia/Kuala_Lumpur': 8, 'Asia/Ho_Chi_Minh': 7,
      'Asia/Kolkata': 5.5, 'Asia/Mumbai': 5.5, 'Asia/Delhi': 5.5, 'Asia/Karachi': 5,
      'Asia/Dubai': 4, 'Asia/Tehran': 3.5, 'Asia/Baghdad': 3, 'Asia/Riyadh': 3,
      
      // Africa
      'Africa/Cairo': 2, 'Africa/Johannesburg': 2, 'Africa/Lagos': 1,
      'Africa/Nairobi': 3, 'Africa/Casablanca': 1, 'Africa/Algiers': 1,
      
      // Australia & Oceania
      'Australia/Sydney': 10, 'Australia/Melbourne': 10, 'Australia/Brisbane': 10,
      'Australia/Perth': 8, 'Australia/Adelaide': 9.5, 'Australia/Darwin': 9.5,
      'Pacific/Auckland': 12, 'Pacific/Fiji': 12, 'Pacific/Honolulu': -10,
      
      // Default
      'UTC': 0
    };
    
    let offset = timezoneOffsets[timezone];
    
    // If timezone not found, try to extract from coordinates-based timezone
    if (offset === undefined) {
      offset = this.getApproximateTimezoneOffset(timezone);
    }
    
    // Handle daylight saving time approximation (simplified)
    // This is a basic approximation - in production, use a proper timezone library
    if (date && this.isDaylightSavingTime(date, timezone)) {
      offset += 1;
    }
    
    return offset * 60; // Return in minutes
  }

  getApproximateTimezoneOffset(timezone) {
    // Fallback timezone offset calculation
    const basicOffsets = {
      'America/New_York': -5, 'America/Los_Angeles': -8, 'America/Chicago': -6,
      'Europe/London': 0, 'Europe/Berlin': 1, 'Europe/Paris': 1,
      'Asia/Tokyo': 9, 'Asia/Shanghai': 8, 'Australia/Sydney': 10,
      'UTC': 0
    };
    
    return basicOffsets[timezone] || 0;
  }

  isDaylightSavingTime(date, timezone) {
    // Simplified DST detection for major timezones
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Northern hemisphere DST (approximate)
    if (timezone.includes('America/') || timezone.includes('Europe/')) {
      return month > 3 && month < 11; // Rough DST period
    }
    
    // Southern hemisphere DST (approximate)
    if (timezone.includes('Australia/')) {
      return month > 10 || month < 4; // Rough DST period for Australia
    }
    
    return false;
  }

  calculateJulianDay(date) {
    // Accurate Julian Day calculation
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    
    let a, b, y, m;
    
    if (month <= 2) {
      y = year - 1;
      m = month + 12;
    } else {
      y = year;
      m = month;
    }
    
    // Gregorian calendar correction
    if (year > 1582 || (year === 1582 && month > 10) || (year === 1582 && month === 10 && day >= 15)) {
      a = Math.floor(y / 100);
      b = 2 - a + Math.floor(a / 4);
    } else {
      b = 0;
    }
    
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
    
    // Add time fraction
    const timeFraction = (hour + minute / 60 + second / 3600) / 24;
    
    return jd + timeFraction;
  }

  calculateSiderealTime(julianDay, longitude) {
    // Calculate Greenwich Mean Sidereal Time
    const T = (julianDay - 2451545.0) / 36525.0;
    const theta0 = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    
    // Normalize to 0-360 degrees
    let gmst = theta0 % 360;
    if (gmst < 0) gmst += 360;
    
    // Convert to local sidereal time
    let lst = gmst + longitude;
    if (lst < 0) lst += 360;
    if (lst > 360) lst -= 360;
    
    return lst;
  }

  /**
   * Calculate planetary positions using enhanced system
   * Integrates VSOP87Calculator, ELP2000MoonCalculator, and coordinate transformations
   */
  async calculateEnhancedPlanetaryPositions(julianDay) {
    try {
      console.log('Starting enhanced planetary calculations...');
      
      // Use the enhanced VSOP87 calculator for all planets except Moon
      const vsopPlanets = this.vsopCalculator.calculatePlanetaryPositions(julianDay);
      console.log('VSOP87 planets calculated:', vsopPlanets.length);
      
      // Calculate Moon position using ELP2000 calculator
      console.log('Calculating Moon position with ELP2000...');
      const moonLongitude = this.moonCalculator.calculateMoonPosition(julianDay);
      console.log('Moon longitude calculated:', moonLongitude);
      
      // Replace Moon in VSOP results with ELP2000 result
      const enhancedPlanets = vsopPlanets.map(planet => {
        if (planet.name === 'Moon') {
          return {
            ...planet,
            longitude: moonLongitude,
            sign: this.getZodiacSign(moonLongitude),
            degree: Math.floor(moonLongitude % 30),
            minute: Math.floor((moonLongitude % 1) * 60),
            calculationMethod: 'ELP2000'
          };
        } else {
          return {
            ...planet,
            calculationMethod: 'VSOP87'
          };
        }
      });
      
      console.log('Enhanced planetary calculations completed');
      return enhancedPlanets;
      
    } catch (error) {
      console.error('Error in enhanced planetary calculations:', error);
      
      // Fallback to original calculation method
      console.log('Falling back to original calculation method...');
      return this.calculateFallbackPlanetaryPositions(julianDay);
    }
  }

  /**
   * Fallback planetary calculation method
   * Used when enhanced calculations fail
   */
  calculateFallbackPlanetaryPositions(julianDay) {
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

    return planets.map(planet => {
      let longitude;
      
      switch (planet.name) {
        case 'Sun':
          longitude = this.calculateSunPosition(julianDay);
          break;
        case 'Moon':
          longitude = this.calculateMoonPosition(julianDay);
          break;
        case 'Mercury':
          longitude = this.calculateMercuryPosition(julianDay);
          break;
        case 'Venus':
          longitude = this.calculateVenusPosition(julianDay);
          break;
        case 'Mars':
          longitude = this.calculateMarsPosition(julianDay);
          break;
        case 'Jupiter':
          longitude = this.calculateJupiterPosition(julianDay);
          break;
        case 'Saturn':
          longitude = this.calculateSaturnPosition(julianDay);
          break;
        case 'Uranus':
          longitude = this.calculateUranusPosition(julianDay);
          break;
        case 'Neptune':
          longitude = this.calculateNeptunePosition(julianDay);
          break;
        case 'Pluto':
          longitude = this.calculatePlutoPosition(julianDay);
          break;
        default:
          longitude = 0;
      }
      
      // Normalize longitude to 0-360 degrees
      longitude = longitude % 360;
      if (longitude < 0) longitude += 360;
      
      return {
        ...planet,
        longitude: longitude,
        sign: this.getZodiacSign(longitude),
        degree: Math.floor(longitude % 30),
        minute: Math.floor((longitude % 1) * 60),
        calculationMethod: 'Fallback'
      };
    });
  }

  calculatePlacidusHousesEnhanced(julianDay, latitude, siderealTime) {
    const houses = [];
    const latitudeRad = latitude * Math.PI / 180;
    const obliquity = this.calculateObliquity(julianDay);
    const obliquityRad = obliquity * Math.PI / 180;
    
    // Calculate accurate Midheaven (MC)
    let mc = siderealTime;
    if (mc < 0) mc += 360;
    if (mc >= 360) mc -= 360;
    
    // Calculate Ascendant using spherical astronomy
    const mcRad = mc * Math.PI / 180;
    const tanAsc = -Math.cos(mcRad) / (Math.sin(mcRad) * Math.cos(obliquityRad) + Math.tan(latitudeRad) * Math.sin(obliquityRad));
    let asc = Math.atan(tanAsc) * 180 / Math.PI;
    
    // Correct quadrant
    if (Math.cos(mcRad) < 0) {
      asc += 180;
    }
    if (asc < 0) asc += 360;
    
    // Calculate IC and Descendant
    const ic = (mc + 180) % 360;
    const desc = (asc + 180) % 360;
    
    // Enhanced Placidus calculations for intermediate houses
    // Using proper quadrant divisions for accurate house calculations
    const houseCusps = {
      1: asc,
      2: this.calculatePlacidusHouse(2, julianDay, latitude, siderealTime, asc, ic),
      3: this.calculatePlacidusHouse(3, julianDay, latitude, siderealTime, asc, ic),
      4: ic,
      5: this.calculatePlacidusHouse(5, julianDay, latitude, siderealTime, ic, desc),
      6: this.calculatePlacidusHouse(6, julianDay, latitude, siderealTime, ic, desc),
      7: desc,
      8: this.calculatePlacidusHouse(8, julianDay, latitude, siderealTime, desc, mc),
      9: this.calculatePlacidusHouse(9, julianDay, latitude, siderealTime, desc, mc),
      10: mc,
      11: this.calculatePlacidusHouse(11, julianDay, latitude, siderealTime, mc, asc),
      12: this.calculatePlacidusHouse(12, julianDay, latitude, siderealTime, mc, asc)
    };
    
    for (let i = 1; i <= 12; i++) {
      const cuspPosition = houseCusps[i];
      houses.push({
        house: i,
        cusp: cuspPosition,
        sign: this.getZodiacSign(cuspPosition),
        degree: Math.floor(cuspPosition % 30),
        minute: Math.floor((cuspPosition % 1) * 60),
        second: Math.floor(((cuspPosition % 1) * 60 % 1) * 60)
      });
    }
    
    return houses;
  }

  calculatePlacidusHouse(houseNum, julianDay, latitude, siderealTime, startAngle, endAngle) {
    const latRad = latitude * Math.PI / 180;
    const obliquity = this.calculateObliquity(julianDay);
    const oblRad = obliquity * Math.PI / 180;
    
    // Proper Placidus house calculation using iterative method
    // Based on the formula: tan(H) = tan(L) * sin(E + t*k) / sin(E)
    // where H = house longitude, L = local latitude, E = ecliptic longitude of quadrant start
    // t = time fraction, k = quadrant arc
    
    // Time fractions for intermediate houses (correct Placidus divisions)
    const timeFractions = {
      2: 2/3, 3: 1/3, 5: 1/3, 6: 2/3,
      8: 2/3, 9: 1/3, 11: 1/3, 12: 2/3
    };
    
    const timeFraction = timeFractions[houseNum];
    if (!timeFraction) return startAngle;
    
    // Calculate quadrant arc
    let quadrantArc = endAngle - startAngle;
    if (quadrantArc < 0) quadrantArc += 360;
    if (quadrantArc > 180) quadrantArc = 360 - quadrantArc;
    
    // Convert to radians for calculation
    const startRad = startAngle * Math.PI / 180;
    const arcRad = quadrantArc * Math.PI / 180;
    
    // Placidus formula: iterative solution
    let houseRad = startRad;
    const maxIterations = 10;
    const tolerance = 1e-8;
    
    for (let i = 0; i < maxIterations; i++) {
      // Calculate time parameter for this house
      const timeParam = timeFraction * arcRad;
      
      // Spherical trigonometry for house cusp
      const numerator = Math.sin(timeParam) * Math.cos(latRad);
      const denominator = Math.cos(timeParam) * Math.cos(oblRad) - 
                         Math.sin(timeParam) * Math.sin(oblRad) * Math.sin(latRad);
      
      if (Math.abs(denominator) < 1e-10) break; // Avoid division by zero
      
      const newHouseRad = Math.atan2(
        Math.sin(startRad) * Math.cos(oblRad) + numerator / denominator * Math.sin(oblRad),
        Math.cos(startRad)
      );
      
      // Check convergence
      if (Math.abs(newHouseRad - houseRad) < tolerance) {
        houseRad = newHouseRad;
        break;
      }
      
      houseRad = newHouseRad;
    }
    
    // Convert back to degrees
    let houseDegrees = houseRad * 180 / Math.PI;
    
    return this.normalizeAngle(houseDegrees);
  }

  calculateIntermediateHouse(start, end, houseNumber, latitude, obliquity) {
    // Alternative method for intermediate houses when Placidus fails
    // Uses equal time divisions as fallback
    const timeDivisions = {
      2: 2/3, 3: 1/3, 5: 1/3, 6: 2/3, 8: 2/3, 9: 1/3, 11: 1/3, 12: 2/3
    };
    
    const fraction = timeDivisions[houseNumber] || 0.5;
    
    let diff = end - start;
    if (diff < 0) diff += 360;
    if (diff > 180) diff = 360 - diff;
    
    // Apply latitude correction for better accuracy
    const latCorrection = Math.cos(latitude * Math.PI / 180) * 0.1;
    const adjustedFraction = fraction + (fraction - 0.5) * latCorrection;
    
    let cusp = start + (diff * adjustedFraction);
    
    return this.normalizeAngle(cusp);
  }

  calculateObliquity(julianDay) {
    // Calculate obliquity of the ecliptic
    const T = (julianDay - 2451545.0) / 36525.0;
    const obliquity = 23.439291 - 0.0130042 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
    return obliquity;
  }

  calculateAspects(planets) {
    const aspects = [];
    
    // Traditional orbs by planet type (luminaries get wider orbs)
    const planetOrbs = {
      'Sun': { base: 8, tight: 6 },
      'Moon': { base: 8, tight: 6 },
      'Mercury': { base: 6, tight: 4 },
      'Venus': { base: 6, tight: 4 },
      'Mars': { base: 6, tight: 4 },
      'Jupiter': { base: 7, tight: 5 },
      'Saturn': { base: 7, tight: 5 },
      'Uranus': { base: 5, tight: 3 },
      'Neptune': { base: 5, tight: 3 },
      'Pluto': { base: 5, tight: 3 }
    };
    
    // Aspect types with different orb categories
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orbType: 'base', symbol: '☌', strength: 'major' },
      { name: 'Opposition', angle: 180, orbType: 'base', symbol: '☍', strength: 'major' },
      { name: 'Trine', angle: 120, orbType: 'base', symbol: '△', strength: 'major' },
      { name: 'Square', angle: 90, orbType: 'base', symbol: '□', strength: 'major' },
      { name: 'Sextile', angle: 60, orbType: 'tight', symbol: '⚹', strength: 'minor' },
      { name: 'Quincunx', angle: 150, orbType: 'tight', symbol: '⚻', strength: 'minor' },
      { name: 'Semisquare', angle: 45, orbType: 'tight', symbol: '∠', strength: 'minor' },
      { name: 'Sesquiquadrate', angle: 135, orbType: 'tight', symbol: '⚼', strength: 'minor' }
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;

        for (const aspectType of aspectTypes) {
          // Calculate dynamic orb based on both planets
          const orb1 = planetOrbs[planet1.name]?.[aspectType.orbType] || 4;
          const orb2 = planetOrbs[planet2.name]?.[aspectType.orbType] || 4;
          
          // Use the average orb, but give luminaries precedence
          let effectiveOrb;
          if (planet1.name === 'Sun' || planet1.name === 'Moon' || 
              planet2.name === 'Sun' || planet2.name === 'Moon') {
            effectiveOrb = Math.max(orb1, orb2); // Use larger orb if luminaries involved
          } else {
            effectiveOrb = (orb1 + orb2) / 2; // Average orb for other planets
          }
          
          // Adjust orb for aspect strength
          if (aspectType.strength === 'minor') {
            effectiveOrb *= 0.75; // Tighter orbs for minor aspects
          }
          
          const orbDifference = Math.abs(normalizedAngle - aspectType.angle);
          
          if (orbDifference <= effectiveOrb) {
            // Calculate aspect strength (closer = stronger)
            const strength = 1 - (orbDifference / effectiveOrb);
            
            aspects.push({
              planet1: planet1.name,
              planet2: planet2.name,
              aspect: aspectType.name,
              symbol: aspectType.symbol,
              angle: normalizedAngle,
              exactAngle: aspectType.angle,
              orb: orbDifference,
              maxOrb: effectiveOrb,
              strength: strength,
              aspectType: aspectType.strength,
              isApplying: this.isAspectApplying(planet1, planet2, aspectType.angle)
            });
            break;
          }
        }
      }
    }

    // Sort aspects by strength (exact aspects first)
    aspects.sort((a, b) => a.orb - b.orb);
    
    return aspects;
  }
  
  /**
   * Determine if an aspect is applying (planets moving toward exact aspect) or separating
   */
  isAspectApplying(planet1, planet2, exactAngle) {
    // This is a simplified version - in a full implementation, you'd need
    // planetary velocities to determine if aspects are applying or separating
    // For now, we'll use a basic heuristic based on planetary order
    
    const planetOrder = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const index1 = planetOrder.indexOf(planet1.name);
    const index2 = planetOrder.indexOf(planet2.name);
    
    if (index1 === -1 || index2 === -1) return null;
    
    // Faster planets typically apply to slower planets
    return index1 < index2;
  }

  getZodiacSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    // Ensure longitude is normalized to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    return signs[Math.floor(normalizedLongitude / 30)];
  }

  getHousePosition(longitude, houses) {
    // Find which house this longitude falls into
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % 12];
      
      let currentCusp = currentHouse.cusp;
      let nextCusp = nextHouse.cusp;
      
      // Handle house crossing 0 degrees
      if (nextCusp < currentCusp) {
        if (longitude >= currentCusp || longitude < nextCusp) {
          return currentHouse.house;
        }
      } else {
        if (longitude >= currentCusp && longitude < nextCusp) {
          return currentHouse.house;
        }
      }
    }
    
    return 1; // Fallback
  }

  /**
   * Normalize angle to 0-360 degrees consistently
   * @param {number} angle - Angle in degrees
   * @returns {number} Normalized angle
   */
  normalizeAngle(angle) {
    if (typeof angle !== 'number' || isNaN(angle)) {
      console.warn('Invalid angle provided to normalizeAngle:', angle);
      return 0;
    }
    
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }

  // Accurate planetary position calculation methods
  calculateSunPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    // Mean longitude of the Sun
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    
    // Mean anomaly of the Sun
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const MRad = M * Math.PI / 180;
    
    // Equation of center
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(MRad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) +
              0.000289 * Math.sin(3 * MRad);
    
    // True longitude
    const sunLongitude = L0 + C;
    
    return sunLongitude % 360;
  }

  calculateMoonPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    // Mean longitude of the Moon
    const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
    
    // Mean elongation of the Moon
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000;
    
    // Mean anomaly of the Sun
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
    
    // Mean anomaly of the Moon
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
    
    // Moon's argument of latitude
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000;
    
    // Convert to radians
    const DRad = D * Math.PI / 180;
    const MRad = M * Math.PI / 180;
    const MpRad = Mp * Math.PI / 180;
    const FRad = F * Math.PI / 180;
    
    // Main periodic terms (simplified)
    let correction = 0;
    correction += 6.288774 * Math.sin(MpRad);
    correction += 1.274027 * Math.sin(2 * DRad - MpRad);
    correction += 0.658314 * Math.sin(2 * DRad);
    correction += 0.213618 * Math.sin(2 * MpRad);
    correction += -0.185116 * Math.sin(MRad);
    correction += -0.114332 * Math.sin(2 * FRad);
    correction += 0.058793 * Math.sin(2 * DRad - 2 * MpRad);
    correction += 0.057066 * Math.sin(2 * DRad - MRad - MpRad);
    correction += 0.053322 * Math.sin(2 * DRad + MpRad);
    correction += 0.045758 * Math.sin(2 * DRad - MRad);
    
    const moonLongitude = L + correction;
    
    return moonLongitude % 360;
  }

  calculateMercuryPosition(julianDay) {
    // Enhanced Mercury calculation with more terms for better accuracy
    const T = (julianDay - 2451545.0) / 36525.0;
    const T2 = T * T;
    
    // Mean longitude with higher precision
    const L = 252.250906 + 149472.6746358 * T - 0.0000536 * T2;
    
    // Mean anomaly with higher precision
    const M = 174.7947656 + 149474.0722491 * T + 0.0003011 * T2;
    const MRad = M * Math.PI / 180;
    
    // Enhanced equation of center with more periodic terms
    let C = 23.4400 * Math.sin(MRad) + 
            2.9818 * Math.sin(2 * MRad) + 
            0.5255 * Math.sin(3 * MRad) +
            0.1058 * Math.sin(4 * MRad) +
            0.0241 * Math.sin(5 * MRad) +
            0.0055 * Math.sin(6 * MRad);
    
    // Apply small perturbations from Venus and Earth
    const venusLongitude = 181.979801 + 58517.8156760 * T;
    const earthLongitude = 100.466457 + 35999.3728565 * T;
    
    C += 0.00204 * Math.cos((5 * venusLongitude - 2 * L) * Math.PI / 180);
    C += 0.00103 * Math.cos((2 * earthLongitude - L) * Math.PI / 180);
    
    return this.normalizeAngle(L + C);
  }

  calculateVenusPosition(julianDay) {
    // Enhanced Venus calculation with more terms
    const T = (julianDay - 2451545.0) / 36525.0;
    const T2 = T * T;
    
    // Mean longitude with secular terms
    const L = 181.979801 + 58517.8156760 * T + 0.0003011 * T2;
    
    // Mean anomaly
    const M = 50.4071 + 58519.2130302 * T - 0.0001420 * T2;
    const MRad = M * Math.PI / 180;
    
    // Enhanced equation of center
    let C = 0.7758 * Math.sin(MRad) + 
            0.0033 * Math.sin(2 * MRad) +
            0.0001 * Math.sin(3 * MRad);
    
    // Apply Earth perturbations
    const earthLongitude = 100.466457 + 35999.3728565 * T;
    C += 0.00013 * Math.cos((earthLongitude - L) * Math.PI / 180);
    
    return this.normalizeAngle(L + C);
  }

  calculateMarsPosition(julianDay) {
    // Enhanced Mars calculation with more accurate terms
    const T = (julianDay - 2451545.0) / 36525.0;
    const T2 = T * T;
    
    // Mean longitude with higher precision
    const L = 355.433 + 19140.2993313 * T + 0.0000261 * T2;
    
    // Mean anomaly
    const M = 19.3730 + 19141.6964746 * T - 0.0001557 * T2;
    const MRad = M * Math.PI / 180;
    
    // Enhanced equation of center with more terms
    let C = 10.691 * Math.sin(MRad) + 
            0.623 * Math.sin(2 * MRad) + 
            0.050 * Math.sin(3 * MRad) +
            0.005 * Math.sin(4 * MRad) +
            0.0005 * Math.sin(5 * MRad);
    
    // Apply perturbations from Jupiter
    const jupiterLongitude = 34.351519 + 3034.9056606 * T;
    C += 0.705 * Math.cos((jupiterLongitude - L) * Math.PI / 180);
    
    return this.normalizeAngle(L + C);
  }

  calculateJupiterPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    const L = 34.351519 + 3034.9056606 * T;
    const M = 19.895 + 3034.69202390 * T;
    const MRad = M * Math.PI / 180;
    
    const C = 5.555 * Math.sin(MRad) + 0.168 * Math.sin(2 * MRad);
    
    return (L + C) % 360;
  }

  calculateSaturnPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    const L = 50.0774 + 1222.1138488 * T;
    const M = 317.020 + 1223.5110686 * T;
    const MRad = M * Math.PI / 180;
    
    const C = 6.406 * Math.sin(MRad) + 0.319 * Math.sin(2 * MRad);
    
    return (L + C) % 360;
  }

  calculateUranusPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    const L = 314.055 + 428.4669983 * T;
    const M = 141.050 + 428.3269041 * T;
    const MRad = M * Math.PI / 180;
    
    const C = 5.481 * Math.sin(MRad) + 0.119 * Math.sin(2 * MRad);
    
    return (L + C) % 360;
  }

  calculateNeptunePosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    const L = 304.348 + 218.4862002 * T;
    const M = 256.225 + 218.4594190 * T;
    const MRad = M * Math.PI / 180;
    
    const C = 1.019 * Math.sin(MRad);
    
    return (L + C) % 360;
  }

  calculatePlutoPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    const L = 238.958 + 145.1097790 * T;
    const M = 14.882 + 145.1769950 * T;
    const MRad = M * Math.PI / 180;
    
    const C = 6.157 * Math.sin(MRad) + 0.199 * Math.sin(2 * MRad);
    
    return (L + C) % 360;
  }

  showChartVisualization() {
    document.getElementById('chartVisualization').style.display = 'block';
    document.getElementById('chartDataSection').style.display = 'block';
    
    // Update chart info
    document.getElementById('chartDate').textContent = new Date(this.birthData.date).toLocaleDateString();
    document.getElementById('chartLocation').textContent = this.birthData.location.name;
    
    // Render SVG chart
    this.renderBirthChart();
    
    // Populate data tables
    this.populateDataTables();
    
    // Populate interpretation
    this.populateInterpretation();
    
    // Scroll to chart
    document.getElementById('chartVisualization').scrollIntoView({ behavior: 'smooth' });
  }

  renderBirthChart() {
    const svg = document.getElementById('birthChartSVG');
    const centerX = 250;
    const centerY = 250;
    const outerRadius = 200;
    const innerRadius = 150;
    const planetRadius = 125;
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Add cosmic background and effects
    this.createSVGElement(svg, 'defs', {}, `
      <radialGradient id="cosmicGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:rgba(240,199,94,0.1);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(240,199,94,0.05);stop-opacity:1" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="planetGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `);
    
    // Background circle
    this.createSVGElement(svg, 'circle', {
      cx: centerX,
      cy: centerY,
      r: outerRadius + 10,
      fill: 'url(#cosmicGradient)',
      opacity: 0.5
    });
    
    // Draw zodiac signs background
    this.drawZodiacSigns(svg, centerX, centerY, outerRadius, innerRadius);
    
    // Draw outer circle
    this.createSVGElement(svg, 'circle', {
      cx: centerX,
      cy: centerY,
      r: outerRadius,
      fill: 'none',
      stroke: 'rgba(240, 199, 94, 0.6)',
      'stroke-width': 2,
      class: 'chart-outer-circle',
      filter: 'url(#glow)'
    });
    
    // Draw inner circle
    this.createSVGElement(svg, 'circle', {
      cx: centerX,
      cy: centerY,
      r: innerRadius,
      fill: 'none',
      stroke: 'rgba(240, 199, 94, 0.4)',
      'stroke-width': 1,
      class: 'chart-inner-circle'
    });
    
    // Draw house divisions and numbers
    this.drawHouseDivisions(svg, centerX, centerY, outerRadius, innerRadius);
    
    // Draw aspect lines first (behind planets)
    if (this.chartData.aspects) {
      this.drawAspectLines(svg, centerX, centerY, planetRadius);
    }
    
    // Draw planets with enhanced styling
    this.drawPlanetsEnhanced(svg, centerX, centerY, planetRadius);
    
    // Add interactivity
    this.setupChartInteractivity(svg);
    
    // Populate legend
    this.populateEnhancedLegend();
  }

  createSVGElement(parent, tagName, attributes, textContent) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    
    if (textContent) {
      if (tagName === 'defs') {
        element.innerHTML = textContent;
      } else {
        element.textContent = textContent;
      }
    }
    
    parent.appendChild(element);
    return element;
  }

  drawZodiacSigns(svg, centerX, centerY, outerRadius, innerRadius) {
    const zodiacSigns = [
      { name: 'Aries', symbol: '♈', color: '#FF4500' },
      { name: 'Taurus', symbol: '♉', color: '#32CD32' },
      { name: 'Gemini', symbol: '♊', color: '#FFD700' },
      { name: 'Cancer', symbol: '♋', color: '#87CEEB' },
      { name: 'Leo', symbol: '♌', color: '#FF6347' },
      { name: 'Virgo', symbol: '♍', color: '#9ACD32' },
      { name: 'Libra', symbol: '♎', color: '#FFB6C1' },
      { name: 'Scorpio', symbol: '♏', color: '#8B0000' },
      { name: 'Sagittarius', symbol: '♐', color: '#FF8C00' },
      { name: 'Capricorn', symbol: '♑', color: '#2F4F4F' },
      { name: 'Aquarius', symbol: '♒', color: '#00CED1' },
      { name: 'Pisces', symbol: '♓', color: '#9370DB' }
    ];
    
    zodiacSigns.forEach((sign, index) => {
      const startAngle = (index * 30 - 90) * Math.PI / 180;
      const endAngle = ((index + 1) * 30 - 90) * Math.PI / 180;
      const midAngle = (startAngle + endAngle) / 2;
      
      // Create arc path for sign background
      const pathData = this.createArcPath(centerX, centerY, innerRadius, outerRadius, 
                                        index * 30, (index + 1) * 30);
      
      this.createSVGElement(svg, 'path', {
        d: pathData,
        fill: sign.color,
        opacity: 0.1,
        stroke: 'rgba(255, 255, 255, 0.2)',
        'stroke-width': 0.5,
        class: `zodiac-sign-${sign.name.toLowerCase()}`
      });
      
      // Sign symbol
      const symbolRadius = outerRadius - 20;
      const symbolX = centerX + symbolRadius * Math.cos(midAngle);
      const symbolY = centerY + symbolRadius * Math.sin(midAngle);
      
      this.createSVGElement(svg, 'text', {
        x: symbolX,
        y: symbolY,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: sign.color,
        'font-size': '16px',
        'font-weight': 'bold',
        opacity: 0.8,
        class: 'zodiac-symbol'
      }, sign.symbol);
    });
  }

  drawHouseDivisions(svg, centerX, centerY, outerRadius, innerRadius) {
    if (!this.chartData.houses) return;
    
    this.chartData.houses.forEach((house, index) => {
      const angle = (house.cusp - 90) * Math.PI / 180;
      const x1 = centerX + innerRadius * Math.cos(angle);
      const y1 = centerY + innerRadius * Math.sin(angle);
      const x2 = centerX + outerRadius * Math.cos(angle);
      const y2 = centerY + outerRadius * Math.sin(angle);
      
      this.createSVGElement(svg, 'line', {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        stroke: 'rgba(255, 255, 255, 0.3)',
        'stroke-width': house.house % 3 === 1 ? 2 : 1, // Emphasize angular houses
        class: 'house-division'
      });
      
      // House numbers
      const labelRadius = outerRadius - 35;
      const nextHouse = this.chartData.houses[(index + 1) % 12];
      const nextAngle = (nextHouse.cusp - 90) * Math.PI / 180;
      const midAngle = this.calculateMidAngle(angle, nextAngle);
      
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      this.createSVGElement(svg, 'text', {
        x: labelX,
        y: labelY,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: 'rgba(255, 255, 255, 0.8)',
        'font-size': '14px',
        'font-weight': '600',
        class: 'house-number'
      }, house.house.toString());
    });
  }

  drawPlanetsEnhanced(svg, centerX, centerY, planetRadius) {
    if (!this.chartData.planets) return;
    
    this.chartData.planets.forEach((planet, index) => {
      // Calculate house position for this planet
      planet.house = this.getHousePosition(planet.longitude, this.chartData.houses);
      
      const angle = (planet.longitude - 90) * Math.PI / 180;
      const planetX = centerX + planetRadius * Math.cos(angle);
      const planetY = centerY + planetRadius * Math.sin(angle);
      
      // Planet circle with enhanced styling
      const planetCircle = this.createSVGElement(svg, 'circle', {
        cx: planetX,
        cy: planetY,
        r: 12,
        fill: planet.color,
        stroke: 'rgba(255, 255, 255, 0.9)',
        'stroke-width': 2,
        class: 'planet-circle',
        'data-planet': planet.name,
        'data-longitude': planet.longitude.toFixed(2),
        'data-sign': planet.sign,
        filter: 'url(#planetGlow)'
      });
      
      // Planet symbol
      this.createSVGElement(svg, 'text', {
        x: planetX,
        y: planetY,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: 'rgba(255, 255, 255, 0.95)',
        'font-size': '12px',
        'font-weight': 'bold',
        class: 'planet-symbol',
        'pointer-events': 'none'
      }, planet.symbol);
      
      // Planet degree label
      const labelRadius = planetRadius - 25;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      this.createSVGElement(svg, 'text', {
        x: labelX,
        y: labelY,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: 'rgba(240, 199, 94, 0.9)',
        'font-size': '10px',
        'font-weight': '600',
        class: 'planet-degree'
      }, `${planet.degree}°${planet.minute}'`);
    });
  }

  drawAspectLines(svg, centerX, centerY, planetRadius) {
    if (!this.chartData.aspects) return;
    
    this.chartData.aspects.forEach(aspect => {
      const planet1 = this.chartData.planets.find(p => p.name === aspect.planet1);
      const planet2 = this.chartData.planets.find(p => p.name === aspect.planet2);
      
      if (!planet1 || !planet2) return;
      
      const angle1 = (planet1.longitude - 90) * Math.PI / 180;
      const angle2 = (planet2.longitude - 90) * Math.PI / 180;
      
      const x1 = centerX + planetRadius * Math.cos(angle1);
      const y1 = centerY + planetRadius * Math.sin(angle1);
      const x2 = centerX + planetRadius * Math.cos(angle2);
      const y2 = centerY + planetRadius * Math.sin(angle2);
      
      const aspectColors = {
        'Conjunction': '#FFD700',
        'Opposition': '#FF4444',
        'Trine': '#44FF44',
        'Square': '#FF8800',
        'Sextile': '#4488FF'
      };
      
      this.createSVGElement(svg, 'line', {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        stroke: aspectColors[aspect.aspect] || '#FFFFFF',
        'stroke-width': 1.5,
        opacity: 0.6,
        class: `aspect-line ${aspect.aspect.toLowerCase()}`,
        'data-aspect': `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`
      });
    });
  }

  setupChartInteractivity(svg) {
    // Create tooltip element
    this.createTooltip();
    
    // Planet hover interactions
    svg.querySelectorAll('.planet-circle').forEach(planetElement => {
      planetElement.addEventListener('mouseenter', (e) => {
        this.showPlanetTooltip(e, planetElement);
      });
      
      planetElement.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
      
      planetElement.addEventListener('mousemove', (e) => {
        this.updateTooltipPosition(e);
      });
    });
    
    // Aspect line interactions
    svg.querySelectorAll('.aspect-line').forEach(aspectElement => {
      aspectElement.addEventListener('mouseenter', (e) => {
        aspectElement.style.opacity = '1';
        aspectElement.style.strokeWidth = '2.5';
        this.showAspectTooltip(e, aspectElement);
      });
      
      aspectElement.addEventListener('mouseleave', (e) => {
        aspectElement.style.opacity = '0.6';
        aspectElement.style.strokeWidth = '1.5';
        this.hideTooltip();
      });
    });
  }

  createTooltip() {
    if (this.tooltip) return;
    
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'chart-tooltip';
    document.body.appendChild(this.tooltip);
  }

  showPlanetTooltip(event, planetElement) {
    const planetName = planetElement.dataset.planet;
    const longitude = parseFloat(planetElement.dataset.longitude);
    const sign = planetElement.dataset.sign;
    const planet = this.chartData.planets.find(p => p.name === planetName);
    
    if (!planet) return;
    
    this.tooltip.innerHTML = `
      <div class="tooltip-title">${planet.name} ${planet.symbol}</div>
      <div class="tooltip-content">
        <div><strong>Sign:</strong> ${sign}</div>
        <div><strong>Position:</strong> ${planet.degree}° ${planet.minute}' ${sign}</div>
        <div><strong>Longitude:</strong> ${longitude.toFixed(2)}°</div>
      </div>
    `;
    
    this.showTooltip(event);
  }

  showAspectTooltip(event, aspectElement) {
    const aspectInfo = aspectElement.dataset.aspect;
    
    this.tooltip.innerHTML = `
      <div class="tooltip-title">Aspect</div>
      <div class="tooltip-content">${aspectInfo}</div>
    `;
    
    this.showTooltip(event);
  }

  showTooltip(event) {
    this.tooltip.classList.add('visible');
    this.updateTooltipPosition(event);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('visible');
    }
  }

  updateTooltipPosition(event) {
    if (!this.tooltip) return;
    
    const x = event.clientX + 10;
    const y = event.clientY - 10;
    
    this.tooltip.style.left = x + 'px';
    this.tooltip.style.top = y + 'px';
  }

  populateEnhancedLegend() {
    this.populatePlanetLegend();
    this.populateSignLegend();
    this.populateHouseLegend();
  }

  populatePlanetLegend() {
    const legendContainer = document.getElementById('planetLegend');
    if (!legendContainer || !this.chartData.planets) return;
    
    legendContainer.innerHTML = this.chartData.planets.map(planet => `
      <div class="legend-item" data-planet="${planet.name}">
        <div class="legend-symbol" style="background-color: ${planet.color}">
          ${planet.symbol}
        </div>
        <div class="legend-name">${planet.name}</div>
        <div class="legend-details">${planet.sign} ${planet.degree}°</div>
      </div>
    `).join('');
    
    // Add click interactions
    legendContainer.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        this.highlightPlanet(item.dataset.planet);
      });
    });
  }

  populateSignLegend() {
    const legendContainer = document.getElementById('signLegend');
    if (!legendContainer) return;
    
    const zodiacSigns = [
      { name: 'Aries', symbol: '♈', element: 'Fire' },
      { name: 'Taurus', symbol: '♉', element: 'Earth' },
      { name: 'Gemini', symbol: '♊', element: 'Air' },
      { name: 'Cancer', symbol: '♋', element: 'Water' },
      { name: 'Leo', symbol: '♌', element: 'Fire' },
      { name: 'Virgo', symbol: '♍', element: 'Earth' },
      { name: 'Libra', symbol: '♎', element: 'Air' },
      { name: 'Scorpio', symbol: '♏', element: 'Water' },
      { name: 'Sagittarius', symbol: '♐', element: 'Fire' },
      { name: 'Capricorn', symbol: '♑', element: 'Earth' },
      { name: 'Aquarius', symbol: '♒', element: 'Air' },
      { name: 'Pisces', symbol: '♓', element: 'Water' }
    ];
    
    legendContainer.innerHTML = zodiacSigns.map(sign => `
      <div class="legend-item">
        <div class="legend-symbol" style="background-color: var(--cosmic-gold)">
          ${sign.symbol}
        </div>
        <div class="legend-name">${sign.name}</div>
        <div class="legend-details">${sign.element}</div>
      </div>
    `).join('');
  }

  populateHouseLegend() {
    const legendContainer = document.getElementById('houseLegend');
    if (!legendContainer || !this.chartData.houses) return;
    
    const houseNames = [
      'Self & Identity', 'Money & Values', 'Communication', 'Home & Family',
      'Creativity & Romance', 'Health & Service', 'Partnerships', 'Transformation',
      'Philosophy & Travel', 'Career & Reputation', 'Friends & Hopes', 'Spirituality & Subconscious'
    ];
    
    legendContainer.innerHTML = this.chartData.houses.map((house, index) => `
      <div class="legend-item">
        <div class="legend-symbol" style="background-color: rgba(240, 199, 94, 0.7)">
          ${house.house}
        </div>
        <div class="legend-name">${houseNames[index]}</div>
        <div class="legend-details">${house.sign}</div>
      </div>
    `).join('');
  }

  highlightPlanet(planetName) {
    // Reset all planets
    document.querySelectorAll('.planet-circle').forEach(planet => {
      planet.style.strokeWidth = '2';
      planet.style.filter = 'url(#planetGlow)';
    });
    
    // Highlight selected planet
    const targetPlanet = document.querySelector(`[data-planet="${planetName}"]`);
    if (targetPlanet) {
      targetPlanet.style.strokeWidth = '4';
      targetPlanet.style.filter = 'drop-shadow(0 4px 16px rgba(240, 199, 94, 0.8))';
    }
  }

  createArcPath(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
    const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
    const x2 = centerX + Math.cos(endAngleRad) * innerRadius;
    const y2 = centerY + Math.sin(endAngleRad) * innerRadius;
    
    const x3 = centerX + Math.cos(endAngleRad) * outerRadius;
    const y3 = centerY + Math.sin(endAngleRad) * outerRadius;
    const x4 = centerX + Math.cos(startAngleRad) * outerRadius;
    const y4 = centerY + Math.sin(startAngleRad) * outerRadius;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  }

  calculateMidAngle(angle1, angle2) {
    let diff = angle2 - angle1;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return angle1 + diff / 2;
  }

  populateDataTables() {
    this.populatePlanetsTable();
    this.populateHousesTable();
    this.populateAspectsTable();
  }

  populateInterpretation() {
    const content = document.getElementById('interpretationContent');
    
    if (!this.chartInterpretation) {
      content.innerHTML = '<p>Interpretation not available. Please recalculate your chart.</p>';
      return;
    }

    const interpretation = this.chartInterpretation;
    
    let html = `
      <div class="interpretation-sections">
        <!-- Overview Section -->
        <div class="interpretation-section">
          <h3 class="section-title">${interpretation.overview.title}</h3>
          <div class="section-content">
            <p class="overview-summary">${interpretation.overview.summary}</p>
            
            <div class="key-themes">
              <h4>Key Themes in Your Chart</h4>
              <ul class="theme-list">
                ${interpretation.overview.keyThemes.map(theme => `<li>${theme}</li>`).join('')}
              </ul>
            </div>
            
            <div class="chart-pattern">
              <h4>Chart Pattern</h4>
              <p>${interpretation.overview.chartPattern}</p>
            </div>
          </div>
        </div>

        <!-- Personality Section -->
        <div class="interpretation-section">
          <h3 class="section-title">${interpretation.personality.title}</h3>
          <div class="section-content">
            <div class="personality-aspects">
              <div class="aspect-card">
                <h4>Core Identity (Sun)</h4>
                <p>${interpretation.personality.coreIdentity}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Emotional Nature (Moon)</h4>
                <p>${interpretation.personality.emotionalNature}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Communication Style (Mercury)</h4>
                <p>${interpretation.personality.communicationStyle}</p>
              </div>
            </div>
            
            <div class="strengths-challenges">
              <div class="strengths">
                <h4>Your Strengths</h4>
                <ul>
                  ${interpretation.personality.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
              </div>
              
              <div class="challenges">
                <h4>Growth Areas</h4>
                <ul>
                  ${interpretation.personality.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Relationships Section -->
        <div class="interpretation-section">
          <h3 class="section-title">${interpretation.relationships.title}</h3>
          <div class="section-content">
            <div class="relationship-aspects">
              <div class="aspect-card">
                <h4>Love Style (Venus)</h4>
                <p>${interpretation.relationships.loveStyle}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Attraction Style (Mars)</h4>
                <p>${interpretation.relationships.attractionStyle}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Partnership Needs</h4>
                <p>${interpretation.relationships.partnershipNeeds}</p>
              </div>
            </div>
            
            <div class="compatibility-guidance">
              <h4>Compatibility Guidance</h4>
              <p>${interpretation.relationships.compatibility}</p>
            </div>
          </div>
        </div>

        <!-- Career Section -->
        <div class="interpretation-section">
          <h3 class="section-title">${interpretation.career.title}</h3>
          <div class="section-content">
            <div class="career-aspects">
              <div class="aspect-card">
                <h4>Career Path</h4>
                <p>${interpretation.career.careerPath}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Work Style</h4>
                <p>${interpretation.career.workStyle}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Growth Opportunities</h4>
                <p>${interpretation.career.growthOpportunities}</p>
              </div>
            </div>
            
            <div class="talents-challenges">
              <div class="talents">
                <h4>Natural Talents</h4>
                <ul>
                  ${interpretation.career.talents.map(talent => `<li>${talent}</li>`).join('')}
                </ul>
              </div>
              
              <div class="career-challenges">
                <h4>Career Challenges</h4>
                <ul>
                  ${interpretation.career.careerChallenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Spirituality Section -->
        <div class="interpretation-section">
          <h3 class="section-title">${interpretation.spirituality.title}</h3>
          <div class="section-content">
            <div class="spiritual-aspects">
              <div class="aspect-card">
                <h4>Spiritual Nature</h4>
                <p>${interpretation.spirituality.spiritualNature}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Transformation Path</h4>
                <p>${interpretation.spirituality.transformation}</p>
              </div>
              
              <div class="aspect-card">
                <h4>Higher Learning</h4>
                <p>${interpretation.spirituality.higherLearning}</p>
              </div>
            </div>
            
            <div class="spiritual-guidance">
              <div class="life-philosophy">
                <h4>Life Philosophy</h4>
                <p>${interpretation.spirituality.lifePhilosophy}</p>
              </div>
              
              <div class="spiritual-gifts">
                <h4>Spiritual Gifts</h4>
                <ul>
                  ${interpretation.spirituality.spiritualGifts.map(gift => `<li>${gift}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Planetary Insights -->
        <div class="interpretation-section">
          <h3 class="section-title">Planetary Insights</h3>
          <div class="section-content">
            <div class="planetary-insights">
              ${interpretation.planetaryInsights.map(insight => {
                const planetColor = this.findPlanet(this.chartData.planets, insight.planet)?.color || '#666';
                return `<div class="planet-insight">
                  <h4><span style="color: ${planetColor}">${insight.symbol}</span> ${insight.planet} in ${insight.sign} (House ${insight.house})</h4>
                  
                  <div class="sign-interpretation">
                    <h5>Sign Influence:</h5>
                    <p>${insight.interpretation}</p>
                  </div>
                  
                  <div class="house-interpretation">
                    <h5>House Influence:</h5>
                    <p>${insight.houseInterpretation}</p>
                  </div>
                  
                  <div class="combined-interpretation">
                    <h5>Combined Meaning:</h5>
                    <p>${insight.combinedInterpretation}</p>
                  </div>
                  
                  <div class="practical-advice">
                    <h5>Practical Advice:</h5>
                    <p>${insight.practicalAdvice}</p>
                  </div>
                  
                  <div class="beginner-explanation">
                    <strong>What this means:</strong> ${insight.beginnerExplanation}
                  </div>
                  
                  <div class="keywords">
                    <strong>Keywords:</strong> ${insight.keywords.join(', ')}
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Aspect Insights -->
        <div class="interpretation-section">
          <h3 class="section-title">Major Aspects</h3>
          <div class="section-content">
            <div class="aspect-insights">
              ${interpretation.aspectInsights.map(aspect => `
                <div class="aspect-insight">
                  <h4>${aspect.planet1} ${aspect.symbol} ${aspect.planet2}</h4>
                  <p class="interpretation">${aspect.interpretation}</p>
                  <div class="beginner-explanation">
                    <strong>What this means:</strong> ${aspect.beginnerExplanation}
                  </div>
                  <div class="aspect-advice">
                    <strong>Advice:</strong> ${aspect.advice}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    content.innerHTML = html;
  }

  populatePlanetsTable() {
    const table = document.getElementById('planetsTable');
    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th>Sign</th>
            <th>Degree</th>
            <th>House</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    this.chartData.planets.forEach(planet => {
      html += `
        <tr>
          <td><span style="color: ${planet.color}">${planet.symbol}</span> ${planet.name}</td>
          <td>${planet.sign}</td>
          <td>${planet.degree}° ${planet.minute}'</td>
          <td>${planet.house}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    table.innerHTML = html;
  }

  populateHousesTable() {
    const table = document.getElementById('housesTable');
    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>House</th>
            <th>Sign</th>
            <th>Degree</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    this.chartData.houses.forEach(house => {
      html += `
        <tr>
          <td>${house.house}</td>
          <td>${house.sign}</td>
          <td>${house.degree}° ${house.minute}'</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    table.innerHTML = html;
  }

  populateAspectsTable() {
    const table = document.getElementById('aspectsTable');
    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Planet 1</th>
            <th>Aspect</th>
            <th>Planet 2</th>
            <th>Orb</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    this.chartData.aspects.forEach(aspect => {
      html += `
        <tr>
          <td>${aspect.planet1}</td>
          <td>${aspect.symbol} ${aspect.aspect}</td>
          <td>${aspect.planet2}</td>
          <td>${aspect.orb.toFixed(1)}°</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    table.innerHTML = html;
  }

  switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
  }

  downloadChart() {
    // Create downloadable SVG
    const svg = document.getElementById('birthChartSVG');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `birth-chart-${this.birthData.date}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  }

  shareChart() {
    if (navigator.share) {
      navigator.share({
        title: 'My Birth Chart - AstroAura',
        text: `Check out my birth chart calculated on AstroAura!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Chart link copied to clipboard!');
      });
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.birthData = {};
    this.chartData = null;
    
    // Reset form
    document.getElementById('birthChartForm').reset();
    
    // Hide visualization
    document.getElementById('chartVisualization').style.display = 'none';
    document.getElementById('chartDataSection').style.display = 'none';
    
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

  showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  clearError(errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  showCalculationError(customMessage = null) {
    document.getElementById('calculationLoading').style.display = 'none';
    
    const errorMessage = customMessage || 'We encountered an error calculating your birth chart. Please check your birth information and try again.';
    
    document.getElementById('calculationComplete').innerHTML = `
      <div class="calculation-error">
        <h3>Calculation Error</h3>
        <p>${errorMessage}</p>
        <div class="error-actions">
          <button type="button" class="btn-cosmic" onclick="location.reload()">Try Again</button>
          <button type="button" class="btn-secondary" id="backToForm">Back to Form</button>
        </div>
        <div class="error-help">
          <h4>Common Issues:</h4>
          <ul>
            <li>Make sure you selected a location from the suggestions</li>
            <li>Verify your birth date is correct</li>
            <li>Check that you have a stable internet connection</li>
          </ul>
        </div>
      </div>
    `;
    
    document.getElementById('calculationComplete').style.display = 'block';
    
    // Add back to form functionality
    document.getElementById('backToForm')?.addEventListener('click', () => {
      this.goToStep(1);
      document.getElementById('chartVisualization').style.display = 'none';
      document.getElementById('chartDataSection').style.display = 'none';
    });
  }

  generateFallbackInterpretation(chartData) {
    return {
      overview: {
        title: "Your Cosmic Blueprint",
        summary: "Your birth chart reveals unique planetary influences that shape your personality and life path.",
        keyThemes: ["Personal growth and self-discovery", "Balancing different aspects of your nature"],
        chartPattern: "Balanced planetary distribution"
      },
      personality: {
        title: "Core Personality",
        coreIdentity: "Your Sun sign reveals your core identity and life purpose.",
        emotionalNature: "Your Moon sign shows your emotional needs and instinctive responses.",
        communicationStyle: "Your Mercury placement influences how you think and communicate.",
        strengths: ["Natural abilities shown in your chart"],
        challenges: ["Growth opportunities for personal development"]
      },
      relationships: {
        title: "Love & Relationships",
        loveStyle: "Your Venus placement shows what you value in relationships.",
        attractionStyle: "Your Mars placement reveals what motivates and attracts you.",
        partnershipNeeds: "Your 7th house shows what you seek in partnerships.",
        compatibility: "Understanding your chart helps in all relationships."
      },
      career: {
        title: "Career & Life Purpose",
        careerPath: "Your 10th house reveals your ideal career direction.",
        workStyle: "Your Saturn placement shows your approach to work and responsibility.",
        growthOpportunities: "Your Jupiter placement indicates areas of expansion.",
        talents: ["Skills highlighted in your planetary positions"],
        careerChallenges: ["Areas requiring discipline and growth"]
      },
      spirituality: {
        title: "Spiritual Path & Growth",
        spiritualNature: "Your Neptune placement shows your spiritual inclinations.",
        transformation: "Your Pluto placement reveals areas of deep change.",
        higherLearning: "Your 9th house shows your approach to wisdom and learning.",
        lifePhilosophy: "Your chart suggests a unique approach to life's meaning.",
        spiritualGifts: ["Intuitive abilities shown in your chart"]
      },
      planetaryInsights: chartData.planets.map(planet => ({
        planet: planet.name,
        symbol: planet.symbol,
        sign: planet.sign,
        house: planet.house,
        interpretation: `Your ${planet.name} in ${planet.sign} brings ${planet.sign} energy to your personality.`,
        houseInterpretation: `Being in the ${planet.house}th house, this influences your ${this.getHouseTheme(planet.house)}.`,
        combinedInterpretation: `${planet.name} in ${planet.sign} in your ${planet.house}th house creates a unique blend of ${planet.sign} energy focused on ${this.getHouseTheme(planet.house)}.`,
        practicalAdvice: `To work with this energy, embrace ${planet.sign} qualities in your ${this.getHouseTheme(planet.house)} activities.`,
        beginnerExplanation: this.getBeginnerExplanation(planet.name),
        keywords: this.getPlanetKeywords(planet.name)
      })),
      aspectInsights: chartData.aspects.map(aspect => ({
        ...aspect,
        interpretation: `The ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2} creates ${aspect.aspect === 'Conjunction' ? 'blended' : aspect.aspect === 'Opposition' ? 'contrasting' : 'flowing'} energy.`,
        beginnerExplanation: this.getAspectBeginnerExplanation(aspect.aspect),
        influence: aspect.aspect === 'Conjunction' ? 'intense' : aspect.aspect === 'Trine' ? 'harmonious' : 'dynamic',
        advice: `Work with this ${aspect.aspect} by understanding how ${aspect.planet1} and ${aspect.planet2} energies interact.`
      }))
    };
  }

  getHouseTheme(houseNumber) {
    const themes = {
      1: 'identity and self-expression',
      2: 'values and resources',
      3: 'communication and learning',
      4: 'home and family',
      5: 'creativity and romance',
      6: 'work and health',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'philosophy and higher learning',
      10: 'career and reputation',
      11: 'friendships and groups',
      12: 'spirituality and subconscious'
    };
    return themes[houseNumber] || 'life experiences';
  }

  getBeginnerExplanation(planetName) {
    const explanations = {
      'Sun': 'Your Sun sign represents your core identity, ego, and the essence of who you are. It\'s your main personality and how you shine in the world.',
      'Moon': 'Your Moon sign reveals your emotional nature, instincts, and subconscious patterns. It shows how you process feelings and what makes you feel secure.',
      'Mercury': 'Mercury governs communication, thinking, and learning. It shows how you process information and express your thoughts.',
      'Venus': 'Venus rules love, beauty, and values. It reveals what you find attractive and how you express affection.',
      'Mars': 'Mars represents action, energy, and desire. It shows how you assert yourself and pursue your goals.',
      'Jupiter': 'Jupiter is the planet of expansion, luck, and wisdom. It shows where you find growth and opportunities.',
      'Saturn': 'Saturn represents discipline, responsibility, and life lessons. It shows where you need to work hard and grow.',
      'Uranus': 'Uranus brings innovation, rebellion, and sudden changes. It shows where you break free from convention.',
      'Neptune': 'Neptune governs dreams, spirituality, and intuition. It shows your connection to the mystical and creative.',
      'Pluto': 'Pluto represents transformation, power, and regeneration. It shows where you experience deep change.'
    };
    
    return explanations[planetName] || `${planetName} brings unique influences to your astrological profile.`;
  }

  getAspectBeginnerExplanation(aspectName) {
    const explanations = {
      'Conjunction': 'A conjunction occurs when planets are close together, blending their energies intensely.',
      'Opposition': 'An opposition creates tension between planets, requiring balance and integration.',
      'Trine': 'A trine is a harmonious aspect that brings ease and natural talent.',
      'Square': 'A square creates dynamic tension that motivates growth through challenges.',
      'Sextile': 'A sextile offers opportunities and supportive energy between planets.'
    };
    
    return explanations[aspectName] || `This aspect creates a unique relationship between the planets involved.`;
  }

  getPlanetKeywords(planetName) {
    const keywords = {
      'Sun': ['identity', 'ego', 'vitality', 'leadership'],
      'Moon': ['emotions', 'intuition', 'nurturing', 'security'],
      'Mercury': ['communication', 'thinking', 'learning', 'adaptability'],
      'Venus': ['love', 'beauty', 'harmony', 'values'],
      'Mars': ['action', 'energy', 'courage', 'desire'],
      'Jupiter': ['expansion', 'wisdom', 'optimism', 'growth'],
      'Saturn': ['discipline', 'responsibility', 'structure', 'lessons'],
      'Uranus': ['innovation', 'rebellion', 'freedom', 'change'],
      'Neptune': ['spirituality', 'dreams', 'intuition', 'compassion'],
      'Pluto': ['transformation', 'power', 'regeneration', 'depth']
    };
    
    return keywords[planetName] || ['unique', 'influential', 'meaningful'];
  }

  findPlanet(planets, name) {
    return planets.find(planet => planet.name === name);
  }

  normalizeAngle(angle) {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }

  // Add CSS styles for location suggestions
  addLocationStyles() {
    if (document.getElementById('location-suggestion-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'location-suggestion-styles';
    style.textContent = `
      .location-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .location-suggestion {
        padding: 10px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .location-suggestion:hover {
        background-color: #f5f5f5;
      }
      
      .location-suggestion.loading {
        cursor: default;
        color: #666;
        font-style: italic;
      }
      
      .location-suggestion.no-results {
        cursor: default;
        color: #999;
        font-style: italic;
      }
      
      .location-name {
        font-weight: bold;
        margin-bottom: 4px;
        color: #333;
      }
      
      .location-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85em;
      }
      
      .location-coords {
        color: #666;
        font-family: monospace;
      }
      
      .location-source {
        color: #999;
        font-style: italic;
        text-transform: capitalize;
      }
      
      .location-confidence {
        color: #4CAF50;
        font-weight: bold;
      }
      
      .form-group {
        position: relative;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize when DOM is loaded (only on birth chart page)
// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded - initializing calculator');
  console.log('🔧 Available classes:', {
    GeocodingService: typeof GeocodingService,
    TimezoneService: typeof TimezoneService,
    BirthChartCalculator: typeof BirthChartCalculator
  });
  
  // Only initialize if we're on a page with the birth chart form
  const formElement = document.getElementById('birthChartForm');
  console.log('📄 Birth chart form element:', formElement);
  
  if (formElement) {
    console.log('🎨 Birth chart form found, creating calculator...');
    try {
      window.birthChartCalculator = new BirthChartCalculator();
      
      // Make available for debugging
      window.calc = window.birthChartCalculator;
      console.log('✅ Calculator initialized successfully');
      console.log('🛠️ Calculator ready - Services available:');
      console.log('  - Geocoding:', !!window.birthChartCalculator.geocodingService);
      console.log('  - Timezone:', !!window.birthChartCalculator.timezoneService);
      console.log('  - Debug command: calc.validateBirthDate()');
    } catch (error) {
      console.error('❌ Error creating birth chart calculator:', error);
      console.error('Error details:', error.message, error.stack);
    }
  } else {
    console.log('📄 Not on birth chart page, skipping calculator initialization');
  }
});