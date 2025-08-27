/**
 * NutationCalculator - Implements IAU 1980 nutation theory
 * Calculates nutation corrections for longitude and obliquity
 * Based on the IAU 1980 Theory of Nutation
 */
class NutationCalculator {
    constructor() {
        // Main nutation terms from IAU 1980 theory
        // Format: [coefficient_longitude, coefficient_obliquity, D, M, Mp, F, Omega]
        // where D, M, Mp, F, Omega are multipliers for fundamental arguments
        this.nutationTerms = [
            // Main term (18.6 year period)
            [-171996, -174.2, 92025, 8.9, 0, 0, 0, 0, 1],
            [-13187, -1.6, 5736, -3.1, -2, 0, 0, 2, 2],
            [-2274, -0.2, 977, -0.5, 0, 0, 0, 2, 2],
            [2062, 0.2, -895, 0.5, 0, 0, 0, 0, 2],
            [1426, -3.4, 54, -0.1, 0, 1, 0, 0, 0],
            [712, 0.1, -7, 0, 0, 0, 1, 0, 0],
            [-517, 1.2, 224, -0.6, -2, 1, 0, 2, 2],
            [-386, -0.4, 200, 0, 0, 0, 0, 2, 1],
            [-301, 0, 129, -0.1, 0, 0, 1, 2, 2],
            [217, -0.5, -95, 0.3, -2, 0, 1, 0, 0],
            [-158, 0, 0, 0, -2, 0, 0, 2, 1],
            [129, 0.1, -70, 0, 0, 0, -1, 2, 2],
            [123, 0, -53, 0, 2, 0, 0, 0, 0],
            [63, 0, 0, 0, 0, 0, 1, 0, 1],
            [63, 0.1, -33, 0, 0, 0, -1, 0, 1],
            [-59, 0, 26, 0, 0, 0, 1, 2, 1],
            [-58, -0.1, 32, 0, -2, 0, 1, 2, 2],
            [-51, 0, 27, 0, 0, 0, -1, 2, 1],
            [48, 0, 0, 0, 2, 0, 0, 2, 2],
            [46, 0, -24, 0, 0, 0, 1, 0, 2],
            [-38, 0, 16, 0, 0, 0, -1, 0, 2],
            [-31, 0, 13, 0, 0, 0, 1, 2, 0],
            [29, 0, 0, 0, 0, 0, -1, 2, 0],
            [29, 0, -12, 0, 2, 0, 0, 0, 1],
            [26, 0, 0, 0, 0, 0, 1, 0, 0],
            [-22, 0, 0, 0, 0, 1, 0, 2, 0],
            [21, 0, -10, 0, 0, 0, -1, 0, 0],
            [17, -0.1, 0, 0, -2, 0, 2, 2, 2],
            [16, 0, -8, 0, 2, 0, -1, 2, 1],
            [-16, 0.1, 7, 0, 0, 0, 1, 2, -1],
            [-15, 0, 9, 0, -2, 0, 0, 2, 0],
            [-13, 0, 7, 0, 0, 0, -1, 2, -1],
            [-12, 0, 6, 0, 2, 0, 0, 2, 1],
            [11, 0, 0, 0, 0, 1, -1, 0, 0],
            [-10, 0, 5, 0, -2, 0, 1, 0, 1],
            [-8, 0, 3, 0, 0, 1, 1, 0, 0],
            [7, 0, -3, 0, 2, 0, 1, 0, 0],
            [-7, 0, 0, 0, 0, 1, -1, 2, 2],
            [-7, 0, 3, 0, 0, 0, 1, 1, 0],
            [-7, 0, 3, 0, 0, 1, 1, 2, 2],
            [6, 0, 0, 0, -2, 0, 2, 0, 0],
            [6, 0, -3, 0, 0, 0, -1, 1, 0],
            [6, 0, -3, 0, 2, 0, -1, 0, 1],
            [-6, 0, 3, 0, 0, 1, -1, 2, 0],
            [-6, 0, 3, 0, 0, 0, 1, -1, 0],
            [5, 0, 0, 0, 0, 1, 1, 2, 0],
            [-5, 0, 3, 0, -2, 0, 0, 0, 1],
            [-5, 0, 3, 0, 0, 0, -1, -1, 0],
            [-5, 0, 3, 0, 2, 0, 1, 2, 2],
            [4, 0, 0, 0, 0, 1, -1, 0, 2],
            [4, 0, 0, 0, 0, 1, 1, 0, 2]
        ];
    }

