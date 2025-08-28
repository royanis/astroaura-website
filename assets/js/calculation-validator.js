/**
 * CalculationValidator - Validates astronomical calculations against known ephemeris data
 * Provides accuracy testing and diagnostic tools for planetary position calculations
 */
class CalculationValidator {
    constructor() {
        this.referenceEphemeris = this.initializeReferenceData();
        this.accuracyThresholds = {
            Sun: 1/60,      // 1 arc minute in degrees
            Moon: 2/60,     // 2 arc minutes in degrees
            Mercury: 2/60,  // 2 arc minutes in degrees
            Venus: 2/60,    // 2 arc minutes in degrees
            Mars: 2/60,     // 2 arc minutes in degrees
            Jupiter: 5/60,  // 5 arc minutes in degrees
            Saturn: 5/60,   // 5 arc minutes in degrees
            Uranus: 5/60,   // 5 arc minutes in degrees
            Neptune: 5/60,  // 5 arc minutes in degrees
            Pluto: 5/60     // 5 arc minutes in degrees
        };
    }

    /**
     * Initialize reference ephemeris data for validation
     * @returns {Object} Reference data organized by date and planet
     */
    initializeReferenceData() {
        return {
            '1985-01-04T01:00:00.000Z': { // 6:30 AM IST = 1:00 AM UTC
                Sun: { longitude: 283.61, sign: 'Capricorn', degree: 13, minute: 36 },
                Moon: { longitude: 66.73, sign: 'Gemini', degree: 6, minute: 44 },
                Mercury: { longitude: 260.78, sign: 'Sagittarius', degree: 20, minute: 47 },
                Venus: { longitude: 242.45, sign: 'Sagittarius', degree: 2, minute: 27 },
                Mars: { longitude: 334.12, sign: 'Pisces', degree: 4, minute: 7 },
                Jupiter: { longitude: 290.34, sign: 'Capricorn', degree: 20, minute: 20 },
                Saturn: { longitude: 228.67, sign: 'Scorpio', degree: 18, minute: 40 },
                Uranus: { longitude: 255.23, sign: 'Sagittarius', degree: 15, minute: 14 },
                Neptune: { longitude: 275.89, sign: 'Capricorn', degree: 5, minute: 53 },
                Pluto: { longitude: 213.45, sign: 'Scorpio', degree: 3, minute: 27 }
            },
            '2000-01-01T12:00:00.000Z': { // J2000.0 epoch reference
                Sun: { longitude: 280.46, sign: 'Capricorn', degree: 10, minute: 28 },
                Moon: { longitude: 218.32, sign: 'Scorpio', degree: 8, minute: 19 },
                Mercury: { longitude: 263.42, sign: 'Sagittarius', degree: 23, minute: 25 },
                Venus: { longitude: 226.78, sign: 'Scorpio', degree: 16, minute: 47 },
                Mars: { longitude: 333.89, sign: 'Pisces', degree: 3, minute: 53 },
                Jupiter: { longitude: 63.23, sign: 'Gemini', degree: 3, minute: 14 },
                Saturn: { longitude: 39.67, sign: 'Taurus', degree: 9, minute: 40 },
                Uranus: { longitude: 316.45, sign: 'Aquarius', degree: 16, minute: 27 },
                Neptune: { longitude: 303.12, sign: 'Aquarius', degree: 3, minute: 7 },
                Pluto: { longitude: 251.34, sign: 'Sagittarius', degree: 11, minute: 20 }
            }
        };
    }

