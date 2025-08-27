/**
 * Production Geocoding Service with Multiple API Providers
 * Comprehensive fallback system for reliable location services
 */

class GeocodingService {
  constructor() {
    this.cache = new Map();
    this.rateLimiters = new Map();
    this.apiKeys = this.initializeAPIKeys();
    this.providers = this.initializeProviders();
    this.currentProviderIndex = 0;
    this.maxRetries = 3;
    this.cacheExpiryTime = 24 * 60 * 60 * 1000; // 24 hours
  }

  initializeAPIKeys() {
    // Use configuration if available, otherwise fallback to defaults
    if (typeof GeocodingConfig !== 'undefined') {
      return GeocodingConfig.getAPIKeys();
    }

    // Fallback configuration - NO HARDCODED KEYS FOR SECURITY
    return {
      // Free tier APIs - no key required
      nominatim: null,
      photon: null,

      // Premium APIs - keys should be loaded from environment or config
      ipgeolocation: window.IPGEOLOCATION_API_KEY || null,
      google: window.GOOGLE_MAPS_API_KEY || null,
      mapbox: window.MAPBOX_API_KEY || null,
      here: window.HERE_API_KEY || null
    };
  }

  initializeProviders() {
    return [
      {
        name: 'google',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        format: 'json',
        free: false,
        rateLimit: 100, // Conservative rate limiting
        dailyLimit: 40000, // Google's generous daily limit
        parseResponse: this.parseGoogleResponse.bind(this),
        buildQuery: this.buildGoogleQuery.bind(this),
        priority: 1 // Highest priority for accuracy
      },
      {
        name: 'ipgeolocation',
        url: 'https://api.ipgeolocation.io/geocoding',
        format: 'json',
        free: false,
        rateLimit: 1000, // 1 second between requests (reasonable for API)
        dailyLimit: 1000, // Track daily usage
        parseResponse: this.parseIPGeolocationResponse.bind(this),
        buildQuery: this.buildIPGeolocationQuery.bind(this),
        priority: 2
      },
      {
        name: 'nominatim',
        url: 'https://nominatim.openstreetmap.org/search',
        format: 'json',
        free: true,
        rateLimit: 1000, // 1 request per second
        parseResponse: this.parseNominatimResponse.bind(this),
        buildQuery: this.buildNominatimQuery.bind(this),
        priority: 3
      },
      {
        name: 'photon',
        url: 'https://photon.komoot.io/api',
        format: 'json',
        free: true,
        rateLimit: 500, // 2 requests per second
        parseResponse: this.parsePhotonResponse.bind(this),
        buildQuery: this.buildPhotonQuery.bind(this),
        priority: 4
      },
      {
        name: 'positionstack',
        url: 'http://api.positionstack.com/v1/forward',
        format: 'json',
        free: true, // Free tier available
        rateLimit: 1000,
        parseResponse: this.parsePositionStackResponse.bind(this),
        buildQuery: this.buildPositionStackQuery.bind(this),
        priority: 5
      }
    ];
  }

  /**
   * Main geocoding function with comprehensive fallback system
   */
  async geocodeLocation(query, options = {}) {
    console.log(`Geocoding query: "${query}" with options:`, options);
    const cacheKey = this.generateCacheKey(query, options);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('Returning cached results:', cached.length);
      return cached;
    }

    // Enhanced city search preprocessing
    const enhancedQuery = this.preprocessCityQuery(query);
    console.log('Enhanced query:', enhancedQuery);

    let lastError;
    let results = [];
    let availableProviders = [];
    let rateLimitedProviders = [];

    // Sort providers by priority (Google first if available)
    const sortedProviders = [...this.providers].sort((a, b) => (a.priority || 999) - (b.priority || 999));

    // Separate available providers from rate-limited ones
    for (const provider of sortedProviders) {
      // Skip providers without required API keys
      if (provider.name === 'google' && (!this.apiKeys.google || this.apiKeys.google === 'your-google-maps-api-key')) {
        console.log('Skipping Google Maps - no API key configured');
        continue;
      }
      if (provider.name === 'ipgeolocation' && !this.apiKeys.ipgeolocation) {
        console.log('Skipping IPGeolocation - no API key configured');
        continue;
      }

      if (this.isRateLimited(provider.name)) {
        rateLimitedProviders.push(provider);
      } else {
        availableProviders.push(provider);
      }
    }

