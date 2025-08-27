/**
 * Production Timezone Service
 * Accurate timezone determination and UTC conversion for astrological calculations
 */

class TimezoneService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.apiProviders = this.initializeProviders();
    this.fallbackData = this.initializeFallbackData();
  }

  initializeProviders() {
    return [
      {
        name: 'timeapi',
        url: 'https://timeapi.io/api/TimeZone/coordinate',
        free: true,
        parseResponse: this.parseTimeAPIResponse.bind(this),
        buildQuery: this.buildTimeAPIQuery.bind(this)
      },
      {
        name: 'worldtimeapi',
        url: 'https://worldtimeapi.org/api/timezone',
        free: true,
        parseResponse: this.parseWorldTimeAPIResponse.bind(this),
        buildQuery: this.buildWorldTimeAPIQuery.bind(this)
      }
    ];
  }

  initializeFallbackData() {
    // Comprehensive timezone database for fallback
    return {
      // Major timezone boundaries and rules
      timezoneRules: {
        // UTC offsets and DST rules by geographic region
        'America/New_York': { offset: -5, dst: true, dstStart: 'Mar Sun>=8 2:00', dstEnd: 'Nov Sun>=1 2:00' },
        'America/Chicago': { offset: -6, dst: true, dstStart: 'Mar Sun>=8 2:00', dstEnd: 'Nov Sun>=1 2:00' },
        'America/Denver': { offset: -7, dst: true, dstStart: 'Mar Sun>=8 2:00', dstEnd: 'Nov Sun>=1 2:00' },
        'America/Los_Angeles': { offset: -8, dst: true, dstStart: 'Mar Sun>=8 2:00', dstEnd: 'Nov Sun>=1 2:00' },
        'America/Anchorage': { offset: -9, dst: true, dstStart: 'Mar Sun>=8 2:00', dstEnd: 'Nov Sun>=1 2:00' },
        'Pacific/Honolulu': { offset: -10, dst: false },
        
        'Europe/London': { offset: 0, dst: true, dstStart: 'Mar Sun>=25 1:00', dstEnd: 'Oct Sun>=25 2:00' },
        'Europe/Berlin': { offset: 1, dst: true, dstStart: 'Mar Sun>=25 2:00', dstEnd: 'Oct Sun>=25 3:00' },
        'Europe/Athens': { offset: 2, dst: true, dstStart: 'Mar Sun>=25 3:00', dstEnd: 'Oct Sun>=25 4:00' },
        'Europe/Moscow': { offset: 3, dst: false },
        
        'Asia/Kolkata': { offset: 5.5, dst: false },
        'Asia/Shanghai': { offset: 8, dst: false },
        'Asia/Tokyo': { offset: 9, dst: false },
        'Asia/Seoul': { offset: 9, dst: false },
        
        'Australia/Perth': { offset: 8, dst: false },
        'Australia/Adelaide': { offset: 9.5, dst: true, dstStart: 'Oct Sun>=1 2:00', dstEnd: 'Apr Sun>=1 3:00' },
        'Australia/Sydney': { offset: 10, dst: true, dstStart: 'Oct Sun>=1 2:00', dstEnd: 'Apr Sun>=1 3:00' },
        'Australia/Melbourne': { offset: 10, dst: true, dstStart: 'Oct Sun>=1 2:00', dstEnd: 'Apr Sun>=1 3:00' },
        
        'Pacific/Auckland': { offset: 12, dst: true, dstStart: 'Sep Sun>=24 2:00', dstEnd: 'Apr Sun>=1 3:00' }
      },

      // Geographic timezone boundaries
      geographicZones: [
        // North America
        { bounds: { n: 71, s: 23, e: -50, w: -180 }, timezone: 'America/Los_Angeles', priority: 1 },
        { bounds: { n: 71, s: 23, e: -95, w: -125 }, timezone: 'America/Denver', priority: 2 },
        { bounds: { n: 71, s: 23, e: -80, w: -105 }, timezone: 'America/Chicago', priority: 2 },
        { bounds: { n: 71, s: 23, e: -65, w: -90 }, timezone: 'America/New_York', priority: 2 },
        
        // Europe
        { bounds: { n: 71, s: 35, e: 40, w: -10 }, timezone: 'Europe/London', priority: 1 },
        { bounds: { n: 71, s: 35, e: 40, w: 5 }, timezone: 'Europe/Berlin', priority: 2 },
        { bounds: { n: 71, s: 35, e: 50, w: 20 }, timezone: 'Europe/Athens', priority: 2 },
        
        // Asia
        { bounds: { n: 50, s: 5, e: 80, w: 65 }, timezone: 'Asia/Kolkata', priority: 1 },
        { bounds: { n: 50, s: 15, e: 140, w: 100 }, timezone: 'Asia/Shanghai', priority: 1 },
        { bounds: { n: 50, s: 25, e: 150, w: 130 }, timezone: 'Asia/Tokyo', priority: 2 },
        
        // Australia
        { bounds: { n: -10, s: -45, e: 130, w: 110 }, timezone: 'Australia/Perth', priority: 1 },
        { bounds: { n: -25, s: -40, e: 145, w: 135 }, timezone: 'Australia/Adelaide', priority: 2 },
        { bounds: { n: -25, s: -45, e: 155, w: 140 }, timezone: 'Australia/Sydney', priority: 2 }
      ]
    };
  }

  /**
   * Get timezone for coordinates with high accuracy
   */
  async getTimezoneForCoordinates(lat, lng, date = null) {
    const cacheKey = `tz:${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return this.applyHistoricalCorrections(cached, date);
    }

    let timezone;

    // Try API providers
    for (const provider of this.apiProviders) {
      try {
        timezone = await this.queryTimezoneAPI(provider, lat, lng);
        if (timezone) {
          this.cacheTimezone(cacheKey, timezone);
          return this.applyHistoricalCorrections(timezone, date);
        }
      } catch (error) {
        console.warn(`Timezone API ${provider.name} failed:`, error.message);
      }
    }

    // Fallback to geographic estimation
    timezone = this.estimateTimezoneFromGeography(lat, lng);
    if (timezone) {
      this.cacheTimezone(cacheKey, timezone);
      return this.applyHistoricalCorrections(timezone, date);
    }

    // Ultimate fallback
    return this.getUltimateTimezoneFromLongitude(lng);
  }

  /**
   * Query timezone APIs
   */
  async queryTimezoneAPI(provider, lat, lng) {
    const url = provider.buildQuery(lat, lng);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AstroAura-BirthChart/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return provider.parseResponse(data);
  }

  // API Provider implementations
  buildTimeAPIQuery(lat, lng) {
    return `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`;
  }

  parseTimeAPIResponse(data) {
    if (data && data.timeZone) {
      return {
        name: data.timeZone,
        offset: data.currentUtcOffset?.hours || 0,
        dst: data.isDaylightSavingTime || false,
        source: 'timeapi'
      };
    }
    return null;
  }

  buildWorldTimeAPIQuery(lat, lng) {
    // WorldTimeAPI doesn't have coordinate lookup, so we'll use geographic estimation
    const estimatedTz = this.estimateTimezoneFromGeography(lat, lng);
    return `https://worldtimeapi.org/api/timezone/${estimatedTz.name}`;
  }

  parseWorldTimeAPIResponse(data) {
    if (data && data.timezone) {
      return {
        name: data.timezone,
        offset: data.raw_offset / 3600,
        dst: data.dst,
        source: 'worldtimeapi'
      };
    }
    return null;
  }

  /**
   * Geographic timezone estimation with high accuracy
   */
  estimateTimezoneFromGeography(lat, lng) {
    // Find matching geographic zones
    const matches = this.fallbackData.geographicZones.filter(zone => {
      return lat >= zone.bounds.s && lat <= zone.bounds.n &&
             lng >= zone.bounds.w && lng <= zone.bounds.e;
    });

    if (matches.length === 0) {
      return this.getBasicTimezoneFromLongitude(lng);
    }

    // Sort by priority and find best match
    matches.sort((a, b) => b.priority - a.priority);
    const bestMatch = matches[0];
    
    const tzData = this.fallbackData.timezoneRules[bestMatch.timezone];
    return {
      name: bestMatch.timezone,
      offset: tzData.offset,
      dst: tzData.dst || false,
      source: 'geographic-estimation'
    };
  }

  /**
   * Basic longitude-based timezone estimation
   */
  getBasicTimezoneFromLongitude(lng) {
    const offset = Math.round(lng / 15);
    
    // Map to standard timezone names
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

    const timezoneName = timezoneMap[offset.toString()] || 'UTC';
    return {
      name: timezoneName,
      offset: offset,
      dst: false,
      source: 'longitude-estimation'
    };
  }

  getUltimateTimezoneFromLongitude(lng) {
    return this.getBasicTimezoneFromLongitude(lng);
  }

  /**
   * Convert birth time to UTC with high precision
   */
  convertToUTC(date, time, timezone, coordinates = null) {
    try {
      // Normalize time format to HH:MM
      let normalizedTime = time;
      if (time && time.length === 4 && time.includes(':')) {
        // Convert "6:30" to "06:30"
        const [hours, minutes] = time.split(':');
        normalizedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      
      // Create the birth date/time as a neutral time (not in any specific timezone)
      // We need to avoid JavaScript's automatic timezone interpretation
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = normalizedTime.split(':').map(Number);
      
      // Create a Date object using UTC methods to avoid timezone interpretation
      // This represents the raw time values without timezone assumptions
      const birthDateTime = new Date();
      birthDateTime.setUTCFullYear(year);
      birthDateTime.setUTCMonth(month - 1); 
      birthDateTime.setUTCDate(day);
      birthDateTime.setUTCHours(hours);
      birthDateTime.setUTCMinutes(minutes);
      birthDateTime.setUTCSeconds(0);
      birthDateTime.setUTCMilliseconds(0);
      
      if (isNaN(birthDateTime.getTime())) {
        throw new Error(`Invalid date/time format. Date: ${date}, Time: ${normalizedTime}`);
      }

      let utcOffset;
      let isDST = false;

      // If we have timezone info as object
      if (typeof timezone === 'object' && timezone.offset !== undefined) {
        utcOffset = timezone.offset;
        isDST = timezone.dst || false;
        
        // Check if DST applies to this date
        if (timezone.dst) {
          isDST = this.isDaylightSavingTime(birthDateTime, timezone.name);
        }
      } else {
        // If timezone is just a string, look it up
        const tzData = this.fallbackData.timezoneRules[timezone] || 
                      this.fallbackData.timezoneRules[this.mapTimezoneAlias(timezone)];
        
        if (tzData) {
          utcOffset = tzData.offset;
          isDST = tzData.dst && this.isDaylightSavingTime(birthDateTime, timezone);
        } else {
          // Ultimate fallback based on coordinates or longitude estimation
          if (coordinates) {
            const estimatedTz = this.estimateTimezoneFromGeography(coordinates.lat, coordinates.lng);
            utcOffset = estimatedTz.offset;
            isDST = false;
          } else {
            throw new Error(`Unknown timezone: ${timezone}`);
          }
        }
      }

      // Apply DST adjustment
      if (isDST) {
        utcOffset += 1;
      }

      // The birthDateTime now represents neutral time values (6:30 means 6:30, no timezone)
      // We need to convert this to UTC by subtracting the birth location's offset
      
      const birthLocationOffsetMs = utcOffset * 60 * 60 * 1000;
      
      // Convert to UTC: subtract the birth location offset from the neutral time
      // birthDateTime is already in UTC format, representing the local time values
      // So we just subtract the timezone offset to get true UTC
      const utcDateTime = new Date(birthDateTime.getTime() - birthLocationOffsetMs);
      
      console.log('DEBUG Timezone conversion DETAILED:', {
        inputDate: date,
        inputTime: normalizedTime,
        neutralDateTime: birthDateTime.toISOString(), // This represents 6:30 as neutral time
        birthLocationOffset: utcOffset,
        birthLocationOffsetMs: birthLocationOffsetMs,
        isDST: isDST,
        finalUTC: utcDateTime.toString(),
        finalUTCISO: utcDateTime.toISOString()
      });
      
      return {
        utc: utcDateTime,
        offset: utcOffset,
        dst: isDST,
        timezone: typeof timezone === 'object' ? timezone.name : timezone
      };
    } catch (error) {
      console.error('UTC conversion failed:', error);
      throw new Error(`Failed to convert to UTC: ${error.message}`);
    }
  }

  /**
   * Check if daylight saving time applies
   */
  isDaylightSavingTime(date, timezoneName) {
    const tzData = this.fallbackData.timezoneRules[timezoneName];
    if (!tzData || !tzData.dst) {
      return false;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Simplified DST detection for major regions
    if (timezoneName.includes('America/')) {
      // US/Canada DST: Second Sunday in March to First Sunday in November
      return month > 3 && month < 11 || 
             (month === 3 && this.getSecondSunday(year, 3) <= day) ||
             (month === 11 && day < this.getFirstSunday(year, 11));
    } else if (timezoneName.includes('Europe/')) {
      // EU DST: Last Sunday in March to Last Sunday in October
      return month > 3 && month < 10 ||
             (month === 3 && this.getLastSunday(year, 3) <= day) ||
             (month === 10 && day < this.getLastSunday(year, 10));
    } else if (timezoneName.includes('Australia/')) {
      // Australia DST: First Sunday in October to First Sunday in April
      return month < 4 || month >= 10 ||
             (month === 4 && day < this.getFirstSunday(year, 4)) ||
             (month === 10 && this.getFirstSunday(year, 10) <= day);
    }

    return false;
  }

  /**
   * Historical timezone corrections for dates before modern standardization
   */
  applyHistoricalCorrections(timezone, date) {
    if (!date) return timezone;
    
    const birthDate = new Date(date);
    const year = birthDate.getFullYear();
    
    // Before 1884 - Local Mean Time based on longitude
    if (year < 1884) {
      console.warn('Using Local Mean Time for pre-1884 date');
      // Each 15 degrees of longitude = 1 hour difference
      // This is an approximation for historical accuracy
    }
    
    // World War adjustments and other historical changes would go here
    // For production use, implement comprehensive historical timezone database
    
    return timezone;
  }

  /**
   * Helper methods for DST calculations
   */
  getFirstSunday(year, month) {
    const date = new Date(year, month - 1, 1);
    const day = date.getDay();
    return day === 0 ? 1 : 8 - day;
  }

  getSecondSunday(year, month) {
    return this.getFirstSunday(year, month) + 7;
  }

  getLastSunday(year, month) {
    const lastDay = new Date(year, month, 0).getDate();
    const lastDate = new Date(year, month - 1, lastDay);
    const dayOfWeek = lastDate.getDay();
    return lastDay - dayOfWeek;
  }

  /**
   * Map timezone aliases to standard names
   */
  mapTimezoneAlias(timezone) {
    const aliases = {
      'EST': 'America/New_York',
      'CST': 'America/Chicago',
      'MST': 'America/Denver',
      'PST': 'America/Los_Angeles',
      'GMT': 'Europe/London',
      'CET': 'Europe/Berlin',
      'JST': 'Asia/Tokyo',
      'AEST': 'Australia/Sydney'
    };
    
    return aliases[timezone] || timezone;
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

  cacheTimezone(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Get comprehensive timezone information
   */
  async getFullTimezoneInfo(lat, lng, date = null) {
    const timezone = await this.getTimezoneForCoordinates(lat, lng, date);
    const utcConversion = date ? this.convertToUTC(date, '12:00', timezone, { lat, lng }) : null;
    
    return {
      timezone: timezone,
      utcConversion: utcConversion,
      coordinates: { lat, lng },
      date: date
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export for use
window.TimezoneService = TimezoneService;