    /**
     * Validate planetary positions against expected ephemeris data
     * @param {Array} calculatedPlanets - Array of calculated planetary positions
     * @param {string} utcDateTime - UTC date/time string for reference lookup
     * @returns {Object} Validation results with accuracy metrics
     */
    validatePlanetaryPositions(calculatedPlanets, utcDateTime) {
        const results = {
            overall: { passed: 0, failed: 0, warnings: 0 },
            planets: {},
            summary: '',
            diagnostics: []
        };

        // Get expected positions for this date/time
        const expectedPositions = this.getExpectedPosition(utcDateTime);
        
        if (!expectedPositions) {
            results.diagnostics.push(`No reference data available for ${utcDateTime}`);
            results.summary = 'No reference data available for validation';
            return results;
        }

        // Validate each planet
        for (const planet of calculatedPlanets) {
            const planetName = planet.name;
            const expected = expectedPositions[planetName];
            
            if (!expected) {
                results.diagnostics.push(`No expected position for ${planetName}`);
                continue;
            }

            const validation = this.validateSinglePlanet(planet, expected, planetName);
            results.planets[planetName] = validation;

            if (validation.status === 'PASS') {
                results.overall.passed++;
            } else if (validation.status === 'FAIL') {
                results.overall.failed++;
            } else {
                results.overall.warnings++;
            }
        }

        // Generate summary
        results.summary = this.generateValidationSummary(results);
        
        return results;
    }

    /**
     * Validate a single planet's position
     * @param {Object} calculated - Calculated planetary position
     * @param {Object} expected - Expected position from ephemeris
     * @param {string} planetName - Name of the planet
     * @returns {Object} Validation result for this planet
     */
    validateSinglePlanet(calculated, expected, planetName) {
        const threshold = this.accuracyThresholds[planetName] || 5/60; // Default 5 arc minutes
        
        // Calculate angular difference
        const difference = this.calculateAngularDifference(calculated.longitude, expected.longitude);
        const differenceArcMinutes = difference * 60;
        const thresholdArcMinutes = threshold * 60;

        // Determine status
        let status = 'PASS';
        if (difference > threshold * 2) {
            status = 'FAIL';
        } else if (difference > threshold) {
            status = 'WARNING';
        }

        return {
            status,
            calculated: {
                longitude: calculated.longitude,
                sign: calculated.sign || this.getZodiacSign(calculated.longitude),
                degree: Math.floor(calculated.longitude % 30),
                minute: Math.floor((calculated.longitude % 1) * 60)
            },
            expected: {
                longitude: expected.longitude,
                sign: expected.sign,
                degree: expected.degree,
                minute: expected.minute
            },
            difference: {
                degrees: difference,
                arcMinutes: differenceArcMinutes,
                threshold: thresholdArcMinutes
            },
            message: this.generatePlanetMessage(planetName, difference, differenceArcMinutes, thresholdArcMinutes, status)
        };
    }

    /**
     * Calculate angular difference between two longitudes (handles 0°/360° wraparound)
     * @param {number} calculated - Calculated longitude in degrees
     * @param {number} expected - Expected longitude in degrees
     * @returns {number} Angular difference in degrees
     */
    calculateAngularDifference(calculated, expected) {
        let diff = Math.abs(calculated - expected);
        if (diff > 180) {
            diff = 360 - diff;
        }
        return diff;
    }

    /**
     * Get expected position for a given UTC date/time
     * @param {string} utcDateTime - UTC date/time string
     * @returns {Object|null} Expected positions or null if not found
     */
    getExpectedPosition(utcDateTime) {
        // Direct lookup first
        if (this.referenceEphemeris[utcDateTime]) {
            return this.referenceEphemeris[utcDateTime];
        }

        // Try to find closest match within reasonable time window
        const targetTime = new Date(utcDateTime).getTime();
        const timeWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        for (const [refDateTime, positions] of Object.entries(this.referenceEphemeris)) {
            const refTime = new Date(refDateTime).getTime();
            if (Math.abs(targetTime - refTime) <= timeWindow) {
                return positions;
            }
        }

        return null;
    }

