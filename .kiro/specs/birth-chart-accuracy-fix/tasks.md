# Implementation Plan

- [x] 1. Fix timezone conversion and UTC calculation
  - Create enhanced timezone-aware UTC converter that uses birth location timezone
  - Fix the current issue where 6:30 AM IST is incorrectly converted to UTC
  - Implement proper DST handling for birth location
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.7_

- [x] 1.1 Create TimezoneAwareConverter class
  - Write TimezoneAwareConverter class with proper birth location timezone handling
  - Implement createLocationDateTime method that creates time in birth location context
  - Add convertToUTC method that uses birth location offset, not user's current timezone
  - _Requirements: 7.1, 7.2, 7.7_

- [x] 1.2 Fix UTC conversion in BirthChartCalculator
  - Update performAstrologicalCalculations method to use TimezoneAwareConverter
  - Replace current timezone conversion logic with location-aware conversion
  - Add validation to ensure UTC conversion uses birth location timezone
  - _Requirements: 7.1, 7.2, 7.7_

- [x] 1.3 Add timezone conversion validation tests
  - Create test cases for timezone conversion with known birth locations
  - Test DST handling for various locations and dates
  - Verify 6:30 AM IST converts to 1:00 AM UTC for India locations
  - _Requirements: 7.3, 7.4, 7.7_

- [-] 2. Implement complete VSOP87 planetary calculation system
  - Replace simplified planetary calculations with full VSOP87 implementation
  - Add complete coefficient series data for all planets
  - Implement proper coordinate transformations from heliocentric to geocentric
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.1 Create VSOP87SeriesData class
  - Implement VSOP87SeriesData class to store complete coefficient series
  - Add L0 through L5 terms for Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
  - Include proper coefficient organization and access methods
  - _Requirements: 2.1, 2.4_

- [ ] 2.2 Enhance VSOP87Calculator with complete series
  - Update calculateSunLongitudeVSOP87 to use complete L0-L5 series with all terms
  - Update calculateMercuryLongitudeVSOP87 with complete coefficient series
  - Update calculateVenusLongitudeVSOP87 with complete coefficient series
  - _Requirements: 2.1, 2.4_

- [ ] 2.3 Add remaining planetary VSOP87 calculations
  - Implement complete calculateMarsLongitudeVSOP87 with full coefficient series
  - Implement complete calculateJupiterLongitudeVSOP87 replacing simplified version
  - Implement complete calculateSaturnLongitudeVSOP87 replacing simplified version
  - _Requirements: 2.1, 2.4_

- [ ] 2.4 Implement outer planet VSOP87 calculations
  - Implement complete calculateUranusLongitudeVSOP87 with full precision
  - Implement complete calculateNeptuneLongitudeVSOP87 with full precision
  - Update calculatePlutoLongitudeDE431 with higher precision ephemeris data
  - _Requirements: 2.1, 2.4_

- [x] 3. Implement high-precision Moon calculation using ELP2000
  - Replace current simplified Moon calculation with ELP2000 lunar theory
  - Add complete periodic terms for lunar longitude calculation
  - Implement proper fundamental arguments calculation
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.1 Create ELP2000MoonCalculator class
  - Implement ELP2000MoonCalculator class with lunar theory calculations
  - Add calculateFundamentalArguments method for D, M, Mp, F arguments
  - Implement calculateMeanLongitude method for base lunar longitude
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Add ELP2000 periodic terms data
  - Create ELP2000SeriesData class with main periodic terms (at least 50 terms)
  - Include coefficients for lunar longitude corrections
  - Add proper term organization and access methods
  - _Requirements: 3.2_

- [x] 3.3 Implement lunar periodic corrections
  - Add calculatePeriodicTerms method to apply ELP2000 corrections
  - Implement proper argument calculation and sine/cosine evaluation
  - Add conversion from arcseconds to degrees for final result
  - _Requirements: 3.2, 3.3_