    // Phase 1: Try all available API providers first
    console.log(`Phase 1: Trying ${availableProviders.length} available API providers...`);
    for (const provider of availableProviders) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        results = await this.queryProvider(provider, enhancedQuery, options);

        if (results && results.length > 0) {
          console.log(`Provider ${provider.name} returned ${results.length} results`);
          // Success - cache and return
          this.cacheResults(cacheKey, results);
          return results;
        } else {
          console.log(`Provider ${provider.name} returned no results`);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error.message);
        lastError = error;
        // Only rate limit on specific rate limit errors, not all failures
        if (this.isRateLimitError(error)) {
          this.recordRateLimit(provider.name);
        }
      }
    }

    // Phase 2: Try rate-limited providers if no results yet
    if (rateLimitedProviders.length > 0) {
      console.log(`Phase 2: Trying ${rateLimitedProviders.length} rate-limited providers...`);
      for (const provider of rateLimitedProviders) {
        try {
          console.log(`Trying rate-limited provider: ${provider.name}`);
          results = await this.queryProvider(provider, enhancedQuery, options);

          if (results && results.length > 0) {
            console.log(`Rate-limited provider ${provider.name} returned ${results.length} results`);
            this.cacheResults(cacheKey, results);
            return results;
          }
        } catch (error) {
          console.warn(`Rate-limited provider ${provider.name} failed:`, error.message);
          lastError = error;
          if (this.isRateLimitError(error)) {
            this.recordRateLimit(provider.name);
          }
        }
      }
    }

    // Phase 3: Try fallback methods only after ALL APIs fail
    console.log('Phase 3: All API providers exhausted, trying fallback methods...');
    const fallbackResults = await this.tryFallbackMethods(query, options);
    if (fallbackResults && fallbackResults.length > 0) {
      console.log('Fallback methods found results:', fallbackResults.length);
      this.cacheResults(cacheKey, fallbackResults);
      return fallbackResults;
    }

    // If we get here, return empty array rather than throwing error
    console.warn('All geocoding methods exhausted, returning empty results');
    return [];
  }

  /**
   * Preprocess city queries to improve search accuracy
   */
  preprocessCityQuery(query) {
    let processed = query.trim();

    // Handle common abbreviations and variations
    const cityAbbreviations = {
      'NYC': 'New York City, NY, USA',
      'LA': 'Los Angeles, CA, USA',
      'SF': 'San Francisco, CA, USA',
      'DC': 'Washington, DC, USA',
      'Chi': 'Chicago, IL, USA',
      'Philly': 'Philadelphia, PA, USA',
      'Vegas': 'Las Vegas, NV, USA',
      'Miami': 'Miami, FL, USA',
      'Boston': 'Boston, MA, USA',
      'Seattle': 'Seattle, WA, USA',
      'Portland': 'Portland, OR, USA',
      'Denver': 'Denver, CO, USA',
      'Austin': 'Austin, TX, USA',
      'Nashville': 'Nashville, TN, USA',
      'Atlanta': 'Atlanta, GA, USA'
    };

    // Check for abbreviations
    const upperQuery = processed.toUpperCase();
    if (cityAbbreviations[upperQuery]) {
      return cityAbbreviations[upperQuery];
    }

    // Add country context for ambiguous city names
    const ambiguousCities = [
      'London', 'Paris', 'Rome', 'Berlin', 'Madrid', 'Vienna', 'Prague', 'Warsaw',
      'Moscow', 'Athens', 'Dublin', 'Stockholm', 'Oslo', 'Helsinki', 'Copenhagen',
      'Amsterdam', 'Brussels', 'Zurich', 'Geneva', 'Milan', 'Naples', 'Florence',
      'Barcelona', 'Valencia', 'Seville', 'Lisbon', 'Porto'
    ];

    // If it's just a city name without country, and it's a major city, add context
    if (ambiguousCities.some(city => processed.toLowerCase() === city.toLowerCase()) &&
      !processed.includes(',') && !processed.includes(' ')) {
      // Don't modify - let the API handle disambiguation
      return processed;
    }

    // Handle Indian cities specifically (common use case)
    const indianCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
      'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
      'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
      'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
      'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad', 'Prayagraj',
      'Ranchi', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
      'Madurai', 'Raipur', 'Kota'
    ];

    if (indianCities.some(city => processed.toLowerCase() === city.toLowerCase()) &&
      !processed.includes(',') && !processed.toLowerCase().includes('india')) {
      return `${processed}, India`;
    }

    return processed;
  }

  /**
   * Query individual provider
   */
  async queryProvider(provider, query, options) {
    const url = provider.buildQuery(query, options);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AstroAura-BirthChart/1.0 (Professional Astrology Software)',
        'Accept': 'application/json',
        ...this.getProviderHeaders(provider)
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return provider.parseResponse(data, query);
  }

  /**
   * Build Nominatim query
   */
  buildNominatimQuery(query, options) {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: options.limit || '10',
      countrycodes: options.countryCode || '',
      'accept-language': options.language || 'en'
    });

    return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  }

  /**
   * Parse Nominatim response
   */
  parseNominatimResponse(data, query) {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      country: item.address?.country || '',
      state: item.address?.state || '',
      city: item.address?.city || item.address?.town || item.address?.village || '',
      postcode: item.address?.postcode || '',
      timezone: this.estimateTimezoneFromCoordinates(parseFloat(item.lat), parseFloat(item.lon)),
      confidence: this.calculateConfidenceScore(item, query),
      source: 'nominatim',
      raw: item
    })).filter(item =>
      !isNaN(item.lat) && !isNaN(item.lng) &&
      Math.abs(item.lat) <= 90 && Math.abs(item.lng) <= 180
    );
  }

  /**
   * Build Photon query
   */
  buildPhotonQuery(query, options) {
    const params = new URLSearchParams({
      q: query,
      limit: options.limit || '10',
      lang: options.language || 'en'
    });

    if (options.countryCode) {
      // Photon doesn't support countrycodes directly, but we can filter results
    }

    return `https://photon.komoot.io/api/?${params.toString()}`;
  }

  /**
   * Parse Photon response
   */
  parsePhotonResponse(data, query) {
    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map(feature => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;

      return {
        name: this.buildDisplayName(props),
        lat: coords[1],
        lng: coords[0],
        country: props.country || '',
        state: props.state || '',
        city: props.city || props.name || '',
        postcode: props.postcode || '',
        timezone: this.estimateTimezoneFromCoordinates(coords[1], coords[0]),
        confidence: this.calculateConfidenceScore(props, query),
        source: 'photon',
        raw: feature
      };
    }).filter(item =>
      !isNaN(item.lat) && !isNaN(item.lng) &&
      Math.abs(item.lat) <= 90 && Math.abs(item.lng) <= 180
    );
  }

  /**
   * Build Google Maps Geocoding query
   */
  buildGoogleQuery(query, options) {
    const params = new URLSearchParams({
      address: query,
      key: this.apiKeys.google,
      language: options.language || 'en'
    });

    // Add region biasing if country code is provided
    if (options.countryCode) {
      params.set('region', options.countryCode.toLowerCase());
    }

    // Add location biasing for better city results
    params.set('location_type', 'APPROXIMATE');

    return `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  }

  /**
   * Parse Google Maps Geocoding response
   */
  parseGoogleResponse(data, query) {
    console.log('Google Maps raw response:', data);

    if (data.status !== 'OK') {
      console.warn('Google Maps API error:', data.status, data.error_message);
      return [];
    }

    if (!data.results || !Array.isArray(data.results)) {
      console.warn('No results in Google Maps response');
      return [];
    }

    return data.results.map(result => {
      const location = result.geometry.location;
      const components = this.parseGoogleAddressComponents(result.address_components);

      return {
        name: result.formatted_address,
        lat: location.lat,
        lng: location.lng,
        country: components.country,
        state: components.state,
        city: components.city,
        postcode: components.postcode,
        timezone: this.estimateTimezoneFromCoordinates(location.lat, location.lng),
        confidence: this.calculateGoogleConfidence(result, query),
        source: 'google-maps',
        placeId: result.place_id,
        types: result.types,
        raw: result
      };
    }).filter(item =>
      !isNaN(item.lat) && !isNaN(item.lng) &&
      Math.abs(item.lat) <= 90 && Math.abs(item.lng) <= 180
    );
  }

  /**
   * Parse Google Maps address components
   */
  parseGoogleAddressComponents(components) {
    const result = {
      country: '',
      state: '',
      city: '',
      postcode: ''
    };

    components.forEach(component => {
      const types = component.types;

      if (types.includes('country')) {
        result.country = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        result.city = component.long_name;
      } else if (types.includes('postal_code')) {
        result.postcode = component.long_name;
      }
    });

    return result;
  }

  /**
   * Calculate confidence for Google Maps results
   */
  calculateGoogleConfidence(result, query) {
    let confidence = 0.7; // Base confidence for Google Maps (high quality)

    // Boost confidence based on location type
    if (result.types.includes('locality')) {
      confidence += 0.2; // City/town
    } else if (result.types.includes('administrative_area_level_1')) {
      confidence += 0.1; // State/province
    } else if (result.types.includes('country')) {
      confidence += 0.05; // Country
    }

    // Boost confidence for exact matches
    const normalizedQuery = query.toLowerCase().trim();
    const formattedAddress = result.formatted_address.toLowerCase();

    if (formattedAddress.includes(normalizedQuery)) {
      confidence += 0.1;
    }

    // Geometry accuracy boost
    if (result.geometry.location_type === 'ROOFTOP') {
      confidence += 0.1;
    } else if (result.geometry.location_type === 'RANGE_INTERPOLATED') {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Build PositionStack query
   */
  buildPositionStackQuery(query, options) {
    const params = new URLSearchParams({
      query: query,
      limit: options.limit || '10',
      output: 'json'
    });

    // PositionStack requires API key for production use
    if (this.apiKeys.positionstack) {
      params.set('access_key', this.apiKeys.positionstack);
    }

    return `http://api.positionstack.com/v1/forward?${params.toString()}`;
  }

  /**
   * Parse PositionStack response
   */
  parsePositionStackResponse(data, query) {
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map(item => ({
      name: item.label || `${item.name}, ${item.region}, ${item.country}`,
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude),
      country: item.country || '',
      state: item.region || '',
      city: item.locality || item.name || '',
      postcode: item.postal_code || '',
      timezone: this.estimateTimezoneFromCoordinates(parseFloat(item.latitude), parseFloat(item.longitude)),
      confidence: item.confidence || 0.5,
      source: 'positionstack',
      raw: item
    })).filter(item =>
      !isNaN(item.lat) && !isNaN(item.lng) &&
      Math.abs(item.lat) <= 90 && Math.abs(item.lng) <= 180
    );
  }

  /**
   * Fallback methods when all APIs fail
   */
  async tryFallbackMethods(query, options) {
    console.log('Trying fallback geocoding methods...');

    // Try built-in major cities database
    const cityResults = this.searchMajorCities(query);
    if (cityResults.length > 0) {
      return cityResults;
    }

    // Try coordinate parsing if query looks like coordinates
    const coordResults = this.parseCoordinates(query);
    if (coordResults) {
      return [coordResults];
    }

    return [];
  }

  /**
   * Search major cities database as ultimate fallback
   */
  searchMajorCities(query) {
    const majorCities = [
      // North America
      { name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York', country: 'USA' },
      { name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles', country: 'USA' },
      { name: 'Chicago, IL, USA', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago', country: 'USA' },
      { name: 'Toronto, ON, Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto', country: 'Canada' },
      { name: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City', country: 'Mexico' },

      // Europe
      { name: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', country: 'UK' },
      { name: 'Paris, France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', country: 'France' },
      { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin', country: 'Germany' },
      { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome', country: 'Italy' },
      { name: 'Madrid, Spain', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', country: 'Spain' },
      { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6176, timezone: 'Europe/Moscow', country: 'Russia' },

      // Asia
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo', country: 'Japan' },
      { name: 'Beijing, China', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai', country: 'China' },
      { name: 'Shanghai, China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai', country: 'China' },

      // India (comprehensive coverage)
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
      { name: 'Lucknow, India', lat: 26.8467, lng: 80.9462, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kanpur, India', lat: 26.4499, lng: 80.3319, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Nagpur, India', lat: 21.1458, lng: 79.0882, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Indore, India', lat: 22.7196, lng: 75.8577, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Thane, India', lat: 19.2183, lng: 72.9781, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Bhopal, India', lat: 23.2599, lng: 77.4126, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Visakhapatnam, India', lat: 17.6868, lng: 83.2185, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Pimpri-Chinchwad, India', lat: 18.6298, lng: 73.7997, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Patna, India', lat: 25.5941, lng: 85.1376, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Vadodara, India', lat: 22.3072, lng: 73.1812, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Ghaziabad, India', lat: 28.6692, lng: 77.4538, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Ludhiana, India', lat: 30.9010, lng: 75.8573, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Agra, India', lat: 27.1767, lng: 78.0081, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Nashik, India', lat: 19.9975, lng: 73.7898, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Faridabad, India', lat: 28.4089, lng: 77.3178, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Meerut, India', lat: 28.9845, lng: 77.7064, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Rajkot, India', lat: 22.3039, lng: 70.8022, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kalyan-Dombivali, India', lat: 19.2403, lng: 73.1305, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Vasai-Virar, India', lat: 19.4914, lng: 72.8052, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Varanasi, India', lat: 25.3176, lng: 82.9739, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Srinagar, India', lat: 34.0837, lng: 74.7973, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Aurangabad, India', lat: 19.8762, lng: 75.3433, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Dhanbad, India', lat: 23.7957, lng: 86.4304, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Amritsar, India', lat: 31.6340, lng: 74.8723, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Navi Mumbai, India', lat: 19.0330, lng: 73.0297, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Allahabad (Prayagraj), India', lat: 25.4358, lng: 81.8463, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Prayagraj, India', lat: 25.4358, lng: 81.8463, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Ranchi, India', lat: 23.3441, lng: 85.3096, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Haora, India', lat: 22.5958, lng: 88.2636, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Coimbatore, India', lat: 11.0168, lng: 76.9558, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Jabalpur, India', lat: 23.1815, lng: 79.9864, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Gwalior, India', lat: 26.2183, lng: 78.1828, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Vijayawada, India', lat: 16.5062, lng: 80.6480, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Jodhpur, India', lat: 26.2389, lng: 73.0243, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Madurai, India', lat: 9.9252, lng: 78.1198, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Raipur, India', lat: 21.2514, lng: 81.6296, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Kota, India', lat: 25.2138, lng: 75.8648, timezone: 'Asia/Kolkata', country: 'India' },

      // Other Asian cities
      { name: 'Seoul, South Korea', lat: 37.5665, lng: 126.9780, timezone: 'Asia/Seoul', country: 'South Korea' },
      { name: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', country: 'Singapore' },
      { name: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok', country: 'Thailand' },

      // Australia & Oceania
      { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', country: 'Australia' },
      { name: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', country: 'Australia' },
      { name: 'Auckland, New Zealand', lat: -36.8485, lng: 174.7633, timezone: 'Pacific/Auckland', country: 'New Zealand' },

      // South America
      { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo', country: 'Brazil' },
      { name: 'Buenos Aires, Argentina', lat: -34.6118, lng: -58.3960, timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
      { name: 'Lima, Peru', lat: -12.0464, lng: -77.0428, timezone: 'America/Lima', country: 'Peru' },

      // Africa
      { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', country: 'Egypt' },
      { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg', country: 'South Africa' },
      { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos', country: 'Nigeria' },
      { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', country: 'Kenya' }
    ];

    const normalizedQuery = query.toLowerCase().trim();
    return majorCities.filter(city =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
    ).map(city => ({
      ...city,
      city: city.name.split(',')[0],
      state: city.name.split(',')[1]?.trim() || '',
      confidence: 0.8,
      source: 'fallback-cities'
    }));
  }

  /**
   * Parse coordinate strings like "40.7128, -74.0060"
   */
  parseCoordinates(query) {
    const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
    const match = query.trim().match(coordPattern);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return {
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat: lat,
          lng: lng,
          country: '',
          state: '',
          city: '',
          postcode: '',
          timezone: this.estimateTimezoneFromCoordinates(lat, lng),
          confidence: 1.0,
          source: 'coordinate-parse'
        };
      }
    }

    return null;
  }

  /**
   * Enhanced timezone estimation from coordinates
   */
  estimateTimezoneFromCoordinates(lat, lng) {
    // More comprehensive timezone mapping based on longitude zones
    const baseOffset = Math.round(lng / 15);

    // Special cases for major timezone boundaries
    const timezoneMap = {
      // Americas
      '-12': 'Pacific/Kwajalein', '-11': 'Pacific/Midway', '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage', '-8': 'America/Los_Angeles', '-7': 'America/Denver',
      '-6': 'America/Chicago', '-5': 'America/New_York', '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo', '-2': 'America/Noronha', '-1': 'Atlantic/Azores',

      // Europe/Africa
      '0': 'Europe/London', '1': 'Europe/Berlin', '2': 'Europe/Athens',

      // Asia
      '3': 'Europe/Moscow', '4': 'Asia/Dubai', '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka', '7': 'Asia/Bangkok', '8': 'Asia/Shanghai',
      '9': 'Asia/Tokyo', '10': 'Australia/Sydney', '11': 'Pacific/Norfolk',
      '12': 'Pacific/Fiji'
    };

    // Adjust for special regions
    if (lat >= 20 && lat <= 50 && lng >= 70 && lng <= 140) {
      // Asia region adjustments
      if (lng >= 70 && lng < 82.5) return 'Asia/Kolkata'; // India Standard Time
      if (lng >= 104 && lng < 108) return 'Asia/Ho_Chi_Minh'; // Vietnam
      if (lng >= 120 && lng < 135 && lat >= 20 && lat <= 50) return 'Asia/Shanghai'; // China
    }

    if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 155) {
      // Australia region
      if (lng >= 125 && lng < 140) return lat < -25 ? 'Australia/Darwin' : 'Australia/Adelaide';
      if (lng >= 140) return 'Australia/Sydney';
      return 'Australia/Perth';
    }

    return timezoneMap[baseOffset.toString()] || 'UTC';
  }

  /**
   * Calculate confidence score for geocoding result
   */
  calculateConfidenceScore(item, query) {
    const normalizedQuery = query.toLowerCase().trim();
    const displayName = (item.display_name || item.name || '').toLowerCase();

    let confidence = 0;

    // Exact match bonus
    if (displayName.includes(normalizedQuery)) {
      confidence += 0.5;
    }

    // Word match scoring
    const queryWords = normalizedQuery.split(/\s+/);
    const nameWords = displayName.split(/[,\s]+/);

    let matchedWords = 0;
    queryWords.forEach(qWord => {
      if (nameWords.some(nWord => nWord.includes(qWord) || qWord.includes(nWord))) {
        matchedWords++;
      }
    });

    confidence += (matchedWords / queryWords.length) * 0.4;

    // Address completeness bonus
    if (item.address || item.country) confidence += 0.1;

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Cache management
   */
  generateCacheKey(query, options) {
    return `geocode:${query}:${JSON.stringify(options)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiryTime) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  cacheResults(key, results) {
    this.cache.set(key, {
      data: results,
      timestamp: Date.now()
    });
  }

  /**
   * Rate limiting
   */
  isRateLimited(providerName) {
    const limiter = this.rateLimiters.get(providerName);
    if (!limiter) return false;

    return Date.now() - limiter.lastRequest < limiter.minInterval;
  }

  recordRateLimit(providerName) {
    const provider = this.providers.find(p => p.name === providerName);
    if (!provider) return;

    this.rateLimiters.set(providerName, {
      lastRequest: Date.now(),
      minInterval: provider.rateLimit
    });
  }

  /**
   * Check if error is specifically a rate limit error
   */
  isRateLimitError(error) {
    const message = error.message.toLowerCase();
    const rateLimitIndicators = [
      'rate limit',
      'too many requests',
      'quota exceeded',
      '429',
      'rate exceeded',
      'throttled'
    ];
    
    return rateLimitIndicators.some(indicator => message.includes(indicator));
  }

  /**
   * Utility methods
   */
  buildDisplayName(props) {
    const parts = [];

    if (props.name) parts.push(props.name);
    if (props.city && props.city !== props.name) parts.push(props.city);
    if (props.state) parts.push(props.state);
    if (props.country) parts.push(props.country);

    return parts.join(', ');
  }

  getProviderHeaders(provider) {
    const headers = {};

    // Add API keys if available
    if (provider.name === 'mapbox' && this.apiKeys.mapbox) {
      headers['Authorization'] = `Bearer ${this.apiKeys.mapbox}`;
    }

    return headers;
  }

  /**
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      providers: this.providers.map(p => ({
        name: p.name,
        status: this.isRateLimited(p.name) ? 'rate-limited' : 'available',
        free: p.free
      })),
      cacheSize: this.cache.size,
      currentProvider: this.providers[this.currentProviderIndex].name
    };
  }

  /**
   * Build IPGeolocation query
   * Uses the correct Geocoding API endpoint
   */
  buildIPGeolocationQuery(query, options) {
    const params = new URLSearchParams({
      apiKey: this.apiKeys.ipgeolocation,
      q: encodeURIComponent(query),
      format: 'json',
      limit: options.limit || '10'
    });

    // Use the correct geocoding endpoint
    return `https://api.ipgeolocation.io/geocoding?${params.toString()}`;
  }

  /**
   * Parse IPGeolocation response
   * Handles Geocoding API response format from IPGeolocation.io
   */
  parseIPGeolocationResponse(data, query) {
    console.log('IPGeolocation raw response:', data);

    // Check for error responses
    if (data.error || data.message) {
      console.warn('IPGeolocation API error:', data.error || data.message);
      return [];
    }

    // Handle array of results (standard geocoding response)
    const results = Array.isArray(data) ? data : (data.results || [data]);
    
    if (!results || results.length === 0) {
      console.warn('No results in IPGeolocation response');
      return [];
    }

    return results.map(location => {
      const lat = parseFloat(location.lat || location.latitude);
      const lng = parseFloat(location.lng || location.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates in IPGeolocation response:', location);
        return null;
      }

      // Extract timezone from the location data or estimate from coordinates
      let timezone = this.estimateTimezoneFromCoordinates(lat, lng);
      if (location.timezone_name) {
        timezone = location.timezone_name;
      }

      return {
        name: this.buildIPGeolocationDisplayName(location),
        lat: lat,
        lng: lng,
        country: location.country_name || location.country || '',
        state: location.state_prov || location.state || location.region || '',
        city: location.city || location.name || '',
        postcode: location.zipcode || location.postal_code || '',
        timezone: timezone,
        confidence: this.calculateIPGeolocationConfidence(location, query),
        source: 'ipgeolocation-geocoding',
        raw: location
      };
    }).filter(item => item !== null);
  }

  /**
   * Build display name for IPGeolocation results
   */
  buildIPGeolocationDisplayName(item) {
    const parts = [];

    // Handle formatted_address first (if provided)
    if (item.formatted_address) {
      return item.formatted_address;
    }

    // Build from components
    if (item.city || item.name) {
      parts.push(item.city || item.name);
    }
    if (item.state_prov || item.state || item.region) {
      parts.push(item.state_prov || item.state || item.region);
    }
    if (item.country_name || item.country) {
      parts.push(item.country_name || item.country);
    }

    return parts.join(', ') || 'Unknown Location';
  }

  /**
   * Calculate confidence for IPGeolocation results
   */
  calculateIPGeolocationConfidence(item, query) {
    const normalizedQuery = query.toLowerCase().trim();
    const displayName = this.buildIPGeolocationDisplayName(item).toLowerCase();

    let confidence = 0.3; // Base confidence

    // Exact match bonus
    if (displayName.includes(normalizedQuery)) {
      confidence += 0.4;
    }

    // Word matching
    const queryWords = normalizedQuery.split(/\s+/);
    const nameWords = displayName.split(/[,\s]+/);

    let matchedWords = 0;
    queryWords.forEach(qWord => {
      if (nameWords.some(nWord => nWord.includes(qWord) || qWord.includes(nWord))) {
        matchedWords++;
      }
    });

    confidence += (matchedWords / queryWords.length) * 0.3;

    return Math.min(confidence, 1.0);
  }
}

// Export for use
window.GeocodingService = GeocodingService;