    /**
     * Calculate nutation corrections for longitude and obliquity
     * @param {number} T - Julian centuries from J2000.0
     * @returns {Object} Nutation corrections in arcseconds
     */
    calculateNutation(T) {
        // Calculate fundamental arguments (in degrees)
        const fundamentals = this.calculateFundamentalArguments(T);
        
        let deltaLongitude = 0; // Nutation in longitude (arcseconds)
        let deltaObliquity = 0; // Nutation in obliquity (arcseconds)
        
        // Apply each nutation term
        for (const term of this.nutationTerms) {
            const [coeffLng, coeffLngT, coeffObl, coeffOblT, D, M, Mp, F, Omega] = term;
            
            // Calculate argument for this term
            const argument = D * fundamentals.D + 
                           M * fundamentals.M + 
                           Mp * fundamentals.Mp + 
                           F * fundamentals.F + 
                           Omega * fundamentals.Omega;
            
            // Convert to radians
            const argRad = this.degToRad(argument);
            
            // Calculate sine and cosine
            const sinArg = Math.sin(argRad);
            const cosArg = Math.cos(argRad);
            
            // Add contributions to nutation
            deltaLongitude += (coeffLng + coeffLngT * T) * sinArg;
            deltaObliquity += (coeffObl + coeffOblT * T) * cosArg;
        }
        
        // Convert from 0.1 milliarcseconds to arcseconds
        deltaLongitude *= 1e-4;
        deltaObliquity *= 1e-4;
        
        return {
            deltaLongitude: deltaLongitude / 3600, // Convert to degrees
            deltaObliquity: deltaObliquity / 3600, // Convert to degrees
            deltaLongitudeArcsec: deltaLongitude,
            deltaObliquityArcsec: deltaObliquity
        };
    }

    /**
     * Calculate fundamental arguments for nutation theory
     * @param {number} T - Julian centuries from J2000.0
     * @returns {Object} Fundamental arguments in degrees
     */
    calculateFundamentalArguments(T) {
        // Mean elongation of the Moon from the Sun (D)
        const D = 297.85036 + 445267.111480 * T - 0.0019142 * T * T + T * T * T / 189474;
        
        // Mean anomaly of the Sun (M)
        const M = 357.52772 + 35999.050340 * T - 0.0001603 * T * T - T * T * T / 300000;
        
        // Mean anomaly of the Moon (Mp)
        const Mp = 134.96298 + 477198.867398 * T + 0.0086972 * T * T + T * T * T / 56250;
        
        // Moon's argument of latitude (F)
        const F = 93.27191 + 483202.017538 * T - 0.0036825 * T * T + T * T * T / 327270;
        
        // Longitude of the ascending node of the Moon's mean orbit (Omega)
        const Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
        
        return {
            D: this.normalizeAngle(D),
            M: this.normalizeAngle(M),
            Mp: this.normalizeAngle(Mp),
            F: this.normalizeAngle(F),
            Omega: this.normalizeAngle(Omega)
        };
    }

    /**
     * Calculate mean obliquity of the ecliptic
     * @param {number} T - Julian centuries from J2000.0
     * @returns {number} Mean obliquity in degrees
     */
    calculateMeanObliquity(T) {
        // IAU 1980 formula for mean obliquity
        const epsilon0 = 23.439291 - 0.0130042 * T - 0.00000164 * T * T + 0.000000504 * T * T * T;
        return epsilon0;
    }

    /**
     * Calculate true obliquity of the ecliptic (including nutation)
     * @param {number} T - Julian centuries from J2000.0
     * @returns {number} True obliquity in degrees
     */
    calculateTrueObliquity(T) {
        const meanObliquity = this.calculateMeanObliquity(T);
        const nutation = this.calculateNutation(T);
        return meanObliquity + nutation.deltaObliquity;
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
     * Normalize angle to 0-360 degrees
     * @param {number} angle - Angle in degrees
     * @returns {number} Normalized angle
     */
    normalizeAngle(angle) {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NutationCalculator;
}