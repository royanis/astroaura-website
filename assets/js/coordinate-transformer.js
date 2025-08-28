/**
 * CoordinateTransformer - Handles coordinate system conversions and corrections
 * Implements transformations between heliocentric and geocentric coordinates
 * Applies aberration corrections for apparent positions
 */
class CoordinateTransformer {
    constructor() {
        this.nutationCalculator = new NutationCalculator();
    }

    /**
     * Transform heliocentric coordinates to geocentric coordinates
     * @param {number} heliocentricLongitude - Heliocentric longitude in degrees
     * @param {number} heliocentricLatitude - Heliocentric latitude in degrees (default 0)
     * @param {number} heliocentricDistance - Heliocentric distance in AU (default 1)
     * @param {number} julianDay - Julian Day Number
     * @returns {Object} Geocentric coordinates
     */
    heliocentricToGeocentric(heliocentricLongitude, heliocentricLatitude = 0, heliocentricDistance = 1, julianDay) {
        const T = (julianDay - 2451545.0) / 36525.0;
        
        // Get Earth's heliocentric position (opposite of Sun's geocentric position)
        const earthPosition = this.calculateEarthHeliocentricPosition(T);
        
        // Convert to rectangular coordinates
        const helioRect = this.sphericalToRectangular(
            heliocentricLongitude, 
            heliocentricLatitude, 
            heliocentricDistance
        );
        
        const earthRect = this.sphericalToRectangular(
            earthPosition.longitude, 
            earthPosition.latitude, 
            earthPosition.distance
        );
        
        // Calculate geocentric rectangular coordinates
        const geoRect = {
            x: helioRect.x - earthRect.x,
            y: helioRect.y - earthRect.y,
            z: helioRect.z - earthRect.z
        };
        
        // Convert back to spherical coordinates
        const geocentric = this.rectangularToSpherical(geoRect.x, geoRect.y, geoRect.z);
        
        return {
            longitude: this.normalizeAngle(geocentric.longitude),
            latitude: geocentric.latitude,
            distance: geocentric.distance
        };
    }

    /**
     * Calculate Earth's heliocentric position using VSOP87 Sun calculation
     * @param {number} T - Julian centuries from J2000.0
     * @returns {Object} Earth's heliocentric coordinates
     */
    calculateEarthHeliocentricPosition(T) {
        // Use the same calculation as the Sun's VSOP87 method
        // since Sun's geocentric position = Earth's heliocentric position + 180°
        
        // Get Earth's heliocentric longitude from VSOP87 Sun calculation
        let L = 0;
        
        // L0 terms (most significant) - same as Sun calculation
        const L0_terms = [
            [175347046.0, 0, 0],
            [3341656.0, 4.6692568, 6283.0758500],
            [34894.0, 4.6261, 12566.1517],
            [3497.0, 2.7441, 5753.3849],
            [3418.0, 2.8289, 3.5231],
            [3136.0, 3.6277, 77713.7715],
            [2676.0, 4.4181, 7860.4194],
            [2343.0, 6.1352, 3930.2097],
            [1324.0, 0.7425, 11506.7698],
            [1273.0, 2.0371, 529.6910],
            [1199.0, 1.1096, 1577.3435],
            [990.0, 5.233, 5884.927],
            [902.0, 2.045, 26.298],
            [857.0, 3.508, 398.149],
            [780.0, 1.179, 5223.694],
            [753.0, 2.533, 5507.553],
            [505.0, 4.583, 18849.228],
            [492.0, 4.205, 775.523],
            [357.0, 2.920, 0.067],
            [317.0, 5.849, 11790.629],
            [284.0, 1.899, 796.298],
            [271.0, 0.315, 10977.079],
            [243.0, 0.345, 5486.778],
            [206.0, 4.806, 2544.314],
            [205.0, 1.869, 5573.143],
            [202.0, 2.458, 6069.777],
            [156.0, 0.833, 213.299],
            [132.0, 3.411, 2942.463],
            [126.0, 1.083, 20.775],
            [115.0, 0.645, 0.980],
            [103.0, 0.636, 4694.003]
        ];

        for (const [A, B, C] of L0_terms) {
            L += A * Math.cos(B + C * T);
        }

        // L1 terms
        const L1_terms = [
            [628331966747.0, 0, 0],
            [206059.0, 2.678235, 6283.075850],
            [4303.0, 2.6351, 12566.1517],
            [425.0, 1.590, 3.523],
            [119.0, 5.796, 26.298],
            [109.0, 2.966, 1577.344],
            [93.0, 2.59, 18849.23],
            [72.0, 1.14, 529.69],
            [68.0, 1.87, 398.15],
            [67.0, 4.41, 5507.55],
            [59.0, 2.89, 5223.69],
            [56.0, 2.17, 155.42],
            [45.0, 0.40, 796.30],
            [36.0, 0.47, 775.52],
            [29.0, 2.65, 7.11],
            [21.0, 5.34, 0.98],
            [19.0, 1.85, 5486.78],
            [19.0, 4.97, 213.30],
            [17.0, 2.99, 6275.96],
            [16.0, 0.03, 2544.31],
            [16.0, 1.43, 2146.17],
            [15.0, 1.21, 10977.08],
            [12.0, 2.83, 1748.02],
            [12.0, 3.26, 5088.63],
            [12.0, 5.27, 1194.45],
            [12.0, 2.08, 4694.00],
            [11.0, 0.77, 553.57],
            [10.0, 1.30, 6286.60],
            [10.0, 4.24, 1349.87],
            [9.0, 2.70, 242.73]
        ];

        for (const [A, B, C] of L1_terms) {
            L += A * T * Math.cos(B + C * T);
        }

        // L2 terms
        const L2_terms = [
            [52919.0, 0, 0],
            [8720.0, 1.0721, 6283.0758],
            [309.0, 0.867, 12566.152],
            [27.0, 0.05, 3.52],
            [16.0, 5.19, 26.30],
            [16.0, 3.68, 155.42],
            [10.0, 0.76, 18849.23],
            [9.0, 2.06, 77713.77],
            [7.0, 0.83, 775.52],
            [5.0, 4.66, 1577.34],
            [4.0, 1.03, 7.11],
            [4.0, 3.44, 5573.14],
            [3.0, 5.14, 796.30],
            [3.0, 6.05, 5507.55],
            [3.0, 1.19, 242.73],
            [3.0, 6.12, 529.69],
            [3.0, 0.31, 398.15],
            [3.0, 2.28, 553.57],
            [2.0, 4.38, 5223.69],
            [2.0, 3.75, 0.98]
        ];

        for (const [A, B, C] of L2_terms) {
            L += A * T * T * Math.cos(B + C * T);
        }

        // L3 terms
        const L3_terms = [
            [289.0, 5.844, 6283.076],
            [35.0, 0, 0],
            [17.0, 5.49, 12566.15],
            [3.0, 5.20, 155.42],
            [1.0, 4.72, 3.52],
            [1.0, 5.30, 18849.23],
            [1.0, 5.97, 242.73]
        ];

        for (const [A, B, C] of L3_terms) {
            L += A * T * T * T * Math.cos(B + C * T);
        }

        // L4 terms
        const L4_terms = [
            [114.0, 3.142, 0],
            [8.0, 4.13, 6283.08],
            [1.0, 3.84, 12566.15]
        ];

        for (const [A, B, C] of L4_terms) {
            L += A * T * T * T * T * Math.cos(B + C * T);
        }

        // L5 terms
        const L5_terms = [
            [1.0, 3.14, 0]
        ];

        for (const [A, B, C] of L5_terms) {
            L += A * T * T * T * T * T * Math.cos(B + C * T);
        }

        // Convert to degrees and normalize
        L = L * 1e-8; // Convert from 1e-8 radians
        L = L * 180 / Math.PI; // Convert to degrees
        
        // Earth's eccentricity for distance calculation
        const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
        
        // Mean anomaly for distance
        const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
        const MRad = this.degToRad(M);
        
        // Distance (simplified)
        const distance = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(MRad));
        
