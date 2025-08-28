/**
 * Comprehensive Error Handling System for Astronomical Calculations
 * Provides fallback strategies and informative error messages
 */

class CalculationErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.fallbackStrategies = this.initializeFallbackStrategies();
    this.errorTypes = this.initializeErrorTypes();
    this.debugMode = false;
  }

  /**
   * Initialize error types and their handling strategies
   */
  initializeErrorTypes() {
    return {
      VSOP87_CALCULATION_ERROR: {
        severity: 'high',
        fallback: 'simplified_calculation',
        message: 'VSOP87 calculation failed, using simplified planetary theory'
      },
      SERIES_DATA_ERROR: {
        severity: 'high',
        fallback: 'legacy_calculation',
        message: 'Series data unavailable or corrupted, using legacy calculation'
      },
      COORDINATE_TRANSFORMATION_ERROR: {
        severity: 'medium',
        fallback: 'skip_corrections',
        message: 'Coordinate transformation failed, using uncorrected positions'
      },
      NUTATION_CALCULATION_ERROR: {
        severity: 'low',
        fallback: 'skip_nutation',
        message: 'Nutation calculation failed, using mean positions'
      },
      CACHE_ERROR: {
        severity: 'low',
        fallback: 'disable_cache',
        message: 'Cache operation failed, continuing without caching'
      },
      TIMEZONE_CONVERSION_ERROR: {
        severity: 'high',
        fallback: 'utc_offset_calculation',
        message: 'Timezone conversion failed, using longitude-based UTC offset'
      },
      JULIAN_DAY_ERROR: {
        severity: 'critical',
        fallback: 'none',
        message: 'Julian day calculation failed, cannot proceed'
      },
      MOON_CALCULATION_ERROR: {
        severity: 'medium',
        fallback: 'simplified_moon',
        message: 'ELP2000 moon calculation failed, using simplified lunar theory'
      },
      PRECISION_ERROR: {
        severity: 'low',
        fallback: 'lower_precision',
        message: 'High precision calculation failed, using lower precision'
      },
      VALIDATION_ERROR: {
        severity: 'medium',
        fallback: 'skip_validation',
        message: 'Result validation failed, returning unvalidated results'
      }
    };
  }

  /**
   * Initialize fallback strategies
   */
  initializeFallbackStrategies() {
    return {
      simplified_calculation: this.useSimplifiedCalculation.bind(this),
      legacy_calculation: this.useLegacyCalculation.bind(this),
      skip_corrections: this.skipCorrections.bind(this),
      skip_nutation: this.skipNutation.bind(this),
      disable_cache: this.disableCache.bind(this),
      utc_offset_calculation: this.useUTCOffsetCalculation.bind(this),
      simplified_moon: this.useSimplifiedMoon.bind(this),
      lower_precision: this.useLowerPrecision.bind(this),
      skip_validation: this.skipValidation.bind(this)
    };
  }

  /**
   * Handle calculation errors with appropriate fallback strategies
   */
  handleError(errorType, originalError, context = {}) {
    const errorInfo = this.errorTypes[errorType];
    
    if (!errorInfo) {
      return this.handleUnknownError(originalError, context);
    }

    // Log the error
    this.logError(errorType, originalError, context, errorInfo);

    // Apply fallback strategy if available
    if (errorInfo.fallback && errorInfo.fallback !== 'none') {
      const fallbackStrategy = this.fallbackStrategies[errorInfo.fallback];
      if (fallbackStrategy) {
        try {
          return fallbackStrategy(context, originalError);
        } catch (fallbackError) {
          this.logError('FALLBACK_FAILED', fallbackError, { 
            originalError: errorType, 
            fallbackStrategy: errorInfo.fallback 
          });
          return this.getDefaultFallback(context);
        }
      }
    }

    // If no fallback or critical error, throw with enhanced information
    if (errorInfo.severity === 'critical') {
      throw new CalculationError(errorInfo.message, errorType, originalError, context);
    }

    return this.getDefaultFallback(context);
  }

  /**
   * Log error with context information
   */
  logError(errorType, originalError, context, errorInfo = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorType,
      message: errorInfo ? errorInfo.message : originalError.message,
      severity: errorInfo ? errorInfo.severity : 'unknown',
      originalError: {
        name: originalError.name,
        message: originalError.message,
        stack: this.debugMode ? originalError.stack : null
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(logEntry);

    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging based on severity
    if (errorInfo) {
      switch (errorInfo.severity) {
        case 'critical':
          console.error(`[CRITICAL] ${errorInfo.message}`, logEntry);
          break;
        case 'high':
          console.error(`[ERROR] ${errorInfo.message}`, logEntry);
          break;
        case 'medium':
          console.warn(`[WARNING] ${errorInfo.message}`, logEntry);
          break;
        case 'low':
          if (this.debugMode) {
            console.info(`[INFO] ${errorInfo.message}`, logEntry);
          }
          break;
      }
    } else {
      console.error('[UNKNOWN ERROR]', logEntry);
    }
  }

  /**
   * Handle unknown errors
   */
  handleUnknownError(error, context) {
    this.logError('UNKNOWN_ERROR', error, context);
    return this.getDefaultFallback(context);
  }

  /**
   * Fallback strategy implementations
   */
  useSimplifiedCalculation(context, error) {
    return {
      success: true,
      fallback: 'simplified_calculation',
      message: 'Using simplified planetary calculation',
      data: this.getSimplifiedPlanetaryData(context)
    };
  }

  useLegacyCalculation(context, error) {
    return {
      success: true,
      fallback: 'legacy_calculation',
      message: 'Using legacy calculation method',
      data: this.getLegacyCalculationData(context)
    };
  }

  skipCorrections(context, error) {
    return {
      success: true,
      fallback: 'skip_corrections',
      message: 'Coordinate corrections skipped',
      data: context.rawData || null,
      warning: 'Results may have reduced accuracy due to skipped corrections'
    };
  }

  skipNutation(context, error) {
    return {
      success: true,
      fallback: 'skip_nutation',
      message: 'Nutation corrections skipped',
      data: context.rawData || null,
      warning: 'Results use mean positions without nutation corrections'
    };
  }

  disableCache(context, error) {
    if (context.calculator) {
      context.calculator.setCaching(false);
    }
    return {
      success: true,
      fallback: 'disable_cache',
      message: 'Caching disabled due to cache errors',
      data: context.data || null
    };
  }

  useUTCOffsetCalculation(context, error) {
    const { longitude } = context;
    if (longitude !== undefined) {
      const utcOffset = longitude / 15; // Rough UTC offset from longitude
      return {
        success: true,
        fallback: 'utc_offset_calculation',
        message: 'Using longitude-based UTC offset',
        data: { utcOffset, method: 'longitude_based' },
        warning: 'Timezone calculation may be inaccurate'
      };
    }
    throw new Error('Cannot calculate UTC offset without longitude');
  }

  useSimplifiedMoon(context, error) {
    const { T } = context;
    if (T !== undefined) {
      // Very basic lunar longitude calculation
      const L = 218.3164477 + 481267.88123421 * T;
      return {
        success: true,
        fallback: 'simplified_moon',
        message: 'Using simplified moon calculation',
        data: { longitude: L % 360 },
        warning: 'Moon position accuracy significantly reduced'
      };
    }
    throw new Error('Cannot calculate simplified moon position without time parameter');
  }

  useLowerPrecision(context, error) {
    const precisionLevels = ['high', 'medium', 'low', 'minimal'];
    const currentLevel = context.precisionLevel || 'medium';
    const currentIndex = precisionLevels.indexOf(currentLevel);
    
    if (currentIndex < precisionLevels.length - 1) {
      const newLevel = precisionLevels[currentIndex + 1];
      return {
        success: true,
        fallback: 'lower_precision',
        message: `Reduced precision from ${currentLevel} to ${newLevel}`,
        data: { newPrecisionLevel: newLevel },
        warning: 'Calculation precision has been reduced'
      };
    }
    
    throw new Error('Already at minimum precision level');
  }

  skipValidation(context, error) {
    return {
      success: true,
      fallback: 'skip_validation',
      message: 'Result validation skipped',
      data: context.data || null,
      warning: 'Results have not been validated for accuracy'
    };
  }

  /**
   * Get default fallback data
   */
  getDefaultFallback(context) {
    return {
      success: false,
      fallback: 'default',
      message: 'Using default fallback values',
      data: this.getDefaultPlanetaryData(),
      warning: 'Results may be highly inaccurate'
    };
  }

  /**
   * Generate simplified planetary data
   */
  getSimplifiedPlanetaryData(context) {
    const { T } = context;
    if (!T) return null;

    // Very basic planetary positions (mean longitudes)
    return {
      Sun: (280.4664567 + 360007.6982779 * T) % 360,
      Moon: (218.3164477 + 481267.88123421 * T) % 360,
      Mercury: (252.250906 + 149472.6746358 * T) % 360,
      Venus: (181.979801 + 58517.8156748 * T) % 360,
      Mars: (355.433 + 19140.299 * T) % 360,
      Jupiter: (34.351484 + 3034.9056746 * T) % 360,
      Saturn: (50.0774 + 1222.1137943 * T) % 360,
      Uranus: (314.055 + 428.4669983 * T) % 360,
      Neptune: (304.348 + 218.4862002 * T) % 360,
      Pluto: (238.958 + 145.1097790 * T) % 360
    };
  }

  /**
   * Get legacy calculation data (placeholder)
   */
  getLegacyCalculationData(context) {
    // This would call the original calculation methods
    return context.legacyData || this.getSimplifiedPlanetaryData(context);
  }

  /**
   * Get default planetary data (J2000.0 epoch positions)
   */
  getDefaultPlanetaryData() {
    return {
      Sun: 280.4664567,
      Moon: 218.3164477,
      Mercury: 252.250906,
      Venus: 181.979801,
      Mars: 355.433,
      Jupiter: 34.351484,
      Saturn: 50.0774,
      Uranus: 314.055,
      Neptune: 304.348,
      Pluto: 238.958
    };
  }

  /**
   * Validate calculation results
   */
  validateResults(results, context = {}) {
    const issues = [];

    if (!results || typeof results !== 'object') {
      issues.push('Results object is invalid');
      return { valid: false, issues };
    }

    // Check for reasonable longitude values
    for (const [planet, data] of Object.entries(results)) {
      if (typeof data === 'object' && data.longitude !== undefined) {
        const longitude = data.longitude;
        
        if (typeof longitude !== 'number' || isNaN(longitude)) {
          issues.push(`${planet} longitude is not a valid number: ${longitude}`);
        } else if (longitude < 0 || longitude >= 360) {
          issues.push(`${planet} longitude out of range: ${longitude}°`);
        }
      }
    }

    // Check for suspicious rapid changes (if previous results available)
    if (context.previousResults) {
      for (const [planet, data] of Object.entries(results)) {
        const prevData = context.previousResults[planet];
        if (prevData && data.longitude !== undefined && prevData.longitude !== undefined) {
          let diff = Math.abs(data.longitude - prevData.longitude);
          if (diff > 180) diff = 360 - diff; // Handle wrap-around
          
          // Flag if planet moved more than expected (rough check)
          const maxExpectedMovement = this.getMaxExpectedMovement(planet, context.timeDiff || 1);
          if (diff > maxExpectedMovement) {
            issues.push(`${planet} moved ${diff.toFixed(2)}° which exceeds expected maximum of ${maxExpectedMovement}°`);
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings: issues.length > 0 ? ['Results may contain calculation errors'] : []
    };
  }

  /**
   * Get maximum expected planetary movement for validation
   */
  getMaxExpectedMovement(planet, timeDiffDays) {
    const dailyMovements = {
      Sun: 1.0,
      Moon: 13.2,
      Mercury: 4.0,
      Venus: 1.6,
      Mars: 0.7,
      Jupiter: 0.08,
      Saturn: 0.03,
      Uranus: 0.01,
      Neptune: 0.006,
      Pluto: 0.003
    };

    return (dailyMovements[planet] || 1.0) * timeDiffDays * 2; // 2x safety margin
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {};
    
    this.errorLog.forEach(entry => {
      const type = entry.errorType;
      if (!stats[type]) {
        stats[type] = { count: 0, severity: entry.severity };
      }
      stats[type].count++;
    });

    return {
      totalErrors: this.errorLog.length,
      errorTypes: stats,
      recentErrors: this.errorLog.slice(-10)
    };
  }
}

/**
 * Custom error class for calculation errors
 */
class CalculationError extends Error {
  constructor(message, errorType, originalError, context) {
    super(message);
    this.name = 'CalculationError';
    this.errorType = errorType;
    this.originalError = originalError;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Export for use
window.CalculationErrorHandler = CalculationErrorHandler;
window.CalculationError = CalculationError;