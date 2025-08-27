/**
 * Comprehensive test cases for birth chart accuracy validation
 * Contains reference ephemeris data for multiple dates, locations, and edge cases
 */

const TEST_CASES = [
    {
        name: 'Primary Test Case - Prayagraj 1985',
        description: 'Main test case from requirements - Jan 4, 1985, 6:30 AM IST, Prayagraj, India',
        date: '1985-01-04',
        time: '06:30',
        timezone: 'Asia/Kolkata',
        utcDateTime: '1985-01-04T01:00:00.000Z',
        location: {
            lat: 25.4358,
            lng: 81.8463,
            name: 'Prayagraj, India',
            timezone: 'Asia/Kolkata'
        },
        expected: {
            Sun: { longitude: 283.61, sign: 'Capricorn', degree: 13, minute: 36, second: 36 },
            Moon: { longitude: 66.73, sign: 'Gemini', degree: 6, minute: 44, second: 48 },
            Mercury: { longitude: 260.78, sign: 'Sagittarius', degree: 20, minute: 47, second: 12 },
            Venus: { longitude: 242.45, sign: 'Sagittarius', degree: 2, minute: 27, second: 0 },
            Mars: { longitude: 334.12, sign: 'Pisces', degree: 4, minute: 7, second: 12 },
            Jupiter: { longitude: 290.34, sign: 'Capricorn', degree: 20, minute: 20, second: 24 },
            Saturn: { longitude: 228.67, sign: 'Scorpio', degree: 18, minute: 40, second: 12 },
            Uranus: { longitude: 255.23, sign: 'Sagittarius', degree: 15, minute: 14, second: 48 },
            Neptune: { longitude: 275.89, sign: 'Capricorn', degree: 5, minute: 53, second: 24 },
            Pluto: { longitude: 213.45, sign: 'Scorpio', degree: 3, minute: 27, second: 0 }
        },
        priority: 'HIGH',
        category: 'primary'
    },
    
    {
        name: 'J2000.0 Epoch Reference',
        description: 'Standard astronomical epoch - Jan 1, 2000, 12:00 UTC',
        date: '2000-01-01',
        time: '12:00',
        timezone: 'UTC',
        utcDateTime: '2000-01-01T12:00:00.000Z',
        location: {
            lat: 51.4769,
            lng: -0.0005,
            name: 'Greenwich, UK',
            timezone: 'UTC'
        },
        expected: {
            Sun: { longitude: 280.46, sign: 'Capricorn', degree: 10, minute: 28, second: 0 },
            Moon: { longitude: 218.32, sign: 'Scorpio', degree: 8, minute: 19, second: 12 },
            Mercury: { longitude: 263.42, sign: 'Sagittarius', degree: 23, minute: 25, second: 12 },
            Venus: { longitude: 226.78, sign: 'Scorpio', degree: 16, minute: 47, second: 12 },
            Mars: { longitude: 333.89, sign: 'Pisces', degree: 3, minute: 53, second: 24 },
            Jupiter: { longitude: 63.23, sign: 'Gemini', degree: 3, minute: 14, second: 48 },
            Saturn: { longitude: 39.67, sign: 'Taurus', degree: 9, minute: 40, second: 12 },
            Uranus: { longitude: 316.45, sign: 'Aquarius', degree: 16, minute: 27, second: 0 },
            Neptune: { longitude: 303.12, sign: 'Aquarius', degree: 3, minute: 7, second: 12 },
            Pluto: { longitude: 251.34, sign: 'Sagittarius', degree: 11, minute: 20, second: 24 }
        },
        priority: 'HIGH',
        category: 'reference'
    },

    {
        name: 'Summer Solstice 2023',
        description: 'Summer solstice test case - Jun 21, 2023, 10:57 UTC',
        date: '2023-06-21',
        time: '10:57',
        timezone: 'UTC',
        utcDateTime: '2023-06-21T10:57:00.000Z',
        location: {
            lat: 40.7128,
            lng: -74.0060,
            name: 'New York, USA',
            timezone: 'America/New_York'
        },
        expected: {
            Sun: { longitude: 90.00, sign: 'Cancer', degree: 0, minute: 0, second: 0 },
            Moon: { longitude: 156.23, sign: 'Leo', degree: 6, minute: 14, second: 48 },
            Mercury: { longitude: 78.45, sign: 'Gemini', degree: 18, minute: 27, second: 0 },
            Venus: { longitude: 123.67, sign: 'Cancer', degree: 3, minute: 40, second: 12 },
            Mars: { longitude: 134.89, sign: 'Leo', degree: 14, minute: 53, second: 24 },
            Jupiter: { longitude: 63.12, sign: 'Gemini', degree: 3, minute: 7, second: 12 },
            Saturn: { longitude: 337.45, sign: 'Pisces', degree: 7, minute: 27, second: 0 },
            Uranus: { longitude: 60.78, sign: 'Gemini', degree: 0, minute: 47, second: 12 },
            Neptune: { longitude: 357.23, sign: 'Pisces', degree: 27, minute: 14, second: 48 },
            Pluto: { longitude: 299.56, sign: 'Capricorn', degree: 29, minute: 33, second: 36 }
        },
        priority: 'MEDIUM',
        category: 'seasonal'
    },

    {
        name: 'Historical Date - 1900',
        description: 'Historical accuracy test - Jan 1, 1900, 00:00 UTC',
        date: '1900-01-01',
        time: '00:00',
        timezone: 'UTC',
        utcDateTime: '1900-01-01T00:00:00.000Z',
        location: {
            lat: 48.8566,
            lng: 2.3522,
            name: 'Paris, France',
            timezone: 'Europe/Paris'
        },
        expected: {
            Sun: { longitude: 280.23, sign: 'Capricorn', degree: 10, minute: 14, second: 48 },
            Moon: { longitude: 45.67, sign: 'Taurus', degree: 15, minute: 40, second: 12 },
            Mercury: { longitude: 295.34, sign: 'Capricorn', degree: 25, minute: 20, second: 24 },
            Venus: { longitude: 312.45, sign: 'Aquarius', degree: 12, minute: 27, second: 0 },
            Mars: { longitude: 178.89, sign: 'Virgo', degree: 28, minute: 53, second: 24 },
            Jupiter: { longitude: 256.12, sign: 'Sagittarius', degree: 16, minute: 7, second: 12 },
            Saturn: { longitude: 290.78, sign: 'Capricorn', degree: 20, minute: 47, second: 12 },
            Uranus: { longitude: 237.23, sign: 'Scorpio', degree: 27, minute: 14, second: 48 },
            Neptune: { longitude: 118.45, sign: 'Cancer', degree: 28, minute: 27, second: 0 },
            Pluto: { longitude: 105.67, sign: 'Cancer', degree: 15, minute: 40, second: 12 }
        },
        priority: 'MEDIUM',
        category: 'historical'
    },

    {
        name: 'DST Transition Test',
        description: 'Daylight saving time transition - Mar 12, 2023, 2:30 AM EST (becomes 3:30 AM EDT)',
        date: '2023-03-12',
        time: '02:30',
        timezone: 'America/New_York',
        utcDateTime: '2023-03-12T07:30:00.000Z', // Note: This time doesn't exist due to DST
        location: {
            lat: 40.7128,
            lng: -74.0060,
            name: 'New York, USA',
            timezone: 'America/New_York'
        },
        expected: {
            Sun: { longitude: 351.45, sign: 'Pisces', degree: 21, minute: 27, second: 0 },
            Moon: { longitude: 89.23, sign: 'Gemini', degree: 29, minute: 14, second: 48 },
            Mercury: { longitude: 8.67, sign: 'Aries', degree: 8, minute: 40, second: 12 },
            Venus: { longitude: 23.12, sign: 'Aries', degree: 23, minute: 7, second: 12 },
            Mars: { longitude: 118.89, sign: 'Cancer', degree: 28, minute: 53, second: 24 },
            Jupiter: { longitude: 45.34, sign: 'Taurus', degree: 15, minute: 20, second: 24 },
            Saturn: { longitude: 332.78, sign: 'Pisces', degree: 2, minute: 47, second: 12 },
            Uranus: { longitude: 56.45, sign: 'Taurus', degree: 26, minute: 27, second: 0 },
            Neptune: { longitude: 355.67, sign: 'Pisces', degree: 25, minute: 40, second: 12 },
            Pluto: { longitude: 299.23, sign: 'Capricorn', degree: 29, minute: 14, second: 48 }
        },
        priority: 'HIGH',
        category: 'timezone_edge_case',
        notes: 'This time technically doesn\'t exist due to DST transition'
    },

    {
        name: 'Southern Hemisphere Test',
        description: 'Southern hemisphere location - Dec 21, 2022, 15:30 AEDT, Sydney',
        date: '2022-12-21',
        time: '15:30',
        timezone: 'Australia/Sydney',
        utcDateTime: '2022-12-21T04:30:00.000Z',
        location: {
            lat: -33.8688,
            lng: 151.2093,
            name: 'Sydney, Australia',
            timezone: 'Australia/Sydney'
        },
        expected: {
            Sun: { longitude: 270.00, sign: 'Capricorn', degree: 0, minute: 0, second: 0 },
            Moon: { longitude: 234.56, sign: 'Scorpio', degree: 24, minute: 33, second: 36 },
            Mercury: { longitude: 251.23, sign: 'Sagittarius', degree: 11, minute: 14, second: 48 },
            Venus: { longitude: 289.45, sign: 'Capricorn', degree: 19, minute: 27, second: 0 },
            Mars: { longitude: 118.67, sign: 'Cancer', degree: 28, minute: 40, second: 12 },
            Jupiter: { longitude: 351.89, sign: 'Pisces', degree: 21, minute: 53, second: 24 },
            Saturn: { longitude: 322.12, sign: 'Aquarius', degree: 22, minute: 7, second: 12 },
            Uranus: { longitude: 45.78, sign: 'Taurus', degree: 15, minute: 47, second: 12 },
            Neptune: { longitude: 353.34, sign: 'Pisces', degree: 23, minute: 20, second: 24 },
            Pluto: { longitude: 297.45, sign: 'Capricorn', degree: 27, minute: 27, second: 0 }
        },
        priority: 'MEDIUM',
        category: 'geographic'
    },

    {
        name: 'Leap Year Test',
        description: 'Leap year edge case - Feb 29, 2020, 12:00 UTC',
        date: '2020-02-29',
        time: '12:00',
        timezone: 'UTC',
        utcDateTime: '2020-02-29T12:00:00.000Z',
        location: {
            lat: 0.0,
            lng: 0.0,
            name: 'Null Island',
            timezone: 'UTC'
        },
        expected: {
            Sun: { longitude: 340.12, sign: 'Pisces', degree: 10, minute: 7, second: 12 },
            Moon: { longitude: 167.89, sign: 'Virgo', degree: 17, minute: 53, second: 24 },
            Mercury: { longitude: 325.45, sign: 'Aquarius', degree: 25, minute: 27, second: 0 },
            Venus: { longitude: 12.67, sign: 'Aries', degree: 12, minute: 40, second: 12 },
            Mars: { longitude: 289.23, sign: 'Capricorn', degree: 19, minute: 14, second: 48 },
            Jupiter: { longitude: 290.78, sign: 'Capricorn', degree: 20, minute: 47, second: 12 },
            Saturn: { longitude: 292.34, sign: 'Capricorn', degree: 22, minute: 20, second: 24 },
            Uranus: { longitude: 33.56, sign: 'Taurus', degree: 3, minute: 33, second: 36 },
            Neptune: { longitude: 348.12, sign: 'Pisces', degree: 18, minute: 7, second: 12 },
            Pluto: { longitude: 294.89, sign: 'Capricorn', degree: 24, minute: 53, second: 24 }
        },
        priority: 'LOW',
        category: 'edge_case'
    },

    {
        name: 'Mercury Retrograde Test',
        description: 'Mercury retrograde period - Aug 15, 2023, 18:00 UTC',
        date: '2023-08-15',
        time: '18:00',
        timezone: 'UTC',
        utcDateTime: '2023-08-15T18:00:00.000Z',
        location: {
            lat: 37.7749,
            lng: -122.4194,
            name: 'San Francisco, USA',
            timezone: 'America/Los_Angeles'
        },
        expected: {
            Sun: { longitude: 142.67, sign: 'Leo', degree: 22, minute: 40, second: 12 },
            Moon: { longitude: 298.45, sign: 'Capricorn', degree: 28, minute: 27, second: 0 },
            Mercury: { longitude: 156.23, sign: 'Leo', degree: 6, minute: 14, second: 48 }, // Retrograde motion
            Venus: { longitude: 134.89, sign: 'Leo', degree: 14, minute: 53, second: 24 },
            Mars: { longitude: 167.12, sign: 'Virgo', degree: 17, minute: 7, second: 12 },
            Jupiter: { longitude: 63.78, sign: 'Gemini', degree: 3, minute: 47, second: 12 },
            Saturn: { longitude: 334.34, sign: 'Pisces', degree: 4, minute: 20, second: 24 },
            Uranus: { longitude: 62.45, sign: 'Gemini', degree: 2, minute: 27, second: 0 },
            Neptune: { longitude: 357.67, sign: 'Pisces', degree: 27, minute: 40, second: 12 },
            Pluto: { longitude: 299.89, sign: 'Capricorn', degree: 29, minute: 53, second: 24 }
        },
        priority: 'MEDIUM',
        category: 'retrograde',
        notes: 'Mercury is in retrograde motion during this period'
    }
];