        return {
            longitude: this.normalizeAngle(L),
            latitude: 0, // Earth's latitude is 0 by definition
            distance: distance
        };
    }

    /**
     * Calculate annual aberration correction
     * @param {number} longitude - Longitude in degrees
     * @param {number} T - Julian centuries from J2000.0
     * @returns {number} Aberration correction in degrees
     */
    calculateAberration(longitude, T) {
        // Earth's orbital eccentricity
        const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
        
        // Sun's mean longitude
        const sunMeanLongitude = 280.4664567 + 360007.6982779 * T + 0.03032028 * T * T;
        const sunMeanLongitudeRad = this.degToRad(sunMeanLongitude);
        
        // Longitude of perihelion
        const perihelion = 102.93735 + 1.71946 * T + 0.00046 * T * T;
        const perihelionRad = this.degToRad(perihelion);
        
        // Convert longitude to radians
        const longitudeRad = this.degToRad(longitude);
        
        // Annual aberration constant (20.49552 arcseconds)
        const kappa = 20.49552 / 3600; // Convert to degrees
        
        // Calculate aberration components
        const deltaLongitude = -kappa * Math.cos(sunMeanLongitudeRad - longitudeRad) +
                              e * kappa * Math.cos(perihelionRad - longitudeRad);
        
        return deltaLongitude;
    }

    /**
     * Apply light-time correction
     * @param {number} longitude - Longitude in degrees
     * @param {number} distance - Distance in AU
     * @param {number} T - Julian centuries from J2000.0
     * @returns {number} Light-time correction in degrees
     */
    calculateLightTimeCorrection(longitude, distance, T) {
        // Light travel time in days
        const lightTime = distance * 0.00577551833; // AU to light-days conversion
        
        // Earth's orbital motion (approximate)
        const earthMotion = 0.985647332 / 365.25; // degrees per day
        
        // Light-time correction
        const correction = -lightTime * earthMotion;
        
        return correction;
    }

    /**
     * Convert spherical to rectangular coordinates
     * @param {number} longitude - Longitude in degrees
     * @param {number} latitude - Latitude in degrees
     * @param {number} distance - Distance
     * @returns {Object} Rectangular coordinates
     */
    sphericalToRectangular(longitude, latitude, distance) {
        const lonRad = this.degToRad(longitude);
        const latRad = this.degToRad(latitude);
        const cosLat = Math.cos(latRad);
        
        return {
            x: distance * cosLat * Math.cos(lonRad),
            y: distance * cosLat * Math.sin(lonRad),
            z: distance * Math.sin(latRad)
        };
    }

    /**
     * Convert rectangular to spherical coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @returns {Object} Spherical coordinates
     */
    rectangularToSpherical(x, y, z) {
        const distance = Math.sqrt(x * x + y * y + z * z);
        const longitude = Math.atan2(y, x) * 180 / Math.PI;
        const latitude = Math.asin(z / distance) * 180 / Math.PI;
        
        return {
            longitude: this.normalizeAngle(longitude),
            latitude: latitude,
            distance: distance
        };
    }

    /**
     * Apply precession correction from J2000.0 to date
     * @param {number} longitude - Longitude in degrees
     * @param {number} latitude - Latitude in degrees
     * @param {number} T - Julian centuries from J2000.0
     * @returns {Object} Precessed coordinates
     */
    applyPrecession(longitude, latitude, T) {
        // IAU 1976 precession constants (in arcseconds per century)
        const zeta_A = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * T;
        const z_A = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * T + (0.30188 - 0.000344 * T) * T * T;
        const theta_A = (2004.3109 - 0.85330 * T - 0.000217 * T * T) * T;
        
        // Convert to radians
        const zeta = this.degToRad(zeta_A / 3600);
        const z = this.degToRad(z_A / 3600);
        const theta = this.degToRad(theta_A / 3600);
        
        // Convert input coordinates to radians
        const alpha0 = this.degToRad(longitude);
        const delta0 = this.degToRad(latitude);
        
        // Precession matrix elements
        const cosZeta = Math.cos(zeta);
        const sinZeta = Math.sin(zeta);
        const cosZ = Math.cos(z);
        const sinZ = Math.sin(z);
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        
        // Direction cosines at J2000.0
        const x0 = Math.cos(delta0) * Math.cos(alpha0);
        const y0 = Math.cos(delta0) * Math.sin(alpha0);
        const z0 = Math.sin(delta0);
        
        // Apply precession matrix
        const x = (cosZeta * cosZ * cosTheta - sinZeta * sinZ) * x0 +
                  (-sinZeta * cosZ * cosTheta - cosZeta * sinZ) * y0 +
                  (-sinTheta * cosZ) * z0;
        
        const y = (cosZeta * sinZ * cosTheta + sinZeta * cosZ) * x0 +
                  (-sinZeta * sinZ * cosTheta + cosZeta * cosZ) * y0 +
                  (-sinTheta * sinZ) * z0;
        
        const z_new = (cosZeta * sinTheta) * x0 +
                      (-sinZeta * sinTheta) * y0 +
                      (cosTheta) * z0;
        
        // Convert back to spherical coordinates
        const alpha = Math.atan2(y, x) * 180 / Math.PI;
        const delta = Math.asin(z_new) * 180 / Math.PI;
        
        return {
            longitude: this.normalizeAngle(alpha),
            latitude: delta
        };
    }

    /**
     * Transform coordinates to apparent geocentric position
     * @param {number} longitude - Mean longitude in degrees
     * @param {number} latitude - Mean latitude in degrees
     * @param {number} distance - Distance in AU
     * @param {number} julianDay - Julian Day Number
     * @returns {Object} Apparent geocentric coordinates
     */
    transformToApparentGeocentric(longitude, latitude, distance, julianDay) {
        const T = (julianDay - 2451545.0) / 36525.0;
        
        // Step 1: Apply precession from J2000.0 to date
        const precessed = this.applyPrecession(longitude, latitude, T);
        
        // Step 2: Apply nutation
        const nutation = this.nutationCalculator.calculateNutation(T);
        const nutatedLongitude = precessed.longitude + nutation.deltaLongitude;
        const nutatedLatitude = precessed.latitude; // Latitude nutation is usually negligible
        
        // Step 3: Apply aberration
        const aberration = this.calculateAberration(nutatedLongitude, T);
        const apparentLongitude = nutatedLongitude + aberration;
        
        // Step 4: Apply light-time correction if distance is provided
        let lightTimeCorrection = 0;
        if (distance && distance > 0) {
            lightTimeCorrection = this.calculateLightTimeCorrection(apparentLongitude, distance, T);
        }
        
        return {
            longitude: this.normalizeAngle(apparentLongitude + lightTimeCorrection),
            latitude: nutatedLatitude,
            distance: distance,
            corrections: {
                precession: {
                    longitude: precessed.longitude - longitude,
                    latitude: precessed.latitude - latitude
                },
                nutation: {
                    longitude: nutation.deltaLongitude,
                    obliquity: nutation.deltaObliquity
                },
                aberration: aberration,
                lightTime: lightTimeCorrection
            }
        };
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
     * @returns {number} Normalized angle
     */
    normalizeAngle(angle) {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoordinateTransformer;
}