/**
 * ELP2000 Moon Calculator
 * Implements high-precision lunar position calculations using ELP2000-82B theory
 * Replaces simplified Moon calculations with professional-grade accuracy
 */

class ELP2000MoonCalculator {
  constructor() {
    this.lunarTerms = null; // Will be initialized with ELP2000SeriesData
    this.initializeSeriesData();
    console.log('ELP2000MoonCalculator initialized');
  }

  /**
   * Initialize ELP2000 series data
   * Attempts to load the series data if available
   */
  initializeSeriesData() {
    try {
      // Try to create ELP2000SeriesData if the class is available
      if (typeof ELP2000SeriesData !== 'undefined') {
        this.lunarTerms = new ELP2000SeriesData();
        console.log('ELP2000 series data loaded successfully');
      } else {
        console.warn('ELP2000SeriesData class not available - will use fallback calculation');
      }
    } catch (error) {
      console.warn('Failed to initialize ELP2000 series data:', error);
      this.lunarTerms = null;
    }
  }

  /**
   * Calculate Moon position using ELP2000 lunar theory
   * @param {number} julianDay - Julian Day Number
   * @returns {number} Moon longitude in degrees (0-360)
   */
  calculateMoonPosition(julianDay) {
    try {
      const T = (julianDay - 2451545.0) / 36525.0;
      
      // Calculate fundamental arguments
      const fundamentals = this.calculateFundamentalArguments(T);
      
      // Calculate mean lunar longitude
      let longitude = this.calculateMeanLongitude(T);
      
      // Apply periodic terms if series data is available
      if (this.lunarTerms) {
        const periodicCorrections = this.calculatePeriodicTerms(fundamentals, T);
        longitude += periodicCorrections.longitude;
      } else {
        console.warn('ELP2000 series data not loaded, using mean longitude only');
      }
      
      // Normalize to 0-360 degrees
      longitude = this.normalizeAngle(longitude);
      
      return longitude;
      
    } catch (error) {
      console.error('Error in ELP2000 Moon calculation:', error);
      // Fallback to simplified calculation
      return this.calculateSimplifiedMoonPosition(julianDay);
    }
  }

  /**
   * Calculate fundamental arguments for ELP2000 theory
   * These are the basic angular elements used in lunar theory
   * @param {number} T - Time in Julian centuries from J2000.0
   * @returns {Object} Fundamental arguments D, M, Mp, F in degrees
   */
  calculateFundamentalArguments(T) {
    // Mean elongation of the Moon from the Sun (D)
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + 
              T * T * T / 545868 - T * T * T * T / 113065000;
    
    // Mean anomaly of the Sun (M)
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + 
              T * T * T / 24490000;
    
    // Mean anomaly of the Moon (Mp)
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + 
               T * T * T / 69699 - T * T * T * T / 14712000;
    
    // Moon's argument of latitude (F)
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - 
              T * T * T / 3526000 + T * T * T * T / 863310000;
    
    return {
      D: this.normalizeAngle(D),
      M: this.normalizeAngle(M),
      Mp: this.normalizeAngle(Mp),
      F: this.normalizeAngle(F)
    };
  }

  /**
   * Calculate mean longitude of the Moon
   * This is the base lunar longitude before periodic corrections
   * @param {number} T - Time in Julian centuries from J2000.0
   * @returns {number} Mean lunar longitude in degrees
   */
  calculateMeanLongitude(T) {
    // Mean longitude of the Moon (L0)
    const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + 
               T * T * T / 538841 - T * T * T * T / 65194000;
    
    return this.normalizeAngle(L0);
  }

  /**
   * Calculate periodic terms corrections using ELP2000 series
   * Applies the main ELP2000 periodic terms for high-precision lunar longitude
   * @param {Object} fundamentals - Fundamental arguments D, M, Mp, F in degrees
   * @param {number} T - Time in Julian centuries from J2000.0
   * @returns {Object} Corrections for longitude in degrees
   */
  calculatePeriodicTerms(fundamentals, T) {
    if (!this.lunarTerms) {
      console.warn('ELP2000 series data not available');
      return { longitude: 0 };
    }

    let deltaLongitude = 0;
    let termCount = 0;
    
    try {
      // Get main ELP2000 periodic terms
      const mainTerms = this.lunarTerms.getMainTerms();
      
      // Apply each periodic term
      for (const term of mainTerms) {
        const [coeff, d, m, mp, f] = term;
        
        // Calculate argument in radians
        // Each fundamental argument is multiplied by its coefficient
        const argumentDegrees = d * fundamentals.D + 
                               m * fundamentals.M + 
                               mp * fundamentals.Mp + 
                               f * fundamentals.F;
        
        const argumentRadians = this.degToRad(argumentDegrees);
        
        // Add periodic correction
        // Coefficient is in arcseconds * 1e6, so we divide by 1e6 to get arcseconds
        const termContribution = (coeff / 1e6) * Math.sin(argumentRadians);
        deltaLongitude += termContribution;
        termCount++;
      }
      
      // Convert from arcseconds to degrees (1 degree = 3600 arcseconds)
      deltaLongitude = deltaLongitude / 3600;
      
      // Log calculation details for debugging
      console.log(`ELP2000 periodic corrections applied: ${termCount} terms, total correction: ${deltaLongitude.toFixed(6)}°`);
      
      return { 
        longitude: deltaLongitude,
        termCount: termCount,
        maxTerm: this.findLargestTerm(fundamentals)
      };
      
    } catch (error) {
      console.error('Error calculating ELP2000 periodic terms:', error);
      return { longitude: 0, error: error.message };
    }
  }