    /**
     * Get zodiac sign for a given longitude
     * @param {number} longitude - Longitude in degrees
     * @returns {string} Zodiac sign name
     */
    getZodiacSign(longitude) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return signs[Math.floor(longitude / 30)];
    }

    /**
     * Generate validation message for a planet
     * @param {string} planetName - Name of the planet
     * @param {number} difference - Angular difference in degrees
     * @param {number} arcMinutes - Difference in arc minutes
     * @param {number} threshold - Threshold in arc minutes
     * @param {string} status - Validation status
     * @returns {string} Validation message
     */
    generatePlanetMessage(planetName, difference, arcMinutes, threshold, status) {
        const arcMinutesStr = arcMinutes.toFixed(1);
        const thresholdStr = threshold.toFixed(1);

        switch (status) {
            case 'PASS':
                return `${planetName}: PASS - Difference ${arcMinutesStr}' (within ${thresholdStr}' threshold)`;
            case 'WARNING':
                return `${planetName}: WARNING - Difference ${arcMinutesStr}' (exceeds ${thresholdStr}' threshold but within 2x)`;
            case 'FAIL':
                return `${planetName}: FAIL - Difference ${arcMinutesStr}' (exceeds 2x ${thresholdStr}' threshold)`;
            default:
                return `${planetName}: UNKNOWN - Difference ${arcMinutesStr}'`;
        }
    }

    /**
     * Generate overall validation summary
     * @param {Object} results - Validation results
     * @returns {string} Summary message
     */
    generateValidationSummary(results) {
        const total = results.overall.passed + results.overall.failed + results.overall.warnings;
        const passRate = total > 0 ? (results.overall.passed / total * 100).toFixed(1) : 0;

        let summary = `Validation Results: ${results.overall.passed}/${total} planets passed (${passRate}%)`;
        
        if (results.overall.warnings > 0) {
            summary += `, ${results.overall.warnings} warnings`;
        }
        
        if (results.overall.failed > 0) {
            summary += `, ${results.overall.failed} failures`;
        }

        return summary;
    }

    /**
     * Generate detailed diagnostic report
     * @param {Object} validationResults - Results from validatePlanetaryPositions
     * @returns {string} Detailed diagnostic report
     */
    generateDiagnosticReport(validationResults) {
        let report = `=== CALCULATION VALIDATION REPORT ===\n\n`;
        report += `${validationResults.summary}\n\n`;

        // Planet-by-planet breakdown
        for (const [planetName, result] of Object.entries(validationResults.planets)) {
            report += `${planetName.toUpperCase()}:\n`;
            report += `  Status: ${result.status}\n`;
            report += `  Calculated: ${result.calculated.sign} ${result.calculated.degree}°${result.calculated.minute}' (${result.calculated.longitude.toFixed(4)}°)\n`;
            report += `  Expected:   ${result.expected.sign} ${result.expected.degree}°${result.expected.minute}' (${result.expected.longitude.toFixed(4)}°)\n`;
            report += `  Difference: ${result.difference.arcMinutes.toFixed(1)}' (threshold: ${result.difference.threshold.toFixed(1)}')\n`;
            report += `  ${result.message}\n\n`;
        }

        // Diagnostics
        if (validationResults.diagnostics.length > 0) {
            report += `DIAGNOSTICS:\n`;
            for (const diagnostic of validationResults.diagnostics) {
                report += `  - ${diagnostic}\n`;
            }
        }

        return report;
    }

    /**
     * Check if planetary positions are within reasonable ranges
     * @param {Array} planets - Array of planetary positions
     * @returns {Array} Array of range validation issues
     */
    validateRanges(planets) {
        const issues = [];

        for (const planet of planets) {
            // Check longitude range
            if (planet.longitude < 0 || planet.longitude >= 360) {
                issues.push(`${planet.name} longitude out of range: ${planet.longitude}°`);
            }

            // Check for NaN or undefined values
            if (isNaN(planet.longitude) || planet.longitude === undefined) {
                issues.push(`${planet.name} longitude is invalid: ${planet.longitude}`);
            }

            // Check for extremely rapid motion (likely calculation error)
            if (planet.previousLongitude !== undefined) {
                const motion = Math.abs(planet.longitude - planet.previousLongitude);
                const normalizedMotion = motion > 180 ? 360 - motion : motion;
                
                // Maximum daily motion thresholds (degrees per day)
                const maxDailyMotion = {
                    Sun: 1.2, Moon: 15, Mercury: 2.5, Venus: 1.5, Mars: 1.0,
                    Jupiter: 0.3, Saturn: 0.15, Uranus: 0.05, Neptune: 0.03, Pluto: 0.02
                };

                const threshold = maxDailyMotion[planet.name] || 1.0;
                if (normalizedMotion > threshold) {
                    issues.push(`${planet.name} motion too rapid: ${normalizedMotion.toFixed(2)}°/day (max: ${threshold}°/day)`);
                }
            }
        }

        return issues;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculationValidator;
}