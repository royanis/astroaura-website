/**
 * API Keys Configuration
 * Add your API keys here for enhanced geocoding and timezone functionality
 */

// Initialize API_KEYS object
window.API_KEYS = window.API_KEYS || {};

// IPGeolocation.io API Key (for accurate timezone detection)
// Get your free key from: https://ipgeolocation.io/
// Free tier: 1000 requests/day
window.API_KEYS.IPGEOLOCATION = '1c355e807b2d45d09aa5d149e5e35b53';

// Google Maps Geocoding API Key (optional - for enhanced location search)
// Get your key from: https://developers.google.com/maps/documentation/geocoding/get-api-key
// window.API_KEYS.GOOGLE_MAPS = 'your-google-maps-api-key-here';

// Other API Keys (optional)
// window.API_KEYS.MAPBOX = 'your-mapbox-key-here';
// window.API_KEYS.HERE = 'your-here-key-here';

// Note: The geocoding service will work without these keys using free providers,
// but adding API keys will significantly improve accuracy and coverage.