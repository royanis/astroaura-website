/**
 * Simplified Geocoding Service for Birth Chart Calculator
 * Focuses on reliable city search with fallback support
 */

console.log('🌍 Loading GeocodingService class...');

class GeocodingService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiryTime = 24 * 60 * 60 * 1000; // 24 hours
    console.log('✅ GeocodingService constructor called - service initialized');
  }

  /**
   * Main geocoding function with comprehensive fallback system
   */
  async geocodeLocation(query, options = {}) {
    console.log(`Geocoding query: "${query}"`);
    
    // Check cache first
    const cacheKey = `geocode:${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('Returning cached results:', cached.length);
      return cached;
    }

    // Enhanced city search preprocessing
    const enhancedQuery = this.preprocessCityQuery(query);
    console.log('Enhanced query:', enhancedQuery);

    let results = [];

    // Try Nominatim first (free and reliable)
    try {
      console.log('Trying Nominatim...');
      results = await this.queryNominatim(enhancedQuery, options);
      if (results && results.length > 0) {
        console.log(`Nominatim returned ${results.length} results`);
        this.cacheResults(cacheKey, results);
        return results;
      }
    } catch (error) {
      console.warn('Nominatim failed:', error.message);
    }

    // Try fallback methods
    console.log('Trying fallback methods...');
    const fallbackResults = this.searchFallbackLocations(query);
    if (fallbackResults && fallbackResults.length > 0) {
      console.log('Fallback methods found results:', fallbackResults.length);
      this.cacheResults(cacheKey, fallbackResults);
      return fallbackResults;
    }

    console.warn('All geocoding methods exhausted, returning empty results');
    return [];
  }

  /**
   * Preprocess city queries to improve search accuracy
   */
  preprocessCityQuery(query) {
    let processed = query.trim();
    
    // Handle common abbreviations
    const cityAbbreviations = {
      'NYC': 'New York City, NY, USA',
      'LA': 'Los Angeles, CA, USA',
      'SF': 'San Francisco, CA, USA',
      'DC': 'Washington, DC, USA'
    };

    const upperQuery = processed.toUpperCase();
    if (cityAbbreviations[upperQuery]) {
      return cityAbbreviations[upperQuery];
    }

    // Add India context for Indian cities
    const indianCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
      'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
      'Guntur', 'Vijayawada', 'Visakhapatnam', 'Tirupati', 'Nellore', 'Kakinada',
      'Rajahmundry', 'Kadapa', 'Anantapur', 'Kurnool', 'Warangal', 'Nizamabad'
    ];

    const processedLower = processed.toLowerCase();
    
    // Check if it's an Indian city that needs context
    if (indianCities.some(city => processedLower === city.toLowerCase()) && 
        !processed.includes(',') && !processedLower.includes('india')) {
      return `${processed}, India`;
    }

    return processed;
  }

  /**
   * Query Nominatim (OpenStreetMap) geocoding service
   */
  async queryNominatim(query, options) {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: options.limit || '8',
      'accept-language': options.language || 'en'
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AstroAura-BirthChart/1.0',
        'Accept': 'application/json'
      },
      // Timeout handled by browser default
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return await this.parseNominatimResponse(data, query);
  }

  /**
   * Parse Nominatim response with async timezone resolution
   */
  async parseNominatimResponse(data, query) {
    if (!Array.isArray(data)) {
      return [];
    }

    const validItems = data.filter(item => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    });

    // Process timezone resolution in parallel for better performance
    const results = await Promise.all(validItems.map(async (item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      
      return {
        name: item.display_name,
        lat: lat,
        lng: lng,
        country: item.address?.country || '',
        state: item.address?.state || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        postcode: item.address?.postcode || '',
        timezone: await this.getTimezoneFromCoordinates(lat, lng),
        confidence: this.calculateConfidenceScore(item, query),
        source: 'nominatim',
        raw: item
      };
    }));

    return results;
  }

  /**
   * Fallback location search when APIs fail
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
      
      // India (comprehensive coverage including Andhra Pradesh cities)
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
      
      // Andhra Pradesh cities
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
      
      // Telangana cities
      { name: 'Warangal, Telangana, India', lat: 17.9689, lng: 79.5941, timezone: 'Asia/Kolkata', country: 'India' },
      { name: 'Nizamabad, Telangana, India', lat: 18.6725, lng: 78.0941, timezone: 'Asia/Kolkata', country: 'India' },
      
      // Australia & Oceania
      { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney', country: 'Australia' },
      { name: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne', country: 'Australia' },
      
      // South America
      { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo', country: 'Brazil' },
      { name: 'Buenos Aires, Argentina', lat: -34.6118, lng: -58.3960, timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
      
      // Middle East & Central Asia
      { name: 'Kabul, Afghanistan', lat: 34.5266, lng: 69.1849, timezone: 'Asia/Kabul', country: 'Afghanistan' },
      { name: 'Tehran, Iran', lat: 35.6892, lng: 51.3890, timezone: 'Asia/Tehran', country: 'Iran' },
      { name: 'Baghdad, Iraq', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad', country: 'Iraq' },
      { name: 'Damascus, Syria', lat: 33.5138, lng: 36.2765, timezone: 'Asia/Damascus', country: 'Syria' },
      { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh', country: 'Saudi Arabia' },
      { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai', country: 'UAE' },
      { name: 'Islamabad, Pakistan', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi', country: 'Pakistan' },
      { name: 'Karachi, Pakistan', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi', country: 'Pakistan' },
      { name: 'Almaty, Kazakhstan', lat: 43.2775, lng: 76.8958, timezone: 'Asia/Almaty', country: 'Kazakhstan' },
      { name: 'Tashkent, Uzbekistan', lat: 41.2995, lng: 69.2401, timezone: 'Asia/Tashkent', country: 'Uzbekistan' },
      
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
    })).slice(0, 8);
  }

  /**
   * Get accurate timezone using ipgeolocation.io API
   */
  async getTimezoneFromCoordinates(lat, lng) {
    try {
      // Check if API key is available
      if (!window.API_KEYS?.IPGEOLOCATION || window.API_KEYS.IPGEOLOCATION === 'your_ipgeolocation_api_key_here') {
        console.warn('IPGeolocation API key not configured, using fallback timezone estimation');
        return this.estimateTimezoneFromCoordinates(lat, lng);
      }

      const url = `https://api.ipgeolocation.io/timezone?apiKey=${window.API_KEYS.IPGEOLOCATION}&lat=${lat}&long=${lng}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.timezone) {
        console.log(`✅ IPGeolocation API returned timezone: ${data.timezone} for coordinates ${lat}, ${lng}`);
        return data.timezone;
      } else {
        throw new Error('No timezone data in response');
      }
    } catch (error) {
      console.warn('IPGeolocation API failed, using fallback:', error.message);
      return this.estimateTimezoneFromCoordinates(lat, lng);
    }
  }

  /**
   * Fallback timezone estimation from coordinates
   */
  estimateTimezoneFromCoordinates(lat, lng) {
    const baseOffset = Math.round(lng / 15);
    
    const timezoneMap = {
      '-12': 'Pacific/Kwajalein', '-11': 'Pacific/Midway', '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage', '-8': 'America/Los_Angeles', '-7': 'America/Denver',
      '-6': 'America/Chicago', '-5': 'America/New_York', '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo', '-2': 'America/Noronha', '-1': 'Atlantic/Azores',
      '0': 'Europe/London', '1': 'Europe/Berlin', '2': 'Europe/Athens',
      '3': 'Europe/Moscow', '4': 'Asia/Dubai', '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka', '7': 'Asia/Bangkok', '8': 'Asia/Shanghai',
      '9': 'Asia/Tokyo', '10': 'Australia/Sydney', '11': 'Pacific/Norfolk',
      '12': 'Pacific/Fiji'
    };

    // Special regions with accurate timezone mapping
    if (lat >= 20 && lat <= 50 && lng >= 60 && lng <= 140) {
      // Afghanistan
      if (lng >= 60 && lng < 75 && lat >= 29 && lat <= 39) return 'Asia/Kabul';
      // Pakistan
      if (lng >= 60 && lng < 78 && lat >= 23 && lat <= 37) return 'Asia/Karachi';
      // India
      if (lng >= 68 && lng < 97 && lat >= 6 && lat <= 37) return 'Asia/Kolkata';
      // China
      if (lng >= 73 && lng < 135 && lat >= 18 && lat <= 54) return 'Asia/Shanghai';
      // Iran
      if (lng >= 44 && lng < 64 && lat >= 25 && lat <= 40) return 'Asia/Tehran';
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
    
    if (displayName.includes(normalizedQuery)) {
      confidence += 0.5;
    }
    
    const queryWords = normalizedQuery.split(/\s+/);
    const nameWords = displayName.split(/[,\s]+/);
    
    let matchedWords = 0;
    queryWords.forEach(qWord => {
      if (nameWords.some(nWord => nWord.includes(qWord) || qWord.includes(nWord))) {
        matchedWords++;
      }
    });
    
    confidence += (matchedWords / queryWords.length) * 0.4;
    
    if (item.address || item.country) confidence += 0.1;
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Cache management
   */
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
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use
console.log('🌍 Exporting GeocodingService to window...');
window.GeocodingService = GeocodingService;
console.log('✅ GeocodingService exported, available as:', typeof window.GeocodingService);

// Global debug function
window.testGeocodingService = async function(query) {
  console.log('🗺️ Testing geocoding service with query:', query);
  
  try {
    const service = new GeocodingService();
    console.log('✅ Geocoding service created successfully');
    
    const results = await service.geocodeLocation(query);
    console.log('📊 Results:', results);
    
    if (results.length > 0) {
      console.log('✅ Found', results.length, 'results');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.name} (${result.lat}, ${result.lng}) - Source: ${result.source}`);
      });
    } else {
      console.log('❌ No results found');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error testing geocoding service:', error);
    return [];
  }
};

// Global debug function for fallback search only
window.testFallbackSearch = function(query) {
  console.log('🚑 Testing fallback search for:', query);
  
  const service = new GeocodingService();
  const results = service.searchFallbackLocations(query);
  
  console.log('📊 Fallback results:', results);
  
  if (results.length > 0) {
    console.log('✅ Fallback found', results.length, 'results');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name} (${result.lat}, ${result.lng})`);
    });
  } else {
    console.log('❌ No fallback results found');
  }
  
  return results;
};

console.log('✅ GeocodingService loaded successfully. Test commands:');
console.log('  - testGeocodingService("guntur")');
console.log('  - testFallbackSearch("guntur")');
console.log('  - testGeocodingService("mumbai")');
console.log('  - testGeocodingService("new york")');

// Auto-test on load (only once)
if (!window.geocodingServiceTested) {
  window.geocodingServiceTested = true;
  setTimeout(() => {
    console.log('🔄 Auto-testing geocoding service with "guntur"...');
    testFallbackSearch('guntur');
  }, 500);
}