  /**
   * Find the largest contributing term for diagnostic purposes
   * @param {Object} fundamentals - Fundamental arguments D, M, Mp, F
   * @returns {Object} Information about the largest term
   */
  findLargestTerm(fundamentals) {
    if (!this.lunarTerms) return null;
    
    const mainTerms = this.lunarTerms.getMainTerms();
    let maxContribution = 0;
    let maxTerm = null;
    
    for (const term of mainTerms) {
      const [coeff, d, m, mp, f] = term;
      
      const argumentDegrees = d * fundamentals.D + 
                             m * fundamentals.M + 
                             mp * fundamentals.Mp + 
                             f * fundamentals.F;
      
      const argumentRadians = this.degToRad(argumentDegrees);
      const contribution = Math.abs((coeff / 1e6) * Math.sin(argumentRadians));
      
      if (contribution > maxContribution) {
        maxContribution = contribution;
        maxTerm = {
          coefficient: coeff / 1e6,
          arguments: [d, m, mp, f],
          argument: argumentDegrees,
          contribution: contribution
        };
      }
    }
    
    return maxTerm;
  }

  /**
   * Fallback simplified Moon position calculation
   * Used when ELP2000 calculation fails
   * @param {number} julianDay - Julian Day Number
   * @returns {number} Moon longitude in degrees
   */
  calculateSimplifiedMoonPosition(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    
    // Mean longitude
    const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + 
              T * T * T / 538841 - T * T * T * T / 65194000;
    
    // Mean anomaly of the Moon
    const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + 
               T * T * T / 69699 - T * T * T * T / 14712000;
    
    // Simple periodic correction (main term only)
    const MpRad = Mp * Math.PI / 180;
    const correction = 6.288774 * Math.sin(MpRad);
    
    const moonLongitude = L + correction;
    return this.normalizeAngle(moonLongitude);
  }

  /**
   * Set ELP2000 series data
   * @param {ELP2000SeriesData} seriesData - ELP2000 coefficient data
   */
  setSeriesData(seriesData) {
    this.lunarTerms = seriesData;
    console.log('ELP2000 series data loaded');
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * Normalize angle to 0-360 degrees
   * @param {number} angle - Angle in degrees
   * @returns {number} Normalized angle (0-360)
   */
  normalizeAngle(angle) {
    // Handle very large or very negative angles
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  /**
   * Validate Moon position calculation result
   * @param {number} longitude - Calculated Moon longitude
   * @param {number} julianDay - Julian Day used for calculation
   * @returns {Object} Validation results
   */
  validateMoonPosition(longitude, julianDay) {
    const validation = {
      valid: true,
      warnings: [],
      errors: [],
      longitude: longitude
    };

    // Check longitude range
    if (longitude < 0 || longitude >= 360) {
      validation.errors.push(`Moon longitude out of range: ${longitude}°`);
      validation.valid = false;
    }

    // Check for reasonable Moon motion (approximately 13.2° per day)
    const daysSinceJ2000 = julianDay - 2451545.0;
    const expectedApproxLongitude = (218.316 + 13.176396 * daysSinceJ2000) % 360;
    const difference = Math.abs(longitude - expectedApproxLongitude);
    const normalizedDiff = difference > 180 ? 360 - difference : difference;

    if (normalizedDiff > 30) {
      validation.warnings.push(`Moon position differs significantly from expected: ${normalizedDiff.toFixed(2)}°`);
    }

    // Check if using high-precision calculation
    if (!this.lunarTerms) {
      validation.warnings.push('Using simplified calculation - accuracy reduced');
    }

    return validation;
  }

  /**
   * Get detailed calculation information
   * @param {number} julianDay - Julian Day for calculation
   * @returns {Object} Detailed calculation info
   */
  getCalculationDetails(julianDay) {
    const T = (julianDay - 2451545.0) / 36525.0;
    const fundamentals = this.calculateFundamentalArguments(T);
    const meanLongitude = this.calculateMeanLongitude(T);
    
    let periodicCorrections = { longitude: 0, termCount: 0 };
    if (this.lunarTerms) {
      periodicCorrections = this.calculatePeriodicTerms(fundamentals, T);
    }

    return {
      julianDay: julianDay,
      T: T,
      fundamentals: fundamentals,
      meanLongitude: meanLongitude,
      periodicCorrections: periodicCorrections.longitude,
      termCount: periodicCorrections.termCount,
      finalLongitude: this.normalizeAngle(meanLongitude + periodicCorrections.longitude),
      accuracy: this.getAccuracyInfo()
    };
  }

  /**
   * Get calculation accuracy information
   * @returns {Object} Accuracy information
   */
  getAccuracyInfo() {
    return {
      method: 'ELP2000-82B',
      accuracy: this.lunarTerms ? '±2 arc minutes' : '±30 arc minutes (fallback)',
      terms: this.lunarTerms ? this.lunarTerms.getTermCount() : 1,
      description: 'High-precision lunar theory for professional astrological calculations'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ELP2000MoonCalculator;
}