- [x] 4. Add coordinate system transformations and corrections
  - Implement proper nutation corrections for all planetary positions
  - Add aberration corrections for apparent positions
  - Implement coordinate transformations between heliocentric and geocentric systems
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.1 Create NutationCalculator class
  - Implement NutationCalculator with IAU 1980 nutation theory
  - Add calculateNutation method with fundamental arguments
  - Include main nutation terms for longitude and obliquity corrections
  - _Requirements: 2.2, 4.3_

- [x] 4.2 Create CoordinateTransformer class
  - Implement CoordinateTransformer for coordinate system conversions
  - Add heliocentricToGeocentric transformation method
  - Implement calculateAberration method for annual aberration
  - _Requirements: 4.1, 4.2_

- [x] 4.3 Apply corrections to planetary calculations
  - Update VSOP87Calculator to apply nutation corrections to all planets
  - Add aberration corrections to final planetary positions
  - Implement proper coordinate transformation pipeline
  - _Requirements: 2.2, 4.1, 4.2_

- [x] 5. Create comprehensive validation and testing system
  - Implement validation against known ephemeris data
  - Add accuracy testing for all planetary positions
  - Create diagnostic tools for identifying calculation errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.1 Create CalculationValidator class
  - Implement CalculationValidator with ephemeris comparison methods
  - Add validatePlanetaryPositions method to check position accuracy
  - Include getExpectedPosition method with reference ephemeris data
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.2 Add comprehensive test cases
  - Create TEST_CASES array with multiple reference dates and locations
  - Add primary test case (Jan 4, 1985, 6:30 AM IST, Prayagraj) with expected positions
  - Include additional test cases for different years, locations, and edge cases
  - _Requirements: 5.1, 5.4_

- [x] 5.3 Implement accuracy verification system
  - Update test-accuracy.html to use new validation system
  - Add detailed accuracy reporting for each planetary position
  - Create diagnostic output for debugging calculation issues
  - _Requirements: 5.3, 5.4_

- [x] 6. Optimize performance and add error handling
  - Implement efficient series calculation with appropriate truncation
  - Add comprehensive error handling and fallback strategies
  - Optimize calculation performance for real-time use
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.1 Implement calculation optimization
  - Add series truncation logic to VSOP87 calculations for required precision
  - Implement caching for intermediate calculation results
  - Optimize coefficient data loading and access patterns
  - _Requirements: 6.1, 6.2_

- [x] 6.2 Add comprehensive error handling
  - Implement proper error handling in all calculation methods
  - Add fallback strategies for when high-precision calculations fail
  - Create informative error messages for debugging
  - _Requirements: 5.4, 6.4_

- [x] 6.3 Add progress feedback and performance monitoring
  - Implement calculation progress reporting for long operations
  - Add performance timing and monitoring
  - Create user feedback during intensive calculations
  - _Requirements: 6.5_

- [x] 7. Integration and final testing
  - Integrate all components into the main BirthChartCalculator
  - Perform comprehensive testing with the primary test case
  - Validate that all accuracy requirements are met
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7_

- [x] 7.1 Update BirthChartCalculator integration
  - Replace existing planetary calculation calls with new enhanced system
  - Update performAstrologicalCalculations to use new components
  - Ensure proper error handling and fallback behavior
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7.2 Perform final accuracy validation
  - Run comprehensive tests against primary test case (Jan 4, 1985)
  - Verify Sun position accuracy (expected: Capricorn 13°36', ~283.6°)
  - Verify Moon position accuracy (expected: Gemini 6°44', ~66.7°)
  - _Requirements: 1.5, 1.6, 1.7_

- [x] 7.3 Validate all planetary positions
  - Test Mercury accuracy (expected: Sagittarius 20°47', ~260.8°)
  - Test Venus, Mars, and outer planet positions against expected values
  - Ensure all positions are within required accuracy tolerances
  - _Requirements: 1.1, 1.2, 1.3, 1.4_