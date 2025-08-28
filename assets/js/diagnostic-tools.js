/**
 * Diagnostic Tools - Advanced diagnostic utilities for identifying calculation errors
 * Provides detailed analysis and debugging capabilities for astronomical calculations
 */
class DiagnosticTools {
    constructor() {
        this.debugMode = false;
        this.calculationLog = [];
        this.performanceMetrics = {};
    }

    /**
     * Enable debug mode for detailed logging
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('Diagnostic debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
        this.calculationLog = [];
    }

    /**
     * Log calculation step for debugging
     * @param {string} step - Calculation step name
     * @param {Object} data - Data to log
     */
    logCalculationStep(step, data) {
        if (this.debugMode) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                step: step,
                data: JSON.parse(JSON.stringify(data)) // Deep copy
            };
            this.calculationLog.push(logEntry);
            console.log(`[DIAGNOSTIC] ${step}:`, data);
        }
    }

    /**
     * Analyze planetary calculation accuracy
     * @param {Array} calculatedPlanets - Calculated planetary positions
     * @param {Object} expectedPositions - Expected positions from ephemeris
     * @returns {Object} Detailed accuracy analysis
     */
    analyzePlanetaryAccuracy(calculatedPlanets, expectedPositions) {
        const analysis = {
            summary: {},
            details: {},
            patterns: [],
            recommendations: []
        };

        // Analyze each planet
        for (const planet of calculatedPlanets) {
            const expected = expectedPositions[planet.name];
            if (!expected) continue;

            const difference = this.calculateAngularDifference(planet.longitude, expected.longitude);
            const arcMinutes = difference * 60;

            analysis.details[planet.name] = {
                calculated: planet.longitude,
                expected: expected.longitude,
                difference: difference,
                arcMinutes: arcMinutes,
                accuracy: this.categorizeAccuracy(arcMinutes, planet.name),
                motionAnalysis: this.analyzeMotion(planet)
            };
        }

        // Identify patterns
        analysis.patterns = this.identifyAccuracyPatterns(analysis.details);
        
        // Generate recommendations
        analysis.recommendations = this.generateAccuracyRecommendations(analysis.details, analysis.patterns);

        // Summary statistics
        analysis.summary = this.generateAccuracySummary(analysis.details);

        return analysis;
    }

    /**
     * Calculate angular difference between two longitudes
     * @param {number} calculated - Calculated longitude
     * @param {number} expected - Expected longitude
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
     * Categorize accuracy level
     * @param {number} arcMinutes - Difference in arc minutes
     * @param {string} planetName - Name of the planet
     * @returns {string} Accuracy category
     */
    categorizeAccuracy(arcMinutes, planetName) {
        const thresholds = {
            Sun: { excellent: 0.5, good: 1, acceptable: 2 },
            Moon: { excellent: 1, good: 2, acceptable: 5 },
            Mercury: { excellent: 1, good: 2, acceptable: 5 },
            Venus: { excellent: 1, good: 2, acceptable: 5 },
            Mars: { excellent: 1, good: 2, acceptable: 5 },
            Jupiter: { excellent: 2, good: 5, acceptable: 10 },
            Saturn: { excellent: 2, good: 5, acceptable: 10 },
            Uranus: { excellent: 2, good: 5, acceptable: 10 },
            Neptune: { excellent: 2, good: 5, acceptable: 10 },
            Pluto: { excellent: 2, good: 5, acceptable: 10 }
        };

        const threshold = thresholds[planetName] || thresholds.Jupiter;

        if (arcMinutes <= threshold.excellent) return 'EXCELLENT';
        if (arcMinutes <= threshold.good) return 'GOOD';
        if (arcMinutes <= threshold.acceptable) return 'ACCEPTABLE';
        return 'POOR';
    }

    /**
     * Analyze planetary motion characteristics
     * @param {Object} planet - Planet data
     * @returns {Object} Motion analysis
     */
    analyzeMotion(planet) {
        const analysis = {
            dailyMotion: null,
            retrograde: false,
            stationaryPoint: false,
            motionCategory: 'NORMAL'
        };

        // Typical daily motion ranges (degrees per day)
        const typicalMotion = {
            Sun: { min: 0.95, max: 1.02 },
            Moon: { min: 11, max: 15 },
            Mercury: { min: 0.5, max: 2.2 },
            Venus: { min: 0.6, max: 1.3 },
            Mars: { min: 0.3, max: 0.8 },
            Jupiter: { min: 0.08, max: 0.25 },
            Saturn: { min: 0.03, max: 0.13 },
            Uranus: { min: 0.005, max: 0.06 },
            Neptune: { min: 0.006, max: 0.03 },
            Pluto: { min: 0.003, max: 0.02 }
        };

        const expected = typicalMotion[planet.name];
        if (expected && planet.dailyMotion !== undefined) {
            analysis.dailyMotion = planet.dailyMotion;
            
            if (planet.dailyMotion < 0) {
                analysis.retrograde = true;
                analysis.motionCategory = 'RETROGRADE';
            } else if (Math.abs(planet.dailyMotion) < expected.min * 0.1) {
                analysis.stationaryPoint = true;
                analysis.motionCategory = 'STATIONARY';
            } else if (planet.dailyMotion > expected.max * 1.5) {
                analysis.motionCategory = 'FAST';
            } else if (planet.dailyMotion < expected.min * 0.5) {
                analysis.motionCategory = 'SLOW';
            }
        }

        return analysis;
    }

    /**
     * Identify patterns in accuracy issues
     * @param {Object} planetDetails - Detailed planet analysis
     * @returns {Array} Array of identified patterns
     */
    identifyAccuracyPatterns(planetDetails) {
        const patterns = [];
        const planets = Object.keys(planetDetails);

        // Check for systematic offset
        const offsets = planets.map(p => planetDetails[p].difference);
        const avgOffset = offsets.reduce((a, b) => a + b, 0) / offsets.length;
        if (Math.abs(avgOffset) > 1) {
            patterns.push({
                type: 'SYSTEMATIC_OFFSET',
                description: `Average offset of ${avgOffset.toFixed(2)}° suggests systematic calculation error`,
                severity: 'HIGH'
            });
        }

        // Check for inner planet issues
        const innerPlanets = ['Mercury', 'Venus', 'Mars'].filter(p => planetDetails[p]);
        const innerPlanetIssues = innerPlanets.filter(p => planetDetails[p].accuracy === 'POOR').length;
        if (innerPlanetIssues >= 2) {
            patterns.push({
                type: 'INNER_PLANET_ISSUES',
                description: `${innerPlanetIssues} inner planets have poor accuracy - check VSOP87 implementation`,
                severity: 'HIGH'
            });
        }

        // Check for outer planet issues
        const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].filter(p => planetDetails[p]);
        const outerPlanetIssues = outerPlanets.filter(p => planetDetails[p].accuracy === 'POOR').length;
        if (outerPlanetIssues >= 3) {
            patterns.push({
                type: 'OUTER_PLANET_ISSUES',
                description: `${outerPlanetIssues} outer planets have poor accuracy - check long-period terms`,
                severity: 'MEDIUM'
            });
        }

        // Check for coordinate system issues
        const allPoor = planets.filter(p => planetDetails[p].accuracy === 'POOR').length;
        if (allPoor >= planets.length * 0.7) {
            patterns.push({
                type: 'COORDINATE_SYSTEM_ERROR',
                description: 'Most planets have poor accuracy - likely coordinate system or epoch issue',
                severity: 'CRITICAL'
            });
        }

        // Check for specific planet issues
        if (planetDetails.Sun && planetDetails.Sun.accuracy === 'POOR') {
            patterns.push({
                type: 'SUN_POSITION_ERROR',
                description: 'Sun position is inaccurate - check Earth VSOP87 series and coordinate transformation',
                severity: 'HIGH'
            });
        }

        if (planetDetails.Moon && planetDetails.Moon.accuracy === 'POOR') {
            patterns.push({
                type: 'MOON_POSITION_ERROR',
                description: 'Moon position is inaccurate - check ELP2000 implementation and periodic terms',
                severity: 'HIGH'
            });
        }

        return patterns;
    }

    /**
     * Generate accuracy recommendations
     * @param {Object} planetDetails - Detailed planet analysis
     * @param {Array} patterns - Identified patterns
     * @returns {Array} Array of recommendations
     */
    generateAccuracyRecommendations(planetDetails, patterns) {
        const recommendations = [];

        // Pattern-based recommendations
        for (const pattern of patterns) {
            switch (pattern.type) {
                case 'SYSTEMATIC_OFFSET':
                    recommendations.push({
                        priority: 'HIGH',
                        category: 'COORDINATE_SYSTEM',
                        description: 'Check coordinate system transformations and epoch corrections',
                        actions: [
                            'Verify heliocentric to geocentric transformation',
                            'Check precession and nutation corrections',
                            'Validate Julian Day calculation'
                        ]
                    });
                    break;

                case 'INNER_PLANET_ISSUES':
                    recommendations.push({
                        priority: 'HIGH',
                        category: 'VSOP87',
                        description: 'Review VSOP87 implementation for inner planets',
                        actions: [
                            'Check VSOP87 coefficient data completeness',
                            'Verify series truncation levels',
                            'Validate perturbation calculations'
                        ]
                    });
                    break;

                case 'MOON_POSITION_ERROR':
                    recommendations.push({
                        priority: 'HIGH',
                        category: 'LUNAR_THEORY',
                        description: 'Review ELP2000 lunar theory implementation',
                        actions: [
                            'Check ELP2000 periodic terms data',
                            'Verify fundamental arguments calculation',
                            'Validate lunar longitude corrections'
                        ]
                    });
                    break;

                case 'COORDINATE_SYSTEM_ERROR':
                    recommendations.push({
                        priority: 'CRITICAL',
                        category: 'FUNDAMENTAL',
                        description: 'Major coordinate system or calculation error detected',
                        actions: [
                            'Review entire calculation pipeline',
                            'Check timezone conversion accuracy',
                            'Validate Julian Day calculation',
                            'Verify coordinate system transformations'
                        ]
                    });
                    break;
            }
        }

        // Planet-specific recommendations
        for (const [planet, details] of Object.entries(planetDetails)) {
            if (details.accuracy === 'POOR') {
                recommendations.push({
                    priority: 'MEDIUM',
                    category: 'PLANET_SPECIFIC',
                    description: `${planet} position accuracy is poor (${details.arcMinutes.toFixed(1)}' error)`,
                    actions: [
                        `Review ${planet} VSOP87 series implementation`,
                        `Check ${planet} coefficient data accuracy`,
                        `Validate ${planet} coordinate transformations`
                    ]
                });
            }
        }

        return recommendations;
    }

    /**
     * Generate accuracy summary statistics
     * @param {Object} planetDetails - Detailed planet analysis
     * @returns {Object} Summary statistics
     */
    generateAccuracySummary(planetDetails) {
        const planets = Object.keys(planetDetails);
        const summary = {
            totalPlanets: planets.length,
            excellent: 0,
            good: 0,
            acceptable: 0,
            poor: 0,
            averageError: 0,
            maxError: 0,
            minError: Infinity,
            worstPlanet: null,
            bestPlanet: null
        };

        let totalError = 0;

        for (const [planet, details] of Object.entries(planetDetails)) {
            // Count accuracy categories
            switch (details.accuracy) {
                case 'EXCELLENT': summary.excellent++; break;
                case 'GOOD': summary.good++; break;
                case 'ACCEPTABLE': summary.acceptable++; break;
                case 'POOR': summary.poor++; break;
            }

            // Track error statistics
            const error = details.arcMinutes;
            totalError += error;

            if (error > summary.maxError) {
                summary.maxError = error;
                summary.worstPlanet = planet;
            }

            if (error < summary.minError) {
                summary.minError = error;
                summary.bestPlanet = planet;
            }
        }

        summary.averageError = totalError / planets.length;
        summary.accuracyRate = ((summary.excellent + summary.good) / planets.length * 100);

        return summary;
    }

    /**
     * Analyze calculation performance
     * @param {Function} calculationFunction - Function to analyze
     * @param {Array} testCases - Test cases to run
     * @returns {Object} Performance analysis
     */
    async analyzePerformance(calculationFunction, testCases) {
        const results = {
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            testResults: []
        };

        for (const testCase of testCases) {
            const startTime = performance.now();
            
            try {
                const result = await calculationFunction(testCase);
                const endTime = performance.now();
                const duration = endTime - startTime;

                results.testResults.push({
                    testCase: testCase.name,
                    duration: duration,
                    success: true,
                    result: result
                });

                results.totalTime += duration;
                results.minTime = Math.min(results.minTime, duration);
                results.maxTime = Math.max(results.maxTime, duration);

            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                results.testResults.push({
                    testCase: testCase.name,
                    duration: duration,
                    success: false,
                    error: error.message
                });
            }
        }

        results.averageTime = results.totalTime / testCases.length;

        return results;
    }

    /**
     * Generate comprehensive diagnostic report
     * @param {Object} accuracyAnalysis - Accuracy analysis results
     * @param {Object} performanceAnalysis - Performance analysis results
     * @returns {string} Formatted diagnostic report
     */
    generateComprehensiveReport(accuracyAnalysis, performanceAnalysis = null) {
        let report = `=== COMPREHENSIVE DIAGNOSTIC REPORT ===\n`;
        report += `Generated: ${new Date().toISOString()}\n\n`;

        // Accuracy Summary
        report += `ACCURACY SUMMARY:\n`;
        report += `- Total Planets: ${accuracyAnalysis.summary.totalPlanets}\n`;
        report += `- Excellent: ${accuracyAnalysis.summary.excellent}\n`;
        report += `- Good: ${accuracyAnalysis.summary.good}\n`;
        report += `- Acceptable: ${accuracyAnalysis.summary.acceptable}\n`;
        report += `- Poor: ${accuracyAnalysis.summary.poor}\n`;
        report += `- Accuracy Rate: ${accuracyAnalysis.summary.accuracyRate.toFixed(1)}%\n`;
        report += `- Average Error: ${accuracyAnalysis.summary.averageError.toFixed(2)}'\n`;
        report += `- Max Error: ${accuracyAnalysis.summary.maxError.toFixed(2)}' (${accuracyAnalysis.summary.worstPlanet})\n`;
        report += `- Min Error: ${accuracyAnalysis.summary.minError.toFixed(2)}' (${accuracyAnalysis.summary.bestPlanet})\n\n`;

        // Patterns
        if (accuracyAnalysis.patterns.length > 0) {
            report += `IDENTIFIED PATTERNS:\n`;
            for (const pattern of accuracyAnalysis.patterns) {
                report += `- [${pattern.severity}] ${pattern.type}: ${pattern.description}\n`;
            }
            report += `\n`;
        }

        // Recommendations
        if (accuracyAnalysis.recommendations.length > 0) {
            report += `RECOMMENDATIONS:\n`;
            for (const rec of accuracyAnalysis.recommendations) {
                report += `- [${rec.priority}] ${rec.category}: ${rec.description}\n`;
                for (const action of rec.actions) {
                    report += `  * ${action}\n`;
                }
            }
            report += `\n`;
        }

        // Performance Analysis
        if (performanceAnalysis) {
            report += `PERFORMANCE ANALYSIS:\n`;
            report += `- Total Time: ${performanceAnalysis.totalTime.toFixed(2)}ms\n`;
            report += `- Average Time: ${performanceAnalysis.averageTime.toFixed(2)}ms\n`;
            report += `- Min Time: ${performanceAnalysis.minTime.toFixed(2)}ms\n`;
            report += `- Max Time: ${performanceAnalysis.maxTime.toFixed(2)}ms\n`;
            report += `- Success Rate: ${(performanceAnalysis.testResults.filter(r => r.success).length / performanceAnalysis.testResults.length * 100).toFixed(1)}%\n\n`;
        }

        // Detailed Planet Analysis
        report += `DETAILED PLANET ANALYSIS:\n`;
        for (const [planet, details] of Object.entries(accuracyAnalysis.details)) {
            report += `${planet.toUpperCase()}:\n`;
            report += `  Calculated: ${details.calculated.toFixed(4)}°\n`;
            report += `  Expected: ${details.expected.toFixed(4)}°\n`;
            report += `  Difference: ${details.difference.toFixed(4)}° (${details.arcMinutes.toFixed(1)}')\n`;
            report += `  Accuracy: ${details.accuracy}\n`;
            if (details.motionAnalysis.dailyMotion !== null) {
                report += `  Motion: ${details.motionAnalysis.dailyMotion.toFixed(4)}°/day (${details.motionAnalysis.motionCategory})\n`;
            }
            report += `\n`;
        }

        return report;
    }

    /**
     * Get calculation log for debugging
     * @returns {Array} Calculation log entries
     */
    getCalculationLog() {
        return this.calculationLog;
    }

    /**
     * Clear calculation log
     */
    clearCalculationLog() {
        this.calculationLog = [];
    }

    /**
     * Export diagnostic data for external analysis
     * @param {Object} data - Data to export
     * @returns {string} JSON string of diagnostic data
     */
    exportDiagnosticData(data) {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: data,
            calculationLog: this.calculationLog,
            performanceMetrics: this.performanceMetrics
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiagnosticTools;
}