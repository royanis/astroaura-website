/**
 * Timezone-Aware UTC Converter
 * Fixes timezone conversion issues by using birth location timezone consistently
 * Addresses the critical issue where 6:30 AM IST was incorrectly converted to UTC
 */

class TimezoneAwareConverter {
  constructor(timezoneService = null) {
    this.timezoneService = timezoneService || new TimezoneService();
    this.cache = new Map();
    this.debugMode = false;
  }

  /**
   * Convert birth time to UTC using birth location timezone
   * This is the main method that fixes the timezone conversion issue
   * 
   * @param {string} birthDate - Birth date in YYYY-MM-DD format
   * @param {string} birthTime - Birth time in HH:MM format
   * @param {Object} birthLocation - Birth location with lat, lng, and timezone info
   * @returns {Object} UTC conversion result with detailed information
   */
  async convertBirthTimeToUTC(birthDate, birthTime, birthLocation) {
    try {
      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Starting conversion', {
          birthDate,
          birthTime,
          location: birthLocation.name || 'Unknown',
          coordinates: { lat: birthLocation.lat, lng: birthLocation.lng }
        });
      }

      // Validate inputs
      this.validateInputs(birthDate, birthTime, birthLocation);

      // Get accurate timezone for birth location
      const locationTimezone = await this.getLocationTimezone(birthLocation, birthDate);
      
      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Location timezone determined', locationTimezone);
      }

      // Create birth datetime in location's timezone context
      const birthDateTime = this.createLocationDateTime(birthDate, birthTime, locationTimezone);
      
      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Birth datetime created', {
          birthDateTime: birthDateTime.toISOString(),
          representation: 'This represents the birth time as neutral values'
        });
      }

      // Convert to UTC using location's timezone rules
      const utcDateTime = this.convertToUTC(birthDateTime, locationTimezone, birthDate);
      
      if (this.debugMode) {
        console.log('TimezoneAwareConverter: UTC conversion completed', {
          utcDateTime: utcDateTime.toISOString(),
          localTime: `${birthTime} ${locationTimezone.name}`,
          utcTime: utcDateTime.toUTCString()
        });
      }

      // Calculate additional timezone information
      const timezoneInfo = this.calculateTimezoneInfo(locationTimezone, birthDate);

      const result = {
        utc: utcDateTime,
        timezone: locationTimezone.name,
        offset: timezoneInfo.offset,
        dst: timezoneInfo.dst,
        source: locationTimezone.source,
        validation: this.validateConversion(birthDate, birthTime, utcDateTime, timezoneInfo)
      };

      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Final result', result);
      }

      return result;

    } catch (error) {
      console.error('TimezoneAwareConverter: Conversion failed', error);
      throw new Error(`UTC conversion failed: ${error.message}`);
    }
  }

  /**
   * Create datetime representing birth time in location's timezone context
   * This method ensures we interpret the birth time correctly in the birth location
   * 
   * @param {string} date - Birth date in YYYY-MM-DD format
   * @param {string} time - Birth time in HH:MM format
   * @param {Object} timezone - Timezone information for birth location
   * @returns {Date} Date object representing birth time in neutral context
   */
  createLocationDateTime(date, time, timezone) {
    try {
      // Parse date and time components
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);

      // Validate parsed values
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        throw new Error(`Invalid date/time format: ${date} ${time}`);
      }

      if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Date/time values out of range: ${date} ${time}`);
      }

      // Create datetime representing local time at birth location
      // We use UTC methods to avoid JavaScript's automatic timezone interpretation
      // This creates a "neutral" datetime that represents the birth time values
      const localDateTime = new Date();
      localDateTime.setUTCFullYear(year);
      localDateTime.setUTCMonth(month - 1); // JavaScript months are 0-based
      localDateTime.setUTCDate(day);
      localDateTime.setUTCHours(hours);
      localDateTime.setUTCMinutes(minutes);
      localDateTime.setUTCSeconds(0);
      localDateTime.setUTCMilliseconds(0);

      if (isNaN(localDateTime.getTime())) {
        throw new Error(`Failed to create valid datetime from: ${date} ${time}`);
      }

      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Created location datetime', {
          input: `${date} ${time}`,
          timezone: timezone.name,
          neutralDateTime: localDateTime.toISOString(),
          note: 'This represents birth time as neutral values, not yet converted to UTC'
        });
      }

      return localDateTime;

    } catch (error) {
      throw new Error(`Failed to create location datetime: ${error.message}`);
    }
  }

  /**
   * Convert birth datetime to UTC using birth location timezone offset
   * This method applies the correct timezone offset from the birth location
   * 
   * @param {Date} localDateTime - Birth datetime in neutral representation
   * @param {Object} timezone - Timezone information for birth location
   * @param {string} birthDate - Birth date for DST calculation
   * @returns {Date} UTC datetime
   */
  convertToUTC(localDateTime, timezone, birthDate) {
    try {
      // Calculate the effective timezone offset including DST
      const timezoneInfo = this.calculateTimezoneInfo(timezone, birthDate);
      const effectiveOffset = timezoneInfo.offset;

      if (this.debugMode) {
        console.log('TimezoneAwareConverter: Applying timezone offset', {
          baseOffset: timezone.offset,
          dstAdjustment: timezoneInfo.dst ? 1 : 0,
          effectiveOffset: effectiveOffset,
          timezone: timezone.name
        });
      }

      // Convert offset from hours to milliseconds
      const offsetMs = effectiveOffset * 60 * 60 * 1000;

      // CRITICAL FIX: The localDateTime was created using UTC methods, so it represents
      // the birth time values as if they were UTC. To get the actual UTC time,
      // we need to subtract the timezone offset.
      // 
      // Example: 6:30 AM IST (UTC+5:30) should become 1:00 AM UTC
      // localDateTime represents "6:30 AM as UTC" 
      // We subtract 5.5 hours to get "1:00 AM UTC"
      const utcDateTime = new Date(localDateTime.getTime() - offsetMs);

      if (isNaN(utcDateTime.getTime())) {
        throw new Error('Failed to calculate valid UTC datetime');
      }

      if (this.debugMode) {
        console.log('TimezoneAwareConverter: UTC conversion calculation', {
          localTime: localDateTime.toISOString(),
          offsetHours: effectiveOffset,
          offsetMs: offsetMs,
          utcTime: utcDateTime.toISOString(),
          calculation: `${localDateTime.toISOString()} - ${effectiveOffset}h = ${utcDateTime.toISOString()}`
        });
      }

      return utcDateTime;

    } catch (error) {
      throw new Error(`Failed to convert to UTC: ${error.message}`);
    }
  }

  /**
   * Get accurate timezone information for birth location
   * Uses the timezone service to determine the correct timezone
   * 
   * @param {Object} birthLocation - Birth location with coordinates and timezone info
   * @param {string} birthDate - Birth date for historical timezone corrections
   * @returns {Object} Timezone information
   */
  async getLocationTimezone(birthLocation, birthDate) {
    try {
      // Check if we already have timezone information
      if (birthLocation.timezone && typeof birthLocation.timezone === 'object') {
        return birthLocation.timezone;
      }

      // Use timezone service to get accurate timezone
      const timezone = await this.timezoneService.getTimezoneForCoordinates(
        birthLocation.lat,
        birthLocation.lng,
        birthDate
      );

      if (!timezone) {
        throw new Error('Failed to determine timezone for birth location');
      }

      return timezone;

    } catch (error) {
      console.warn('TimezoneAwareConverter: Timezone determination failed, using fallback', error);
      
      // Fallback to basic longitude-based timezone
      return this.getFallbackTimezone(birthLocation);
    }
  }

  /**
   * Calculate comprehensive timezone information including DST
   * 
   * @param {Object} timezone - Base timezone information
   * @param {string} birthDate - Birth date for DST calculation
   * @returns {Object} Complete timezone information
   */
  calculateTimezoneInfo(timezone, birthDate) {
    try {
      const birthDateTime = new Date(birthDate);
      let isDST = false;
      let effectiveOffset = timezone.offset;

      // Check if DST applies to this date
      if (timezone.dst !== false) {
        isDST = this.isDaylightSavingTime(birthDateTime, timezone.name);
        if (isDST) {
          effectiveOffset += 1; // Add 1 hour for DST
        }
      }

      return {
        offset: effectiveOffset,
        dst: isDST,
        baseOffset: timezone.offset,
        dstAdjustment: isDST ? 1 : 0
      };

    } catch (error) {
      console.warn('TimezoneAwareConverter: DST calculation failed, using base offset', error);
      return {
        offset: timezone.offset,
        dst: false,
        baseOffset: timezone.offset,
        dstAdjustment: 0
      };
    }
  }

  /**
   * Validate conversion inputs
   */
  validateInputs(birthDate, birthTime, birthLocation) {
    if (!birthDate || !birthTime || !birthLocation) {
      throw new Error('Missing required parameters: birthDate, birthTime, or birthLocation');
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      throw new Error(`Invalid date format: ${birthDate}. Expected YYYY-MM-DD`);
    }

    // Validate time format
    if (!/^\d{1,2}:\d{2}$/.test(birthTime)) {
      throw new Error(`Invalid time format: ${birthTime}. Expected HH:MM`);
    }

    // Validate location coordinates
    if (typeof birthLocation.lat !== 'number' || typeof birthLocation.lng !== 'number') {
      throw new Error('Birth location must have numeric lat and lng coordinates');
    }

    if (birthLocation.lat < -90 || birthLocation.lat > 90) {
      throw new Error(`Invalid latitude: ${birthLocation.lat}. Must be between -90 and 90`);
    }

    if (birthLocation.lng < -180 || birthLocation.lng > 180) {
      throw new Error(`Invalid longitude: ${birthLocation.lng}. Must be between -180 and 180`);
    }
  }

  /**
   * Validate the conversion result
   */
  validateConversion(birthDate, birthTime, utcDateTime, timezoneInfo) {
    const validation = {
      valid: true,
      warnings: [],
      info: []
    };

    try {
      // Check if UTC time is reasonable
      const birthLocalDate = new Date(birthDate + 'T' + birthTime);
      const timeDifferenceHours = Math.abs(utcDateTime.getTime() - birthLocalDate.getTime()) / (1000 * 60 * 60);
      
      if (timeDifferenceHours > 24) {
        validation.warnings.push(`Large time difference detected: ${timeDifferenceHours.toFixed(1)} hours`);
      }

      // Check timezone offset reasonableness
      if (Math.abs(timezoneInfo.offset) > 14) {
        validation.warnings.push(`Unusual timezone offset: ${timezoneInfo.offset} hours`);
      }

      // Add informational notes
      validation.info.push(`Applied timezone offset: ${timezoneInfo.offset} hours`);
      if (timezoneInfo.dst) {
        validation.info.push('Daylight saving time adjustment applied');
      }

    } catch (error) {
      validation.valid = false;
      validation.warnings.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Fallback timezone determination based on longitude
   */
  getFallbackTimezone(birthLocation) {
    const lng = birthLocation.lng;
    const offset = Math.round(lng / 15);
    
    return {
      name: `UTC${offset >= 0 ? '+' : ''}${offset}`,
      offset: offset,
      dst: false,
      source: 'longitude-fallback'
    };
  }

  /**
   * Check if daylight saving time applies (simplified implementation)
   */
  isDaylightSavingTime(date, timezoneName) {
    // Use the timezone service's DST calculation if available
    if (this.timezoneService && this.timezoneService.isDaylightSavingTime) {
      return this.timezoneService.isDaylightSavingTime(date, timezoneName);
    }

    // Basic fallback DST detection
    const month = date.getMonth() + 1;
    
    if (timezoneName && timezoneName.includes('America/')) {
      // US/Canada DST: roughly March to November
      return month >= 3 && month <= 11;
    } else if (timezoneName && timezoneName.includes('Europe/')) {
      // EU DST: roughly March to October
      return month >= 3 && month <= 10;
    } else if (timezoneName && timezoneName.includes('Australia/')) {
      // Australia DST: roughly October to April
      return month >= 10 || month <= 4;
    }

    return false;
  }

  /**
   * Enable debug mode for detailed logging
   */
  enableDebugMode() {
    this.debugMode = true;
    console.log('TimezoneAwareConverter: Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebugMode() {
    this.debugMode = false;
  }

  /**
   * Clear internal cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use
window.TimezoneAwareConverter = TimezoneAwareConverter;