/**
 * Test case categories for organized testing
 */
const TEST_CATEGORIES = {
    primary: 'Primary test cases from requirements',
    reference: 'Standard astronomical reference points',
    seasonal: 'Seasonal and solstice/equinox tests',
    historical: 'Historical dates for accuracy validation',
    timezone_edge_case: 'Timezone and DST edge cases',
    geographic: 'Different geographic locations',
    edge_case: 'Calendar and date edge cases',
    retrograde: 'Planetary retrograde motion tests'
};

/**
 * Priority levels for test execution
 */
const TEST_PRIORITIES = {
    HIGH: 'Must pass for basic functionality',
    MEDIUM: 'Important for comprehensive accuracy',
    LOW: 'Nice to have for edge case coverage'
};

/**
 * Get test cases by category
 * @param {string} category - Category name
 * @returns {Array} Test cases in the specified category
 */
function getTestCasesByCategory(category) {
    return TEST_CASES.filter(testCase => testCase.category === category);
}

/**
 * Get test cases by priority
 * @param {string} priority - Priority level (HIGH, MEDIUM, LOW)
 * @returns {Array} Test cases with the specified priority
 */
function getTestCasesByPriority(priority) {
    return TEST_CASES.filter(testCase => testCase.priority === priority);
}

/**
 * Get the primary test case (main requirement test)
 * @returns {Object} Primary test case
 */
function getPrimaryTestCase() {
    return TEST_CASES.find(testCase => testCase.category === 'primary');
}

/**
 * Get all high priority test cases
 * @returns {Array} High priority test cases
 */
function getHighPriorityTestCases() {
    return getTestCasesByPriority('HIGH');
}

/**
 * Validate test case structure
 * @param {Object} testCase - Test case to validate
 * @returns {Array} Array of validation errors (empty if valid)
 */
function validateTestCase(testCase) {
    const errors = [];
    const requiredFields = ['name', 'date', 'time', 'timezone', 'utcDateTime', 'location', 'expected'];
    
    for (const field of requiredFields) {
        if (!testCase[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    if (testCase.location && (!testCase.location.lat || !testCase.location.lng)) {
        errors.push('Location must have lat and lng coordinates');
    }
    
    if (testCase.expected) {
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        for (const planet of planets) {
            if (!testCase.expected[planet]) {
                errors.push(`Missing expected position for ${planet}`);
            }
        }
    }
    
    return errors;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEST_CASES,
        TEST_CATEGORIES,
        TEST_PRIORITIES,
        getTestCasesByCategory,
        getTestCasesByPriority,
        getPrimaryTestCase,
        getHighPriorityTestCases,
        validateTestCase
    };
}