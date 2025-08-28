/**
 * Geocoding Service Configuration
 * Configure API keys and settings for geocoding providers
 */

class GeocodingConfig {
  static getAPIKeys() {
    // In production, these would be loaded from environment variables or config
    return {
      // Free tier APIs - no key required
      nominatim: null,
      photon: null,
      
      // Premium APIs - keys should be loaded from environment or config
      ipgeolocation: window.IPGEOLOCATION_API_KEY || null,
      
      // Google Maps Geocoding API
      // Get your key from: https://developers.google.com/maps/documentation/geocoding/get-api-key
      google: window.GOOGLE_MAPS_API_KEY || null,
      
      // Other providers (add keys as needed)
      mapbox: window.MAPBOX_API_KEY || null,
      here: window.HERE_API_KEY || null
    };
  }

  static getProviderSettings() {
    return {
      // Prioritize providers based on accuracy and reliability
      priorityOrder: ['google', 'ipgeolocation', 'nominatim', 'photon', 'positionstack'],
      
      // Rate limiting settings (milliseconds between requests)
      rateLimits: {
        google: 100,        // Very conservative for Google
        nominatim: 1000,    // 1 request per second (OSM policy)
        photon: 500,        // 2 requests per second
        ipgeolocation: 1000,     // 1 second between requests (reasonable for API)
        positionstack: 1000
      },
      
      // Daily limits
      dailyLimits: {
        google: 40000,      // Google's generous limit
        nominatim: 8640,    // Conservative estimate (1/sec * 86400)
        photon: 172800,     // Conservative estimate (2/sec * 86400)
        ipgeolocation: 1000, // Free tier limit
        positionstack: 25000 // Free tier limit
      },
      
      // Fallback settings
      enableFallbackCities: true,
      enableCoordinateParsing: true,
      cacheExpiryHours: 24
    };
  }

  static isGoogleMapsEnabled() {
    const keys = this.getAPIKeys();
    return keys.google && keys.google !== 'your-google-maps-api-key' && keys.google.length > 10;
  }

  static isIPGeolocationEnabled() {
    const keys = this.getAPIKeys();
    return keys.ipgeolocation && keys.ipgeolocation.length > 10;
  }

  static getRecommendedProvider() {
    if (this.isGoogleMapsEnabled()) {
      return 'google';
    }
    if (this.isIPGeolocationEnabled()) {
      return 'ipgeolocation';
    }
    return 'nominatim'; // Best free alternative
  }
}

// Export for use
window.GeocodingConfig = GeocodingConfig;