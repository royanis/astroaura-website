# Birth Chart Accuracy Fix - Requirements Document

## Introduction

The current birth chart calculator has significant accuracy issues with planetary position calculations, particularly for inner planets (Sun, Moon, Mercury, Venus, Mars). Analysis of test data shows discrepancies of 10-150 degrees from expected astronomical positions, making the calculator unsuitable for professional astrological use. This feature will implement high-precision astronomical calculations to achieve accuracy within 1-2 arc minutes for all planetary positions.

## Requirements

### Requirement 1: Accurate Planetary Position Calculations

**User Story:** As an astrology practitioner, I want planetary positions calculated with professional-grade accuracy, so that birth charts are astronomically correct and reliable for interpretation.

#### Acceptance Criteria

1. WHEN calculating planetary positions THEN the Sun position SHALL be accurate within 1 arc minute of Swiss Ephemeris values
2. WHEN calculating planetary positions THEN the Moon position SHALL be accurate within 2 arc minutes of Swiss Ephemeris values  
3. WHEN calculating inner planets (Mercury, Venus, Mars) THEN positions SHALL be accurate within 2 arc minutes of Swiss Ephemeris values
4. WHEN calculating outer planets (Jupiter through Pluto) THEN positions SHALL be accurate within 5 arc minutes of Swiss Ephemeris values
5. WHEN using test case (Jan 4, 1985, 6:30 AM IST, Prayagraj) THEN Sun SHALL be at approximately 283.6° (Capricorn 13°36')
6. WHEN using test case THEN Moon SHALL be at approximately 66.7° (Gemini 6°44')
7. WHEN using test case THEN Mercury SHALL be at approximately 260.8° (Sagittarius 20°47')

### Requirement 2: Correct VSOP87 Implementation

**User Story:** As a developer maintaining the calculator, I want proper VSOP87 theory implementation, so that calculations are based on internationally accepted astronomical standards.

#### Acceptance Criteria

1. WHEN implementing VSOP87 THEN the calculator SHALL use complete coefficient series for L0, L1, L2, L3, L4, L5 terms
2. WHEN calculating planetary longitudes THEN nutation corrections SHALL be properly applied
3. WHEN processing VSOP87 results THEN coordinate transformations SHALL convert from heliocentric to geocentric positions
4. WHEN calculating the Sun THEN the implementation SHALL account for Earth's orbital position using full VSOP87 Earth series
5. WHEN calculating inner planets THEN perturbations from other planets SHALL be included in the calculations

### Requirement 3: Enhanced Moon Position Calculation

**User Story:** As an astrologer, I want highly accurate Moon positions, so that lunar aspects and house positions are calculated correctly for timing and interpretation.

#### Acceptance Criteria

1. WHEN calculating Moon position THEN the system SHALL use ELP2000-82B lunar theory or equivalent precision
2. WHEN calculating Moon longitude THEN the system SHALL include at least 50 main periodic terms
3. WHEN calculating Moon position THEN corrections for lunar libration SHALL be applied
4. WHEN calculating Moon position THEN the result SHALL account for topocentric parallax corrections
5. WHEN Moon calculation fails THEN the system SHALL fall back to simplified high-precision lunar theory

### Requirement 4: Proper Coordinate System Handling

**User Story:** As a user entering birth data, I want the system to handle coordinate transformations correctly, so that my birth chart reflects the actual astronomical positions at my birth time and location.

#### Acceptance Criteria

1. WHEN converting between coordinate systems THEN the system SHALL properly transform from ecliptic to equatorial coordinates
2. WHEN calculating apparent positions THEN the system SHALL apply aberration corrections
3. WHEN calculating positions THEN the system SHALL use the correct obliquity of the ecliptic for the birth date
4. WHEN handling historical dates THEN the system SHALL apply proper precession corrections
5. WHEN calculating topocentric positions THEN the system SHALL account for observer location on Earth's surface

### Requirement 5: Validation and Error Detection

**User Story:** As a quality assurance tester, I want comprehensive validation of astronomical calculations, so that accuracy issues are detected and reported before affecting users.

#### Acceptance Criteria

1. WHEN performing calculations THEN the system SHALL validate results against known ephemeris data
2. WHEN planetary positions are calculated THEN the system SHALL check for reasonable ranges (0-360 degrees)
3. WHEN accuracy tests fail THEN the system SHALL log detailed diagnostic information
4. WHEN calculations produce suspicious results THEN the system SHALL flag them for manual review
5. WHEN validation detects errors THEN the system SHALL provide specific error messages indicating the problem source

### Requirement 6: Performance Optimization

**User Story:** As a user of the birth chart calculator, I want calculations to complete quickly, so that I can generate charts without long waiting times.

#### Acceptance Criteria

1. WHEN calculating a complete birth chart THEN the system SHALL complete within 2 seconds on modern devices
2. WHEN performing VSOP87 calculations THEN the system SHALL optimize series truncation for required precision
3. WHEN caching is available THEN the system SHALL store intermediate calculation results
4. WHEN multiple charts are calculated THEN the system SHALL reuse common astronomical data
5. WHEN calculations are intensive THEN the system SHALL provide progress feedback to users

### Requirement 7: Accurate Timezone and Location Handling

**User Story:** As a user entering birth information, I want the system to automatically determine the correct timezone for my birth location and convert my local birth time to UTC accurately, so that planetary positions reflect the actual astronomical conditions at my birth moment.

#### Acceptance Criteria

1. WHEN a birth location is selected THEN the system SHALL automatically determine the correct timezone for that location
2. WHEN converting birth time to UTC THEN the system SHALL use the timezone corresponding to the birth location, not the user's current timezone
3. WHEN birth date falls during daylight saving time THEN the system SHALL apply DST corrections based on the birth location's DST rules
4. WHEN birth location is in a different country THEN the system SHALL use that country's timezone rules, not local rules
5. WHEN timezone determination fails THEN the system SHALL fall back to longitude-based UTC offset calculation
6. WHEN historical dates are used THEN the system SHALL apply appropriate historical timezone rules for the birth location
7. WHEN birth time is entered as "6:30 AM" in India THEN the system SHALL convert using IST (UTC+5:30), not user's local timezone

### Requirement 8: Historical Date Support

**User Story:** As a historical astrologer, I want accurate calculations for dates before 1900, so that I can create charts for historical figures and events.

#### Acceptance Criteria

1. WHEN calculating charts for dates before 1900 THEN the system SHALL maintain accuracy within specified tolerances
2. WHEN handling pre-1582 dates THEN the system SHALL properly account for Julian/Gregorian calendar differences
3. WHEN calculating very old dates THEN the system SHALL apply appropriate precession models
4. WHEN historical timezone data is unavailable THEN the system SHALL use Local Mean Time calculations based on birth location longitude
5. WHEN accuracy degrades for ancient dates THEN the system SHALL warn users about reduced precision